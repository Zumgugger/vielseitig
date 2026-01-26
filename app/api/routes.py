from fastapi import APIRouter

from app.api import (
    health,
    admin_auth,
    user_auth,
    admin_users,
    teacher,
    lists,
    admin_standard_list,
    share,
    qrcode,
    student,
    pdf,
    admin_analytics,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(admin_auth.router)
api_router.include_router(user_auth.router)
api_router.include_router(admin_users.router)
api_router.include_router(teacher.router)
api_router.include_router(lists.router)
api_router.include_router(admin_standard_list.router)
api_router.include_router(share.router)
api_router.include_router(qrcode.router)
api_router.include_router(student.router)
api_router.include_router(pdf.router)
api_router.include_router(admin_analytics.router)
