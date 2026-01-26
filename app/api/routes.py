from fastapi import APIRouter

from app.api import health, admin_auth, user_auth, admin_users

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(admin_auth.router)
api_router.include_router(user_auth.router)
api_router.include_router(admin_users.router)
