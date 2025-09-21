from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, project

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(project.router, prefix="/project", tags=["project"])
