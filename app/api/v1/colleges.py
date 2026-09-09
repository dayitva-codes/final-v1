from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.models.college import Battalion, College

router = APIRouter(tags=["colleges"])


class BattalionCreate(BaseModel):
    name: str
    code: str


class CollegeCreate(BaseModel):
    battalion_id: int
    name: str
    academic_year_start: int


@router.post("/battalions")
def create_battalion(data: BattalionCreate, db: Session = Depends(get_db)):
    existing = db.query(Battalion).filter(Battalion.code == data.code).first()
    if existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Battalion with code '{data.code}' already exists")
    b = Battalion(**data.model_dump())
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


@router.get("/battalions")
def list_battalions(db: Session = Depends(get_db)):
    return db.query(Battalion).all()


@router.post("/colleges")
def create_college(data: CollegeCreate, db: Session = Depends(get_db)):
    existing = db.query(College).filter(
        College.battalion_id == data.battalion_id,
        College.name == data.name
    ).first()
    if existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"College '{data.name}' already exists in this battalion")
    c = College(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/colleges")
def list_colleges(battalion_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(College)
    if battalion_id:
        q = q.filter(College.battalion_id == battalion_id)
    return q.all()
