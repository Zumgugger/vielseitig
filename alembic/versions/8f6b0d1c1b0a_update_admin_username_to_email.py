"""Update default admin username to email form

Revision ID: 8f6b0d1c1b0a
Revises: 7807caff4d60
Create Date: 2026-01-27
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "8f6b0d1c1b0a"
down_revision = "7807caff4d60"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Update legacy admin username to email-style if present
    op.execute("""
        UPDATE admins
        SET username = 'admin@admin.com'
        WHERE username = 'admin'
    """)


def downgrade() -> None:
    # Revert only if the record matches the email username
    op.execute("""
        UPDATE admins
        SET username = 'admin'
        WHERE username = 'admin@admin.com'
    """)
