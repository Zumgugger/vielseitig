"""FastAPI dependencies for authentication and authorization."""
from datetime import datetime
from typing import Optional
from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.sessions import get_current_admin, get_current_user
from app.models.admin import Admin
from app.models.user import User


async def get_optional_session_token(
    session: Optional[str] = Cookie(None, alias="vielseitig_session")
) -> Optional[str]:
    """Get session token from cookie if present."""
    return session


async def require_admin(
    session_token: Optional[str] = Depends(get_optional_session_token),
    db: AsyncSession = Depends(get_session)
) -> Admin:
    """Require valid admin session."""
    admin = await get_current_admin(session_token, db)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required"
        )
    return admin


async def require_user(
    session_token: Optional[str] = Depends(get_optional_session_token),
    db: AsyncSession = Depends(get_session)
) -> User:
    """Require valid user session."""
    user = await get_current_user(session_token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User authentication required"
        )
    return user


async def require_active_user(
    user: User = Depends(require_user)
) -> User:
    """Require user to be active."""
    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is not active"
        )
    
    # Check if user has active_until set and if it has expired
    if user.active_until and user.active_until < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account activation has expired"
        )
    
    return user
