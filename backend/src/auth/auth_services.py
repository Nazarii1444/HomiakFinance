import secrets
from datetime import timezone, datetime
import re
import requests
import hashlib
from sqlalchemy.ext.asyncio import AsyncSession

from src.auth.schemas import UserCreate
from src.models import User, UserStatus
from src.utils.getters_services import get_user_by_id, get_user_by_email
from src.utils.auth_services import hash_password, verify_password
from src.auth.password_validator import validate_password


async def create_user(db: AsyncSession, user: UserCreate) -> User:
    """New user creation"""
    print("Password: ", user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        capital=0.0
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


def check_password_strength(password: str) -> list[str]:
    errors = []

    if len(password) < 8:
        errors.append("Password must be at least 8 characters")

    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain an uppercase letter")

    if not re.search(r"[a-z]", password):
        errors.append("Password must contain a lowercase letter")

    if not re.search(r"\d", password):
        errors.append("Password must contain a number")

    if not re.search(r"[@$!%*?&]", password):
        errors.append("Password must contain a special character")

    if not validate_password(password):
        errors.append("Password too common")

    sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1[:5], sha1[5:]
    res = requests.get(f"https://api.pwnedpasswords.com/range/{prefix}")
    if suffix in res.text:
        errors.append("Password found in leaked databases")

    return errors
