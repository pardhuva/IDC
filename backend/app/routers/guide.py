from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.guide_assignment import GuideAssignment
from app.models.intern_profile import InternProfile
from app.schemas.intern import InternProfileOut

router = APIRouter(prefix="/guide", tags=["guide"])


class AssignGuidePayload(BaseModel):
    guide_id: int
    intern_id: int


@router.post("/assign", status_code=status.HTTP_201_CREATED)
def assign_guide(
    payload: AssignGuidePayload,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    # Verify guide exists and is a guide
    guide = db.query(User).filter(User.id == payload.guide_id, User.role == "guide").first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")

    # Verify intern profile exists
    profile = db.query(InternProfile).filter(InternProfile.id == payload.intern_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern not found")

    existing = db.query(GuideAssignment).filter(
        GuideAssignment.guide_id == payload.guide_id,
        GuideAssignment.intern_id == payload.intern_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Assignment already exists")

    assignment = GuideAssignment(
        guide_id=payload.guide_id,
        intern_id=payload.intern_id,
        assigned_by=user.id,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"id": assignment.id, "guide_id": assignment.guide_id, "intern_id": assignment.intern_id}


@router.get("/my-interns", response_model=List[InternProfileOut])
def get_my_interns(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    assignments = db.query(GuideAssignment).filter(GuideAssignment.guide_id == user.id).all()
    intern_ids = [a.intern_id for a in assignments]
    if not intern_ids:
        return []
    return db.query(InternProfile).filter(InternProfile.id.in_(intern_ids)).all()


@router.get("/my-guide")
def get_my_guide(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    assignment = db.query(GuideAssignment).filter(GuideAssignment.intern_id == profile.id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="No guide assigned yet")

    guide = db.query(User).filter(User.id == assignment.guide_id).first()
    return {"id": guide.id, "name": guide.name, "email": guide.email}
