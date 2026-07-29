"""Router for Workload / Completion Predictor."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile

router = APIRouter(prefix="/ai/predict", tags=["AI - Predictor"])


@router.get("/me")
def my_prediction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Intern sees their own completion prediction."""
    from app.ai.workload_predictor import predict_completion

    profile = (
        db.query(InternProfile)
        .filter(InternProfile.user_id == current_user.id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")

    return predict_completion(profile.id, db)


@router.get("/overview")
def prediction_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coordinator")),
):
    """Coordinator sees all interns' completion predictions."""
    from app.ai.workload_predictor import predict_completion

    profiles = db.query(InternProfile).all()
    results = []
    for profile in profiles:
        pred = predict_completion(profile.id, db)
        results.append({
            "intern_id": profile.id,
            "user_id": profile.user_id,
            "probability": pred["probability"],
            "status": pred["status"],
            "predicted_end_date": pred["predicted_end_date"],
            "risk_factors": pred["risk_factors"],
        })

    # Sort: Behind Schedule first, then At Risk, then On Track
    order = {"Behind Schedule": 0, "At Risk": 1, "On Track": 2, "Unknown": 3}
    results.sort(key=lambda x: (order.get(x["status"], 99), x["probability"]))

    return {"predictions": results}


@router.get("/{intern_id}")
def intern_prediction(
    intern_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coordinator", "guide")),
):
    """Coordinator/guide views a specific intern's prediction."""
    from app.ai.workload_predictor import predict_completion

    profile = (
        db.query(InternProfile)
        .filter(InternProfile.id == intern_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Intern not found")

    return predict_completion(intern_id, db)
