"""add video_url to properties

Revision ID: 002_add_video_url_to_properties
Revises: 001_add_property_display_fields
Create Date: 2025-12-17

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_video_url_to_properties'
down_revision = '001_add_property_display_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add video_url column to properties table
    op.add_column('properties', sa.Column('video_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    # Remove video_url column
    op.drop_column('properties', 'video_url')
