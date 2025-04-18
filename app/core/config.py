from pydantic_settings import BaseSettings
from typing import List, Optional
import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
env_path = Path('.') / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    """
    Application settings configuration.
    Values are loaded from environment variables and .env files.
    """
    API_VERSION: str = "1.0.0"
    PROJECT_NAME: str = "P2P Storage Space Marketplace"
    DESCRIPTION: str = "A peer-to-peer marketplace for renting out personal storage spaces"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/storage_space")
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Metrics
    METRICS_ENABLED: bool = True
    
    # File Storage
    MAX_LISTING_IMAGES: int = 10
    MAX_IMAGE_SIZE_MB: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create a global settings object
settings = Settings()