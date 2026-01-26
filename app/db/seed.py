import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.db.seeds.adjectives_data import DEFAULT_ADJECTIVES
from app.models import Admin, Adjective, List

logger = logging.getLogger(__name__)


async def seed_default_list(session: AsyncSession) -> None:
    """Seed the default adjective list."""
    # Check if default list already exists
    result = await session.execute(select(List).where(List.is_default == True))  # noqa: E712
    existing_list = result.scalar_one_or_none()

    if existing_list:
        logger.info("Default adjective list already exists, skipping seed")
        return

    # Create default list
    default_list = List(
        name="Standardliste",
        description="Standard-Adjektivliste für Berufswahl und Selbstreflexion",
        is_default=True,
        owner_user_id=None,
    )
    session.add(default_list)
    await session.flush()  # Get the ID

    # Add adjectives
    for idx, adj_data in enumerate(DEFAULT_ADJECTIVES, start=1):
        adjective = Adjective(
            list_id=default_list.id,
            word=adj_data["word"],
            explanation=adj_data["explanation"],
            example=adj_data["example"],
            order_index=idx,
            active=True,
        )
        session.add(adjective)

    await session.commit()
    logger.info(f"Created default list with {len(DEFAULT_ADJECTIVES)} adjectives")


async def seed_default_admin(session: AsyncSession) -> None:
    """Seed the default admin account."""
    # Check if admin already exists
    result = await session.execute(select(Admin).where(Admin.username == "admin"))
    existing_admin = result.scalar_one_or_none()

    if existing_admin:
        logger.info("Default admin account already exists, skipping seed")
        return

    # Create admin with temporary password
    admin = Admin(
        username="admin",
        password_hash=get_password_hash("changeme"),
    )
    session.add(admin)
    await session.commit()
    logger.info("Created default admin account (username: admin, password: changeme)")
    logger.warning("⚠️  IMPORTANT: Change the admin password immediately after first login!")


async def run_seeds() -> None:
    """Run all seed functions."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting database seeding...")

    async with SessionLocal() as session:
        await seed_default_list(session)
        await seed_default_admin(session)

    logger.info("Database seeding completed")


if __name__ == "__main__":
    asyncio.run(run_seeds())
