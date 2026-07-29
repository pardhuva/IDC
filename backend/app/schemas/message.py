from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class MessageCreate(BaseModel):
    receiver_id: Optional[int] = None
    group_id: Optional[str] = None
    content: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: Optional[int] = None
    group_id: Optional[str] = None
    content: str
    is_read: bool
    created_at: datetime
    sender_name: Optional[str] = None

    class Config:
        from_attributes = True
