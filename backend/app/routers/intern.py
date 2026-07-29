from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.schemas.intern import InternProfileCreate, InternProfileOut, InternProfileUpdate

router = APIRouter(prefix="/interns", tags=["interns"])


@router.post("/", response_model=InternProfileOut, status_code=status.HTTP_201_CREATED)
def create_intern_profile(
    payload: InternProfileCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("intern")),
):
    existing = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Intern profile already exists")

    profile = InternProfile(
        user_id=user.id,
        phone=payload.phone,
        college=payload.college,
        department=payload.department,
        joining_date=payload.joining_date,
        internship_duration_months=payload.internship_duration_months,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me", response_model=InternProfileOut)
def get_own_profile(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return profile


@router.put("/me", response_model=InternProfileOut)
def update_own_profile(
    payload: InternProfileUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/", response_model=List[InternProfileOut])
def list_all_interns(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    return db.query(InternProfile).all()


@router.get("/{intern_id}", response_model=InternProfileOut)
def get_intern_by_id(
    intern_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator", "guide")),
):
    profile = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return profile
