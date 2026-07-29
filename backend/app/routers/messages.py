from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.intern_profile import InternProfile
from app.models.guide_assignment import GuideAssignment
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["messages"])


def _enrich(msg: Message, db: Session) -> dict:
    data = {c.name: getattr(msg, c.name) for c in msg.__table__.columns}
    sender = db.query(User).filter(User.id == msg.sender_id).first()
    data["sender_name"] = sender.name if sender else None
    return data


@router.post("/", response_model=MessageOut, status_code=201)
def send_message(
    payload: MessageCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not payload.receiver_id and not payload.group_id:
        raise HTTPException(status_code=400, detail="Provide receiver_id (DM) or group_id (group chat)")

    msg = Message(
        sender_id=user.id,
        receiver_id=payload.receiver_id if not payload.group_id else None,
        group_id=payload.group_id,
        content=payload.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return _enrich(msg, db)


@router.get("/dm/{other_user_id}", response_model=List[MessageOut])
def get_dm_thread(
    other_user_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    msgs = db.query(Message).filter(
        Message.group_id.is_(None),
        or_(
            and_(Message.sender_id == user.id, Message.receiver_id == other_user_id),
            and_(Message.sender_id == other_user_id, Message.receiver_id == user.id),
        )
    ).order_by(Message.created_at.asc()).all()

    db.query(Message).filter(
        Message.sender_id == other_user_id,
        Message.receiver_id == user.id,
        Message.is_read == False,
    ).update({"is_read": True})
    db.commit()

    return [_enrich(m, db) for m in msgs]


@router.get("/group/{group_id}", response_model=List[MessageOut])
def get_group_messages(
    group_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    msgs = db.query(Message).filter(
        Message.group_id == group_id,
    ).order_by(Message.created_at.asc()).all()
    return [_enrich(m, db) for m in msgs]


@router.get("/contacts")
def get_message_contacts(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    contacts = []

    if user.role == "intern":
        profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
        if profile:
            assignment = db.query(GuideAssignment).filter(GuideAssignment.intern_id == profile.id).first()
            if assignment:
                guide = db.query(User).filter(User.id == assignment.guide_id).first()
                if guide:
                    contacts.append({"id": guide.id, "name": guide.name, "role": "guide", "type": "dm"})
                    contacts.append({"id": f"guide_{guide.id}", "name": f"{guide.name}'s Team", "role": "group", "type": "group"})

    elif user.role == "guide":
        assignments = db.query(GuideAssignment).filter(GuideAssignment.guide_id == user.id).all()
        for a in assignments:
            profile = db.query(InternProfile).filter(InternProfile.id == a.intern_id).first()
            if profile:
                intern_user = db.query(User).filter(User.id == profile.user_id).first()
                if intern_user:
                    contacts.append({"id": intern_user.id, "name": intern_user.name, "role": "intern", "type": "dm"})
        if assignments:
            contacts.append({"id": f"guide_{user.id}", "name": "My Interns (Group)", "role": "group", "type": "group"})

    elif user.role == "coordinator":
        guides = db.query(User).filter(User.role == "guide").all()
        for g in guides:
            contacts.append({"id": g.id, "name": g.name, "role": "guide", "type": "dm"})

    return contacts


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    count = db.query(Message).filter(
        Message.receiver_id == user.id,
        Message.is_read == False,
    ).count()
    return {"count": count}
