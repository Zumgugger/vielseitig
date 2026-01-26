"""PDF export of student sorting assignments with hexagon visualization."""
import io
from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfgen import canvas
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.analytics import AnalyticsSession, AnalyticsAssignment
from app.models.adjective import Adjective
from app.models.list import List as ListModel
from app.services.analytics import ALLOWED_BUCKETS, mark_pdf_export, record_assignment as record_assignment_service


router = APIRouter(prefix="/api/sessions", tags=["pdf"])


class PDFExportRequest(BaseModel):
    session_id: str
    include_hexagon: bool = True


class AssignmentRecordRequest(BaseModel):
    adjective_id: int
    bucket: str


def draw_hexagon(c, x, y, size=1.5, text="", fill=True):
    """Draw a hexagon at position (x, y) with optional text."""
    import math
    
    angle_offset = math.pi / 6  # 30 degrees
    points = []
    for i in range(6):
        angle = i * math.pi / 3 + angle_offset
        px = x + size * math.cos(angle)
        py = y + size * math.sin(angle)
        points.append((px, py))
    
    # Draw hexagon
    if fill:
        c.setFillColor(colors.lightgrey)
    c.setStrokeColor(colors.black)
    c.setLineWidth(0.5)
    
    path = c.beginPath()
    path.moveTo(points[0][0], points[0][1])
    for p in points[1:]:
        path.lineTo(p[0], p[1])
    path.close()
    c.drawPath(path, stroke=1, fill=fill)
    
    # Draw text if provided
    if text:
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x, y - 0.3, text)


BUCKET_ORDER = tuple(name for name in ("selten", "manchmal", "oft") if name in ALLOWED_BUCKETS)


@router.post("/{sessionId}/pdf")
async def export_session_pdf(
    sessionId: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Export student sorting session as PDF with hexagon visualization.
    
    Creates PDF showing sorted adjectives and visual hexagon representation.
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
    
    # Get list
    list_result = await db.execute(
        select(ListModel).where(ListModel.id == session.list_id)
    )
    list_obj = list_result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Get assignments for session
    assignments_result = await db.execute(
        select(AnalyticsAssignment)
        .where(AnalyticsAssignment.session_id == sessionId)
        .order_by(AnalyticsAssignment.bucket)
    )
    assignments = assignments_result.scalars().all()

    adjectives_result = await db.execute(
        select(Adjective).where(Adjective.list_id == session.list_id)
    )
    adjectives_by_id = {adj.id: adj for adj in adjectives_result.scalars()}
    
    # Group by bucket
    buckets = {}
    for assignment in assignments:
        if assignment.bucket not in buckets:
            buckets[assignment.bucket] = []
        buckets[assignment.bucket].append(assignment)
    
    # Create PDF
    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1f77b4'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#333333'),
        spaceAfter=12,
        alignment=TA_LEFT
    )
    
    elements = []
    
    # Title
    elements.append(Paragraph("Vielseitig – Sortierergebnis", title_style))
    
    # List info
    info_text = f"<b>Liste:</b> {list_obj.name}<br/>"
    if list_obj.description:
        info_text += f"<b>Beschreibung:</b> {list_obj.description}<br/>"
    info_text += f"<b>Datum:</b> {session.started_at.strftime('%d.%m.%Y %H:%M')}"
    
    elements.append(Paragraph(info_text, styles['Normal']))
    elements.append(Spacer(1, 0.5*cm))
    
    # Results by bucket
    if buckets:
        elements.append(Paragraph("Sortierergebnisse nach Kategorie", heading_style))

        for bucket_name in BUCKET_ORDER:
            if bucket_name not in buckets:
                continue

            bucket_assignments = buckets[bucket_name]
            elements.append(Paragraph(f"<b>{bucket_name.capitalize()}</b>", styles['Normal']))

            table_data = []
            for assignment in bucket_assignments:
                adj = adjectives_by_id.get(assignment.adjective_id)
                if adj:
                    table_data.append([
                        Paragraph(f"<b>{adj.word}</b>", styles['Normal']),
                        Paragraph(adj.explanation or "", styles['Normal'])
                    ])

            if table_data:
                table = Table(
                    table_data,
                    colWidths=[3*cm, 12*cm]
                )
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey)
                ]))

                elements.append(table)

            elements.append(Spacer(1, 0.3*cm))
    else:
        elements.append(Paragraph("Keine Sortierergebnisse vorhanden", styles['Normal']))
    
    elements.append(Spacer(1, 0.5*cm))
    
    # Footer
    footer_text = f"Exportiert: {datetime.utcnow().strftime('%d.%m.%Y %H:%M:%S UTC')}"
    elements.append(Paragraph(f"<i>{footer_text}</i>", styles['Normal']))
    
    # Build PDF
    doc.build(elements)
    pdf_buffer.seek(0)
    
    # Mark session as exported
    await mark_pdf_export(db, session_id=sessionId)
    
    # Return PDF
    return FileResponse(
        pdf_buffer,
        media_type="application/pdf",
        filename=f"vielseitig_session_{sessionId[:8]}.pdf"
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
