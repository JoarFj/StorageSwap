from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

# Base schema with common attributes
class BookingBase(BaseModel):
    listing_id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    total_price: int  # in cents
    platform_fee: int  # in cents
    status: str = "pending"  # pending, confirmed, cancelled, completed
    payment_status: str = "pending"  # pending, paid, refunded

    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ["pending", "confirmed", "cancelled", "completed"]
        if v not in valid_statuses:
            raise ValueError(f'Status must be one of {valid_statuses}')
        return v

    @validator('payment_status')
    def validate_payment_status(cls, v):
        valid_payment_statuses = ["pending", "paid", "refunded"]
        if v not in valid_payment_statuses:
            raise ValueError(f'Payment status must be one of {valid_payment_statuses}')
        return v

# Schema for creating a booking
class BookingCreate(BookingBase):
    pass

# Schema for updating a booking
class BookingUpdate(BaseModel):
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None

    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            valid_statuses = ["pending", "confirmed", "cancelled", "completed"]
            if v not in valid_statuses:
                raise ValueError(f'Status must be one of {valid_statuses}')
        return v

    @validator('payment_status')
    def validate_payment_status(cls, v):
        if v is not None:
            valid_payment_statuses = ["pending", "paid", "refunded"]
            if v not in valid_payment_statuses:
                raise ValueError(f'Payment status must be one of {valid_payment_statuses}')
        return v

# Schema for booking response
class BookingResponse(BookingBase):
    id: int
    renter_id: int
    created_at: datetime

    class Config:
        from_attributes = True