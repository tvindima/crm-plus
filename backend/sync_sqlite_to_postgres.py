"""
Sync data from SQLite (test.db) to PostgreSQL (Railway).
Exports SQLite data and imports to PostgreSQL.
"""
import os
import sys
import sqlite3
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

# Use PostgreSQL
os.environ['DATABASE_URL'] = 'postgresql://postgres:GVejNLQMPCeKNzfwxqMtcCYhRbEGRvat@autorack.proxy.rlwy.net:18181/railway'

from app.database import SessionLocal
from app.models.property import Property
from app.models.agent import Agent
from app.models.lead import Lead
from sqlalchemy import text


def sync_data():
    """Sync all data from SQLite to PostgreSQL."""
    print("[SYNC] Connecting to SQLite...")
    sqlite_conn = sqlite3.connect('test.db')
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()
    
    print("[SYNC] Connecting to PostgreSQL...")
    pg_db = SessionLocal()
    
    try:
        # Clear existing data
        print("[SYNC] Clearing PostgreSQL tables...")
        pg_db.execute(text("TRUNCATE TABLE properties, agents, leads, agencies RESTART IDENTITY CASCADE"))
        pg_db.commit()
        
        # Sync Agents
        print("[SYNC] Syncing agents...")
        sqlite_cur.execute("SELECT * FROM agents")
        agents = sqlite_cur.fetchall()
        for row in agents:
            agent = Agent(
                id=row['id'],
                name=row['name'],
                email=row['email'],
                phone=row['phone'],
                role=row.get('role', 'Agente'),
                created_at=row.get('created_at')
            )
            pg_db.add(agent)
        pg_db.commit()
        print(f"[SYNC] ✅ Synced {len(agents)} agents")
        
        # Sync Properties
        print("[SYNC] Syncing properties...")
        sqlite_cur.execute("SELECT * FROM properties")
        properties = sqlite_cur.fetchall()
        for row in properties:
            prop = Property(
                id=row['id'],
                reference=row['reference'],
                title=row['title'],
                description=row.get('description'),
                price=row['price'],
                status=row['status'],
                property_type=row.get('property_type', 'Apartamento'),
                business_type=row.get('business_type', 'Venda'),
                bedrooms=row.get('bedrooms'),
                bathrooms=row.get('bathrooms'),
                area=row.get('area'),
                location=row.get('location'),
                latitude=row.get('latitude'),
                longitude=row.get('longitude'),
                district=row.get('district'),
                county=row.get('county'),
                parish=row.get('parish'),
                agent_id=row.get('agent_id'),
                created_at=row.get('created_at'),
                updated_at=row.get('updated_at')
            )
            pg_db.add(prop)
        pg_db.commit()
        print(f"[SYNC] ✅ Synced {len(properties)} properties")
        
        # Sync Leads
        print("[SYNC] Syncing leads...")
        sqlite_cur.execute("SELECT * FROM leads")
        leads = sqlite_cur.fetchall()
        for row in leads:
            lead = Lead(
                id=row['id'],
                name=row['name'],
                email=row.get('email'),
                phone=row.get('phone'),
                message=row.get('message'),
                status=row.get('status', 'NEW'),
                property_id=row.get('property_id'),
                created_at=row.get('created_at')
            )
            pg_db.add(lead)
        pg_db.commit()
        print(f"[SYNC] ✅ Synced {len(leads)} leads")
        
        # Verify counts
        prop_count = pg_db.query(Property).filter(Property.status == 'AVAILABLE').count()
        agent_count = pg_db.query(Agent).count()
        lead_count = pg_db.query(Lead).count()
        
        print("\n[SYNC] ✅ MIGRATION COMPLETE!")
        print(f"  - Properties (AVAILABLE): {prop_count}")
        print(f"  - Agents: {agent_count}")
        print(f"  - Leads: {lead_count}")
        
    except Exception as e:
        print(f"[SYNC] ❌ Error: {e}")
        pg_db.rollback()
        raise
    finally:
        sqlite_conn.close()
        pg_db.close()


if __name__ == '__main__':
    sync_data()
