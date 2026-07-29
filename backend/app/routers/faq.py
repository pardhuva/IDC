from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User
from app.models.faq import FAQ
from app.schemas.faq import FAQCreate, FAQOut

router = APIRouter(prefix="/faq", tags=["faq"])


@router.get("/", response_model=List[FAQOut])
def list_faqs(db: Session = Depends(get_db)):
    return db.query(FAQ).filter(FAQ.is_active == True).all()


@router.post("/", response_model=FAQOut, status_code=status.HTTP_201_CREATED)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    faq = FAQ(**payload.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.get("/search", response_model=List[FAQOut])
def search_faqs(q: str, db: Session = Depends(get_db)):
    return (
        db.query(FAQ)
        .filter(FAQ.is_active == True)
        .filter(
            FAQ.question.ilike(f"%{q}%") | FAQ.answer.ilike(f"%{q}%")
        )
        .all()
    )
