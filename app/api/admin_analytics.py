"""Admin analytics dashboard and aggregations."""
from datetime import datetime
from typing import Dict, List
from statistics import mean, StatisticsError

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.admin import Admin
from app.models.analytics import AnalyticsSession, AnalyticsAssignment
from app.models.adjective import Adjective
from app.api.deps import require_admin


router = APIRouter(prefix="/admin/analytics", tags=["admin-analytics"])


class AdjectiveStats(BaseModel):
    adjective_id: int
    word: str
    count: int
    percentage: float


class ThemeStats(BaseModel):
    theme_id: int
    session_count: int
    percentage: float


class AnalyticsResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    avg_duration_seconds: float
    total_pdf_exports: int
    top_adjectives: List[AdjectiveStats]
    theme_distribution: List[ThemeStats]
    total_assignments: int

    class Config:
        from_attributes = True


@router.get("/summary", response_model=AnalyticsResponse)
async def get_analytics_summary(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """
    Get comprehensive analytics summary for admin dashboard.
    
    Aggregates session data, adjective assignments, and PDF exports.
    """
    # Count total sessions
    sessions_result = await db.execute(
        select(func.count(AnalyticsSession.id))
    )
    total_sessions = sessions_result.scalar() or 0
    
    # Count completed sessions (with finished_at)
    completed_result = await db.execute(
        select(func.count(AnalyticsSession.id))
        .where(AnalyticsSession.finished_at != None)
    )
    completed_sessions = completed_result.scalar() or 0
    
    # Calculate average duration
    durations = []
    duration_result = await db.execute(
        select(AnalyticsSession.started_at, AnalyticsSession.finished_at)
        .where(AnalyticsSession.finished_at != None)
    )
    
    for started, finished in duration_result.all():
        if started and finished:
            duration = (finished - started).total_seconds()
            durations.append(duration)
    
    avg_duration_seconds = 0.0
    if durations:
        try:
            avg_duration_seconds = mean(durations)
        except StatisticsError:
            avg_duration_seconds = 0.0
    
    # Count PDF exports
    pdf_result = await db.execute(
        select(func.count(AnalyticsSession.id))
        .where(AnalyticsSession.pdf_exported_at != None)
    )
    total_pdf_exports = pdf_result.scalar() or 0
    
    # Get top adjectives in assignments
    top_adj_result = await db.execute(
        select(
            AnalyticsAssignment.adjective_id,
            func.count(AnalyticsAssignment.id).label('count')
        )
        .group_by(AnalyticsAssignment.adjective_id)
        .order_by(func.count(AnalyticsAssignment.id).desc())
        .limit(10)
    )
    
    top_adjectives = []
    for adjective_id, count in top_adj_result.all():
        # Get adjective word
        adj_result = await db.execute(
            select(Adjective).where(Adjective.id == adjective_id)
        )
        adj = adj_result.scalar_one_or_none()
        
        if adj:
            percentage = (count / total_sessions * 100) if total_sessions > 0 else 0
            top_adjectives.append(
                AdjectiveStats(
                    adjective_id=adjective_id,
                    word=adj.word,
                    count=count,
                    percentage=round(percentage, 2)
                )
            )
    
    # Get theme distribution
    theme_result = await db.execute(
        select(
            AnalyticsSession.theme_id,
            func.count(AnalyticsSession.id).label('count')
        )
        .group_by(AnalyticsSession.theme_id)
        .order_by(func.count(AnalyticsSession.id).desc())
    )
    
    theme_distribution = []
    for theme_id, count in theme_result.all():
        percentage = (count / total_sessions * 100) if total_sessions > 0 else 0
        theme_distribution.append(
            ThemeStats(
                theme_id=theme_id or 0,  # Handle NULL theme_id
                session_count=count,
                percentage=round(percentage, 2)
            )
        )
    
    # Count total assignments
    assignments_result = await db.execute(
        select(func.count(AnalyticsAssignment.id))
    )
    total_assignments = assignments_result.scalar() or 0
    
    return AnalyticsResponse(
        total_sessions=total_sessions,
        completed_sessions=completed_sessions,
        avg_duration_seconds=round(avg_duration_seconds, 2),
        total_pdf_exports=total_pdf_exports,
        top_adjectives=top_adjectives,
        theme_distribution=theme_distribution,
        total_assignments=total_assignments
    )


class SessionListResponse(BaseModel):
    id: str
    list_id: int
    is_standard_list: bool
    started_at: datetime
    finished_at: datetime | None
    duration_seconds: int | None
    pdf_exported_at: datetime | None
    assignment_count: int

    class Config:
        from_attributes = True


@router.get("/sessions", response_model=List[SessionListResponse])
async def list_analytics_sessions(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session),
    limit: int = 50,
    offset: int = 0
):
    """
    List all analytics sessions with pagination.
    
    Admin endpoint for viewing all student sorting sessions.
    """
    # Get sessions with limit/offset
    sessions_result = await db.execute(
        select(AnalyticsSession)
        .order_by(AnalyticsSession.started_at.desc())
        .limit(limit)
        .offset(offset)
    )
    sessions = sessions_result.scalars().all()
    
    response = []
    for session in sessions:
        # Count assignments
        assignments_result = await db.execute(
            select(func.count(AnalyticsAssignment.id))
            .where(AnalyticsAssignment.session_id == session.id)
        )
        assignment_count = assignments_result.scalar() or 0
        
        # Calculate duration
        duration_seconds = None
        if session.finished_at:
            duration_seconds = int((session.finished_at - session.started_at).total_seconds())
        
        response.append(
            SessionListResponse(
                id=session.id,
                list_id=session.list_id,
                is_standard_list=session.is_standard_list,
                started_at=session.started_at,
                finished_at=session.finished_at,
                duration_seconds=duration_seconds,
                pdf_exported_at=session.pdf_exported_at,
                assignment_count=assignment_count
            )
        )
    
    return response


@router.get("/sessions/{sessionId}")
async def get_session_details(
    sessionId: str,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """
    Get detailed information about a specific analytics session.
    
    Including all assignments and adjective details.
    """
    # Get session
    session_result = await db.execute(
        select(AnalyticsSession).where(AnalyticsSession.id == sessionId)
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Get assignments
    assignments_result = await db.execute(
        select(AnalyticsAssignment)
        .where(AnalyticsAssignment.session_id == sessionId)
        .order_by(AnalyticsAssignment.bucket)
    )
    assignments = assignments_result.scalars().all()
    
    # Build response with adjective details
    assignment_details = []
    for assignment in assignments:
        # Get adjective
        adj_result = await db.execute(
            select(Adjective).where(Adjective.id == assignment.adjective_id)
        )
        adj = adj_result.scalar_one_or_none()
        
        if adj:
            assignment_details.append({
                "adjective_id": adj.id,
                "word": adj.word,
                "explanation": adj.explanation,
                "bucket": assignment.bucket,
                "assigned_at": assignment.assigned_at
            })
    
    # Calculate duration
    duration_seconds = None
    if session.finished_at:
        duration_seconds = int((session.finished_at - session.started_at).total_seconds())
    
    return {
        "session_id": session.id,
        "list_id": session.list_id,
        "is_standard_list": session.is_standard_list,
        "theme_id": session.theme_id,
        "started_at": session.started_at,
        "finished_at": session.finished_at,
        "duration_seconds": duration_seconds,
        "pdf_exported_at": session.pdf_exported_at,
        "assignment_count": len(assignments),
        "assignments": assignment_details
    }
