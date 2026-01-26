"""School licensing and access control helpers."""
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.school import School
from app.models.user import User
from app.models.list import List


async def is_school_licensed(db: AsyncSession, school_id: int) -> bool:
    """Check if a school has an active license (at least 1 active user)."""
    result = await db.execute(
        select(func.count(User.id)).where(
            User.school_id == school_id,
            User.status == "active"
        )
    )
    active_user_count = result.scalar() or 0
    return active_user_count > 0


async def can_export_pdf(db: AsyncSession, *, user_id: int, list_id: int) -> bool:
    """
    Check if a user can export PDF for a given list.
    
    Rules:
    - Default list: only if user's school is licensed
    - Custom list: only if user is active and owns the list
    """
    # Get user
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    
    if not user or user.status != "active":
        return False
    
    # Get list
    list_result = await db.execute(select(List).where(List.id == list_id))
    list_obj = list_result.scalar_one_or_none()
    
    if not list_obj:
        return False
    
    # Default list: requires school license
    if list_obj.is_default:
        return await is_school_licensed(db, user.school_id)
    
    # Custom list: user must be owner
    return list_obj.owner_user_id == user_id
