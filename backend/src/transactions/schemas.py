from pydantic import BaseModel, Field, condecimal
from fastapi import Depends
from decimal import Decimal
from src.models import TransactionKind
from typing import Optional, Union
from datetime import datetime


Money = condecimal(max_digits=14, decimal_places=2, ge=0)

class TransactionCreate(BaseModel):
    amount: Money
    kind: TransactionKind = TransactionKind.EXPENSE
    category_name: str = Field(min_length=1, max_length=64)
    currency: Optional[str] = Field(default=None, max_length=16)
    date: Optional[datetime] = None


class TransactionUpdate(BaseModel):
    amount: Optional[Money] = None
    kind: Optional[Union[int, TransactionKind]] = None
    category_name: Optional[str] = Field(default=None, min_length=1, max_length=64)
    currency: Optional[str] = Field(default=None, max_length=16)
    date: Optional[datetime] = None


class TransactionOut(BaseModel):
    id_: int
    amount: Decimal
    kind: TransactionKind
    category_name: str
    currency: Optional[str]
    date: datetime
    new_capital: Optional[float] = None

    class Config:
        from_attributes = True
        orm_mode = True
