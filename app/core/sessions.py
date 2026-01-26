"""Session management for admin and user authentication."""
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin import Admin
from app.models.user import User


class SessionStore:
    """In-memory session store with expiration handling."""
    
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(
        self, 
        user_id: int, 
        user_type: str,  # 'admin' or 'user'
        session_data: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a new session and return session token."""
        token = secrets.token_urlsafe(32)
        
        # Session timeout: 2 days of inactivity (sliding window)
        expires_at = datetime.utcnow() + timedelta(days=2)
        
        self._sessions[token] = {
            "user_id": user_id,
            "user_type": user_type,
            "created_at": datetime.utcnow(),
            "last_activity": datetime.utcnow(),
            "expires_at": expires_at,
            "data": session_data or {}
        }
        
        return token
    
    def get_session(self, token: str) -> Optional[Dict[str, Any]]:
        """Get session data if valid and not expired."""
        if token not in self._sessions:
            return None
        
        session = self._sessions[token]
        
        # Check expiration
        if datetime.utcnow() > session["expires_at"]:
            del self._sessions[token]
            return None
        
        # Update last activity (sliding window)
        session["last_activity"] = datetime.utcnow()
        session["expires_at"] = datetime.utcnow() + timedelta(days=2)
        
        return session
    
    def delete_session(self, token: str) -> bool:
        """Delete a session. Returns True if session existed."""
        if token in self._sessions:
            del self._sessions[token]
            return True
        return False
    
    def cleanup_expired(self):
        """Remove expired sessions."""
        now = datetime.utcnow()
        expired = [
            token for token, session in self._sessions.items()
            if now > session["expires_at"]
        ]
        for token in expired:
            del self._sessions[token]


# Global session store instance
session_store = SessionStore()


async def get_current_admin(
    session_token: Optional[str],
    db: AsyncSession
) -> Optional[Admin]:
    """Get current admin from session token."""
    if not session_token:
        return None
    
    session = session_store.get_session(session_token)
    if not session or session["user_type"] != "admin":
        return None
    
    result = await db.execute(
        select(Admin).where(Admin.id == session["user_id"])
    )
    admin = result.scalar_one_or_none()
    
    return admin


async def get_current_user(
    session_token: Optional[str],
    db: AsyncSession
) -> Optional[User]:
    """Get current user from session token."""
    if not session_token:
        return None
    
    session = session_store.get_session(session_token)
    if not session or session["user_type"] != "user":
        return None
    
    result = await db.execute(
        select(User).where(User.id == session["user_id"])
    )
    user = result.scalar_one_or_none()
    
    return user
