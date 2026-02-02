from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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
    dist_assets = frontend_dist / "assets"
    favicon_path = frontend_dist / "favicon.ico"
    
    # Add CORS middleware
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://vielseitig.zumgugger.ch",
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(api_router)
    
    # Mount static assets directory (JS, CSS, images from Vite build)
    if dist_assets.exists():
        app.mount("/assets", StaticFiles(directory=str(dist_assets)), name="assets")

    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        if favicon_path.exists():
            return FileResponse(favicon_path)
        raise HTTPException(status_code=404)

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str, request: Request):
        # Serve static files from dist if they exist
        static_file = frontend_dist / full_path
        if static_file.exists() and static_file.is_file():
            return FileResponse(static_file)
        
        # GET requests to page routes → serve SPA (index.html)
        if dist_index.exists():
            return FileResponse(dist_index)
        raise HTTPException(status_code=404, detail="Frontend build not found")
    
    return app


app = create_application()
