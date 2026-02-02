"""Teacher (Lehrkraft) user management endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.user import User
from app.models.school import School
from app.models.list import List as ListModel
from app.api.deps import require_user


router = APIRouter(prefix="/user", tags=["teacher"])


class SchoolInfo(BaseModel):
    id: int
    name: str
    status: str

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    id: int
    email: str
    status: str
    school: Optional[SchoolInfo]
    created_at: str
    last_login_at: Optional[str]

    class Config:
        from_attributes = True


class ListSummary(BaseModel):
    id: int
    name: str
    slug: Optional[str]
    description: Optional[str]
    is_default: bool
    is_premium: bool
    adjective_count: int
    owner_email: Optional[str]
    share_token: Optional[str]
    share_with_school: bool
    created_at: str

    class Config:
        from_attributes = True


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ============ PROFILE MANAGEMENT ============


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Get current user profile."""
    # Load school info
    school_result = await db.execute(
        select(School).where(School.id == user.school_id)
    )
    school = school_result.scalar_one_or_none()
    
    school_info = SchoolInfo(
        id=school.id,
        name=school.name,
        status=school.status
    ) if school else None
    
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        status=user.status,
        school=school_info,
        created_at=user.created_at.isoformat() if user.created_at else None,
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else None
    )


@router.put("/profile")
async def update_profile(
    request: ChangePasswordRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Update user profile (password change)."""
    from app.core.security import verify_password, get_password_hash
    
    # Verify current password
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.password_hash = get_password_hash(request.new_password)
    db.add(user)
    await db.commit()
    
    return {"message": "Password updated successfully"}


@router.get("/schools")
async def get_user_schools(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Get user's school information."""
    school_result = await db.execute(
        select(School).where(School.id == user.school_id)
    )
    school = school_result.scalar_one_or_none()
    
    if not school:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found"
        )
    
    return SchoolInfo(
        id=school.id,
        name=school.name,
        status=school.status
    )


# ============ LIST OVERVIEW ============


@router.get("/lists", response_model=List[ListSummary])
async def get_user_lists(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """
    Get all lists for the user:
    - Standard list (always included)
    - User's own custom lists
    - Lists shared with user's school
    """
    lists = []
    
    # 1. Add standard list
    standard_result = await db.execute(
        select(ListModel).where(ListModel.is_default == True)
    )
    standard_list = standard_result.scalar_one_or_none()
    
    from app.models.adjective import Adjective
    
    if standard_list:
        adj_count_result = await db.execute(
            select(Adjective).where(Adjective.list_id == standard_list.id)
        )
        adj_count = len(adj_count_result.scalars().all())
        
        lists.append(ListSummary(
            id=standard_list.id,
            name=standard_list.name,
            slug=standard_list.slug,
            description=standard_list.description,
            is_default=True,
            is_premium=False,
            adjective_count=adj_count,
            owner_email=None,
            share_token=None,
            share_with_school=False,
            created_at=standard_list.created_at.isoformat() if standard_list.created_at else ""
        ))
    
    # 2. Add premium lists (available to all registered users)
    premium_lists_result = await db.execute(
        select(ListModel).where(ListModel.is_premium == True)  # noqa: E712
        .order_by(ListModel.name)
    )
    premium_lists = premium_lists_result.scalars().all()
    
    for premium_list in premium_lists:
        adj_count_result = await db.execute(
            select(Adjective).where(Adjective.list_id == premium_list.id)
        )
        adj_count = len(adj_count_result.scalars().all())
        
        lists.append(ListSummary(
            id=premium_list.id,
            name=premium_list.name,
            slug=premium_list.slug,
            description=premium_list.description,
            is_default=False,
            is_premium=True,
            adjective_count=adj_count,
            owner_email=None,
            share_token=None,
            share_with_school=False,
            created_at=premium_list.created_at.isoformat() if premium_list.created_at else ""
        ))
    
    # 3. Add user's own custom lists
    own_lists_result = await db.execute(
        select(ListModel).where(
            and_(ListModel.owner_user_id == user.id, ListModel.is_default == False)  # noqa: E712
        ).order_by(ListModel.created_at.desc())
    )
    own_lists = own_lists_result.scalars().all()
    
    for own_list in own_lists:
        adj_count_result = await db.execute(
            select(Adjective).where(Adjective.list_id == own_list.id)
        )
        adj_count = len(adj_count_result.scalars().all())
        
        lists.append(ListSummary(
            id=own_list.id,
            name=own_list.name,
            slug=own_list.slug,
            description=own_list.description,
            is_default=False,
            is_premium=False,
            adjective_count=adj_count,
            owner_email=user.email,
            share_token=own_list.share_token,
            share_with_school=own_list.share_with_school,
            created_at=own_list.created_at.isoformat() if own_list.created_at else ""
        ))
    
    # 4. Add lists shared with user's school
    shared_lists_result = await db.execute(
        select(ListModel).where(
            and_(
                ListModel.share_with_school == True,  # noqa: E712
                ListModel.owner_user_id != user.id,  # Don't include own lists again
                ListModel.is_default == False,  # noqa: E712
                ListModel.is_premium == False  # noqa: E712  # Don't include premium lists again
            )
        ).order_by(ListModel.created_at.desc())
    )
    shared_lists = shared_lists_result.scalars().all()
    
    for shared_list in shared_lists:
        # Get owner info
        owner_result = await db.execute(
            select(User).where(User.id == shared_list.owner_user_id)
        )
        owner = owner_result.scalar_one_or_none()
        
        adj_count_result = await db.execute(
            select(Adjective).where(Adjective.list_id == shared_list.id)
        )
        adj_count = len(adj_count_result.scalars().all())
        
        lists.append(ListSummary(
            id=shared_list.id,
            name=shared_list.name,
            slug=shared_list.slug,
            description=shared_list.description,
            is_default=False,
            is_premium=False,
            adjective_count=adj_count,
            owner_email=owner.email if owner else None,
            share_token=shared_list.share_token,
            share_with_school=shared_list.share_with_school,
            created_at=shared_list.created_at.isoformat() if shared_list.created_at else ""
        ))
    
    return lists
