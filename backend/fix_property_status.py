"""Fix property status in Railway PostgreSQL on startup if needed."""
import os
from sqlalchemy import create_engine, text

def fix_property_status():
    """Update property status from lowercase to uppercase."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url or 'sqlite' in database_url.lower():
        print("[FIX] Skipping - not using PostgreSQL")
        return
    
    try:
        engine = create_engine(database_url)
        with engine.begin() as conn:
            # Check if we have lowercase status
            result = conn.execute(text("SELECT COUNT(*) FROM properties WHERE status = 'available'"))
            lowercase_count = result.scalar()
            
            if lowercase_count > 0:
                print(f"[FIX] Found {lowercase_count} properties with lowercase status")
                result = conn.execute(text("UPDATE properties SET status = 'AVAILABLE' WHERE status = 'available'"))
                print(f"[FIX] ✅ Updated {result.rowcount} properties to AVAILABLE")
            else:
                print("[FIX] All properties already have correct status")
                
    except Exception as e:
        print(f"[FIX] Error: {e}")

if __name__ == '__main__':
    fix_property_status()
