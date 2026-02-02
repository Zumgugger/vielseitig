import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.session import SessionLocal
from app.db.seeds.adjectives_data import DEFAULT_ADJECTIVES
from app.db.seeds.premium_lists_data import PREMIUM_LISTS
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
        slug="standard",
        description="Standard-Adjektivliste für Berufswahl und Selbstreflexion",
        is_default=True,
        is_premium=False,
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


async def seed_premium_lists(session: AsyncSession) -> None:
    """Seed premium adjective lists (only for registered users)."""
    import secrets
    from datetime import datetime, timedelta
    
    for list_data in PREMIUM_LISTS:
        # Check if list already exists by slug
        result = await session.execute(
            select(List).where(List.slug == list_data["slug"])
        )
        existing_list = result.scalar_one_or_none()

        if existing_list:
            # Update existing list with share token if missing
            if not existing_list.share_token:
                existing_list.share_token = secrets.token_urlsafe(32)
                existing_list.share_expires_at = datetime.utcnow() + timedelta(days=365 * 10)  # 10 years
                existing_list.share_enabled = True
                session.add(existing_list)
                await session.commit()
                logger.info(f"Updated premium list '{list_data['name']}' with share token")
            else:
                logger.info(f"Premium list '{list_data['name']}' already exists, skipping")
            continue

        # Create premium list with share token
        share_token = secrets.token_urlsafe(32)
        share_expires_at = datetime.utcnow() + timedelta(days=365 * 10)  # 10 years for premium lists
        
        premium_list = List(
            name=list_data["name"],
            slug=list_data["slug"],
            description=list_data["description"],
            is_default=False,
            is_premium=True,
            owner_user_id=None,
            share_token=share_token,
            share_expires_at=share_expires_at,
            share_enabled=True,
        )
        session.add(premium_list)
        await session.flush()  # Get the ID

        # Add adjectives
        for idx, adj_data in enumerate(list_data["adjectives"], start=1):
            adjective = Adjective(
                list_id=premium_list.id,
                word=adj_data["word"],
                explanation=adj_data["explanation"],
                example=adj_data["example"],
                order_index=idx,
                active=True,
            )
            session.add(adjective)

        await session.commit()
        logger.info(f"Created premium list '{list_data['name']}' with {len(list_data['adjectives'])} adjectives")


async def seed_default_admin(session: AsyncSession) -> None:
    """Seed the default admin account."""
    # Check if admin already exists (legacy username or new email-style username)
    result = await session.execute(
        select(Admin).where(Admin.username.in_(["admin", "admin@admin.com"]))
    )
    existing_admin = result.scalar_one_or_none()

    if existing_admin:
        # Backfill legacy username to new email-style username
        if existing_admin.username == "admin":
            existing_admin.username = "admin@admin.com"
            session.add(existing_admin)
            await session.commit()
            logger.info("Updated default admin username to admin@admin.com")
        else:
            logger.info("Default admin account already exists, skipping seed")
        return

    # Create admin with temporary password
    admin = Admin(
        username="admin@admin.com",
        password_hash=get_password_hash("changeme"),
    )
    session.add(admin)
    await session.commit()
    logger.info("Created default admin account (username: admin@admin.com, password: changeme)")
    logger.warning("⚠️  IMPORTANT: Change the admin password immediately after first login!")


async def run_seeds() -> None:
    """Run all seed functions."""
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting database seeding...")

    async with SessionLocal() as session:
        await seed_default_list(session)
        await seed_premium_lists(session)
        await seed_default_admin(session)

    logger.info("Database seeding completed")


if __name__ == "__main__":
    asyncio.run(run_seeds())
