"""
Add missing columns to properties table.
Run this ONCE on Railway to fix schema mismatch.
"""
import os
from sqlalchemy import create_engine, text

# Get PostgreSQL URL from environment
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found. This script is for PostgreSQL only.")
    exit(1)

# Fix old postgres:// URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'database'}")

engine = create_engine(DATABASE_URL)

# SQL migration
migration_sql = """
-- Add missing columns to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS business_type VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS typology VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS usable_area FLOAT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_area FLOAT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS municipality VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parish VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS condition VARCHAR;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS energy_certificate VARCHAR;
"""

try:
    with engine.connect() as conn:
        # Execute migration
        conn.execute(text(migration_sql))
        conn.commit()
        print("✅ Migration completed successfully!")
        
        # Verify columns
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties' 
            ORDER BY ordinal_position
        """))
        
        print("\n📋 Current properties table schema:")
        for row in result:
            print(f"  - {row[0]}: {row[1]}")
            
except Exception as e:
    print(f"❌ Migration failed: {e}")
    exit(1)
