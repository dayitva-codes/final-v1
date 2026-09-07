from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class EvaluationCriterion(Base):
    """
    A table, not a hardcoded list — admins can add/rename criteria
    without touching code.
    """
    __tablename__ = "evaluation_criteria"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    max_score = Column(Integer, default=10, nullable=False)

    evaluations = relationship("Evaluation", back_populates="criterion")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(Integer, primary_key=True, index=True)
    cadet_id = Column(Integer, ForeignKey("cadets.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentors.id"), nullable=False)
    criterion_id = Column(Integer, ForeignKey("evaluation_criteria.id"), nullable=False)

    score = Column(Float, nullable=False)
    remarks = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    cadet = relationship("Cadet", back_populates="evaluations")
    mentor = relationship("Mentor", back_populates="evaluations")
    criterion = relationship("EvaluationCriterion", back_populates="evaluations")
