import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Security - MUST be set via environment variable in production
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours
    TRIAL_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = "sqlite:///./gymsoft.db"
    
    # CORS - set via env in production
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()