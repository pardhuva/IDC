from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import User
from app.models.project import Project
from app.models.intern_profile import InternProfile
from app.schemas.project import ProjectCreate, ProjectOut

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("/", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    project = Project(
        **payload.model_dump(),
        guide_id=user.id,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/", response_model=List[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role == "guide":
        return db.query(Project).filter(Project.guide_id == user.id).all()
    elif user.role == "intern":
        profile = db.query(InternProfile).filter(InternProfile.user_id == user.id).first()
        if not profile:
            return []
        return db.query(Project).filter(Project.intern_id == profile.id).all()
    else:
        # Coordinator sees all
        return db.query(Project).all()


@router.put("/{project_id}/assign/{intern_id}", response_model=ProjectOut)
def assign_intern_to_project(
    project_id: int,
    intern_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("guide")),
):
    project = db.query(Project).filter(Project.id == project_id, Project.guide_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    intern = db.query(InternProfile).filter(InternProfile.id == intern_id).first()
    if not intern:
        raise HTTPException(status_code=404, detail="Intern not found")

    project.intern_id = intern_id
    db.commit()
    db.refresh(project)
    return project
