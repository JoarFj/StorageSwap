from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Base schema with common attributes
class MessageBase(BaseModel):
    receiver_id: int
    message: str
    listing_id: Optional[int] = None
    booking_id: Optional[int] = None
    is_read: bool = False

# Schema for creating a message
class MessageCreate(MessageBase):
    pass

# Schema for updating a message (only allows marking as read)
class MessageUpdate(BaseModel):
    is_read: bool = True

# Schema for message response
class MessageResponse(MessageBase):
    id: int
    sender_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for conversation summary
class ConversationGroup(BaseModel):
    other_user_id: int
    other_user_name: str
    other_user_avatar: Optional[str] = None
    last_message: MessageResponse
    unread_count: int