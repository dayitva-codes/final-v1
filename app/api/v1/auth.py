from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import SupabaseToken, Token, UserOut
from app.services import auth_service
from jose import JWTError, jwt

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        token = auth_service.login(db, form_data.username, form_data.password)
        return Token(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication server error: {str(e)}"
        )


@router.post("/supabase", response_model=Token)
def login_with_supabase(payload: SupabaseToken, db: Session = Depends(get_db)):
    if not settings.supabase_jwt_secret:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Supabase login is not configured")
    try:
        claims = jwt.decode(
            payload.access_token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid Supabase session") from exc
    token = auth_service.login_with_supabase(db, claims, settings.supabase_jwt_secret)
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
