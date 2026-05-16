from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from src.utils.getters_services import get_user_by_email

bcrypt_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return bcrypt_context.hash(password)


async def authenticate_user(db: AsyncSession, email: str, password: str):
    """Check user and his password"""
    user = await get_user_by_email(db, email)

    if not user or not verify_password(password, user.hashed_password):
        return None

    return user
