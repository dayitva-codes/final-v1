from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.mentor import Mentor, ScopeLevelEnum
from app.models.user import RoleEnum
from app.schemas.mentor import MentorRegister
from app.services.auth_service import create_user


def register_mentor(db: Session, data: MentorRegister) -> Mentor:
    if data.scope_level == ScopeLevelEnum.institute and not data.college_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "college_id required for institute-level mentor")
    if data.scope_level == ScopeLevelEnum.multi_college and not data.battalion_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "battalion_id required for multi-college mentor")

    # Mentors start unverified — an admin must approve them before they can score cadets.
    user = create_user(db, data.email, data.password, RoleEnum.mentor, is_verified=False)

    mentor = Mentor(
        user_id=user.id,
        enrollment_number=data.enrollment_number,
        scope_level=data.scope_level,
        college_id=data.college_id,
        battalion_id=data.battalion_id,
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor


def verify_mentor(db: Session, mentor_user_id: int) -> None:
    from app.models.user import User

    user = db.query(User).filter(User.id == mentor_user_id, User.role == RoleEnum.mentor).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mentor not found")
    user.is_verified = True
    db.commit()
