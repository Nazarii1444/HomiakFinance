import os
import sys
import time

import uvicorn

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_utilities import repeat_every

from src.health.routers import health_router
from src.auth.auth_router import auth_router
from src.transactions.transaction_router import transaction_router
from src.for_testing.dev_router import dev_router
from src.users.users_router import users_router
from src.currencies.currency_router import currency_router, register_currency_cron

from src.database import get_db
from src.config import origins

app = FastAPI(title="Homiak Finance", description="Homiak Finance API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_currency_cron(app)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


app.include_router(health_router, prefix="/health", tags=["Health Check"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(transaction_router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(dev_router, prefix="/api/dev")
app.include_router(users_router, prefix="/api/users", tags=["Users"])
app.include_router(currency_router, prefix="/api/currencies", tags=["Currencies"])


if __name__ == '__main__':
    get_db()
    uvicorn.run("src.app:app", host="127.0.0.1", port=8000, reload=True, workers=4)
