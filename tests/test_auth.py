"""Test authentication endpoints."""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.core.sessions import session_store
from app.core.security import verify_password
from sqlalchemy import select
from app.models.admin import Admin


async def test_auth():
    """Test authentication system."""
    print("Testing authentication system...")
    
    # Test session creation
    token = session_store.create_session(user_id=1, user_type="admin")
    print(f"✓ Created session token: {token[:16]}...")
    
    # Test session retrieval
    session = session_store.get_session(token)
    assert session is not None
    assert session["user_id"] == 1
    assert session["user_type"] == "admin"
    print("✓ Session retrieval works")
    
    # Test session deletion
    deleted = session_store.delete_session(token)
    assert deleted is True
    print("✓ Session deletion works")
    
    # Test database connection and admin lookup
    async with SessionLocal() as db:
        result = await db.execute(select(Admin).where(Admin.username == "admin"))
        admin = result.scalar_one_or_none()
        assert admin is not None
        print(f"✓ Found admin: {admin.username}")
        
        # Test password verification
        is_valid = verify_password("changeme", admin.password_hash)
        assert is_valid is True
        print("✓ Password verification works")
    
    print("\n✅ All authentication tests passed!")


if __name__ == "__main__":
    asyncio.run(test_auth())
