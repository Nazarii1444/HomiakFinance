# AGENTS.md – Homiak Finance Backend

## Architecture Overview

FastAPI async backend (Python 3.13) with PostgreSQL via `asyncpg`/SQLAlchemy async.

**Domain packages** under `src/` each contain a `*_router.py` and usually `schemas.py`:
- `auth/` – signup/login, password strength + HaveIBeenPwned check
- `transactions/` – CRUD; every mutation updates `User.capital` via currency conversion
- `currencies/` – exchange rates fetched from NBU API on a `repeat_every` cron registered in `app.py`
- `goals/` – savings goals (target `summ`, current `saved`)
- `users/` – profile CRUD (`/api/users/me`)
- `two_fa/` – TOTP setup/verify (pyotp + qrcode)
- `google_oauth/`, `github_oauth/` – OAuth2 via Authlib; tokens set as **cookies** (unlike regular login which returns JSON)
- `for_testing/` – unauthenticated `/api/dev/seed` endpoint (10 users × 20 tx), **not for production**
- `health/` – `GET /health/` → `{"status":"OK"}`

**Key cross-cutting files:**
- `src/app.py` – router registration, middlewares, cron hook
- `src/models.py` – all SQLAlchemy ORM models (`User`, `Transaction`, `Goal`, `Notification`, `Currency`)
- `src/dependencies.py` – `get_current_user` / `get_current_user_id_from_token` FastAPI deps
- `src/config.py` – env vars, logging setup, CORS origins (`localhost:3000`, `localhost:5173`)
- `src/utils/` – shared helpers (exceptions, getters, JWT handlers, security)

## Critical Patterns

### Primary Key Convention
All ORM models use `id_` (with trailing underscore) as the PK attribute, e.g. `user.id_`, `tx.id_`. Using `.id` will silently return `None`.

### Dual Utilities – Know Which to Use
| Concern | File | Library |
|---|---|---|
| Hash / verify password | `src/utils/auth_services.py` | `passlib` pbkdf2_sha256 |
| Create/decode JWT | `src/utils/jwt_handlers.py` | `PyJWT` (`import jwt`) |
| Decode JWT in dependencies | `src/utils/security.py` | `python-jose` |
| Shared exceptions | `src/utils/exceptions.py` | pre-built `HTTPException` instances |
| Reusable DB queries | `src/utils/getters_services.py` | `get_user_by_email/username/id` |

`src/config.py` (root config) and `src/utils/config.py` (JWT token lifetimes) both load `.env` separately.

### Authentication Flow
1. `POST /api/auth/login` → returns `{access_token, refresh_token}` JSON
2. Bearer token decoded by `src/dependencies.py:get_current_user_id_from_token` → `get_current_user` injects `User` ORM object
3. OAuth routes (Google/GitHub) set tokens as HTTP cookies instead of JSON response

### Capital & Currency Conversion
Every `Transaction` creation/update adjusts `User.capital` (stored in user's `default_currency`). Conversion in `src/transactions/currency_converter.py` pivots through USD using rates from the `currencies` table. Income adds, expense subtracts. The `currencies` table is refreshed on a cron from the National Bank of Ukraine (`NBU_API_URL` env var).

### Expense Categories
`ALLOWED_EXPENSES_CATEGORIES` is a hardcoded list at the top of `src/transactions/transaction_router.py`. Add new categories there.

## Developer Workflows

### Run Dev Server
```bash
# from backend/
python src/app.py
# Starts on http://127.0.0.1:8000 with reload=True
```

### Run Tests
```bash
# from backend/
pytest
# or with coverage:
pytest --cov=src --cov-report=term-missing
```

Tests use **in-memory SQLite** (via `aiosqlite`), not Postgres. `conftest.py` overrides the `get_db` dependency and wipes all tables between each test. `pytest.ini` sets `asyncio_mode = auto` and `pythonpath = .`.

### Database Migrations (Alembic)
```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```
The custom `alembic/env.py` (see README) imports `Base` from `src.models` and `DATABASE_URL` from `src.config`.

### Required `.env` Variables
```
POSTGRES_USER, POSTGRES_PASSWORD, DB_HOST, DB_PORT, DB_NAME
SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
NBU_API_URL
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
```

### Seed Local Data
```
POST /api/dev/seed   (no auth required)
```
Creates 10 users (password `password123`) with 20 random transactions each.

