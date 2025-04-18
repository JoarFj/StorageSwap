from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Base schema with common attributes
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    is_host: bool = False

# Schema for creating a user
class UserCreate(UserBase):
    password: str
    confirm_password: str

# Schema for user login
class UserLogin(BaseModel):
    username: str
    password: str

# Schema for updating a user
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None
    is_host: Optional[bool] = None

# Schema for user response (without password)
class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for token response
class Token(BaseModel):
    access_token: str
    token_type: str

# Schema for token payload
class TokenPayload(BaseModel):
    sub: str  # subject (user id)