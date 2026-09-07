from fastapi import FastAPI

from app.api.v1.router import api_router
from app.db.base import Base
from app.db.seed import seed
from app.db.session import SessionLocal, engine

# Import all models so Base knows about every table before create_all runs.
from app.models import cadet, college, evaluation, mentor, user  # noqa: F401

app = FastAPI(title="NCC Battalion Management System", version="1.0.0")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(api_router, prefix="/api/v1")
