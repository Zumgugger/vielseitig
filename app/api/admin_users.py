"""Admin user and school management endpoints."""
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.school import School
from app.models.admin import Admin
from app.api.deps import require_admin
from app.services.admin_utils import reset_user_password, generate_temporary_password


router = APIRouter(prefix="/admin", tags=["admin-users"])


class PendingUserResponse(BaseModel):
    id: int
    email: str
    school_name: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserDetailResponse(BaseModel):
    id: int
    email: str
    status: str
    active_until: Optional[datetime]
    school_id: int
    school_name: Optional[str]
    notes: Optional[str]
    created_at: datetime
    last_login_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserCreateRequest(BaseModel):
    email: EmailStr
    password: str
    school_id: int
    status: str = "active"
    active_until: Optional[datetime] = None
    notes: Optional[str] = None


class UserUpdateRequest(BaseModel):
    email: Optional[EmailStr] = None
    school_id: Optional[int] = None
    status: Optional[str] = None
    active_until: Optional[datetime] = None
    notes: Optional[str] = None


class ApprovalRequest(BaseModel):
    reason: Optional[str] = None


class SchoolResponse(BaseModel):
    id: int
    name: str
    status: str
    created_at: datetime
    active_user_count: int

    class Config:
        from_attributes = True


class SchoolCreateRequest(BaseModel):
    name: str
    status: str = "active"


