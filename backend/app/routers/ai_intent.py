"""Router for AI-powered FAQ intent classification."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.ai.intent_classifier import (
    classify_and_route,
    train_classifier,
    INTENT_DESCRIPTIONS,
)

router = APIRouter(prefix="/ai", tags=["ai"])


# ---- Request / Response schemas -------------------------------------------

class ClassifyRequest(BaseModel):
    text: str


class IntentScore(BaseModel):
    intent: str
    confidence: float


class ClassifyResponse(BaseModel):
    intent: str
    confidence: float
    action_type: str
    target_url: str
    message: str
    all_intents: list[IntentScore]


class IntentInfo(BaseModel):
    intent: str
    description: str


# ---- Endpoints ------------------------------------------------------------

@router.post("/classify-intent", response_model=ClassifyResponse)
def classify_intent(
    body: ClassifyRequest,
    user: User = Depends(get_current_user),
):
    """Classify a user question and return the matched intent with a routed action."""
    result = classify_and_route(body.text)
    return ClassifyResponse(
        intent=result["intent"],
        confidence=result["confidence"],
        action_type=result["action_type"],
        target_url=result["target_url"],
        message=result["message"],
        all_intents=[
            IntentScore(intent=i["intent"], confidence=i["confidence"])
            for i in result["all_intents"]
        ],
    )


@router.get("/intents", response_model=list[IntentInfo])
def list_intents():
    """Return all recognised intent categories with descriptions (public)."""
    return [
        IntentInfo(intent=k, description=v)
        for k, v in INTENT_DESCRIPTIONS.items()
    ]


@router.post("/retrain")
def retrain_classifier(
    user: User = Depends(require_role("coordinator")),
):
    """Re-train the intent classifier (coordinator only)."""
    train_classifier()
    return {"status": "ok", "message": "Classifier retrained successfully."}
