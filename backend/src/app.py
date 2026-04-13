import os
import sys
import time

import uvicorn

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utilities import repeat_every
from starlette.middleware.sessions import SessionMiddleware

from src.health.routers import health_router
from src.auth.auth_router import auth_router
from src.transactions.transaction_router import transaction_router
from src.for_testing.dev_router import dev_router
from src.users.users_router import users_router
from src.currencies.currency_router import currency_router, register_currency_cron
from src.goals.goal_router import goal_router
from src.google_oauth.google_router import google_oauth_router
from src.github_oauth.github_oauth import github_oauth_router
from src.two_fa.two_fa_router import two_fa_router

from src.database import get_db
from src.config import origins


def create_app(*, enable_cron: bool = True) -> FastAPI:
    """Application factory.

    Parameters
    ----------
    enable_cron:
        When *True* (default / production), the NBU currency-refresh cron is
        registered as a startup task.  Pass *False* in tests to avoid
        background tasks that prevent the event-loop from closing.
    """
    application = FastAPI(title="Homiak Finance", description="Homiak Finance API")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    if enable_cron:
        register_currency_cron(application)

    @application.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

    application.add_middleware(SessionMiddleware, secret_key="super-session-secret")

    application.include_router(health_router, prefix="/health", tags=["Health Check"])
    application.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
    application.include_router(transaction_router, prefix="/api/transactions", tags=["Transactions"])
    application.include_router(dev_router, prefix="/api/dev")
    application.include_router(users_router, prefix="/api/users", tags=["Users"])
    application.include_router(currency_router, prefix="/api/currencies", tags=["Currencies"])
    application.include_router(google_oauth_router, prefix="/api", tags=["Google OAuth"])
    application.include_router(github_oauth_router, prefix="/api", tags=["Github OAuth"])
    application.include_router(goal_router, prefix="/api/goals", tags=["Goals"])
    application.include_router(two_fa_router, prefix="/api/2fa", tags=["2FA"])

    return application


# Production singleton — used by ``uvicorn src.app:app``
app = create_app(enable_cron=True)

if __name__ == '__main__':
    get_db()
    uvicorn.run("src.app:app", host="127.0.0.1", port=8000, reload=True, workers=4)
