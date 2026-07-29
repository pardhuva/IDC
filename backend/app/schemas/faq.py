from typing import Optional

from pydantic import BaseModel


class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    intent_label: Optional[str] = None


class FAQOut(BaseModel):
    id: int
    question: str
    answer: str
    category: Optional[str] = None
    intent_label: Optional[str] = None

    class Config:
        from_attributes = True
