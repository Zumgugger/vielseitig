"""Disable shared lists for inactive owners

Revision ID: 5e2a4c8c9c3b
Revises: 8f6b0d1c1b0a
Create Date: 2026-01-27
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "5e2a4c8c9c3b"
down_revision = "8f6b0d1c1b0a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        UPDATE lists
        SET share_enabled = 0
        WHERE owner_user_id IN (
            SELECT id FROM users WHERE status IS NULL OR status != 'active'
        )
        """
    )


def downgrade() -> None:
    # Cannot reliably re-enable; no-op rollback
    pass