class SchoolUpdateRequest(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None


# ============ PENDING INBOX ============


@router.get("/pending-users", response_model=List[PendingUserResponse])
async def get_pending_users(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Get list of pending users awaiting approval."""
    result = await db.execute(
        select(User).where(User.status == "pending").order_by(User.created_at)
    )
    users = result.scalars().all()
    
    # Enrich with school names
    response = []
    for user in users:
        school_result = await db.execute(
            select(School).where(School.id == user.school_id)
        )
        school = school_result.scalar_one_or_none()
        
        response.append(PendingUserResponse(
            id=user.id,
            email=user.email,
            school_name=school.name if school else None,
            status=user.status,
            created_at=user.created_at
        ))
    
    return response


@router.post("/users/{userId}/approve")
async def approve_user(
    userId: int,
    request: ApprovalRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Approve a pending user (set status to active)."""
    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.status = "active"
    # Set active_until to 1 year from now if not already set
    if not user.active_until:
        user.active_until = datetime.utcnow() + timedelta(days=365)
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {"message": "User approved", "email": user.email, "status": user.status}


@router.post("/users/{userId}/reject")
async def reject_user(
    userId: int,
    request: ApprovalRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Reject a pending user (set status to passive)."""
    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.status = "passive"
    db.add(user)
    await db.commit()
    
    return {"message": "User rejected", "email": user.email}


@router.get("/pending-schools", response_model=List[SchoolResponse])
async def get_pending_schools(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Get list of pending schools awaiting approval."""
    result = await db.execute(
        select(School).where(School.status == "pending").order_by(School.created_at)
    )
    schools = result.scalars().all()
    
    response = []
    for school in schools:
        # Count active users
        user_result = await db.execute(
            select(User).where(
                (User.school_id == school.id) & (User.status == "active")
            )
        )
        active_count = len(user_result.scalars().all())
        
        response.append(SchoolResponse(
            id=school.id,
            name=school.name,
            status=school.status,
            created_at=school.created_at,
            active_user_count=active_count
        ))
    
    return response


@router.post("/schools/{schoolId}/approve")
async def approve_school(
    schoolId: int,
    request: ApprovalRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Approve a pending school."""
    result = await db.execute(select(School).where(School.id == schoolId))
    school = result.scalar_one_or_none()
    
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    
    school.status = "active"
    db.add(school)
    await db.commit()
    
    return {"message": "School approved", "name": school.name, "status": school.status}


@router.post("/schools/{schoolId}/reject")
async def reject_school(
    schoolId: int,
    request: ApprovalRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Reject a pending school."""
    result = await db.execute(select(School).where(School.id == schoolId))
    school = result.scalar_one_or_none()
    
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    
    school.status = "passive"
    db.add(school)
    await db.commit()
    
    return {"message": "School rejected", "name": school.name}


# ============ USER CRUD ============


@router.get("/users", response_model=List[UserDetailResponse])
async def list_users(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Get all users."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    response = []
    for user in users:
        school_result = await db.execute(
            select(School).where(School.id == user.school_id)
        )
        school = school_result.scalar_one_or_none()
        
        response.append(UserDetailResponse(
            id=user.id,
            email=user.email,
            status=user.status,
            active_until=user.active_until,
            school_id=user.school_id,
            school_name=school.name if school else None,
            notes=user.notes,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        ))
    
    return response


@router.get("/users/{userId}", response_model=UserDetailResponse)
async def get_user(
    userId: int,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Get user details."""
    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    school_result = await db.execute(
        select(School).where(School.id == user.school_id)
    )
    school = school_result.scalar_one_or_none()
    
    return UserDetailResponse(
        id=user.id,
        email=user.email,
        status=user.status,
        active_until=user.active_until,
        school_id=user.school_id,
        school_name=school.name if school else None,
        notes=user.notes,
        created_at=user.created_at,
        last_login_at=user.last_login_at
    )


@router.post("/users")
async def create_user(
    user_req: UserCreateRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Create a new user (admin-only)."""
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == user_req.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Check if school exists
    school_result = await db.execute(
        select(School).where(School.id == user_req.school_id)
    )
    if not school_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School not found"
        )
    
    password_hash = get_password_hash(user_req.password)
    
    new_user = User(
        email=user_req.email,
        password_hash=password_hash,
        school_id=user_req.school_id,
        status=user_req.status,
        active_until=user_req.active_until,
        notes=user_req.notes
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {
        "message": "User created",
        "id": new_user.id,
        "email": new_user.email,
        "status": new_user.status
    }


@router.put("/users/{userId}")
async def update_user(
    userId: int,
    user_req: UserUpdateRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Update a user."""
    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Check if new email is unique
    if user_req.email and user_req.email != user.email:
        email_result = await db.execute(
            select(User).where(User.email == user_req.email)
        )
        if email_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        user.email = user_req.email
    
    if user_req.school_id:
        school_result = await db.execute(
            select(School).where(School.id == user_req.school_id)
        )
        if not school_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="School not found"
            )
        user.school_id = user_req.school_id
    
    if user_req.status:
        user.status = user_req.status
    
    if user_req.active_until is not None:
        user.active_until = user_req.active_until
    
    if user_req.notes is not None:
        user.notes = user_req.notes
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return {"message": "User updated", "id": user.id, "email": user.email}


@router.delete("/users/{userId}")
async def delete_user(
    userId: int,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Delete a user."""
    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted", "id": userId}


@router.put("/users/{userId}/activation")
async def set_user_activation(
    userId: int,
    status: str,
    active_until: Optional[datetime] = None,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Set user activation status and expiry."""
    result = await db.execute(select(User).where(User.id == userId))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.status = status
    user.active_until = active_until
    
    db.add(user)
    await db.commit()
    
    return {
        "message": "User activation updated",
        "id": user.id,
        "status": user.status,
        "active_until": user.active_until
    }


@router.post("/users/{userId}/reset-password")
async def reset_password(
    userId: int,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Reset a user's password to a temporary one."""
    temp_password = await generate_temporary_password()
    email = await reset_user_password(db, userId, temp_password)
    
    return {
        "message": "Password reset",
        "email": email,
        "temporary_password": temp_password,
        "note": "User should change this password on next login"
    }


# ============ SCHOOL CRUD ============


@router.get("/schools", response_model=List[SchoolResponse])
async def list_schools(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Get all schools."""
    result = await db.execute(select(School).order_by(School.created_at.desc()))
    schools = result.scalars().all()
    
    response = []
    for school in schools:
        # Count active users
        user_result = await db.execute(
            select(User).where(
                (User.school_id == school.id) & (User.status == "active")
            )
        )
        active_count = len(user_result.scalars().all())
        
        response.append(SchoolResponse(
            id=school.id,
            name=school.name,
            status=school.status,
            created_at=school.created_at,
            active_user_count=active_count
        ))
    
    return response


@router.post("/schools")
async def create_school(
    school_req: SchoolCreateRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Create a new school."""
    # Check if name already exists
    result = await db.execute(
        select(School).where(School.name == school_req.name)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School name already exists"
        )
    
    new_school = School(
        name=school_req.name,
        status=school_req.status
    )
    
    db.add(new_school)
    await db.commit()
    await db.refresh(new_school)
    
    return {
        "message": "School created",
        "id": new_school.id,
        "name": new_school.name,
        "status": new_school.status
    }


@router.put("/schools/{schoolId}")
async def update_school(
    schoolId: int,
    school_req: SchoolUpdateRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Update a school."""
    result = await db.execute(select(School).where(School.id == schoolId))
    school = result.scalar_one_or_none()
    
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    
    # Check if new name is unique
    if school_req.name and school_req.name != school.name:
        name_result = await db.execute(
            select(School).where(School.name == school_req.name)
        )
        if name_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="School name already exists"
            )
        school.name = school_req.name
    
    if school_req.status:
        school.status = school_req.status
    
    db.add(school)
    await db.commit()
    await db.refresh(school)
    
    return {"message": "School updated", "id": school.id, "name": school.name}


@router.delete("/schools/{schoolId}")
async def delete_school(
    schoolId: int,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Delete a school."""
    result = await db.execute(select(School).where(School.id == schoolId))
    school = result.scalar_one_or_none()
    
    if not school:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found")
    
    await db.delete(school)
    await db.commit()
    
    return {"message": "School deleted", "id": schoolId}
