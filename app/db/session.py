from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings


settings = get_settings()


def _ensure_sqlite_path(db_url: str) -> None:
    if not db_url.startswith("sqlite"):
        return
    db_path = db_url.split("///")[-1]
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)


_ensure_sqlite_path(settings.database_url)

engine: AsyncEngine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


@event.listens_for(engine.sync_engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record) -> None:  # type: ignore[override]
    if engine.url.get_backend_name() != "sqlite":
        return
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
