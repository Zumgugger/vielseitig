"""PDF export of student sorting assignments using front-end snapshot (WYSIWYG)."""
import base64
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.analytics import AnalyticsSession
from app.models.list import List as ListModel
from app.services.analytics import mark_pdf_export, record_assignment as record_assignment_service


router = APIRouter(prefix="/api/sessions", tags=["pdf"])


class PDFSnapshotRequest(BaseModel):
    image_data_url: str


class AssignmentRecordRequest(BaseModel):
    adjective_id: int
    bucket: str


@router.post("/{sessionId}/pdf")
async def export_session_pdf(
    sessionId: str,
    payload: PDFSnapshotRequest,
    db: AsyncSession = Depends(get_session),
):
    """Export the current session using a front-end snapshot (WYSIWYG)."""

    # Session and list lookup
    session_result = await db.execute(
        select(AnalyticsSession).where(AnalyticsSession.id == sessionId)
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    list_result = await db.execute(
        select(ListModel).where(ListModel.id == session.list_id)
    )
    list_obj = list_result.scalar_one_or_none()
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found",
        )

    if not payload.image_data_url or not payload.image_data_url.startswith("data:image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="image_data_url is required and must be a data URL",
        )

    # Decode data URL (expected PNG from front-end screenshot)
    try:
        header, b64data = payload.image_data_url.split(",", 1)
        image_bytes = base64.b64decode(b64data)
    except Exception as exc:  # pragma: no cover - defensive
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="image_data_url could not be decoded",
        ) from exc

    # Prepare PDF (landscape per WYSIWYG request)
    pdf_buffer = io.BytesIO()
    page_width, page_height = landscape(A4)
    margin = 1.5 * cm
    footer_space = 1.0 * cm
    content_width = page_width - 2 * margin
    content_height = page_height - 2 * margin - footer_space

    c = canvas.Canvas(pdf_buffer, pagesize=landscape(A4))

    image = ImageReader(io.BytesIO(image_bytes))
    img_width, img_height = image.getSize()
    img_ratio = img_width / img_height
    box_ratio = content_width / content_height

    if img_ratio >= box_ratio:
        draw_width = content_width
        draw_height = content_width / img_ratio
    else:
        draw_height = content_height
        draw_width = content_height * img_ratio

    x = (page_width - draw_width) / 2
    y = (page_height - footer_space - draw_height) / 2 + footer_space / 2

    c.drawImage(
        image,
        x,
        y,
        width=draw_width,
        height=draw_height,
        preserveAspectRatio=True,
        mask="auto",
    )

    # Footer date (spec: DD.MM.YYYY)
    c.setFont("Helvetica", 9)
    c.drawCentredString(
        page_width / 2,
        margin / 2,
        datetime.utcnow().strftime("%d.%m.%Y"),
    )

    c.showPage()
    c.save()
    pdf_buffer.seek(0)

    await mark_pdf_export(db, session_id=sessionId)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=\"ich-bin-vielseitig.pdf\""},
    )


@router.post("/{sessionId}/record-assignment")
async def record_assignment(
    sessionId: str,
    payload: AssignmentRecordRequest,
    db: AsyncSession = Depends(get_session)
):
    """
    Record a student's adjective assignment during sorting.
    
    Buckets must be one of: selten, manchmal, oft.
    """
    assignment = await record_assignment_service(
        db,
        session_id=sessionId,
        adjective_id=payload.adjective_id,
        bucket=payload.bucket,
    )

    return {
        "message": "Assignment recorded",
        "adjective_id": assignment.adjective_id,
        "bucket": assignment.bucket,
    }
