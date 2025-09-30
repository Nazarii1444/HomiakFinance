from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from src.database import get_db
from src.models import User
from src.utils.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user_id_from_token(token: str = Depends(oauth2_scheme)) -> int:
    try:
        payload = decode_token(token)
        sub = payload.get("sub")
        exp = int(payload.get("exp"))
        now = int(datetime.now(timezone.utc).timestamp())
        if now > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired",
            )
        user_id = int(sub)

    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")
    return user_id


async def get_current_user(
        db: AsyncSession = Depends(get_db),
        user_id: int = Depends(get_current_user_id_from_token),
) -> User:
    user = (await db.execute(select(User).where(User.id_ == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
