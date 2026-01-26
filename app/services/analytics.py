"""Shared analytics helpers for session lifecycle and assignments."""
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import AnalyticsAssignment, AnalyticsSession
from app.models.adjective import Adjective
from app.models.list import List
from app.models.school import School
from app.models.user import User


ALLOWED_BUCKETS = {"selten", "manchmal", "oft"}


async def _get_accessible_list(db: AsyncSession, list_id: Optional[int]) -> List:
    """Return a list that can be accessed publicly or raise HTTP errors."""
    if list_id is None:
        result = await db.execute(select(List).where(List.is_default == True))  # noqa: E712
        list_obj = result.scalar_one_or_none()
        if not list_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Default list not found")
    else:
        result = await db.execute(select(List).where(List.id == list_id))
        list_obj = result.scalar_one_or_none()
        if not list_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")

    if list_obj.is_default:
        return list_obj

    if not list_obj.share_enabled:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This list is not shared")

    if list_obj.share_expires_at and datetime.utcnow() > list_obj.share_expires_at:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Share link has expired")

    if list_obj.owner_user_id:
        owner_result = await db.execute(select(User).where(User.id == list_obj.owner_user_id))
        owner = owner_result.scalar_one_or_none()
        if not owner or owner.status != "active":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner account is not active")

        if owner.school_id:
            school_result = await db.execute(select(School).where(School.id == owner.school_id))
            school = school_result.scalar_one_or_none()
            if not school or school.status != "active":
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner's school is not active")

    return list_obj


async def _get_session_or_404(db: AsyncSession, session_id: str) -> AnalyticsSession:
    result = await db.execute(select(AnalyticsSession).where(AnalyticsSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


async def start_analytics_session(
    db: AsyncSession,
    *,
    list_id: Optional[int],
    theme_id: Optional[int] = None,
) -> AnalyticsSession:
    """Create a new analytics session for the given list."""
    list_obj = await _get_accessible_list(db, list_id)

    session = AnalyticsSession(
        list_id=list_obj.id,
        is_standard_list=list_obj.is_default,
        theme_id=theme_id,
        started_at=datetime.utcnow(),
    )

    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def finish_analytics_session(db: AsyncSession, *, session_id: str) -> AnalyticsSession:
    """Mark an analytics session as finished."""
    session = await _get_session_or_404(db, session_id)
    if not session.finished_at:
        session.finished_at = datetime.utcnow()
        db.add(session)
        await db.commit()
        await db.refresh(session)
    return session


async def mark_pdf_export(db: AsyncSession, *, session_id: str) -> AnalyticsSession:
    """Mark that a PDF export has been triggered for the session."""
    session = await _get_session_or_404(db, session_id)
    session.pdf_exported_at = datetime.utcnow()
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def record_assignment(
    db: AsyncSession,
    *,
    session_id: str,
    adjective_id: int,
    bucket: str,
) -> AnalyticsAssignment:
    """Insert or update an analytics assignment for a session."""
    normalized_bucket = bucket.lower()
    if normalized_bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bucket must be one of: {', '.join(sorted(ALLOWED_BUCKETS))}",
        )

    session = await _get_session_or_404(db, session_id)

    if not session.list_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session has no associated list")

    adj_result = await db.execute(
        select(Adjective).where(Adjective.id == adjective_id, Adjective.list_id == session.list_id)
    )
    adjective = adj_result.scalar_one_or_none()
    if not adjective:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adjective not found in this list")

    existing_result = await db.execute(
        select(AnalyticsAssignment).where(
            AnalyticsAssignment.session_id == session_id,
            AnalyticsAssignment.adjective_id == adjective_id,
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.bucket = normalized_bucket
        existing.assigned_at = datetime.utcnow()
        db.add(existing)
        await db.commit()
        await db.refresh(existing)
        return existing

    assignment = AnalyticsAssignment(
        session_id=session_id,
        adjective_id=adjective_id,
        bucket=normalized_bucket,
        assigned_at=datetime.utcnow(),
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment
