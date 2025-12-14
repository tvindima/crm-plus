"""
Auto-seed database on Railway startup if empty.
Uses CSV files to populate agents and properties.
"""
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.properties.models import Property
from app.agents.models import Agent

# Import all models to register with Base
import app.teams.models
import app.agencies.models
import app.leads.models


def seed_database():
    """Seed database with CSV data if empty."""
    print("[SEED] Checking if database needs seeding...")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        property_count = db.query(Property).count()
        agent_count = db.query(Agent).count()
        
        print(f"[SEED] Current state: {property_count} properties, {agent_count} agents")
        
        if property_count > 0:
            print("[SEED] Database already has data, skipping seed")
            return True
        
        print("[SEED] Database is empty, importing from CSV...")
        
        # Import agents
        csv_agents = Path(__file__).parent / "scripts" / "agentes.csv"
        if csv_agents.exists():
            import pandas as pd
            df = pd.read_csv(csv_agents)
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
            print(f"[SEED] Imported {db.query(Agent).count()} agents")
        
        # Import properties
        csv_properties = Path(__file__).parent / "scripts" / "propriedades.csv"
        if csv_properties.exists():
            import pandas as pd
            df = pd.read_csv(csv_properties)
            
            for _, row in df.iterrows():
                reference = str(row.get("Referência", "")).strip()
                if not reference:
                    continue
                
                # Map agent by reference initials
                ref_initials = reference[:2].upper()
                agent = db.query(Agent).filter(Agent.name.ilike(f"%{ref_initials}%")).first()
                
                prop = Property(
                    reference=reference,
                    title=str(row.get("Título", "")).strip() or None,
                    business_type=str(row.get("Negócio", "")).strip() or None,
                    property_type=str(row.get("Tipo", "")).strip() or None,
                    typology=str(row.get("Tipologia", "")).strip() or None,
                    price=float(row.get("Preço", 0)) if pd.notna(row.get("Preço")) else None,
                    usable_area=float(row.get("Área Útil", 0)) if pd.notna(row.get("Área Útil")) else None,
                    location=str(row.get("Localização", "")).strip() or None,
                    municipality=str(row.get("Concelho", "")).strip() or None,
                    parish=str(row.get("Freguesia", "")).strip() or None,
                    description=str(row.get("Descrição", "")).strip() or None,
                    status="Disponível",
                    agent_id=agent.id if agent else None,
                )
                db.add(prop)
            
            db.commit()
            print(f"[SEED] Imported {db.query(Property).count()} properties")
        
        print("[SEED] Database seeding complete!")
        return True
        
    except Exception as e:
        print(f"[SEED] Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    success = seed_database()
    sys.exit(0 if success else 1)
