"""PDF export of student sorting assignments with hexagon visualization."""
import io
from typing import List, Optional
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


router = APIRouter(prefix="/api/sessions", tags=["pdf"])


class PDFExportRequest(BaseModel):
    session_id: str
    include_hexagon: bool = True


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
        
        for bucket_num in sorted(buckets.keys()):
            bucket_assignments = buckets[bucket_num]
            bucket_name = f"Kategorie {bucket_num + 1}"  # Convert 0-index to 1-index
            
            elements.append(Paragraph(f"<b>{bucket_name}</b>", styles['Normal']))
            
            # Create table with adjectives
            table_data = []
            for assignment in bucket_assignments:
                # Get adjective
                adj_result = await db.execute(
                    select(Adjective).where(Adjective.id == assignment.adjective_id)
                )
                adj = adj_result.scalar_one_or_none()
                
                if adj:
                    table_data.append([
                        Paragraph(f"<b>{adj.word}</b>", styles['Normal']),
                        Paragraph(adj.explanation, styles['Normal'])
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
    session.pdf_exported_at = datetime.utcnow()
    db.add(session)
    await db.commit()
    
    # Return PDF
    return FileResponse(
        pdf_buffer,
        media_type="application/pdf",
        filename=f"vielseitig_session_{sessionId[:8]}.pdf"
    )


@router.post("/{sessionId}/record-assignment")
async def record_assignment(
    sessionId: str,
    adjective_id: int,
    bucket: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Record a student's adjective assignment during sorting.
    
    Stores which adjective was placed in which bucket/hexagon position.
    """
    # Verify session exists
    session_result = await db.execute(
        select(AnalyticsSession).where(AnalyticsSession.id == sessionId)
    )
    session = session_result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Verify bucket is valid (0-5 for hexagon)
    if bucket < 0 or bucket > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bucket must be 0-5 (for hexagon positions)"
        )
    
    # Verify adjective exists and belongs to list
    adj_result = await db.execute(
        select(Adjective).where(
            Adjective.id == adjective_id,
            Adjective.list_id == session.list_id
        )
    )
    adj = adj_result.scalar_one_or_none()
    
    if not adj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adjective not found in this list"
        )
    
    # Check if assignment already exists (update instead of duplicate)
    existing_result = await db.execute(
        select(AnalyticsAssignment).where(
            AnalyticsAssignment.session_id == sessionId,
            AnalyticsAssignment.adjective_id == adjective_id
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        # Update existing assignment
        existing.bucket = bucket
        existing.assigned_at = datetime.utcnow()
        db.add(existing)
    else:
        # Create new assignment
        assignment = AnalyticsAssignment(
            session_id=sessionId,
            adjective_id=adjective_id,
            bucket=bucket,
            assigned_at=datetime.utcnow()
        )
        db.add(assignment)
    
    await db.commit()
    
    return {"message": "Assignment recorded", "adjective_id": adjective_id, "bucket": bucket}
