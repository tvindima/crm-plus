"""
Migrate PostgreSQL schema to add missing columns.
Run this once on Railway to update the database schema.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import text
from app.database import engine


def migrate():
    """Add missing columns to properties table."""
    print("[MIGRATE] Starting schema migration...")
    
    try:
        with engine.begin() as conn:  # Use begin() for auto-commit
            # Check if business_type column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='properties' AND column_name='business_type'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE] Adding business_type column...")
                conn.execute(text("ALTER TABLE properties ADD COLUMN business_type VARCHAR"))
                print("[MIGRATE] ✅ Added business_type")
            else:
                print("[MIGRATE] business_type already exists")
            
            # Check property_type
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='properties' AND column_name='property_type'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE] Adding property_type column...")
                conn.execute(text("ALTER TABLE properties ADD COLUMN property_type VARCHAR"))
                print("[MIGRATE] ✅ Added property_type")
            else:
                print("[MIGRATE] property_type already exists")
            
            # Check typology
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='properties' AND column_name='typology'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE] Adding typology column...")
                conn.execute(text("ALTER TABLE properties ADD COLUMN typology VARCHAR"))
                print("[MIGRATE] ✅ Added typology")
            else:
                print("[MIGRATE] typology already exists")
            
            # Check observations
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='properties' AND column_name='observations'
            """))
            
            if result.fetchone() is None:
                print("[MIGRATE] Adding observations column...")
                conn.execute(text("ALTER TABLE properties ADD COLUMN observations TEXT"))
                print("[MIGRATE] ✅ Added observations")
            else:
                print("[MIGRATE] observations already exists")
            
        print("[MIGRATE] ✅ Migration complete!")
            
    except Exception as e:
        print(f"[MIGRATE] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise


if __name__ == "__main__":
    migrate()
