from fastapi import FastAPI

from app.api.routes import api_router
from app.config import get_settings
from app.core.logging import setup_logging


def create_application() -> FastAPI:
    settings = get_settings()
    setup_logging()

    app = FastAPI(title=settings.app_name)
    app.include_router(api_router)
    return app


app = create_application()
