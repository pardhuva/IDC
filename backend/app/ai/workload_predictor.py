"""
Workload / Completion Predictor Module
Uses rule-based feature engineering + logistic regression to predict
whether an intern will complete their internship on time.
"""

from datetime import datetime, timedelta

# ---------------------------------------------------------------------------
# Lazy sklearn imports
# ---------------------------------------------------------------------------
_model = None


def _get_model():
    """Return a fitted LogisticRegression on synthetic anchors (lazy load)."""
    global _model
    if _model is not None:
        return _model

    import numpy as np
    from sklearn.linear_model import LogisticRegression

    # Synthetic anchor points so the model generalises from feature values.
    # Features: [task_rate, diary_rate, doc_score, checklist_rate,
    #            time_remaining_frac, velocity]
    X = np.array([
        # clearly on track
        [1.0, 1.0, 1.0, 1.0, 0.5, 1.0],
        [0.8, 0.9, 0.9, 0.8, 0.4, 0.8],
        [0.7, 0.8, 0.8, 0.7, 0.6, 0.7],
        # borderline
        [0.5, 0.5, 0.5, 0.5, 0.3, 0.5],
        [0.4, 0.6, 0.6, 0.4, 0.2, 0.4],
        # behind
        [0.2, 0.3, 0.3, 0.2, 0.1, 0.2],
        [0.1, 0.1, 0.2, 0.1, 0.05, 0.1],
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    ])
    y = np.array([1, 1, 1, 1, 0, 0, 0, 0])

    clf = LogisticRegression(max_iter=200)
    clf.fit(X, y)
    _model = clf
    return _model


# ---------------------------------------------------------------------------
# Feature helpers (reuse patterns from performance_scorer)
# ---------------------------------------------------------------------------

def _task_features(db, intern_id: int) -> dict:
    from app.models.task import Task
    from app.models.project import Project

    projects = db.query(Project).filter(Project.intern_id == intern_id).all()
    project_ids = [p.id for p in projects]

    if not project_ids:
        return {"total": 0, "completed": 0, "in_progress": 0, "rate": 0.0}

    total = db.query(Task).filter(Task.project_id.in_(project_ids)).count()
    completed = db.query(Task).filter(
        Task.project_id.in_(project_ids), Task.status == "completed"
    ).count()
    in_progress = db.query(Task).filter(
        Task.project_id.in_(project_ids), Task.status == "in_progress"
    ).count()

    rate = (completed / total) if total > 0 else 0.0
    return {"total": total, "completed": completed, "in_progress": in_progress, "rate": rate}


def _diary_features(db, intern_id: int, total_days: int) -> dict:
    from app.models.diary import DiaryEntry

    entries = db.query(DiaryEntry).filter(DiaryEntry.intern_id == intern_id).all()
    weekdays = max(total_days * 5 / 7, 1)
    rate = min(len(entries) / weekdays, 1.0)
    return {"entries": len(entries), "expected": int(weekdays), "rate": rate}


def _document_features(db, intern_id: int) -> dict:
    from app.models.document import Document

    docs = db.query(Document).filter(Document.intern_id == intern_id).all()
    if not docs:
        return {"total": 0, "verified": 0, "pending": 0, "rejected": 0, "score": 0.0}

    verified = sum(1 for d in docs if d.status == "verified")
    pending = sum(1 for d in docs if d.status == "pending")
    rejected = sum(1 for d in docs if d.status == "rejected")
    total = len(docs)
    score = (verified + pending * 0.5) / total if total else 0.0
    return {"total": total, "verified": verified, "pending": pending,
            "rejected": rejected, "score": score}


def _checklist_features(db, intern_id: int) -> dict:
    from app.models.checklist import ChecklistItem

    items = db.query(ChecklistItem).filter(ChecklistItem.intern_id == intern_id).all()
    if not items:
        return {"total": 0, "completed": 0, "rate": 0.0}

    completed = sum(1 for i in items if i.is_completed)
    return {"total": len(items), "completed": completed,
            "rate": completed / len(items)}


def _time_features(profile) -> dict:
    """Return days elapsed, total duration, and remaining fraction."""
    today = datetime.utcnow().date()

    if profile.joining_date and profile.internship_duration_months:
        start = profile.joining_date
        end = start + timedelta(days=profile.internship_duration_months * 30)
        elapsed = max((today - start).days, 0)
        total = max((end - start).days, 1)
        remaining = max((end - today).days, 0)
        remaining_frac = remaining / total
    else:
        elapsed = 30
        total = 180
        remaining = 150
        remaining_frac = remaining / total

    return {
        "days_elapsed": elapsed,
        "total_days": total,
        "days_remaining": remaining,
        "remaining_fraction": remaining_frac,
    }


