"""Add slug and is_premium to lists table

Revision ID: a1b2c3d4e5f6
Revises: 8f6b0d1c1b0a
Create Date: 2026-02-02 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '5e2a4c8c9c3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add slug column
    op.add_column('lists', sa.Column('slug', sa.String(100), nullable=True))
    op.create_index('ix_lists_slug', 'lists', ['slug'], unique=True)
    
    # Add is_premium column
    op.add_column('lists', sa.Column('is_premium', sa.Boolean(), nullable=False, server_default='false'))
    op.create_index('ix_lists_is_premium', 'lists', ['is_premium'])
    
    # Update existing default list with slug
    op.execute("UPDATE lists SET slug = 'standard' WHERE is_default = true AND slug IS NULL")


def downgrade() -> None:
    op.drop_index('ix_lists_is_premium', table_name='lists')
    op.drop_column('lists', 'is_premium')
    op.drop_index('ix_lists_slug', table_name='lists')
    op.drop_column('lists', 'slug')
