from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from src.goals.schemas import GoalCreate, GoalUpdate, GoalOut

from src.database import get_db
from src.dependencies import get_current_user
from src.models import Goal, User

goal_router = APIRouter()


async def _get_user_goal_or_404(
        session: AsyncSession, goal_id: int, user_id: int
) -> Goal:
    stmt = select(Goal).where(Goal.id_ == goal_id, Goal.user_id == user_id)
    goal = (await session.execute(stmt)).scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@goal_router.post("", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(
        payload: GoalCreate,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    goal = Goal(
        user_id=current_user.id_,
        name=payload.name,
        summ=payload.summ,
        saved=payload.saved,
    )
    session.add(goal)
    await session.commit()
    await session.refresh(goal)
    return goal


@goal_router.get("", response_model=List[GoalOut])
async def list_goals(
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
        q: Optional[str] = Query(None, description="Пошук за назвою"),
        limit: int = Query(50, ge=1, le=200),
        offset: int = Query(0, ge=0),
):
    stmt = (
        select(Goal)
        .where(Goal.user_id == current_user.id_)
        .order_by(Goal.id_.desc())
        .limit(limit)
        .offset(offset)
    )
    if q:
        stmt = stmt.where(Goal.name == q)

    rows = (await session.execute(stmt)).scalars().all()
    return rows


@goal_router.get("/{goal_id}", response_model=GoalOut)
async def get_goal(
        goal_id: int,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    return await _get_user_goal_or_404(session, goal_id, current_user.id_)


@goal_router.patch("/{goal_id}", response_model=GoalOut)
async def update_goal(
        goal_id: int,
        payload: GoalUpdate,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    await _get_user_goal_or_404(session, goal_id, current_user.id_)

    updates = {}
    if payload.name is not None:
        updates["name"] = payload.name
    if payload.summ is not None:
        updates["summ"] = payload.summ
    if payload.saved is not None:
        updates["saved"] = payload.saved

    if not updates:
        return await _get_user_goal_or_404(session, goal_id, current_user.id_)

    stmt = (
        update(Goal)
        .where(Goal.id_ == goal_id, Goal.user_id == current_user.id_)
        .values(**updates)
        .returning(Goal)
    )
    goal = (await session.execute(stmt)).scalar_one()
    await session.commit()
    return goal


@goal_router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(
        goal_id: int,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    await _get_user_goal_or_404(session, goal_id, current_user.id_)
    await session.execute(
        delete(Goal).where(Goal.id_ == goal_id, Goal.user_id == current_user.id_)
    )
    await session.commit()
    return None
