from pydantic_settings import BaseSettings
from typing import Optional, List
import secrets
import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_VERSION: str = "1.0.0"
    PROJECT_NAME: str = "P2P Storage Space Marketplace"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/storage_space")
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Monitoring settings
    METRICS_ENABLED: bool = True

    class Config:
        env_file = ".env"

# Create global settings object
settings = Settings()