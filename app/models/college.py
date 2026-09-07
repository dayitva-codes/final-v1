from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Battalion(Base):
    __tablename__ = "battalions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)  # e.g. "3 MP GIRLS BN"

    colleges = relationship("College", back_populates="battalion")


class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    battalion_id = Column(Integer, ForeignKey("battalions.id"), nullable=False)
    name = Column(String, nullable=False)
    academic_year_start = Column(Integer, nullable=False)  # e.g. 2026

    battalion = relationship("Battalion", back_populates="colleges")
    cadets = relationship("Cadet", back_populates="college")
