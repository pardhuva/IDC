from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ChecklistItemOut(BaseModel):
    id: int
    step_key: str
    title: str
    is_completed: bool
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
