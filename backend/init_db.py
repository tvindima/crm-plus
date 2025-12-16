"""
Initialize database with seed data if empty.
Run this on Railway startup to populate test.db if needed.
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.properties.models import Property
from app.leads.models import Lead  # Import Lead ANTES de Agent
from app.agents.models import Agent
from app.teams.models import Team
from app.agencies.models import Agency
from app.calendar.models import Task  # Import Task para criar tabela


def init_database():
    """Create tables and check if we need to seed data."""
    print("[INIT_DB] Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if we have any properties
        property_count = db.query(Property).count()
        agent_count = db.query(Agent).count()
        
        print(f"[INIT_DB] Found {property_count} properties, {agent_count} agents")
        
        if property_count == 0:
            print("[INIT_DB] Database is empty. You need to:")
            print("  1. Import data from scripts/import_*.py")
            print("  2. Or mount a persistent volume with test.db")
            print("  3. Or use PostgreSQL instead of SQLite")
            
        db.close()
        return True
        
    except Exception as e:
        print(f"[INIT_DB] Error: {e}")
        db.close()
        return False


if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
