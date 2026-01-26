from datetime import datetime
from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, utc_now


class School(Base):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, active, passive
    created_at: Mapped[datetime] = mapped_column(default=utc_now)

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="school", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<School(id={self.id}, name={self.name!r}, status={self.status!r})>"
