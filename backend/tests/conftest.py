import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from src.app import create_app
from src.database import Base, get_db
from src.models import User, Currency, Currencies
from src.utils.auth_services import hash_password


app = create_app(enable_cron=False)

# ── In-memory SQLite (async) ──────────────────────────────────────────────────
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

TABLES_TO_CLEAN = ["notifications", "transactions", "goals", "users", "currencies"]


# ── DB lifecycle ──────────────────────────────────────────────────────────────
@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def clean_tables():
    """Wipe all rows before every test — keeps tables but removes data."""
    yield
    async with engine.begin() as conn:
        for table in TABLES_TO_CLEAN:
            await conn.execute(text(f"DELETE FROM {table}"))


@pytest_asyncio.fixture()
async def db():
    async with TestingSession() as session:
        yield session


# ── Override get_db dependency ────────────────────────────────────────────────
@pytest_asyncio.fixture()
async def client(db):
    async def _override():
        yield db

    app.dependency_overrides[get_db] = _override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


# ── Seed helpers ──────────────────────────────────────────────────────────────
def _unique_user(suffix: str = "") -> dict:
    """Generate unique user data to avoid UNIQUE constraint collisions."""
    uid = uuid.uuid4().hex[:8]
    return {
        "username": f"user_{uid}{suffix}",
        "email": f"user_{uid}{suffix}@example.com",
        "hashed_password": hash_password("StrongPass1!"),
        "default_currency": Currencies.USD.value,
        "capital": 0.0,
    }


@pytest_asyncio.fixture()
async def test_user(db) -> User:
    user = User(**_unique_user("_main"))
    # store known credentials for login
    user.email = "test@example.com"
    user.username = "testuser"
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture()
async def test_user2(db) -> User:
    user = User(**_unique_user("_other"))
    user.email = "other@example.com"
    user.username = "otheruser"
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest_asyncio.fixture()
async def seed_currency(db):
    """Insert a few currency rows so currency endpoints return data."""
    db.add_all([
        Currency(name="UAH", rate=41.5),
        Currency(name="EUR", rate=1.08),
        Currency(name="PLN", rate=4.0),
    ])
    await db.commit()


@pytest_asyncio.fixture()
async def auth_headers(client, test_user) -> dict:
    r = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "StrongPass1!",
    })
    token = r.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture()
async def auth_headers2(client, test_user2) -> dict:
    r = await client.post("/api/auth/login", json={
        "email": "other@example.com",
        "password": "StrongPass1!",
    })
    token = r.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}

