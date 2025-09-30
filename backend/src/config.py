import os
import logging
from dotenv import load_dotenv
from datetime import timedelta

# Just a config file
load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY", "secret_key")
POSTGRES_USER: str = os.getenv("POSTGRES_USER", default="postgres")
POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", default="postgres")
DB_HOST: str = os.getenv("DB_HOST", default="127.0.0.1")
DB_PORT: int = os.getenv("DB_PORT", default=5432)
DB_NAME: str = os.getenv("DB_NAME", default="homiakdb")

DATABASE_URL: str = f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

origins = [
    "http://localhost:3000",
    "http://localhost:5173"
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
NBU_API_URL = "https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json"

# ===== JWT =====
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1h
ACCESS_TOKEN_EXPIRES = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
