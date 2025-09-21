from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, Enum, TIMESTAMP, UniqueConstraint, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.database import Base

import enum


class UserStatus(enum.Enum):
    USER = 0
    ADMIN = 1


class User(Base):
    __tablename__ = "users"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    hashed_password = Column(String(255), nullable=False)
    default_currency = Column(String(16), ForeignKey("currencies.name"), nullable=True)
    timezone = Column(String(64), nullable=True)
    capital = Column(Float, nullable=False, default=0.0)
    role = Column(Enum(UserStatus), nullable=False, default=UserStatus.USER)

    # relationships
    currency = relationship("Currency", back_populates="users", lazy="joined")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Currency(Base):
    __tablename__ = "currencies"

    name = Column(String(16), primary_key=True)
    rate = Column(Float, nullable=False, default=1.0)

    users = relationship("User", back_populates="currency")


class Transaction(Base):
    __tablename__ = "transactions"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id_", ondelete="CASCADE"), nullable=False)
    summ = Column(Float, nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="transactions")


class Goal(Base):
    __tablename__ = "goals"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id_", ondelete="CASCADE"), nullable=False)
    summ = Column(Float, nullable=False)

    user = relationship("User", back_populates="goals")


class Notification(Base):
    __tablename__ = "notifications"

    id_ = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id_", ondelete="CASCADE"), nullable=False)
    deadline = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="notifications")
