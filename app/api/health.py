from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/", response_class=HTMLResponse)
async def root():
    """Root landing page with API information."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vielseitig API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 900px;
                margin: 50px auto;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                background: rgba(255,255,255,0.95);
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                color: #333;
            }
            h1 { 
                color: #667eea; 
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            .tagline {
                color: #666;
                font-size: 1.2em;
                margin-bottom: 30px;
            }
            .card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
                border-left: 4px solid #667eea;
            }
            .card h3 {
                margin-top: 0;
                color: #667eea;
            }
            a {
                color: #667eea;
                text-decoration: none;
                font-weight: bold;
            }
            a:hover { text-decoration: underline; }
            .btn {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                border-radius: 6px;
                margin: 10px 10px 10px 0;
                transition: background 0.3s;
            }
            .btn:hover {
                background: #764ba2;
                text-decoration: none;
            }
            code {
                background: #e9ecef;
                padding: 3px 8px;
                border-radius: 3px;
                font-family: 'Courier New', monospace;
                color: #d63384;
            }
            .status {
                display: inline-block;
                background: #28a745;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 0.9em;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 Vielseitig</h1>
            <p class="tagline">API Backend für Adjektiv-Sortierung & Selbstreflexion</p>
            
            <p><span class="status">● Online</span></p>
            
            <div class="card">
                <h3>📚 API Documentation</h3>
                <p>Explore all 40+ endpoints with interactive Swagger UI:</p>
                <a href="/docs" class="btn">Open API Docs →</a>
                <a href="/redoc" class="btn" style="background: #764ba2;">ReDoc →</a>
            </div>
            
            <div class="card">
                <h3>🔐 Authentication</h3>
                <p><strong>Admin Access:</strong> <code>POST /admin/login</code></p>
                <p><strong>Teacher Access:</strong> <code>POST /user/login</code></p>
                <p><strong>Student Access:</strong> <code>GET /l/{token}</code> (public share links)</p>
            </div>
            
            <div class="card">
                <h3>🎯 Key Features</h3>
                <ul>
                    <li>User & School Management (Admin)</li>
                    <li>Custom Adjective Lists with Sharing (Teachers)</li>
                    <li>Student Sorting Sessions with Analytics</li>
                    <li>PDF Export with Hexagon Visualization</li>
                    <li>QR Code Generation for Easy Sharing</li>
                    <li>Analytics Dashboard with Aggregations</li>
                </ul>
            </div>
            
            <div class="card">
                <h3>🚀 Quick Links</h3>
                <p>
                    <a href="/admin">Admin Portal</a> •
                    <a href="/health">Health Check</a> •
                    <a href="/l">Standard List</a>
                </p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 0.9em;">
                <p>Vielseitig © 2026 • Built with FastAPI & SQLAlchemy</p>
            </div>
        </div>
    </body>
    </html>
    """


@router.get("/health")
async def health() -> dict[str, str]:
    """Return a simple health payload for uptime checks."""

    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

