"""Admin utilities for user management and password operations."""
import secrets
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.security import get_password_hash
from app.models.user import User


async def reset_user_password(db: AsyncSession, user_id: int, new_password: str) -> str:
    """
    Reset a user's password.
    
    Returns the user's email for confirmation.
    """
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.password_hash = get_password_hash(new_password)
    db.add(user)
    await db.commit()
    
    return user.email


async def generate_temporary_password() -> str:
    """Generate a temporary password."""
    return secrets.token_urlsafe(12)[:16]
