import os
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.document import Document
from app.schemas.document import DocumentOut

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found. Create profile first.")

    ext = os.path.splitext(file.filename)[1] if file.filename else ""
    stored_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        intern_id=profile.id,
        doc_type=doc_type,
        original_filename=file.filename or "unknown",
        file_path=file_path,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/me", response_model=List[DocumentOut])
def list_own_documents(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Intern profile not found")
    return db.query(Document).filter(Document.intern_id == profile.id).all()


class VerifyPayload(BaseModel):
    status: str
    reviewer_notes: Optional[str] = None


@router.put("/{doc_id}/verify", response_model=DocumentOut)
def verify_document(
    doc_id: int,
    payload: VerifyPayload,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = payload.status
    doc.reviewer_notes = payload.reviewer_notes
    doc.verified_by = user.id
    doc.verified_at = datetime.utcnow()

    db.commit()
    db.refresh(doc)
    return doc
