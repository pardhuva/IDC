"""
Router for AI-powered semantic search.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.ai.semantic_search import search as semantic_search, rebuild_index

router = APIRouter(prefix="/ai", tags=["AI Search"])


@router.get("/search")
def ai_search(
    q: str = Query(..., min_length=1, description="Search query"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Semantic search across all campus data (requires authentication)."""
    results = semantic_search(q, db, top_k=top_k)
    return {"query": q, "results": results}


@router.post("/rebuild-index")
def ai_rebuild_index(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("coordinator")),
):
    """Force rebuild the FAISS search index (coordinator only)."""
    rebuild_index(db)
    return {"message": "Search index rebuilt successfully."}
