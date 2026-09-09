from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SupabaseToken(BaseModel):
    access_token: str


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True
