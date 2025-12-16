"""Fix property status to uppercase AVAILABLE in PostgreSQL."""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

os.environ['DATABASE_URL'] = 'postgresql://postgres:GVejNLQMPCeKNzfwxqMtcCYhRbEGRvat@autorack.proxy.rlwy.net:18181/railway'

from app.database import SessionLocal
from sqlalchemy import text

def fix_status():
    db = SessionLocal()
    try:
        result = db.execute(text("UPDATE properties SET status = 'AVAILABLE' WHERE LOWER(status) = 'available'"))
        db.commit()
        print(f"✅ Updated {result.rowcount} properties to AVAILABLE")
        
        # Verify
        count = db.execute(text("SELECT COUNT(*) FROM properties WHERE status = 'AVAILABLE'")).scalar()
        print(f"✅ Total AVAILABLE properties: {count}")
    finally:
        db.close()

if __name__ == '__main__':
    fix_status()
