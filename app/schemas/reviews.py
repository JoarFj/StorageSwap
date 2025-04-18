from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

# Base schema with common attributes
class ReviewBase(BaseModel):
    booking_id: int
    reviewed_id: int
    listing_id: Optional[int] = None
    rating: int
    comment: Optional[str] = None
    is_public: bool = True

    @validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

# Schema for creating a review
class ReviewCreate(ReviewBase):
    pass

# Schema for updating a review
class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None
    is_public: Optional[bool] = None

    @validator('rating')
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError('Rating must be between 1 and 5')
        return v

# Schema for review response
class ReviewResponse(ReviewBase):
    id: int
    reviewer_id: int
    created_at: datetime

    class Config:
        from_attributes = True