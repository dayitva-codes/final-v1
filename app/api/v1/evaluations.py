from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_role
from app.models.evaluation import EvaluationCriterion
from app.models.user import User
from app.schemas.evaluation import CriterionOut, EvaluationCreate, EvaluationOut
from app.services import evaluation_service

router = APIRouter(prefix="/evaluations", tags=["evaluations"])


@router.get("/criteria", response_model=list[CriterionOut])
def list_criteria(db: Session = Depends(get_db)):
    return db.query(EvaluationCriterion).all()


@router.post("/", response_model=EvaluationOut, status_code=status.HTTP_201_CREATED)
def submit(
    data: EvaluationCreate,
    db: Session = Depends(get_db),
    mentor: User = Depends(require_role("mentor")),
):
    if not mentor.is_verified:
        from fastapi import HTTPException

        raise HTTPException(status.HTTP_403_FORBIDDEN, "Mentor not yet verified by admin")
    return evaluation_service.submit_evaluation(db, mentor.id, data)
