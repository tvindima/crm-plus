"""add missing leadstatus enum values

Revision ID: 20251222_leadstatus
Revises: 6ff0c4d3c0a7
Create Date: 2025-12-22 15:30:00

"""
from alembic import op
from sqlalchemy import text

# revision identifiers
revision = '20251222_leadstatus'
down_revision = '6ff0c4d3c0a7'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    
    # Add NEGOTIATION (safe - ignores if exists)
    conn.execute(text("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'NEGOTIATION' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'leadstatus')
            ) THEN
                ALTER TYPE leadstatus ADD VALUE 'NEGOTIATION';
            END IF;
        END $$;
    """))
    
    # Add CONVERTED (safe)
    conn.execute(text("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'CONVERTED' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'leadstatus')
            ) THEN
                ALTER TYPE leadstatus ADD VALUE 'CONVERTED';
            END IF;
        END $$;
    """))
    
    # Add VISIT_SCHEDULED (safe)
    conn.execute(text("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'VISIT_SCHEDULED' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'leadstatus')
            ) THEN
                ALTER TYPE leadstatus ADD VALUE 'VISIT_SCHEDULED';
            END IF;
        END $$;
    """))


def downgrade():
    # Cannot remove enum values in PostgreSQL (would break existing data)
    pass
