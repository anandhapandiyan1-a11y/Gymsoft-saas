import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Security - MUST be set via environment variable in production
    SECRET_KEY: str = "dev_secret_key_change_in_production_please_use_env_var"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours
    TRIAL_DAYS: int = 7
    
    # Database - defaults to SQLite for local dev, use persistent disk in production
    DATABASE_URL: str = "sqlite:///./gymsoft.db"
    
    # CORS - set via env in production
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"  # Allow extra env vars

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # In production on Render, use persistent disk for SQLite
        if self.ENVIRONMENT == "production" and self.DATABASE_URL.startswith("sqlite"):
            db_path = "/opt/render/project/src/backend/data/gymsoft.db"
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            self.DATABASE_URL = f"sqlite:///{db_path}"

settings = Settings()