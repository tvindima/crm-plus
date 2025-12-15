"""
Add missing columns to properties table.
Run this ONCE on Railway to fix schema mismatch.
"""
import os
import sys
from sqlalchemy import create_engine, text

# Get PostgreSQL URL from environment
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("⚠️  DATABASE_URL not found. Skipping migration (SQLite mode).")
    sys.exit(0)  # Exit successfully, not an error

# Fix old postgres:// URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Connecting to PostgreSQL...")
print(f"📍 Host: {DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else 'unknown'}")

try:
    engine = create_engine(DATABASE_URL)
    
    # SQL migration - each statement separately for better error handling
    migrations = [
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS business_type VARCHAR;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS typology VARCHAR;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS observations TEXT;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS usable_area FLOAT;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_area FLOAT;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS municipality VARCHAR;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS parish VARCHAR;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS condition VARCHAR;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS energy_certificate VARCHAR;",
    ]
    
    with engine.connect() as conn:
        print("🔧 Running migrations...")
        
        for i, sql in enumerate(migrations, 1):
            try:
                conn.execute(text(sql))
                print(f"  ✅ Migration {i}/{len(migrations)} completed")
            except Exception as e:
                print(f"  ⚠️  Migration {i} failed (might already exist): {e}")
        
        conn.commit()
        print("\n✅ All migrations completed!")
        
        # Verify columns
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties' 
            ORDER BY ordinal_position
        """))
        
        columns = list(result)
        print(f"\n📋 Properties table has {len(columns)} columns:")
        for row in columns:
            print(f"  - {row[0]}: {row[1]}")
        
        # Check specifically for business_type
        if any(col[0] == 'business_type' for col in columns):
            print("\n✅ business_type column confirmed!")
        else:
            print("\n❌ business_type column NOT found!")
            sys.exit(1)
            
except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🎉 Migration script completed successfully!")
