from datetime import datetime
from typing import List as ListType
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utc_now


class List(Base):
    __tablename__ = "lists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    slug: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    owner_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    share_token: Mapped[Optional[str]] = mapped_column(String(64), unique=True, nullable=True, index=True)
    share_expires_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    share_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    share_with_school: Mapped[bool] = mapped_column(Boolean, default=False)
    source_list_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lists.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    # Relationships
    owner: Mapped[Optional["User"]] = relationship("User", back_populates="lists")
    adjectives: Mapped[ListType["Adjective"]] = relationship(
        "Adjective", back_populates="list", cascade="all, delete-orphan"
    )
    analytics_sessions: Mapped[ListType["AnalyticsSession"]] = relationship(
        "AnalyticsSession", back_populates="list"
    )

    def __repr__(self) -> str:
        return f"<List(id={self.id}, name={self.name!r}, is_default={self.is_default}, is_premium={self.is_premium})>"
