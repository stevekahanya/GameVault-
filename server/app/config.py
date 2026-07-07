"""Environment-driven configuration for local and deployed Flask runs."""

import os
import secrets
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


def split_origins(value):
    """Turn a comma-separated CORS_ORIGINS env var into a clean list."""
    return [origin.strip() for origin in value.split(",") if origin.strip()]


class Config:
    # Defaults keep local setup easy, while production should set explicit secrets.
    SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URI",
        f"sqlite:///{os.path.join(BASE_DIR, 'questlog.db')}",
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY") or SECRET_KEY

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.getenv("JWT_ACCESS_TOKEN_HOURS", "12"))
    )

    RAWG_API_KEY = os.getenv("RAWG_API_KEY")

    # Vite's common localhost origins are allowed by default for development.
    CORS_ORIGINS = split_origins(
        os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
    )
