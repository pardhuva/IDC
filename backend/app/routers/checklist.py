from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.checklist import ChecklistItem
from app.schemas.checklist import ChecklistItemOut

router = APIRouter(prefix="/checklist", tags=["checklist"])

DEFAULT_STEPS = [
    ("profile_photo", "Complete Profile & Upload Photo"),
    ("joining_report", "Submit Joining Report"),
    ("nda_signed", "Sign NDA / Secrecy Agreement"),
    ("id_proof_uploaded", "Upload ID Proof & College Letter"),
    ("entry_pass_collected", "Collect SHAR Entry Pass"),
    ("security_briefing", "Complete Security Briefing"),
    ("system_access_granted", "Get System/Network Access"),
    ("hostel_mess_registered", "Register at Hostel/Mess (if applicable)"),
    ("safety_orientation", "Complete Safety Orientation"),
    ("guide_assigned", "Get Guide Assigned"),
    ("project_allocated", "Get Project Allocated"),
    ("workspace_setup", "Set Up Workspace"),
    ("library_card", "Collect Library Card"),
    ("medical_certificate", "Submit Medical Fitness Certificate"),
]


@router.get("/", response_model=List[ChecklistItemOut])
def get_checklist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return db.query(ChecklistItem).filter(ChecklistItem.intern_id == profile.id).all()


@router.post("/init", response_model=List[ChecklistItemOut], status_code=status.HTTP_201_CREATED)
def init_checklist(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    existing = db.query(ChecklistItem).filter(ChecklistItem.intern_id == profile.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Checklist already initialized")

    items = []
    for step_key, title in DEFAULT_STEPS:
        item = ChecklistItem(
            intern_id=profile.id,
            step_key=step_key,
            title=title,
        )
        db.add(item)
        items.append(item)

    db.commit()
    for item in items:
        db.refresh(item)
    return items


@router.put("/{item_id}/complete", response_model=ChecklistItemOut)
def complete_item(
    item_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    item = db.query(ChecklistItem).filter(
        ChecklistItem.id == item_id,
        ChecklistItem.intern_id == profile.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")

    item.is_completed = True
    item.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item
