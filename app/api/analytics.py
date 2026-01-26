"""Public analytics endpoints for student sorting sessions."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.services.analytics import (
    finish_analytics_session,
    mark_pdf_export,
    record_assignment,
    start_analytics_session,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class SessionStartRequest(BaseModel):
    list_id: Optional[int] = None
    theme_id: Optional[int] = None


class SessionStartResponse(BaseModel):
    session_id: str
    list_id: int
    is_standard_list: bool
    theme_id: Optional[int]
    started_at: datetime

    class Config:
        from_attributes = True


class AssignmentRequest(BaseModel):
    analytics_session_id: str
    adjective_id: int
    bucket: str


class AssignmentResponse(BaseModel):
    message: str
    adjective_id: int
    bucket: str


class SessionFinishRequest(BaseModel):
    analytics_session_id: str


class SessionFinishResponse(BaseModel):
    message: str
    finished_at: datetime


class PdfExportRequest(BaseModel):
    analytics_session_id: str


class PdfExportResponse(BaseModel):
    message: str
    pdf_exported_at: datetime


@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(
    payload: SessionStartRequest,
    db: AsyncSession = Depends(get_session),
):
    session = await start_analytics_session(db, list_id=payload.list_id, theme_id=payload.theme_id)
    return SessionStartResponse(
        session_id=session.id,
        list_id=session.list_id or payload.list_id or 0,
        is_standard_list=session.is_standard_list,
        theme_id=session.theme_id,
        started_at=session.started_at,
    )


@router.post("/assignment", response_model=AssignmentResponse)
async def submit_assignment(
    payload: AssignmentRequest,
    db: AsyncSession = Depends(get_session),
):
    assignment = await record_assignment(
        db,
        session_id=payload.analytics_session_id,
        adjective_id=payload.adjective_id,
        bucket=payload.bucket,
    )
    return AssignmentResponse(
        message="Assignment recorded",
        adjective_id=assignment.adjective_id,
        bucket=assignment.bucket,
    )


@router.post("/session/finish", response_model=SessionFinishResponse)
async def finish_session(
    payload: SessionFinishRequest,
    db: AsyncSession = Depends(get_session),
):
    session = await finish_analytics_session(db, session_id=payload.analytics_session_id)
    return SessionFinishResponse(message="Session finished", finished_at=session.finished_at)


@router.post("/session/pdf-export", response_model=PdfExportResponse)
async def mark_pdf_exported(
    payload: PdfExportRequest,
    db: AsyncSession = Depends(get_session),
):
    session = await mark_pdf_export(db, session_id=payload.analytics_session_id)
    return PdfExportResponse(message="PDF export recorded", pdf_exported_at=session.pdf_exported_at)
