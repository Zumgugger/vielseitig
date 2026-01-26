"""User authentication and registration routes."""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.security import get_password_hash, verify_password
from app.core.sessions import session_store
from app.models.user import User
from app.models.school import School
from app.api.deps import get_optional_session_token, require_user
from app.services.sms import twilio_client


router = APIRouter(prefix="/user", tags=["user-auth"])


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    school_id: Optional[int] = None
    school_name: Optional[str] = None


class UserRegisterResponse(BaseModel):
    message: str
    email: str
    status: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserLoginResponse(BaseModel):
    message: str
    email: str
    status: str


@router.post("/register", response_model=UserRegisterResponse)
async def user_register(
    registration: UserRegisterRequest,
    db: AsyncSession = Depends(get_session)
):
    """User registration endpoint."""
    
    # Validate that either school_id or school_name is provided
    if not registration.school_id and not registration.school_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either school_id or school_name must be provided"
        )
    
    # Check if email already exists
    result = await db.execute(
        select(User).where(User.email == registration.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Handle school selection/creation
    school_id = registration.school_id
    
    if not school_id and registration.school_name:
        # Check if school name already exists
        result = await db.execute(
            select(School).where(School.name == registration.school_name)
        )
        existing_school = result.scalar_one_or_none()
        
        if existing_school:
            school_id = existing_school.id
        else:
            # Create new school with pending status
            new_school = School(
                name=registration.school_name,
                status="pending"
            )
            db.add(new_school)
            await db.flush()
            school_id = new_school.id
    
    # Create new user with pending status
    password_hash = get_password_hash(registration.password)
    
    new_user = User(
        email=registration.email,
        password_hash=password_hash,
        school_id=school_id,
        status="pending"
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Get school name for SMS notification
    school_result = await db.execute(
        select(School).where(School.id == school_id)
    )
    school = school_result.scalar_one_or_none()
    school_name = school.name if school else "Unknown"
    
    # Send SMS notification to admin
    await twilio_client.send_registration_notification(new_user.email, school_name)
    
    return UserRegisterResponse(
        message="Registration successful. Admin will review your request.",
        email=new_user.email,
        status=new_user.status
    )


@router.post("/login", response_model=UserLoginResponse)
async def user_login(
    credentials: UserLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_session)
):
    """User login endpoint."""
    # Find user by email
    result = await db.execute(
        select(User).where(User.email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create session
    session_token = session_store.create_session(
        user_id=user.id,
        user_type="user"
    )
    
    # Update last login timestamp
    await db.execute(
        update(User)
        .where(User.id == user.id)
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
    
    return UserLoginResponse(
        message="Login successful",
        email=user.email,
        status=user.status
    )


@router.post("/logout")
async def user_logout(
    response: Response,
    session_token: str = Depends(get_optional_session_token),
    user: User = Depends(require_user)
):
    """User logout endpoint."""
    if session_token:
        session_store.delete_session(session_token)
    
    # Clear cookie
    response.delete_cookie(key="vielseitig_session")
    
    return {"message": "Logout successful"}


@router.get("/profile")
async def get_user_profile(
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Get current user profile."""
    # Load school information
    result = await db.execute(
        select(School).where(School.id == user.school_id)
    )
    school = result.scalar_one_or_none()
    
    return {
        "id": user.id,
        "email": user.email,
        "status": user.status,
        "active_until": user.active_until,
        "school": {
            "id": school.id,
            "name": school.name,
            "status": school.status
        } if school else None,
        "created_at": user.created_at,
        "last_login_at": user.last_login_at
    }
