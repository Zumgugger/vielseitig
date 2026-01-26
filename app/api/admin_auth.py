"""Admin authentication routes."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.security import verify_password
from app.core.sessions import session_store
from app.models.admin import Admin
from app.api.deps import get_optional_session_token, require_admin


router = APIRouter(prefix="/admin", tags=["admin-auth"])


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    message: str
    username: str


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    credentials: AdminLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_session)
):
    """Admin login endpoint."""
    # Find admin by username
    result = await db.execute(
        select(Admin).where(Admin.username == credentials.username)
    )
    admin = result.scalar_one_or_none()
    
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create session
    session_token = session_store.create_session(
        user_id=admin.id,
        user_type="admin"
    )
    
    # Update last login timestamp
    await db.execute(
        update(Admin)
        .where(Admin.id == admin.id)
        .values(last_login_at=datetime.utcnow())
    )
    await db.commit()
    
    # Set session cookie (httpOnly, Secure, SameSite)
    response.set_cookie(
        key="vielseitig_session",
        value=session_token,
        httponly=True,
        secure=True,  # HTTPS only
        samesite="lax",
        max_age=60 * 60 * 24 * 2  # 2 days
    )
    
    return AdminLoginResponse(
        message="Login successful",
        username=admin.username
    )


@router.post("/logout")
async def admin_logout(
    response: Response,
    session_token: str = Depends(get_optional_session_token),
    admin: Admin = Depends(require_admin)
):
    """Admin logout endpoint."""
    if session_token:
        session_store.delete_session(session_token)
    
    # Clear cookie
    response.delete_cookie(key="vielseitig_session")
    
    return {"message": "Logout successful"}


@router.get("/profile")
async def get_admin_profile(admin: Admin = Depends(require_admin)):
    """Get current admin profile."""
    return {
        "id": admin.id,
        "username": admin.username,
        "created_at": admin.created_at,
        "last_login_at": admin.last_login_at
    }