# ---------------------------------------------------------------------------
# Main prediction function
# ---------------------------------------------------------------------------

def predict_completion(intern_id: int, db) -> dict:
    """
    Predict whether an intern will complete on time.

    Returns dict with probability (0-100), status label, predicted end date,
    risk factors, and suggestions.
    """
    import numpy as np

    from app.models.intern_profile import InternProfile

    profile = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not profile:
        return {
            "intern_id": intern_id,
            "probability": 0,
            "status": "Unknown",
            "predicted_end_date": None,
            "risk_factors": ["Intern profile not found"],
            "suggestions": [],
        }

    # Gather features
    time_info = _time_features(profile)
    task_info = _task_features(db, intern_id)
    diary_info = _diary_features(db, intern_id, time_info["days_elapsed"])
    doc_info = _document_features(db, intern_id)
    cl_info = _checklist_features(db, intern_id)

    # Velocity: tasks completed per day
    velocity = (task_info["completed"] / max(time_info["days_elapsed"], 1))
    # Normalise velocity to 0-1 (cap at 2 tasks/day)
    velocity_norm = min(velocity / 2.0, 1.0)

    feature_vector = np.array([[
        task_info["rate"],
        diary_info["rate"],
        doc_info["score"],
        cl_info["rate"],
        time_info["remaining_fraction"],
        velocity_norm,
    ]])

    model = _get_model()
    prob = float(model.predict_proba(feature_vector)[0][1]) * 100
    prob = round(prob, 1)

    # Classify
    if prob >= 70:
        status = "On Track"
    elif prob >= 40:
        status = "At Risk"
    else:
        status = "Behind Schedule"

    # Predicted end date
    if task_info["total"] > 0 and velocity > 0:
        remaining_tasks = task_info["total"] - task_info["completed"]
        days_to_finish = remaining_tasks / velocity
        predicted_end = datetime.utcnow().date() + timedelta(days=int(days_to_finish))
    elif profile.joining_date and profile.internship_duration_months:
        predicted_end = profile.joining_date + timedelta(
            days=profile.internship_duration_months * 30
        )
    else:
        predicted_end = None

    # Risk factors
    risk_factors = []
    if task_info["rate"] < 0.4:
        risk_factors.append("Low task completion rate ({:.0%})".format(task_info["rate"]))
    if diary_info["rate"] < 0.5:
        risk_factors.append("Inconsistent diary entries ({:.0%} of expected)".format(diary_info["rate"]))
    if doc_info["rejected"] > 0:
        risk_factors.append(f"{doc_info['rejected']} document(s) rejected")
    if cl_info["rate"] < 0.5:
        risk_factors.append("Checklist less than half complete ({:.0%})".format(cl_info["rate"]))
    if time_info["remaining_fraction"] < 0.2 and task_info["rate"] < 0.7:
        risk_factors.append("Less than 20% time remaining with significant work left")

    # Suggestions
    suggestions = []
    if task_info["rate"] < 0.5:
        suggestions.append("Prioritise completing in-progress tasks before starting new ones.")
    if diary_info["rate"] < 0.5:
        suggestions.append("Write a short diary entry every working day to stay consistent.")
    if doc_info["score"] < 0.7:
        suggestions.append("Upload or re-submit pending/rejected documents promptly.")
    if cl_info["rate"] < 0.5:
        suggestions.append("Complete remaining onboarding checklist items.")
    if velocity == 0 and task_info["total"] > 0:
        suggestions.append("No tasks completed yet. Start with the highest-priority task.")
    if not suggestions:
        suggestions.append("Keep up the good work and maintain your current pace.")

    return {
        "intern_id": intern_id,
        "probability": prob,
        "status": status,
        "predicted_end_date": str(predicted_end) if predicted_end else None,
        "risk_factors": risk_factors,
        "suggestions": suggestions,
        "features": {
            "task_completion_rate": round(task_info["rate"], 2),
            "diary_consistency": round(diary_info["rate"], 2),
            "document_score": round(doc_info["score"], 2),
            "checklist_progress": round(cl_info["rate"], 2),
            "time_remaining_fraction": round(time_info["remaining_fraction"], 2),
            "velocity_tasks_per_day": round(velocity, 3),
        },
    }
