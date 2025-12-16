"""add property display fields

Revision ID: 001_add_property_display_fields
Revises: 
Create Date: 2025-12-16

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_add_property_display_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to properties table
    op.add_column('properties', sa.Column('is_published', sa.Integer(), nullable=True, server_default='1'))
    op.add_column('properties', sa.Column('is_featured', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('properties', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('properties', sa.Column('longitude', sa.Float(), nullable=True))
    op.add_column('properties', sa.Column('bedrooms', sa.Integer(), nullable=True))
    op.add_column('properties', sa.Column('bathrooms', sa.Integer(), nullable=True))
    op.add_column('properties', sa.Column('parking_spaces', sa.Integer(), nullable=True))


def downgrade() -> None:
    # Remove added columns
    op.drop_column('properties', 'parking_spaces')
    op.drop_column('properties', 'bathrooms')
    op.drop_column('properties', 'bedrooms')
    op.drop_column('properties', 'longitude')
    op.drop_column('properties', 'latitude')
    op.drop_column('properties', 'is_featured')
    op.drop_column('properties', 'is_published')
