from src.config import API_URL
from typing import Dict
from fastapi import APIRouter
import httpx

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy import Float, String, Column




async def fetch_rates() -> Dict[str, float]:
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.get(API_URL)
        r.raise_for_status()
        data = r.json()
        rates: Dict[str, float] = data.get("rates", {})
        rates["USD"] = 1.0
        return rates


async def upsert_rates(rates: Dict[str, float]) -> None:
    async with AsyncSessionLocal() as session:
        values = [{"name": code, "count": float(rate)} for code, rate in rates.items()]
        stmt = insert(Currency).values(values)
        stmt = stmt.on_conflict_do_update(
            index_elements=[Currency.name],
            set_={"count": stmt.excluded.count},
        )
        await session.execute(stmt)
        await session.commit()


currency_router = APIRouter()

@currency_router.get("/")
async def update_currencies():
    rates = await fetch_rates()

    return {"status": "OK"}
