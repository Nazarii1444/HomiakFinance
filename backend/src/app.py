import os
import sys
import time

import uvicorn

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from src.health.routers import health_router
from src.auth.routers.auth_router import auth_router

from src.database import get_db
from src.config import origins

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


app.include_router(health_router, prefix="/health", tags=["Health Check"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])


if __name__ == '__main__':
    get_db()
    uvicorn.run("src.app:app", host="127.0.0.1", port=8000, reload=True, workers=4)
