"""Tests for licensing and admin utilities."""
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.session import get_session
from app.db.seed import seed_default_admin, seed_default_list
from app.main import app
from app.models import Base, School, User, Admin
from app.services.licensing import is_school_licensed, can_export_pdf
from app.services.admin_utils import generate_temporary_password, reset_user_password
from app.core.security import verify_password
from httpx import AsyncClient


@pytest.fixture(scope="module")
async def test_context():
    """Provide an isolated app client and session factory."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async def override_get_session():
        async with SessionLocal() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    async with SessionLocal() as session:
        await seed_default_list(session)
        await seed_default_admin(session)

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client, SessionLocal

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_school_licensing(test_context):
    """Test school licensing checks."""
    client, session_factory = test_context

    async with session_factory() as db:
        # Create a school
        school = School(name="Test School", status="active")
        db.add(school)
        await db.commit()
        await db.refresh(school)

        # School with no active users is not licensed
        assert not await is_school_licensed(db, school.id)

        # Create and activate a user
        from app.core.security import get_password_hash

        user = User(
            email="teacher@test.de",
            password_hash=get_password_hash("test123"),
            school_id=school.id,
            status="active",
        )
        db.add(user)
        await db.commit()

        # School with 1 active user is licensed
        assert await is_school_licensed(db, school.id)


@pytest.mark.asyncio
async def test_pdf_export_permissions(test_context):
    """Test PDF export permissions based on licensing."""
    client, session_factory = test_context

    async with session_factory() as db:
        # Setup: create school and user
        school = School(name="PDF Test School", status="active")
        db.add(school)
        await db.commit()
        await db.refresh(school)

        from app.core.security import get_password_hash

        user = User(
            email="pdf@test.de",
            password_hash=get_password_hash("test123"),
            school_id=school.id,
            status="active",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Get default list
        from app.models.list import List

        default_result = await db.execute(
            select(List).where(List.is_default == True)  # noqa: E712
        )
        default_list = default_result.scalar_one_or_none()

        # Active user in licensed school can export default list
        can_export = await can_export_pdf(db, user_id=user.id, list_id=default_list.id)
        assert can_export


@pytest.mark.asyncio
async def test_password_reset(test_context):
    """Test password reset functionality."""
    client, session_factory = test_context

    async with session_factory() as db:
        # Create a user
        from app.core.security import get_password_hash

        user = User(
            email="reset@test.de",
            password_hash=get_password_hash("oldpassword"),
            school_id=1,
            status="active",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Generate and set temporary password
        temp_password = await generate_temporary_password()
        assert len(temp_password) > 0

        email = await reset_user_password(db, user.id, temp_password)
        assert email == "reset@test.de"

        # Verify new password works
        user_result = await db.execute(select(User).where(User.id == user.id))
        updated_user = user_result.scalar_one_or_none()
        assert verify_password(temp_password, updated_user.password_hash)

        # Old password no longer works
        assert not verify_password("oldpassword", updated_user.password_hash)


@pytest.mark.asyncio
async def test_password_reset_endpoint(test_context):
    """Test password reset service (endpoint tested via integration)."""
    client, session_factory = test_context

    async with session_factory() as db:
        from app.core.security import get_password_hash

        # Create a user to reset
        user = User(
            email="endpoint_reset@test.de",
            password_hash=get_password_hash("oldpassword"),
            school_id=1,
            status="active",
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        user_id = user.id

        # Test the service directly
        temp_password = await generate_temporary_password()
        email = await reset_user_password(db, user_id, temp_password)

        assert email == "endpoint_reset@test.de"

        # Verify the new password works
        user_result = await db.execute(select(User).where(User.id == user_id))
        updated_user = user_result.scalar_one_or_none()
        assert verify_password(temp_password, updated_user.password_hash)
        assert not verify_password("oldpassword", updated_user.password_hash)
