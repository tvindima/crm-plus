"""document existing ingestion tables (created manually)

Revision ID: 20251222_ingestion
Revises: 20251222_leadstatus
Create Date: 2025-12-22 17:30:00

"""
from alembic import op
from sqlalchemy import text

revision = '20251222_ingestion'
down_revision = '20251222_leadstatus'
branch_labels = None
depends_on = None


def upgrade():
    """
    Document existing ingestion tables (already created manually).
    Tables exist: draft_properties, ingestion_files
    This migration is a no-op to align alembic history with DB state.
    """
    conn = op.get_bind()
    
    # Check if tables exist
    result = conn.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public' 
          AND table_name IN ('draft_properties', 'ingestion_files')
        ORDER BY table_name
    """))
    
    existing = [row[0] for row in result.fetchall()]
    
    if existing:
        print(f"✓ Ingestion tables already exist: {existing}")
        print("  This migration documents their existence (no-op)")
    else:
        print("⚠️ Tables don't exist - would need creation (not implemented here)")


def downgrade():
    """Not implemented - tables were created manually"""
    pass
