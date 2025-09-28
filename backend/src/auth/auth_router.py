from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import JSONResponse

from src.auth.auth_services import (
    create_user,
    authenticate_user
)
from src.auth.schemas import (
    UserCreate,
    UserLogin,
    UserLoginResponse,
    TokenPair
)
from src.config import logger
from src.database import get_db
from src.utils.exceptions import (
    email_already_registered_exception,
    username_already_registered_exception,
    invalid_credentials_exception,
)
from src.utils.getters_services import (
    get_user_by_email,
    get_user_by_username,
)
from src.utils.jwt_handlers import (
    create_refresh_token,
    create_access_token
)

auth_router = APIRouter()


@auth_router.post("/signup")
async def sign_up(request: Request, user: UserCreate, db: AsyncSession = Depends(get_db)):
    if await get_user_by_email(db, user.email):
        raise email_already_registered_exception
    if await get_user_by_username(db, user.username):
        raise username_already_registered_exception

    new_user = await create_user(db, user)

    access_token = await create_access_token({"sub": str(new_user.id_), "username": new_user.username})
    refresh_token = await create_refresh_token({"sub": str(new_user.id_)})
    return TokenPair(access_token=access_token, refresh_token=refresh_token)


@auth_router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    email = user.email.strip().lower()

    db_user = await authenticate_user(db, email, user.password)
    if not db_user:
        logger.info("Login failed for email=%s", email)
        raise invalid_credentials_exception

    access_token = await create_access_token(data={"sub": str(db_user.id_)})
    refresh_token = await create_refresh_token(data={"sub": str(db_user.id_)})

    logger.info("User signed in: id=%s email=%s", db_user.id_, db_user.email)
    return UserLoginResponse(access_token=access_token, refresh_token=refresh_token)
