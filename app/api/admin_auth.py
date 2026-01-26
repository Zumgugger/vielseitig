"""Admin authentication routes."""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.core.security import verify_password
from app.core.sessions import session_store
from app.models.admin import Admin
from app.api.deps import get_optional_session_token, require_admin


router = APIRouter(prefix="/admin", tags=["admin-auth"])


@router.get("/", response_class=HTMLResponse)
async def admin_landing():
    """Admin landing page with helpful information."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vielseitig Admin API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #1f77b4; }
            .info { background: #e8f4f8; padding: 15px; border-radius: 4px; margin: 20px 0; }
            a { color: #1f77b4; text-decoration: none; font-weight: bold; }
            a:hover { text-decoration: underline; }
            code {
                background: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 Vielseitig Admin API</h1>
            
            <div class="info">
                ℹ️ This is an API endpoint. To interact with the admin API, use:
            </div>
            
            <h3>📚 Interactive API Documentation</h3>
            <p>
                <a href="/docs">Swagger UI at /docs</a> - Test all endpoints with a graphical interface
            </p>
            
            <h3>🔐 Admin Login</h3>
            <p>POST request to <code>/admin/login</code> with JSON body:</p>
            <pre style="background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto;">
{
  "username": "admin",
  "password": "changeme"
}</pre>
            
            <h3>📋 Available Admin Endpoints</h3>
            <ul>
                <li><code>POST /admin/login</code> - Admin login</li>
                <li><code>POST /admin/logout</code> - Admin logout</li>
                <li><code>GET /admin/profile</code> - Get admin profile</li>
                <li><code>GET /admin/pending-users</code> - View pending user registrations</li>
                <li><code>GET /admin/pending-schools</code> - View pending school registrations</li>
                <li><code>GET /admin/users</code> - List all users</li>
                <li><code>GET /admin/schools</code> - List all schools</li>
                <li><code>GET /admin/analytics/summary</code> - Analytics dashboard data</li>
                <li><code>GET /admin/standard-list</code> - Manage standard adjective list</li>
            </ul>
            
            <p style="margin-top: 30px;">
                <a href="/docs" style="background: #1f77b4; color: white; padding: 12px 24px; border-radius: 4px; display: inline-block;">
                    Go to API Documentation →
                </a>
            </p>
        </div>
    </body>
    </html>
    """


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    message: str
    username: str


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(
    credentials: AdminLoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_session)
):
    """Admin login endpoint."""
    # Find admin by username
    result = await db.execute(
        select(Admin).where(Admin.username == credentials.username)
    )
    admin = result.scalar_one_or_none()
    
    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Create session
    session_token = session_store.create_session(
        user_id=admin.id,
        user_type="admin"
    )
    
    # Update last login timestamp
    await db.execute(
        update(Admin)
        .where(Admin.id == admin.id)
        .values(last_login_at=datetime.utcnow())
    )
    await db.commit()
    
    # Set session cookie (httpOnly, Secure, SameSite)
    response.set_cookie(
        key="vielseitig_session",
        value=session_token,
        httponly=True,
        secure=True,  # HTTPS only
        samesite="lax",
        max_age=60 * 60 * 24 * 2  # 2 days
    )
    
    return AdminLoginResponse(
        message="Login successful",
        username=admin.username
    )


@router.post("/logout")
async def admin_logout(
    response: Response,
    session_token: str = Depends(get_optional_session_token),
    admin: Admin = Depends(require_admin)
):
    """Admin logout endpoint."""
    if session_token:
        session_store.delete_session(session_token)
    
    # Clear cookie
    response.delete_cookie(key="vielseitig_session")
    
    return {"message": "Logout successful"}


@router.get("/profile")
async def get_admin_profile(admin: Admin = Depends(require_admin)):
    """Get current admin profile."""
    return {
        "id": admin.id,
        "username": admin.username,
        "created_at": admin.created_at,
        "last_login_at": admin.last_login_at
    }
