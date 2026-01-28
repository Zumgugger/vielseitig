from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.api.routes import api_router
from app.config import get_settings
from app.core.logging import setup_logging


def create_application() -> FastAPI:
    settings = get_settings()
    setup_logging()

    app = FastAPI(title=settings.app_name)
    project_root = Path(__file__).resolve().parents[1]
    frontend_dist = project_root / "frontend" / "dist"
    dist_index = frontend_dist / "index.html"
    favicon_path = frontend_dist / "favicon.ico"
    
    # Add CORS middleware for development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(api_router)

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        if favicon_path.exists():
            return FileResponse(favicon_path)
        raise HTTPException(status_code=404)

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str, request: Request):
        # GET requests to page routes → serve SPA (index.html)
        # Any request to unmatched API routes → 404
        if dist_index.exists():
            return FileResponse(dist_index)
        raise HTTPException(status_code=404, detail="Frontend build not found")
    return app


app = create_application()
