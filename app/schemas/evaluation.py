from datetime import datetime

from pydantic import BaseModel


class EvaluationCreate(BaseModel):
    cadet_id: int
    criterion_id: int
    score: float
    remarks: str | None = None


class EvaluationOut(BaseModel):
    id: int
    cadet_id: int
    mentor_id: int
    criterion_id: int
    score: float
    remarks: str | None
    evaluated_at: datetime

    class Config:
        from_attributes = True


class CriterionOut(BaseModel):
    id: int
    name: str
    max_score: int

    class Config:
        from_attributes = True


class CadetScoreSummary(BaseModel):
    """One row per criterion, averaged — this is what feeds the dashboard and the AI insight."""
    criterion_name: str
    average_score: float
    max_score: int
