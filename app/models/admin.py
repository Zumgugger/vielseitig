from datetime import datetime
from typing import Optional

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, utc_now


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    def __repr__(self) -> str:
        return f"<Admin(id={self.id}, username={self.username!r})>"
