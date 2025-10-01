from typing import List

from fastapi import APIRouter, Depends, Request, status, Query
from fastapi.exceptions import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.dependencies import get_current_user
from src.models import Transaction, TransactionKind, User
from src.transactions.schemas import TransactionOut, TransactionCreate, TransactionUpdate
from src.transactions.currency_converter import convert_to_user_currency

ALLOWED_EXPENSES_CATEGORIES = [
    "shopping",
    "food",
    "phone",
    "entertainment",
    "education",
    "beauty",
    "sports",
    "social",
    "transportation",
    "clothing",
    "car",
    "alcohol",
    "cigarettes",
    "electronics",
    "travel",
    "health",
    "pets",
    "repairs",
    "housing",
    "home",
    "gifts",
    "donations",
    "lottery",
    "kids"
]

transaction_router = APIRouter()


async def _get_user_tx_or_404(
        session: AsyncSession, tx_id: int, user_id: int
) -> Transaction:
    stmt = select(Transaction).where(
        Transaction.id_ == tx_id,
        Transaction.user_id == user_id,
    )
    tx = (await session.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@transaction_router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
async def create_transaction(
        payload: TransactionCreate,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    values = {
        "user_id": current_user.id_,
        "amount": payload.amount,
        "kind": payload.kind,
        "category_name": payload.category_name,
        "currency": payload.currency,
    }
    if payload.date is not None:
        values["date"] = payload.date

    default_currency = current_user.default_currency
    val = await convert_to_user_currency(session, default_currency, payload.kind, payload.amount, payload.currency)
    current_user.capital = round(float(current_user.capital) + float(val), 2)

    tx = Transaction(**values)
    session.add(tx)
    await session.commit()
    await session.refresh(tx)
    await session.refresh(current_user)
    return {
        "id_": tx.id_,
        "amount": tx.amount,
        "kind": tx.kind,
        "category_name": tx.category_name,
        "currency": tx.currency,
        "date": tx.date,
        "new_capital": current_user.capital
    }


@transaction_router.patch("/{tx_id}", response_model=TransactionOut, status_code=status.HTTP_200_OK)
async def update_transaction(
        tx_id: int,
        payload: TransactionUpdate,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    tx = await session.get(Transaction, tx_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.user_id != current_user.id_:
        raise HTTPException(status_code=403, detail="Forbidden")

    data = payload.model_dump(exclude_unset=True)
    if not data:
        return tx

    if "kind" in data and data["kind"] is not None:
        try:
            data["kind"] = TransactionKind(data["kind"])
        except Exception:
            raise HTTPException(status_code=422, detail="Invalid 'kind' value")

    for field, value in data.items():
        setattr(tx, field, value)

    await session.commit()
    await session.refresh(tx)
    return tx


@transaction_router.get("/{tx_id}", response_model=TransactionOut, status_code=status.HTTP_200_OK)
async def get_transaction_by_id(
        tx_id: int,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Transaction)
        .where(
            Transaction.id_ == tx_id,
            Transaction.user_id == current_user.id_,
        )
    )
    tx = (await session.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return tx


@transaction_router.delete("/{tx_id}", status_code=status.HTTP_200_OK)
async def delete_transaction(
        tx_id: int,
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    stmt = select(Transaction).where(
        Transaction.id_ == tx_id,
        Transaction.user_id == current_user.id_,
    )
    tx = (await session.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    default_currency = current_user.default_currency
    val = await convert_to_user_currency(session, default_currency, tx.kind, tx.amount, tx.currency)
    current_user.capital = round(float(current_user.capital) - float(val), 2)

    await session.delete(tx)
    await session.commit()
    await session.refresh(current_user)
    return {
        "message": "Transaction has been deleted",
        "id_": tx.id_,
        "amount": tx.amount,
        "kind": tx.kind,
        "category_name": tx.category_name,
        "currency": tx.currency,
        "date": tx.date,
        "new_capital": current_user.capital
    }


@transaction_router.get("", response_model=List[TransactionOut], status_code=status.HTTP_200_OK)
async def list_my_transactions(
        limit: int = Query(50, ge=1, le=1000),
        offset: int = Query(0, ge=0),
        session: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Transaction)
        .where(Transaction.user_id == current_user.id_)
        .order_by(Transaction.date.desc(), Transaction.id_.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await session.execute(stmt)
    transactions = result.scalars().all()
    return transactions
