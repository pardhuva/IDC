from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.campus import OfficeLocation, Announcement
from app.models.contact import Contact
from app.schemas.campus import (
    OfficeLocationCreate, OfficeLocationOut,
    AnnouncementCreate, AnnouncementOut,
)

router = APIRouter(prefix="/campus", tags=["campus"])


# --- Office Locations ---

@router.get("/offices", response_model=List[OfficeLocationOut])
def list_offices(db: Session = Depends(get_db)):
    return db.query(OfficeLocation).filter(OfficeLocation.is_active == True).all()


@router.get("/offices/{slug}", response_model=OfficeLocationOut)
def get_office_by_slug(slug: str, db: Session = Depends(get_db)):
    office = db.query(OfficeLocation).filter(OfficeLocation.slug == slug).first()
    if not office:
        raise HTTPException(status_code=404, detail="Office location not found")
    return office


@router.post("/offices", response_model=OfficeLocationOut, status_code=status.HTTP_201_CREATED)
def create_office(
    payload: OfficeLocationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    office = OfficeLocation(**payload.model_dump())
    db.add(office)
    db.commit()
    db.refresh(office)
    return office


# --- Announcements ---

@router.get("/announcements", response_model=List[AnnouncementOut])
def list_announcements(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Announcement)
    # Filter by target role if set
    announcements = query.all()
    return [
        a for a in announcements
        if a.target_role is None or a.target_role == user.role
    ]


@router.post("/announcements", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    announcement = Announcement(
        **payload.model_dump(),
        created_by=user.id,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


# --- Contacts ---

@router.get("/contacts")
def list_contacts(db: Session = Depends(get_db)):
    return db.query(Contact).all()


@router.post("/contacts", status_code=status.HTTP_201_CREATED)
def create_contact(
    payload: dict,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("coordinator")),
):
    contact = Contact(**payload)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact
