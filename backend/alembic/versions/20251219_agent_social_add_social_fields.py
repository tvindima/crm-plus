"""add social fields to agents table

Revision ID: 20251219_agent_social
Revises: 20251219_site_prefs
Create Date: 2025-12-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '20251219_agent_social'
down_revision = '20251219_site_prefs'
branch_labels = None
depends_on = None


def upgrade():
    """
    Adicionar campos de bio e redes sociais à tabela agents.
    Estes campos ficam diretamente no agente para fácil acesso.
    """
    # Adicionar colunas apenas se não existirem
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('agents')]
    
    if 'license_ami' not in columns:
        op.add_column('agents', sa.Column('license_ami', sa.String(50), nullable=True))
    
    if 'bio' not in columns:
        op.add_column('agents', sa.Column('bio', sa.Text(), nullable=True))
    
    if 'instagram' not in columns:
        op.add_column('agents', sa.Column('instagram', sa.String(255), nullable=True))
    
    if 'facebook' not in columns:
        op.add_column('agents', sa.Column('facebook', sa.String(255), nullable=True))
    
    if 'linkedin' not in columns:
        op.add_column('agents', sa.Column('linkedin', sa.String(255), nullable=True))
    
    if 'whatsapp' not in columns:
        op.add_column('agents', sa.Column('whatsapp', sa.String(50), nullable=True))


def downgrade():
    """Remove campos de redes sociais da tabela agents"""
    op.drop_column('agents', 'whatsapp')
    op.drop_column('agents', 'linkedin')
    op.drop_column('agents', 'facebook')
    op.drop_column('agents', 'instagram')
    op.drop_column('agents', 'bio')
    op.drop_column('agents', 'license_ami')
