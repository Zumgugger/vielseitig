from datetime import datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all database models."""

    pass


def utc_now() -> datetime:
    """Return current UTC timestamp."""
    return datetime.now(timezone.utc)
