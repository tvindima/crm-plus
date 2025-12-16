"""
Migrate leads table to add missing columns.
Run this once on Railway to update the database schema.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from app.database import engine


def migrate():
    """Add missing columns to leads table."""
    print("[MIGRATE LEADS] Starting schema migration...")
    
    try:
        with engine.begin() as conn:
            # Check if source column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='source'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE LEADS] Adding source column...")
                conn.execute(text("ALTER TABLE leads ADD COLUMN source VARCHAR"))
                print("[MIGRATE LEADS] ✅ Added source")
            else:
                print("[MIGRATE LEADS] source already exists")
            
            # Check origin
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='origin'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE LEADS] Adding origin column...")
                conn.execute(text("ALTER TABLE leads ADD COLUMN origin VARCHAR"))
                print("[MIGRATE LEADS] ✅ Added origin")
            else:
                print("[MIGRATE LEADS] origin already exists")
            
            # Check action_type
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='action_type'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE LEADS] Adding action_type column...")
                conn.execute(text("ALTER TABLE leads ADD COLUMN action_type VARCHAR"))
                print("[MIGRATE LEADS] ✅ Added action_type")
            else:
                print("[MIGRATE LEADS] action_type already exists")
            
            # Check property_id
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='property_id'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE LEADS] Adding property_id column...")
                conn.execute(text("ALTER TABLE leads ADD COLUMN property_id INTEGER REFERENCES properties(id)"))
                print("[MIGRATE LEADS] ✅ Added property_id")
            else:
                print("[MIGRATE LEADS] property_id already exists")
            
        print("[MIGRATE LEADS] ✅ Migration complete!")
            
    except Exception as e:
        print(f"[MIGRATE LEADS] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    migrate()
