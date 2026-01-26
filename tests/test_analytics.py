"""Integration tests for public analytics endpoints."""
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.db.seed import seed_default_list
from app.db.session import get_session
from app.main import app
from app.models import (
    Adjective,
    AnalyticsAssignment,
    AnalyticsSession,
    Base,
    List,
)


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

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client, SessionLocal

    app.dependency_overrides.clear()
    await engine.dispose()


async def _get_default_list_and_adjective(session_factory):
    async with session_factory() as session:
        list_result = await session.execute(select(List).where(List.is_default == True))  # noqa: E712
        list_obj = list_result.scalar_one()

        adj_result = await session.execute(
            select(Adjective).where(Adjective.list_id == list_obj.id).limit(1)
        )
        adjective = adj_result.scalar_one()

        return list_obj, adjective


@pytest.mark.asyncio
async def test_full_analytics_flow(test_context):
    client, session_factory = test_context
    list_obj, adjective = await _get_default_list_and_adjective(session_factory)

    start_response = await client.post(
        "/api/analytics/session/start",
        json={"list_id": list_obj.id, "theme_id": 2},
    )
    assert start_response.status_code == 200
    session_id = start_response.json()["session_id"]

    assign_response = await client.post(
        "/api/analytics/assignment",
        json={
            "analytics_session_id": session_id,
            "adjective_id": adjective.id,
            "bucket": "oft",
        },
    )
    assert assign_response.status_code == 200
    assert assign_response.json()["bucket"] == "oft"

    finish_response = await client.post(
        "/api/analytics/session/finish",
        json={"analytics_session_id": session_id},
    )
    assert finish_response.status_code == 200

    export_response = await client.post(
        "/api/analytics/session/pdf-export",
        json={"analytics_session_id": session_id},
    )
    assert export_response.status_code == 200

    async with session_factory() as session:
        db_session = (
            await session.execute(
                select(AnalyticsSession).where(AnalyticsSession.id == session_id)
            )
        ).scalar_one()
        assert db_session.finished_at is not None
        assert db_session.pdf_exported_at is not None

        assignment = (
            await session.execute(
                select(AnalyticsAssignment).where(
                    AnalyticsAssignment.session_id == session_id
                )
            )
        ).scalar_one()
        assert assignment.adjective_id == adjective.id
        assert assignment.bucket == "oft"


@pytest.mark.asyncio
async def test_invalid_bucket_rejected(test_context):
    client, session_factory = test_context
    list_obj, adjective = await _get_default_list_and_adjective(session_factory)

    start_response = await client.post(
        "/api/analytics/session/start",
        json={"list_id": list_obj.id},
    )
    session_id = start_response.json()["session_id"]

    invalid_response = await client.post(
        "/api/analytics/assignment",
        json={
            "analytics_session_id": session_id,
            "adjective_id": adjective.id,
            "bucket": "invalid",
        },
    )
    assert invalid_response.status_code == 400
    assert "Bucket" in invalid_response.json().get("detail", "")
