from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utc_now


class AnalyticsSession(Base):
    __tablename__ = "analytics_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    list_id: Mapped[Optional[int]] = mapped_column(ForeignKey("lists.id", ondelete="SET NULL"), nullable=True)
    is_standard_list: Mapped[bool] = mapped_column(default=False, index=True)
    theme_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(default=utc_now, index=True)
    finished_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)
    pdf_exported_at: Mapped[Optional[datetime]] = mapped_column(nullable=True)

    # Relationships
    list: Mapped[Optional["List"]] = relationship("List", back_populates="analytics_sessions")
    assignments: Mapped[List["AnalyticsAssignment"]] = relationship(
        "AnalyticsAssignment", back_populates="session", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<AnalyticsSession(id={self.id!r}, is_standard_list={self.is_standard_list})>"


class AnalyticsAssignment(Base):
    __tablename__ = "analytics_assignments"
    __table_args__ = (CheckConstraint("bucket IN ('selten', 'manchmal', 'oft')", name="check_bucket"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("analytics_sessions.id", ondelete="CASCADE"), index=True)
    adjective_id: Mapped[int] = mapped_column(ForeignKey("adjectives.id", ondelete="CASCADE"), index=True)
    bucket: Mapped[str] = mapped_column(String(20), index=True)  # selten, manchmal, oft
    assigned_at: Mapped[datetime] = mapped_column(default=utc_now)

    # Relationships
    session: Mapped["AnalyticsSession"] = relationship("AnalyticsSession", back_populates="assignments")
    adjective: Mapped["Adjective"] = relationship("Adjective", back_populates="assignments")

    def __repr__(self) -> str:
        return f"<AnalyticsAssignment(id={self.id}, adjective_id={self.adjective_id}, bucket={self.bucket!r})>"
