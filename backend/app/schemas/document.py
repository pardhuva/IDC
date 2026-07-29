from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    intern_id: int
    doc_type: str
    original_filename: str
    status: str
    reviewer_notes: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
