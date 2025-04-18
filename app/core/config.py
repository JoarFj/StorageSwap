from pydantic_settings import BaseSettings
import os
import secrets
from typing import List, Optional

from dotenv import load_dotenv
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings configuration.
    Values are loaded from environment variables and .env files.
    """
    API_VERSION: str = "1.0.0"
    PROJECT_NAME: str = "P2P Storage Space Marketplace"
    DESCRIPTION: str = "A peer-to-peer marketplace for renting out personal storage spaces"
    
    # Security settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/storage_space")
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Metrics settings
    METRICS_ENABLED: bool = True
    
    # Application settings
    MAX_LISTING_IMAGES: int = 10
    MAX_IMAGE_SIZE_MB: int = 5
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()