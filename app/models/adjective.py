from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utc_now


class Adjective(Base):
    __tablename__ = "adjectives"

    id: Mapped[int] = mapped_column(primary_key=True)
    list_id: Mapped[int] = mapped_column(ForeignKey("lists.id", ondelete="CASCADE"), index=True)
    word: Mapped[str] = mapped_column(String(100))
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    example: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now)

    # Relationships
    list: Mapped["List"] = relationship("List", back_populates="adjectives")
    assignments: Mapped[List["AnalyticsAssignment"]] = relationship(
        "AnalyticsAssignment", back_populates="adjective"
    )

    def __repr__(self) -> str:
        return f"<Adjective(id={self.id}, word={self.word!r}, list_id={self.list_id})>"
