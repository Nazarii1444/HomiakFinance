from sqlalchemy import Column, Integer, CheckConstraint, Numeric, String, ForeignKey, Float, Boolean, Enum, TIMESTAMP, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.database import Base

import enum


class UserStatus(enum.Enum):
    USER = 0
    ADMIN = 1


class TransactionKind(enum.Enum):
    EXPENSE = 0
    INCOME = 1
    TRANSFER = 2


class Currencies(enum.Enum):
    USD = "USD"
    EUR = "EUR"
    JPY = "JPY"
    GBP = "GBP"
    AUD = "AUD"
    CHF = "CHF"
    SEK = "SEK"
    NOK = "NOK"
    PLN = "PLN"
    UAH = "UAH"


class User(Base):
    __tablename__ = "users"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    default_currency = Column(String(3), nullable=False, default=Currencies.USD.value)
    timezone = Column(String(64), nullable=True)
    capital = Column(Float, nullable=False, default=0.0)
    role = Column(Enum(UserStatus), nullable=False, default=UserStatus.USER)
    twofa_secret = Column(String(32), nullable=True)
    twofa_enabled = Column(Boolean, nullable=False, default=False)

    # relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "default_currency IN ('USD','EUR','JPY','GBP','AUD','CHF','SEK','NOK','PLN','UAH')",
            name="chk_users_default_currency",
        ),
    )


class Currency(Base):
    __tablename__ = "currencies"

    name = Column(String(16), primary_key=True)
    rate = Column(Float, nullable=False, default=1.0)


class Transaction(Base):
    __tablename__ = "transactions"

    id_ = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id_", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    name = Column(String(64), nullable=False, default="")
    kind = Column(Enum(TransactionKind), nullable=False, default=TransactionKind.EXPENSE)
    category_name = Column(String(64), nullable=False)
    currency = Column(String(16), nullable=True)
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="transactions")


class Goal(Base):
    __tablename__ = "goals"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id_", ondelete="CASCADE"), nullable=False)
    summ = Column(Float, nullable=False)
    name = Column(String, nullable=False)
    saved = Column(Float, nullable=False, default=0.0)

    user = relationship("User", back_populates="goals")


class Notification(Base):
    __tablename__ = "notifications"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id_", ondelete="CASCADE"), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="notifications")
