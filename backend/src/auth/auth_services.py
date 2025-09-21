import secrets
from datetime import timezone, datetime

from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.schemas import UserCreate
from src.models import User, UserStatus
from src.utils.getters_services import get_user_by_id, get_user_by_email
from src.utils.auth_services import hash_password, verify_password


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """New user creation"""
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        default_currency=user.default_currency,
        timezone=user.timezone,
        capital=0.0,
    )

    db.add(new_user)
    await db.flush()
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User | None:
    user = await get_user_by_email(db, email)
    if not user or not getattr(user, "hashed_password", None):
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user
