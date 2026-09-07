from fastapi import APIRouter

from app.api.v1 import ai_insights, auth, cadets, colleges, dashboard, evaluations, mentors

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(cadets.router)
api_router.include_router(mentors.router)
api_router.include_router(colleges.router)
api_router.include_router(evaluations.router)
api_router.include_router(dashboard.router)
api_router.include_router(ai_insights.router)
