"""add_license_ami_to_agents

Revision ID: 53fbb0057a36
Revises: 8a9b2c3d4e5f
Create Date: 2025-12-22 02:24:42.076015

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '53fbb0057a36'
down_revision = '8a9b2c3d4e5f'
branch_labels = None
depends_on = None


def upgrade():
    # Adicionar coluna license_ami à tabela agents
    op.add_column('agents', 
        sa.Column('license_ami', sa.String(length=50), nullable=True)
    )


def downgrade():
    # Remover coluna license_ami (rollback)
    op.drop_column('agents', 'license_ami')
