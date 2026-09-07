from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db, require_role
from app.models.user import User
from app.schemas.mentor import MentorOut, MentorRegister
from app.services import mentor_service

router = APIRouter(prefix="/mentors", tags=["mentors"])


@router.post("/register", response_model=MentorOut, status_code=status.HTTP_201_CREATED)
def register(data: MentorRegister, db: Session = Depends(get_db)):
    return mentor_service.register_mentor(db, data)


@router.post("/{user_id}/verify", status_code=status.HTTP_200_OK)
def verify(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_role("admin")),
):
    mentor_service.verify_mentor(db, user_id)
    return {"detail": "Mentor verified"}
