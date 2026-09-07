from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.cadet import Cadet, GenderEnum, WingEnum
from app.models.college import College
from app.models.user import RoleEnum
from app.schemas.cadet import CadetRegister
from app.services.auth_service import create_user

GIRLS_WINGS = {WingEnum.JW, WingEnum.SW}
BOYS_WINGS = {WingEnum.JD, WingEnum.SD}


def validate_wing_matches_gender(gender: GenderEnum, wing: WingEnum) -> None:
    """
    Business rule enforced server-side, not just trusted from the frontend:
    girls -> JW/SW, boys -> JD/SD.
    """
    if gender == GenderEnum.female and wing not in GIRLS_WINGS:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Female cadets must be registered under wing JW or SW",
        )
    if gender == GenderEnum.male and wing not in BOYS_WINGS:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Male cadets must be registered under wing JD or SD",
        )


def register_cadet(db: Session, data: CadetRegister) -> Cadet:
    validate_wing_matches_gender(data.gender, data.wing)

    college = db.query(College).filter(College.id == data.college_id).first()
    if not college or college.battalion_id != data.battalion_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "College does not belong to the selected battalion",
        )

    existing = db.query(Cadet).filter(Cadet.enrollment_number == data.enrollment_number).first()
    if existing:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Enrollment number already registered")

    user = create_user(db, data.email, data.password, RoleEnum.cadet, is_verified=True)

    cadet = Cadet(
        user_id=user.id,
        college_id=data.college_id,
        enrollment_number=data.enrollment_number,
        full_name=data.full_name,
        mobile=data.mobile,
        photo_url=data.photo_url,
        academic_year=data.academic_year,
        address=data.address,
        gender=data.gender,
        wing=data.wing,
        ncc_goal=data.ncc_goal,
    )
    db.add(cadet)
    db.commit()
    db.refresh(cadet)
    return cadet
