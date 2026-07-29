from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.event import Event
from app.schemas.event import EventCreate, EventOut

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/", response_model=List[EventOut])
def list_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Event).order_by(Event.event_date.desc()).all()


@router.get("/upcoming", response_model=List[EventOut])
def list_upcoming_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Event)
        .filter(Event.event_date >= datetime.now())
        .order_by(Event.event_date.asc())
        .all()
    )


@router.get("/featured", response_model=List[EventOut])
def list_featured_events(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return db.query(Event).filter(Event.is_featured == True).all()


@router.post("/", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    event = Event(**payload.model_dump(), created_by=user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
