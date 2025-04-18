from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

# Base Listing schema with common attributes
class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    space_type: str
    size: int  # in square feet
    price_per_month: int  # in cents
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None
    features: Optional[List[str]] = None
    access_instructions: Optional[str] = None
    access_type: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    is_active: bool = True
    
    @validator('space_type')
    def validate_space_type(cls, v):
        valid_space_types = [
            "garage", "basement", "attic", "shed", "storage_unit", 
            "warehouse", "closet", "room", "outdoor", "other"
        ]
        if v not in valid_space_types:
            raise ValueError(f'Space type must be one of {valid_space_types}')
        return v

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    space_type: Optional[str] = None
    size: Optional[int] = None
    price_per_month: Optional[int] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    images: Optional[List[str]] = None
    features: Optional[List[str]] = None
    access_instructions: Optional[str] = None
    access_type: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    is_active: Optional[bool] = None
    
    @validator('space_type')
    def validate_space_type(cls, v):
        if v is not None:
            valid_space_types = [
                "garage", "basement", "attic", "shed", "storage_unit", 
                "warehouse", "closet", "room", "outdoor", "other"
            ]
            if v not in valid_space_types:
                raise ValueError(f'Space type must be one of {valid_space_types}')
        return v

class ListingResponse(ListingBase):
    id: int
    host_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ListingFilters(BaseModel):
    location: Optional[str] = None
    space_type: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    min_size: Optional[int] = None
    max_size: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius: Optional[float] = None  # in miles

class ListingCreateFromFrontend(BaseModel):
    """Special schema for handling frontend form data format"""
    title: str
    description: Optional[str] = None
    space_type: str
    sizeSqFt: str  # String from frontend form
    pricePerMonthDollars: str  # String from frontend form (e.g., "125.00")
    address: str
    city: str
    state: str
    zip_code: str
    country: str = "United States"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    imageUrls: Optional[List[str]] = None
    featuresInput: Optional[str] = None  # Comma-separated string from frontend
    access_instructions: Optional[str] = None
    access_type: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    is_active: bool = True