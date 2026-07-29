from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.guide_assignment import GuideAssignment
from app.models.leave_request import LeaveRequest
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestReview, LeaveRequestOut

router = APIRouter(prefix="/leave", tags=["leave-requests"])


def _enrich(req: LeaveRequest, db: Session) -> dict:
    data = {c.name: getattr(req, c.name) for c in req.__table__.columns}
    profile = db.query(InternProfile).filter(InternProfile.id == req.intern_id).first()
    if profile:
        user = db.query(User).filter(User.id == profile.user_id).first()
        data["intern_name"] = user.name if user else None
    else:
        data["intern_name"] = None
    return data


@router.post("/", response_model=LeaveRequestOut, status_code=status.HTTP_201_CREATED)
def create_leave_request(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("intern")),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    if payload.to_date < payload.from_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    req = LeaveRequest(intern_id=profile.id, **payload.model_dump())
    db.add(req)
    db.commit()
    db.refresh(req)
    return _enrich(req, db)


@router.get("/me", response_model=List[LeaveRequestOut])
def my_leave_requests(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("intern")),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        return []
    reqs = db.query(LeaveRequest).filter(LeaveRequest.intern_id == profile.id).order_by(LeaveRequest.created_at.desc()).all()
    return [_enrich(r, db) for r in reqs]


@router.get("/pending", response_model=List[LeaveRequestOut])
def pending_requests_for_guide(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide", "coordinator")),
):
    if user.role == "coordinator":
        reqs = db.query(LeaveRequest).filter(LeaveRequest.status == "pending").order_by(LeaveRequest.created_at.desc()).all()
        return [_enrich(r, db) for r in reqs]

    assignments = db.query(GuideAssignment).filter(GuideAssignment.guide_id == user.id).all()
    intern_ids = [a.intern_id for a in assignments]
    if not intern_ids:
        return []
    reqs = db.query(LeaveRequest).filter(
        LeaveRequest.intern_id.in_(intern_ids),
    ).order_by(LeaveRequest.created_at.desc()).all()
    return [_enrich(r, db) for r in reqs]


@router.put("/{request_id}/review", response_model=LeaveRequestOut)
def review_leave_request(
    request_id: int,
    payload: LeaveRequestReview,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide", "coordinator")),
):
    req = db.query(LeaveRequest).filter(LeaveRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if payload.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be approved or rejected")

    req.status = payload.status
    req.reviewer_id = user.id
    req.reviewer_comment = payload.reviewer_comment
    req.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return _enrich(req, db)
