"""List management for users (Lehrkraft)."""
import secrets
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.user import User
from app.models.list import List as ListModel
from app.models.adjective import Adjective
from app.api.deps import require_user


router = APIRouter(prefix="/user/lists", tags=["user-lists"])


class AdjectiveResponse(BaseModel):
    id: int
    word: str
    explanation: str
    example: str
    order_index: int
    active: bool

    class Config:
        from_attributes = True


class ListResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_default: bool
    owner_user_id: Optional[int]
    share_token: Optional[str]
    share_expires_at: Optional[datetime]
    share_with_school: bool
    source_list_id: Optional[int]
    adjectives: List[AdjectiveResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ListCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    share_with_school: bool = False


class ListUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    share_with_school: Optional[bool] = None


class AdjectiveCreateRequest(BaseModel):
    word: str
    explanation: str
    example: str
    order_index: Optional[int] = None


class AdjectiveUpdateRequest(BaseModel):
    word: Optional[str] = None
    explanation: Optional[str] = None
    example: Optional[str] = None
    order_index: Optional[int] = None


# ============ LIST CRUD ============


@router.post("", response_model=ListResponse)
async def create_list(
    request: ListCreateRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Create a new custom list for the user."""
    # Generate share token and expiry (1 year from now)
    share_token = secrets.token_urlsafe(32)
    share_expires_at = datetime.utcnow() + timedelta(days=365)
    
    new_list = ListModel(
        name=request.name,
        description=request.description,
        is_default=False,
        owner_user_id=user.id,
        share_token=share_token,
        share_expires_at=share_expires_at,
        share_enabled=True,
        share_with_school=request.share_with_school,
        source_list_id=None
    )
    
    db.add(new_list)
    await db.commit()
    await db.refresh(new_list)
    
    # Load empty adjectives list
    adjectives = []
    
    return ListResponse(
        id=new_list.id,
        name=new_list.name,
        description=new_list.description,
        is_default=new_list.is_default,
        owner_user_id=new_list.owner_user_id,
        share_token=new_list.share_token,
        share_expires_at=new_list.share_expires_at,
        share_with_school=new_list.share_with_school,
        source_list_id=new_list.source_list_id,
        adjectives=adjectives,
        created_at=new_list.created_at,
        updated_at=new_list.updated_at
    )


@router.get("/{listId}", response_model=ListResponse)
async def get_list(
    listId: int,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Get a list with all its adjectives."""
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    # Permission check: user must be owner or it must be shared with school
    if not list_obj.is_default:
        if list_obj.owner_user_id != user.id and not list_obj.share_with_school:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    # Load adjectives
    adj_result = await db.execute(
        select(Adjective)
        .where(Adjective.list_id == listId)
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
    
    return ListResponse(
        id=list_obj.id,
        name=list_obj.name,
        description=list_obj.description,
        is_default=list_obj.is_default,
        owner_user_id=list_obj.owner_user_id,
        share_token=list_obj.share_token,
        share_expires_at=list_obj.share_expires_at,
        share_with_school=list_obj.share_with_school,
        source_list_id=list_obj.source_list_id,
        adjectives=adjectives,
        created_at=list_obj.created_at,
        updated_at=list_obj.updated_at
    )


@router.put("/{listId}", response_model=ListResponse)
async def update_list(
    listId: int,
    request: ListUpdateRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Update a list (only owner can edit)."""
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    # Permission: only owner can edit
    if list_obj.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can edit")
    
    if request.name:
        list_obj.name = request.name
    if request.description is not None:
        list_obj.description = request.description
    if request.share_with_school is not None:
        list_obj.share_with_school = request.share_with_school
    
    list_obj.updated_at = datetime.utcnow()
    db.add(list_obj)
    await db.commit()
    await db.refresh(list_obj)
    
    # Load adjectives
    adj_result = await db.execute(
        select(Adjective)
        .where(Adjective.list_id == listId)
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
    
    return ListResponse(
        id=list_obj.id,
        name=list_obj.name,
        description=list_obj.description,
        is_default=list_obj.is_default,
        owner_user_id=list_obj.owner_user_id,
        share_token=list_obj.share_token,
        share_expires_at=list_obj.share_expires_at,
        share_with_school=list_obj.share_with_school,
        source_list_id=list_obj.source_list_id,
        adjectives=adjectives,
        created_at=list_obj.created_at,
        updated_at=list_obj.updated_at
    )


@router.delete("/{listId}")
async def delete_list(
    listId: int,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Delete a list (only owner can delete)."""
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    # Permission: only owner can delete
    if list_obj.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can delete")
    
    await db.delete(list_obj)
    await db.commit()
    
    return {"message": "List deleted", "id": listId}


# ============ ADJECTIVE CRUD ============


@router.get("/{listId}/adjectives", response_model=List[AdjectiveResponse])
async def get_adjectives(
    listId: int,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Get all adjectives for a list."""
    # Check list exists and user has access
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    if not list_obj.is_default and list_obj.owner_user_id != user.id and not list_obj.share_with_school:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    
    adj_result = await db.execute(
        select(Adjective)
        .where(Adjective.list_id == listId)
        .order_by(Adjective.order_index)
    )
    adjectives = adj_result.scalars().all()
    
    return [
        AdjectiveResponse(
            id=adj.id,
            word=adj.word,
            explanation=adj.explanation,
            example=adj.example,
            order_index=adj.order_index,
            active=adj.active
        )
        for adj in adjectives
    ]


@router.post("/{listId}/adjectives", response_model=AdjectiveResponse)
async def create_adjective(
    listId: int,
    request: AdjectiveCreateRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Add a new adjective to a list."""
    # Check list exists and user is owner
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    if list_obj.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can add adjectives")
    
    # Determine order_index
    if request.order_index is None:
        max_order_result = await db.execute(
            select(Adjective).where(Adjective.list_id == listId)
        )
        adjectives = max_order_result.scalars().all()
        order_index = len(adjectives) + 1
    else:
        order_index = request.order_index
    
    new_adj = Adjective(
        list_id=listId,
        word=request.word,
        explanation=request.explanation,
        example=request.example,
        order_index=order_index,
        active=True
    )
    
    db.add(new_adj)
    await db.commit()
    await db.refresh(new_adj)
    
    return AdjectiveResponse(
        id=new_adj.id,
        word=new_adj.word,
        explanation=new_adj.explanation,
        example=new_adj.example,
        order_index=new_adj.order_index,
        active=new_adj.active
    )


@router.put("/{listId}/adjectives/{adjectiveId}", response_model=AdjectiveResponse)
async def update_adjective(
    listId: int,
    adjectiveId: int,
    request: AdjectiveUpdateRequest,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Update an adjective (inline auto-save)."""
    # Check list and permissions
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    if list_obj.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can edit")
    
    # Get adjective
    adj_result = await db.execute(
        select(Adjective).where(
            and_(Adjective.id == adjectiveId, Adjective.list_id == listId)
        )
    )
    adj = adj_result.scalar_one_or_none()
    
    if not adj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adjective not found")
    
    # Update fields
    if request.word is not None:
        adj.word = request.word
    if request.explanation is not None:
        adj.explanation = request.explanation
    if request.example is not None:
        adj.example = request.example
    if request.order_index is not None:
        adj.order_index = request.order_index
    
    db.add(adj)
    await db.commit()
    await db.refresh(adj)
    
    return AdjectiveResponse(
        id=adj.id,
        word=adj.word,
        explanation=adj.explanation,
        example=adj.example,
        order_index=adj.order_index,
        active=adj.active
    )


@router.delete("/{listId}/adjectives/{adjectiveId}")
async def delete_adjective(
    listId: int,
    adjectiveId: int,
    user: User = Depends(require_user),
    db: AsyncSession = Depends(get_session)
):
    """Delete an adjective from a list."""
    # Check list and permissions
    result = await db.execute(select(ListModel).where(ListModel.id == listId))
    list_obj = result.scalar_one_or_none()
    
    if not list_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="List not found")
    
    if list_obj.owner_user_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can delete")
    
    # Get adjective
    adj_result = await db.execute(
        select(Adjective).where(
            and_(Adjective.id == adjectiveId, Adjective.list_id == listId)
        )
    )
    adj = adj_result.scalar_one_or_none()
    
    if not adj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adjective not found")
    
    await db.delete(adj)
    await db.commit()
    
    return {"message": "Adjective deleted", "id": adjectiveId}
