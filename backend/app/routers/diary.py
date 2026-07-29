from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.diary import DiaryEntry
from app.schemas.diary import DiaryEntryCreate, DiaryEntryOut, DiaryCommentUpdate

router = APIRouter(prefix="/diary", tags=["diary"])


@router.post("/", response_model=DiaryEntryOut, status_code=status.HTTP_201_CREATED)
def create_diary_entry(
    payload: DiaryEntryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("intern")),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    entry = DiaryEntry(
        intern_id=profile.id,
        **payload.model_dump(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/me", response_model=List[DiaryEntryOut])
def list_own_diary(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return db.query(DiaryEntry).filter(DiaryEntry.intern_id == profile.id).order_by(DiaryEntry.date.desc()).all()


@router.get("/intern/{intern_id}", response_model=List[DiaryEntryOut])
def view_intern_diary(
    intern_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    return db.query(DiaryEntry).filter(DiaryEntry.intern_id == intern_id).order_by(DiaryEntry.date.desc()).all()


@router.put("/{entry_id}/comment", response_model=DiaryEntryOut)
def add_diary_comment(
    entry_id: int,
    payload: DiaryCommentUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry
