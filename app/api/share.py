"""Share links and public access to adjective lists."""
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.list import List as ListModel
from app.models.user import User
from app.models.adjective import Adjective


router = APIRouter(prefix="/l", tags=["share"])


class AdjectiveResponse(BaseModel):
    id: int
    word: str
    explanation: str
    example: str
    order_index: int
    active: bool

    class Config:
        from_attributes = True


class ListShareResponse(BaseModel):
    id: int
    name: str
    description: str
    adjectives: List[AdjectiveResponse]

    class Config:
        from_attributes = True


@router.get("/{token}")
async def get_share_link(
    token: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Resolve share link and redirect to student sorting view.
    
    Public endpoint - validates token, list ownership, and expiry.
    """
    # Find list by share token
    result = await db.execute(
        select(ListModel).where(ListModel.share_token == token)
    )
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    # Verify share is enabled
    if not list_obj.share_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This list is no longer shared"
        )
    
    # Verify share token hasn't expired
    if list_obj.share_expires_at and datetime.utcnow() > list_obj.share_expires_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Share link has expired"
        )
    
    # Verify owner is active (if not standard list)
    if not list_obj.is_default and list_obj.owner_user_id:
        user_result = await db.execute(
            select(User).where(User.id == list_obj.owner_user_id)
        )
        owner = user_result.scalar_one_or_none()
        
        if not owner or owner.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Owner account is not active"
            )
        
        # Verify owner's school is licensed/active
        if owner.school_id:
            from app.models.school import School
            school_result = await db.execute(
                select(School).where(School.id == owner.school_id)
            )
            school = school_result.scalar_one_or_none()
            
            if not school or school.status != "active":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Owner's school is not active"
                )
    
    # Redirect to student sorting view
    # Frontend will use /sort?listId=<id> or /sort/<id>
    return RedirectResponse(url=f"/sort?listId={list_obj.id}", status_code=302)


@router.get("/{token}/data", response_model=ListShareResponse)
async def get_share_link_data(
    token: str,
    db: AsyncSession = Depends(get_session)
):
    """
    Get adjectives for a shared list (for student sorting view).
    
    Public endpoint - returns list data for sorting interface.
    """
    # Find list by share token
    result = await db.execute(
        select(ListModel).where(ListModel.share_token == token)
    )
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link not found"
        )
    
    # Verify share is enabled
    if not list_obj.share_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This list is no longer shared"
        )
    
    # Verify share token hasn't expired
    if list_obj.share_expires_at and datetime.utcnow() > list_obj.share_expires_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Share link has expired"
        )
    
    # Verify owner is active (if not standard list)
    if not list_obj.is_default and list_obj.owner_user_id:
        user_result = await db.execute(
            select(User).where(User.id == list_obj.owner_user_id)
        )
        owner = user_result.scalar_one_or_none()
        
        if not owner or owner.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Owner account is not active"
            )
        
        # Verify owner's school is licensed/active
        if owner.school_id:
            from app.models.school import School
            school_result = await db.execute(
                select(School).where(School.id == owner.school_id)
            )
            school = school_result.scalar_one_or_none()
            
            if not school or school.status != "active":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Owner's school is not active"
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
            example=adj.example,
            order_index=adj.order_index,
            active=adj.active
        )
        for adj in adjectives_data
    ]
    
    return ListShareResponse(
        id=list_obj.id,
        name=list_obj.name,
        description=list_obj.description,
        adjectives=adjectives
    )


@router.get("", response_model=ListShareResponse)
async def get_default_list(
    db: AsyncSession = Depends(get_session)
):
    """
    Get the default/standard list (publicly accessible).
    
    Public endpoint for accessing standard list without share token.
    """
    # Get default list
    result = await db.execute(
        select(ListModel).where(ListModel.is_default == True)
    )
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Standard list not found"
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
            example=adj.example,
            order_index=adj.order_index,
            active=adj.active
        )
        for adj in adjectives_data
    ]
    
    return ListShareResponse(
        id=list_obj.id,
        name=list_obj.name,
        description=list_obj.description,
        adjectives=adjectives
    )
