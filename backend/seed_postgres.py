"""
Seed database with CSV data (PostgreSQL or SQLite).
Works on Railway with PostgreSQL or locally with SQLite.
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base, DATABASE_URL
from app.properties.models import Property
from app.agents.models import Agent

# Import all models
import app.teams.models
import app.agencies.models
import app.leads.models


def seed_database():
    """Seed database with CSV data if empty."""
    print("[SEED] Starting database seed...")
    print(f"[SEED] Database: {DATABASE_URL if 'DATABASE_URL' in globals() else 'SQLite'}")
    
    # Create tables
    print("[SEED] Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[SEED] ✅ Tables created successfully")
    except Exception as e:
        print(f"[SEED] ⚠️ Table creation error (might already exist): {e}")
    
    db = SessionLocal()
    try:
        property_count = db.query(Property).count()
        agent_count = db.query(Agent).count()
        
        print(f"[SEED] Current: {property_count} properties, {agent_count} agents")
        
        if property_count > 0:
            print("[SEED] ✅ Database already seeded, skipping")
            return True
        
        print("[SEED] 📦 Importing from CSV...")
        
        # Import agents
        csv_agents = Path(__file__).parent / "scripts" / "agentes.csv"
        if csv_agents.exists():
            try:
                import pandas as pd
                df = pd.read_csv(csv_agents, sep=',')
                
                for _, row in df.iterrows():
                    name = str(row.get("Nome", "")).strip()
                    email = str(row.get("Email", "")).strip()
                    phone = str(row.get("Telefone", "")).strip() if pd.notna(row.get("Telefone")) else None
                    
                    if not email:
                        continue
                    
                    existing = db.query(Agent).filter_by(email=email).first()
                    if not existing:
                        agent = Agent(name=name, email=email, phone=phone)
                        db.add(agent)
                
                db.commit()
                print(f"[SEED] ✅ Imported {db.query(Agent).count()} agents")
            except Exception as e:
                print(f"[SEED] ⚠️  Agent import error: {e}")
                db.rollback()
        else:
            print(f"[SEED] ⚠️  CSV not found: {csv_agents}")
        
        # Import properties
        csv_properties = Path(__file__).parent / "scripts" / "propriedades.csv"
        if csv_properties.exists():
            try:
                import pandas as pd
                df = pd.read_csv(csv_properties, sep=';')
                
                imported = 0
                for _, row in df.iterrows():
                    reference = str(row.get("referencia", "")).strip()
                    if not reference:
                        continue
                    
                    # Find agent by name from "angariador" column or match by initials
                    agent_name = str(row.get("angariador", "")).strip()
                    ref_initials = reference[:2].upper()
                    agent = None
                    
                    # Try to find agent by name first
                    if agent_name:
                        agent = db.query(Agent).filter(Agent.name.ilike(f"%{agent_name}%")).first()
                    
                    # If not found, try to match agent by initials
                    if not agent:
                        for a in db.query(Agent).all():
                            name_parts = a.name.strip().split()
                            if len(name_parts) >= 2:
                                initials = (name_parts[0][0] + name_parts[1][0]).upper()
                                if initials == ref_initials:
                                    agent = a
                                    break
                    
                    # Parse price (remove dots for thousands separator)
                    price_str = str(row.get("preco", "0")).replace(".", "").replace(",", ".")
                    try:
                        price = float(price_str) if price_str else 0
                    except:
                        price = 0
                    
                    # Parse areas
                    area_util = row.get("area_util", None)
                    try:
                        usable_area = float(str(area_util).replace(",", ".")) if pd.notna(area_util) else None
                    except:
                        usable_area = None
                    
                    area_terreno = row.get("area_terreno", None)
                    try:
                        land_area = float(str(area_terreno).replace(",", ".")) if pd.notna(area_terreno) else None
                    except:
                        land_area = None
                    
                    prop = Property(
                        reference=reference,
                        title=f"{row.get('tipo', '')} {row.get('tipologia', '')} - {row.get('concelho', '')}".strip() or reference,
                        business_type=str(row.get("negocio", "")).strip() or None,
                        property_type=str(row.get("tipo", "")).strip() or None,
                        typology=str(row.get("tipologia", "")).strip() or None,
                        price=price,
                        usable_area=usable_area,
                        land_area=land_area,
                        location=None,  # CSV não tem este campo
                        municipality=str(row.get("concelho", "")).strip() or None,
                        parish=str(row.get("freguesia", "")).strip() or None,
                        condition=str(row.get("estado", "")).strip() or None,
                        energy_certificate=str(row.get("ce", "")).strip() or None,
                        description=None,  # CSV não tem descrição
                        observations=None,
                        status="available",  # All properties available
                        agent_id=agent.id if agent else None,
                    )
                    db.add(prop)
                    imported += 1
                    
                    if imported % 50 == 0:
                        db.commit()
                        print(f"[SEED] ... {imported} properties imported")
                
                db.commit()
                final_count = db.query(Property).count()
                print(f"[SEED] ✅ Imported {final_count} properties total")
            except Exception as e:
                print(f"[SEED] ⚠️  Property import error: {e}")
                import traceback
                traceback.print_exc()
                db.rollback()
        else:
            print(f"[SEED] ⚠️  CSV not found: {csv_properties}")
        
        print("[SEED] ✅ Database seeding complete!")
        return True
        
    except Exception as e:
        print(f"[SEED] ❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = seed_database()
    sys.exit(0 if success else 1)
