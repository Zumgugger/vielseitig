import pytest
from httpx import AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test that the health endpoint returns OK status."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "timestamp" in data
        assert "environment" in data
