"""Admin management of the standard adjective list."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.models.admin import Admin
from app.models.list import List as ListModel
from app.models.adjective import Adjective
from app.api.deps import require_admin


router = APIRouter(prefix="/admin/standard-list", tags=["admin-standard-list"])


class AdjectiveResponse(BaseModel):
    id: int
    word: str
    explanation: str
    example: str
    order_index: int
    active: bool

    class Config:
        from_attributes = True


class StandardListResponse(BaseModel):
    id: int
    name: str
    description: str
    adjectives: List[AdjectiveResponse]

    class Config:
        from_attributes = True


class AdjectiveUpdateRequest(BaseModel):
    word: str
    explanation: str
    example: str
    order_index: int


@router.get("", response_model=StandardListResponse)
async def get_standard_list(
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Get the standard list with all adjectives."""
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
        .where(Adjective.list_id == list_obj.id)
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
    
    return StandardListResponse(
        id=list_obj.id,
        name=list_obj.name,
        description=list_obj.description,
        adjectives=adjectives
    )


@router.put("/{adjectiveId}", response_model=AdjectiveResponse)
async def update_standard_adjective(
    adjectiveId: int,
    request: AdjectiveUpdateRequest,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Update an adjective in the standard list (inline auto-save)."""
    # Get adjective and verify it belongs to standard list
    adj_result = await db.execute(select(Adjective).where(Adjective.id == adjectiveId))
    adj = adj_result.scalar_one_or_none()
    
    if not adj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adjective not found")
    
    # Verify it's in the standard list
    list_result = await db.execute(
        select(ListModel).where(ListModel.id == adj.list_id)
    )
    list_obj = list_result.scalar_one_or_none()
    
    if not list_obj or not list_obj.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Adjective is not in standard list"
        )
    
    # Update
    adj.word = request.word
    adj.explanation = request.explanation
    adj.example = request.example
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


@router.delete("/{adjectiveId}")
async def delete_standard_adjective(
    adjectiveId: int,
    admin: Admin = Depends(require_admin),
    db: AsyncSession = Depends(get_session)
):
    """Delete an adjective from the standard list."""
    # Get adjective
    adj_result = await db.execute(select(Adjective).where(Adjective.id == adjectiveId))
    adj = adj_result.scalar_one_or_none()
    
    if not adj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Adjective not found")
    
    # Verify it's in the standard list
    list_result = await db.execute(
        select(ListModel).where(ListModel.id == adj.list_id)
    )
    list_obj = list_result.scalar_one_or_none()
    
    if not list_obj or not list_obj.is_default:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Adjective is not in standard list"
        )
    
    await db.delete(adj)
    await db.commit()
    
    return {"message": "Adjective deleted from standard list", "id": adjectiveId}
