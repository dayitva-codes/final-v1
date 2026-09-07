from pydantic import BaseModel, EmailStr

from app.models.cadet import GenderEnum, WingEnum


class CadetRegister(BaseModel):
    # account
    email: EmailStr
    password: str
    # org placement
    battalion_id: int
    college_id: int
    # personal
    full_name: str
    enrollment_number: str
    mobile: str
    academic_year: int
    address: str | None = None
    gender: GenderEnum
    wing: WingEnum
    ncc_goal: str | None = None
    photo_url: str | None = None


class CadetOut(BaseModel):
    id: int
    full_name: str
    enrollment_number: str
    mobile: str
    academic_year: int
    gender: GenderEnum
    wing: WingEnum
    ncc_goal: str | None
    photo_url: str | None
    college_id: int

    class Config:
        from_attributes = True
