from datetime import datetime, timezone

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    """Return a simple health payload for uptime checks."""

    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
