"""add_gps_and_optional_fields_to_first_impressions

Revision ID: 8a9b2c3d4e5f
Revises: 27eef89f1974
Create Date: 2025-12-22 01:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '8a9b2c3d4e5f'
down_revision = '27eef89f1974'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar novos campos
    op.add_column('first_impressions', 
        sa.Column('referred_by', sa.String(length=255), nullable=True, comment='Nome de quem referenciou'))
    
    op.add_column('first_impressions', 
        sa.Column('latitude', sa.DECIMAL(precision=10, scale=7), nullable=True, comment='GPS latitude'))
    
    op.add_column('first_impressions', 
        sa.Column('longitude', sa.DECIMAL(precision=10, scale=7), nullable=True, comment='GPS longitude'))
    
    op.add_column('first_impressions', 
        sa.Column('location', sa.String(length=500), nullable=True, comment='Morada texto'))
    
    op.add_column('first_impressions', 
        sa.Column('estado_conservacao', sa.String(length=100), nullable=True, comment='Estado de conservação'))
    
    op.add_column('first_impressions', 
        sa.Column('valor_estimado', sa.DECIMAL(precision=15, scale=2), nullable=True, comment='Valor estimado EUR'))
    
    op.add_column('first_impressions', 
        sa.Column('photos', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='Array URLs fotos'))
    
    op.add_column('first_impressions', 
        sa.Column('attachments', postgresql.JSON(astext_type=sa.Text()), nullable=True, comment='Array anexos'))
    
    # Tornar client_phone opcional (remover NOT NULL constraint)
    op.alter_column('first_impressions', 'client_phone',
                    existing_type=sa.String(length=50),
                    nullable=True)


def downgrade() -> None:
    # Reverter alterações
    op.alter_column('first_impressions', 'client_phone',
                    existing_type=sa.String(length=50),
                    nullable=False)
    
    op.drop_column('first_impressions', 'attachments')
    op.drop_column('first_impressions', 'photos')
    op.drop_column('first_impressions', 'valor_estimado')
    op.drop_column('first_impressions', 'estado_conservacao')
    op.drop_column('first_impressions', 'location')
    op.drop_column('first_impressions', 'longitude')
    op.drop_column('first_impressions', 'latitude')
    op.drop_column('first_impressions', 'referred_by')
