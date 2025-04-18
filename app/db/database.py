from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative class definitions
Base = declarative_base()

# Database dependency
def get_db() -> Session:
    """
    Dependency for getting a database session.
    Ensures session is closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()