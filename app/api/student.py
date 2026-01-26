"""Student mode - adjective retrieval and analytics session management."""
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.list import List as ListModel
from app.models.adjective import Adjective
from app.models.analytics import AnalyticsSession


router = APIRouter(prefix="/api/lists", tags=["student"])


class AdjectiveResponse(BaseModel):
    id: int
    word: str
    explanation: str
    example: str

    class Config:
        from_attributes = True


class AdjectiveListResponse(BaseModel):
    list_id: int
    list_name: str
    list_description: str
    adjectives: List[AdjectiveResponse]

    class Config:
        from_attributes = True


class AnalyticsSessionResponse(BaseModel):
    session_id: str
    list_id: int
    is_standard_list: bool
    started_at: datetime

    class Config:
        from_attributes = True


@router.get("/default/adjectives", response_model=AdjectiveListResponse)
async def get_default_list_adjectives(
    db: AsyncSession = Depends(get_session)
):
    """
    Get all adjectives from the standard/default list.
    
    Public endpoint for student sorting view with default list.
    """
    # Get default list
    result = await db.execute(
        select(ListModel).where(ListModel.is_default == True)
    )
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Default list not found"
        )
    
    # Load adjectives
    adj_result = await db.execute(
        select(Adjective)
        .where(Adjective.list_id == list_obj.id, Adjective.active == True)
        .order_by(Adjective.order_index)
    )
    adjectives_data = adj_result.scalars().all()
    
    adjectives = [
        AdjectiveResponse(
            id=adj.id,
            word=adj.word,
            explanation=adj.explanation,
            example=adj.example
        )
        for adj in adjectives_data
    ]
    
    return AdjectiveListResponse(
        list_id=list_obj.id,
        list_name=list_obj.name,
        list_description=list_obj.description,
        adjectives=adjectives
    )


@router.get("/{listId}/adjectives", response_model=AdjectiveListResponse)
async def get_list_adjectives(
    listId: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Get all adjectives for a specific list (public access).
    
    Used by student sorting view to retrieve adjectives.
    Validates that list exists and is shared (for non-default lists).
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
    
    # If not default list, verify it's shared
    if not list_obj.is_default:
        if not list_obj.share_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This list is not shared"
            )
        
        # Verify share token hasn't expired
        if list_obj.share_expires_at and datetime.utcnow() > list_obj.share_expires_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Share link has expired"
            )
        
        # Verify owner is active
        if list_obj.owner_user_id:
            from app.models.user import User
            user_result = await db.execute(
                select(User).where(User.id == list_obj.owner_user_id)
            )
            owner = user_result.scalar_one_or_none()
            
            if not owner or owner.status != "active":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Owner account is not active"
                )
    
    # Load adjectives
    adj_result = await db.execute(
        select(Adjective)
        .where(Adjective.list_id == list_obj.id, Adjective.active == True)
        .order_by(Adjective.order_index)
    )
    adjectives_data = adj_result.scalars().all()
    
    adjectives = [
        AdjectiveResponse(
            id=adj.id,
            word=adj.word,
            explanation=adj.explanation,
            example=adj.example
        )
        for adj in adjectives_data
    ]
    
    return AdjectiveListResponse(
        list_id=list_obj.id,
        list_name=list_obj.name,
        list_description=list_obj.description,
        adjectives=adjectives
    )


@router.post("/{listId}/session", response_model=AnalyticsSessionResponse)
async def create_analytics_session(
    listId: int,
    db: AsyncSession = Depends(get_session)
):
    """
    Start a new analytics session for a list.
    
    Creates session record for tracking student sorting activity.
    Returns session ID for subsequent analytics tracking.
    """
    # Verify list exists and is accessible
    result = await db.execute(
        select(ListModel).where(ListModel.id == listId)
    )
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )
    
    # If not default list, verify it's shared
    if not list_obj.is_default:
        if not list_obj.share_enabled:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This list is not shared"
            )
        
        # Verify share token hasn't expired
        if list_obj.share_expires_at and datetime.utcnow() > list_obj.share_expires_at:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Share link has expired"
            )
        
        # Verify owner is active
        if list_obj.owner_user_id:
            from app.models.user import User
            user_result = await db.execute(
                select(User).where(User.id == list_obj.owner_user_id)
            )
            owner = user_result.scalar_one_or_none()
            
            if not owner or owner.status != "active":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Owner account is not active"
                )
    
    # Create analytics session
    session = AnalyticsSession(
        id=str(uuid4()),
        list_id=list_obj.id,
        is_standard_list=list_obj.is_default,
        theme_id=None,  # Theme selection happens in frontend
        started_at=datetime.utcnow()
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return AnalyticsSessionResponse(
        session_id=session.id,
        list_id=session.list_id,
        is_standard_list=session.is_standard_list,
        started_at=session.started_at
    )


@router.put("/{listId}/session/{sessionId}")
async def finish_analytics_session(
    listId: int,
    sessionId: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Mark analytics session as finished.
    
    Records completion timestamp for tracking.
    """
    # Get session
    result = await db.execute(
        select(AnalyticsSession).where(
            AnalyticsSession.id == sessionId,
            AnalyticsSession.list_id == listId
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Mark as finished
    session.finished_at = datetime.utcnow()
    db.add(session)
    await db.commit()
    
    return {"message": "Session finished", "session_id": sessionId}
