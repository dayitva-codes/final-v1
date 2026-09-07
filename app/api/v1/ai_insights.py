from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.services import ai_insight_service, evaluation_service

router = APIRouter(tags=["ai"])


@router.get("/cadets/{cadet_id}/ai-insight")
def get_ai_insight(cadet_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    scores = evaluation_service.get_cadet_score_summary(db, cadet_id)
    insight = ai_insight_service.generate_insight(scores)
    return insight
