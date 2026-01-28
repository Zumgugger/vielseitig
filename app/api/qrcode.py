"""QR code generation for list share links."""
from io import BytesIO

import qrcode
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.list import List as ListModel
from app.models.user import User
from app.api.deps import require_user


router = APIRouter(prefix="/user", tags=["qr"])


@router.get("/lists/{listId}/qr")
async def get_list_qr_code(
    listId: int,
    request: Request,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Generate QR code for list share link (PNG format).
    
    User endpoint - only owner can generate QR code.
    Generates QR code pointing to /l/{token}.
    """
    # Get list
    result = await db.execute(
        select(ListModel).where(ListModel.id == listId)
    )
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # Permission check: only owner
    if list_obj.owner_user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only list owner can generate QR code"
        )
    
    # Verify share is enabled
    if not list_obj.share_enabled or not list_obj.share_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="List sharing is not enabled"
        )
    
    # Generate QR code with dynamic URL from request
    # Get base URL from request (e.g., http://localhost:3000 or https://vielseitig.zumgugger.ch)
    base_url = f"{request.url.scheme}://{request.url.netloc}"
    qr_url = f"{base_url}/l/{list_obj.share_token}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=2,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to bytes
    img_bytes = BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)
    
    return StreamingResponse(
        img_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=list_{listId}_qr.png"}
    )
