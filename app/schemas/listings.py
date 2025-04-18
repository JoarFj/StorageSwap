from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Optional
from datetime import datetime
import re

# Space type validation
valid_space_types = ["basement", "garage", "attic", "room", "shed", "other"]

# Base schema with common attributes
class ListingBase(BaseModel):
    title: str
    description: str
    space_type: str
    size: int  # in square feet
    price_per_month: int  # in cents
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    latitude: float
    longitude: float
    features: Optional[List[str]] = None
    access_instructions: Optional[str] = None
    access_type: str  # 24/7, by appointment, specific hours
    available_from: datetime
    available_to: Optional[datetime] = None
    is_active: bool = True

    @validator('space_type')
    def validate_space_type(cls, v):
        if v not in valid_space_types:
            raise ValueError(f'Space type must be one of {valid_space_types}')
        return v

    @validator('zip_code')
    def validate_zip_code(cls, v):
        if not re.match(r'^\d{5}(-\d{4})?$', v):
            raise ValueError('Invalid US zip code format')
        return v

# Schema for creating a listing
class ListingCreate(ListingBase):
    images: List[str]  # URLs to images
    
    @validator('images')
    def validate_images(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one image URL is required')
        return v

# Schema for listing creation from frontend (with dollar amount)
class ListingCreateFromFrontend(BaseModel):
    title: str
    description: str
    space_type: str
    sizeSqFt: str  # String to handle frontend input
    pricePerMonthDollars: str  # String to handle frontend input
    address: str
    city: str
    state: str
    zip_code: str
    country: str
    latitude: float
    longitude: float
    imageUrls: List[str]
    featuresInput: str
    access_instructions: Optional[str] = None
    access_type: str
    available_from: datetime
    available_to: Optional[datetime] = None
    is_active: bool = True

    @root_validator
    def convert_to_backend_format(cls, values):
        # Convert price from dollars to cents
        price_dollars = values.get('pricePerMonthDollars')
        if price_dollars:
            try:
                values['price_per_month'] = int(float(price_dollars) * 100)
            except ValueError:
                raise ValueError('Price must be a valid number')
        
        # Convert size from string to int
        size_str = values.get('sizeSqFt')
        if size_str:
            try:
                values['size'] = int(float(size_str))
            except ValueError:
                raise ValueError('Size must be a valid number')
                
        # Convert features string to list
        features_input = values.get('featuresInput')
        if features_input:
            values['features'] = [f.strip() for f in features_input.split(',') if f.strip()]
            
        # Copy image URLs to images field
        values['images'] = values.get('imageUrls', [])
        
        return values

# Schema for updating a listing
class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    space_type: Optional[str] = None
    size: Optional[int] = None
    price_per_month: Optional[int] = None
    images: Optional[List[str]] = None
    features: Optional[List[str]] = None
    access_instructions: Optional[str] = None
    access_type: Optional[str] = None
    available_from: Optional[datetime] = None
    available_to: Optional[datetime] = None
    is_active: Optional[bool] = None

    @validator('space_type')
    def validate_space_type(cls, v):
        if v is not None and v not in valid_space_types:
            raise ValueError(f'Space type must be one of {valid_space_types}')
        return v

# Schema for listing filters
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

# Schema for listing response
class ListingResponse(ListingBase):
    id: int
    host_id: int
    images: List[str]
    created_at: datetime

    class Config:
        from_attributes = True