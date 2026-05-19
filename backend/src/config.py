import logging
import os
from datetime import timedelta

from dotenv import load_dotenv

# Just a config file
load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "secret_key")
POSTGRES_USER: str = os.getenv("POSTGRES_USER", default="postgres")
POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", default="postgres")
DB_HOST: str = os.getenv("DB_HOST", default="127.0.0.1")
DB_PORT: int = os.getenv("DB_PORT", default=5432)
DB_NAME: str = os.getenv("DB_NAME", default="homiakdb")

_db_url_env = os.getenv("DATABASE_URL")
if _db_url_env:
    # Support Neon/Render/etc. connection strings; ensure asyncpg driver is used
    DATABASE_URL = _db_url_env.replace("postgresql://", "postgresql+asyncpg://", 1).replace("postgres://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    *[o.strip() for o in os.getenv("EXTRA_CORS_ORIGINS", "").split(",") if o.strip()],
]

# ===== logging =====

logging.basicConfig(
    filename='logs.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)


# ===== currencies =====
NBU_API_URL = os.getenv("NBU_API_URL")

# ===== JWT =====
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
ACCESS_TOKEN_EXPIRES = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

# ===== Google =====
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_ACCESS_COOKIE_NAME = "access_token"
JWT_REFRESH_COOKIE_NAME = "refresh_token"

# ===== Github =====
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
