import os

from dotenv import load_dotenv

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
    "http://localhost",
    "http://93.115.23.34/",
    "http://93.115.23.34:80",
    "https://93.115.23.34:80",
]

# ====== logging =====

import logging, sys
from logging.config import dictConfig

dictConfig({
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {"format": "%(asctime)s %(levelname)s [%(name)s] %(message)s"}
    },
    "handlers": {
        "stdout": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "default",
        }
    },
    "root": {"level": "DEBUG", "handlers": ["stdout"]},
    "loggers": {
        "uvicorn": {"level": "DEBUG", "handlers": ["stdout"], "propagate": False},
        "uvicorn.error": {"level": "DEBUG", "handlers": ["stdout"], "propagate": False},
        "uvicorn.access": {"level": "INFO", "handlers": ["stdout"], "propagate": False},
        "gunicorn": {"level": "DEBUG", "handlers": ["stdout"], "propagate": False},
        "gunicorn.error": {"level": "DEBUG", "handlers": ["stdout"], "propagate": False},
        "gunicorn.access": {"level": "INFO", "handlers": ["stdout"], "propagate": False},
    },
})

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
