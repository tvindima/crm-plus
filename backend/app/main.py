import os
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.leads.routes import router as leads_router
from app.properties.routes import router as properties_router
from app.agents.routes import router as agents_router
from app.teams.routes import router as teams_router
from app.agencies.routes import router as agencies_router
from app.calendar.routes import router as calendar_router
from app.feed.routes import router as feed_router
from app.match_plus.routes import router as match_plus_router
from app.assistant.routes import router as assistant_router
from app.notifications.routes import router as notifications_router
from app.billing.routes import router as billing_router
from app.reports.routes import router as reports_router
from app.users.routes import router as users_router
from app.mobile.routes import router as mobile_router

from app.api.ingestion import router as ingestion_router
from app.api.health_db import router as health_db_router
from app.api.v1.health import router as health_router, heath_router
from app.api.v1.auth import router as auth_router
from app.api.v1.auth_mobile import router as auth_mobile_router
from app.api.admin import router as admin_router
from app.api.avatars import router as avatars_router
from app.api.dashboard import router as dashboard_router
from app.api.admin_migration import router as admin_migration_router


# Debug endpoint to check database connection
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, DATABASE_URL, engine

debug_router = APIRouter(prefix="/debug", tags=["debug"])

@debug_router.get("/db-info")
def get_db_info():
    """Debug endpoint to check database configuration"""
    import os
    return {
        "DATABASE_URL_exists": bool(DATABASE_URL),
        "DATABASE_URL_prefix": DATABASE_URL[:20] if DATABASE_URL else None,
        "engine_url": str(engine.url),
        "RAILWAY_ENVIRONMENT": os.environ.get("RAILWAY_ENVIRONMENT"),
    }

@debug_router.get("/properties-test")
def test_properties(db: Session = Depends(get_db)):
    """Debug endpoint to test properties query"""
    try:
        from app.properties.models import Property
        count = db.query(Property).count()
        first = db.query(Property).first()
        return {
            "success": True,
            "count": count,
            "first_property": first.reference if first else None,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
        }

@debug_router.post("/run-migration")
def run_migration():
    """Execute database migration to add missing columns - USE ONCE"""
    import os
    from sqlalchemy import create_engine, text, inspect
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        results = []
        
        with engine_temp.connect() as conn:
            # FIRST: Add missing columns to agents table SAFELY (no data loss)
            inspector = inspect(engine_temp)
            existing_agent_cols = [col['name'] for col in inspector.get_columns('agents')]
            
            agent_columns = {
                'license_ami': 'VARCHAR(50)',
                'bio': 'TEXT',
                'instagram': 'VARCHAR(255)',
                'facebook': 'VARCHAR(255)',
                'linkedin': 'VARCHAR(255)',
                'whatsapp': 'VARCHAR(50)',
                'avatar_url': 'VARCHAR(500)',
                'photo': 'VARCHAR(500)'
            }
            
            for col_name, col_type in agent_columns.items():
                if col_name not in existing_agent_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE agents ADD COLUMN {col_name} {col_type}"))
                        results.append(f"✅ agents.{col_name} added")
                    except Exception as e:
                        results.append(f"⚠️ agents.{col_name}: {str(e)[:50]}")
                else:
                    results.append(f"✓ agents.{col_name} exists")
            
            conn.commit()
            
            # Get final agent columns
            final_agent_cols = [col['name'] for col in inspect(engine_temp).get_columns('agents')]
            
        return {
            "success": True,
            "message": "Migration completed! Agent columns updated safely.",
            "results": results,
            "agent_columns": final_agent_cols
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }

@debug_router.post("/run-seed")
def run_seed():
    """Execute database seed with CSV data - USE ONCE"""
    try:
        # Execute seed directly inline
        from pathlib import Path
        import pandas as pd
        from app.database import SessionLocal, engine, Base
        from app.properties.models import Property
        from app.agents.models import Agent
        import os
        
        print("[SEED] Starting database seed...")
        
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        
        # Check if already seeded (skip if already has CSV data)
        property_count = db.query(Property).count()
        if property_count > 100:
            # Already has real data, don't re-seed
            db.close()
            return {
                "success": True,
                "message": "Already seeded (100+ properties exist)",
                "properties": property_count
            }
        
        # Find CSV paths
        base_dir = Path(__file__).parent.parent
        csv_agents = base_dir / "scripts" / "agentes.csv"
        csv_properties = base_dir / "scripts" / "propriedades.csv"
        
        print(f"[SEED] Looking for CSVs in: {base_dir / 'scripts'}")
        print(f"[SEED] Agents CSV exists: {csv_agents.exists()}")
        print(f"[SEED] Properties CSV exists: {csv_properties.exists()}")
        
        # Import agents
        if csv_agents.exists():
            df = pd.read_csv(csv_agents, sep=',')
            print(f"[SEED] Found {len(df)} agents in CSV")
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
        
        # Import properties
        if csv_properties.exists():
            df = pd.read_csv(csv_properties, sep=';', on_bad_lines='skip')
            print(f"[SEED] Found {len(df)} properties in CSV")
            
            imported = 0
            for _, row in df.iterrows():
                reference = str(row.get("referencia", "")).strip()
                if not reference:
                    continue
                
                # Find agent
                agent_name = str(row.get("angariador", "")).strip()
                agent = None
                if agent_name:
                    agent = db.query(Agent).filter(Agent.name.ilike(f"%{agent_name}%")).first()
                
                # Parse price (CSV uses dot as decimal separator, already in correct format)
                price_str = str(row.get("preco", "0")).strip()
                try:
                    price = float(price_str) if price_str and price_str != "nan" else 0
                except:
                    price = 0
                
                # Parse areas (CSV uses dot as decimal separator)
                area_util = row.get("area_util", None)
                try:
                    usable_area = float(str(area_util).strip()) if pd.notna(area_util) and str(area_util).strip() else None
                except:
                    usable_area = None
                
                prop = Property(
                    reference=reference,
                    title=f"{row.get('tipo', '')} {row.get('tipologia', '')} - {row.get('concelho', '')}".strip() or reference,
                    business_type=str(row.get("negocio", "")).strip() or None,
                    property_type=str(row.get("tipo", "")).strip() or None,
                    typology=str(row.get("tipologia", "")).strip() or None,
                    price=price,
                    usable_area=usable_area,
                    municipality=str(row.get("concelho", "")).strip() or None,
                    parish=str(row.get("freguesia", "")).strip() or None,
                    condition=str(row.get("estado", "")).strip() or None,
                    energy_certificate=str(row.get("ce", "")).strip() or None,
                    status="available",
                    agent_id=agent.id if agent else None,
                )
                db.add(prop)
                imported += 1
                
                if imported % 50 == 0:
                    db.commit()
            
            db.commit()
        
        final_props = db.query(Property).count()
        final_agents_count = db.query(Agent).count()
        db.close()
        
        return {
            "success": True,
            "message": "Seed completed!",
            "properties_imported": final_props,
            "agents_imported": final_agents_count
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }

@debug_router.post("/add-agent-photo-column")
def add_agent_photo_column():
    """Add photo and ALL missing social columns to agents table"""
    import os
    from sqlalchemy import create_engine, text
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        
        with engine_temp.connect() as conn:
            # Add ALL missing columns
            columns_sql = [
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS photo VARCHAR(500);",
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS license_ami VARCHAR(50);",
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS bio TEXT;",
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);",
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);",
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);",
                "ALTER TABLE agents ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);"
            ]
            
            for sql in columns_sql:
                try:
                    conn.execute(text(sql))
                except Exception:
                    pass  # Column might already exist
            
            conn.commit()
            
            # Verify
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'agents'
                ORDER BY ordinal_position
            """))
            
            columns = [f"{row[0]}:{row[1]}" for row in result]
            
        return {
            "success": True,
            "message": "All agent columns added!",
            "columns": columns
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }

@debug_router.post("/add-missing-agent-columns")
def add_missing_agent_columns():
    """Add missing columns to agents table WITHOUT losing data"""
    import os
    from sqlalchemy import create_engine, text, inspect
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        
        with engine_temp.connect() as conn:
            # Check existing columns
            inspector = inspect(engine_temp)
            existing_columns = [col['name'] for col in inspector.get_columns('agents')]
            
            columns_to_add = {
                'license_ami': 'VARCHAR(50)',
                'bio': 'TEXT',
                'instagram': 'VARCHAR(255)',
                'facebook': 'VARCHAR(255)',
                'linkedin': 'VARCHAR(255)',
                'whatsapp': 'VARCHAR(50)'
            }
            
            added = []
            skipped = []
            
            for col_name, col_type in columns_to_add.items():
                if col_name not in existing_columns:
                    conn.execute(text(f"ALTER TABLE agents ADD COLUMN {col_name} {col_type}"))
                    added.append(col_name)
                else:
                    skipped.append(col_name)
            
            conn.commit()
            
            # Get final columns
            final_columns = [col['name'] for col in inspect(engine_temp).get_columns('agents')]
            
        return {
            "success": True,
            "message": "Columns added successfully!",
            "added": added,
            "skipped": skipped,
            "final_columns": final_columns
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }

@debug_router.post("/fix-agents-table")
def fix_agents_table():
    """Recreate agents table with correct schema"""
    import os
    from sqlalchemy import create_engine, text
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        
        with engine_temp.connect() as conn:
            # Drop and recreate agents table
            conn.execute(text("DROP TABLE IF EXISTS agents CASCADE;"))
            conn.execute(text("""
                CREATE TABLE agents (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    email VARCHAR UNIQUE NOT NULL,
                    phone VARCHAR,
                    photo VARCHAR(500),
                    team_id INTEGER,
                    agency_id INTEGER
                );
            """))
            conn.commit()
            
            # Verify
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'agents'
                ORDER BY ordinal_position
            """))
            
            columns = [f"{row[0]}:{row[1]}" for row in result]
            
        return {
            "success": True,
            "message": "Agents table recreated!",
            "columns": columns
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }

@debug_router.get("/db-info")
def db_info():
    """Check which database is being used"""
    import os
    from app.database import engine
    
    db_url = os.environ.get("DATABASE_URL", "NOT SET")
    db_url_prefix = db_url[:30] if db_url != "NOT SET" else "NOT SET"
    
    return {
        "DATABASE_URL_exists": db_url != "NOT SET",
        "DATABASE_URL_prefix": db_url_prefix,
        "engine_url": str(engine.url)[:50],
        "RAILWAY_ENVIRONMENT": os.environ.get("RAILWAY_ENVIRONMENT", "NOT SET"),
        "is_postgresql": "postgresql" in str(engine.url)
    }

@debug_router.get("/properties-test")
def properties_test():
    """Validate properties count and first record"""
    from app.database import SessionLocal
    from app.properties.models import Property
    
    db = SessionLocal()
    
    try:
        count = db.query(Property).count()
        first = db.query(Property).first()
        
        return {
            "success": True,
            "count": count,
            "first_property": first.reference if first else None,
            "first_title": first.title if first else None,
            "first_price": first.price if first else None
        }
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:300]
        }
    finally:
        db.close()

@debug_router.post("/delete-test-data")
def delete_test_data():
    """Delete PROP1 test property"""
    from app.database import SessionLocal
    from app.properties.models import Property
    from app.agents.models import Agent
    
    db = SessionLocal()
    
    try:
        # Delete test property
        test_prop = db.query(Property).filter_by(reference="PROP1").first()
        if test_prop:
            db.delete(test_prop)
        
        # Delete test agent if exists
        test_agent = db.query(Agent).filter_by(id=1).first()
        if test_agent and test_agent.email == "test@test.com":
            db.delete(test_agent)
        
        db.commit()
        
        # Validate
        count = db.query(Property).count()
        first = db.query(Property).first()
        
        return {
            "success": True,
            "message": "Test data deleted",
            "properties_remaining": count,
            "new_first_property": first.reference if first else None
        }
    except Exception as e:
        db.rollback()
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:300]
        }
    finally:
        db.close()

@debug_router.post("/create-users-table")
def create_users_table():
    """Create users table and seed initial admin users - USE ONCE"""
    import os
    from sqlalchemy import create_engine, text
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        
        with engine_temp.connect() as conn:
            # Create users table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR NOT NULL UNIQUE,
                    hashed_password VARCHAR NOT NULL,
                    full_name VARCHAR NOT NULL,
                    role VARCHAR NOT NULL DEFAULT 'agent',
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    avatar_url VARCHAR,
                    phone VARCHAR,
                    agent_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
                );
            """))
            
            # Create indexes
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);"))
            
            # Seed admin users
            conn.execute(text("""
                INSERT INTO users (email, hashed_password, full_name, role, is_active)
                VALUES 
                    ('tvindima@imoveismais.pt', '$2b$12$cmgDsN9m4U9nTLia1ldZSO6Lm3G5jRDwN7eSb2axqdY2C3SUYzN8q', 'Tiago Vindima', 'admin', true),
                    ('faturacao@imoveismais.pt', '$2b$12$6FaRh5CwDdGDgbIg/z0lMejeK/tY0.Gg55T2vz3JXjwPPa0tcZT2y', 'Gestor de Loja', 'admin', true),
                    ('leiria@imoveismais.pt', '$2b$12$YVa.Wy1Cflz5zKdQ0xciFOfugCK.OFk9Vb5NuJ0mB9Wsxrjg0DpUK', 'Admin Leiria', 'admin', true)
                ON CONFLICT (email) DO UPDATE SET
                    hashed_password = EXCLUDED.hashed_password;
            """))
            
            # Create updated_at trigger
            conn.execute(text("""
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
            """))
            
            conn.execute(text("""
                DROP TRIGGER IF EXISTS update_users_updated_at ON users;
                CREATE TRIGGER update_users_updated_at
                    BEFORE UPDATE ON users
                    FOR EACH ROW
                    EXECUTE FUNCTION update_updated_at_column();
            """))
            
            conn.commit()
            
            # Verify
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            """))
            
            columns = [f"{row[0]}:{row[1]}" for row in result]
            
            # Count users
            user_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
            
        return {
            "success": True,
            "message": "Users table created and seeded!",
            "columns": columns,
            "users_count": user_count
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }

@debug_router.post("/link-users-to-agents")
def link_users_to_agents():
    """Link users to their corresponding agents by email"""
    from app.database import SessionLocal
    from app.users.models import User
    from app.agents.models import Agent
    
    db = SessionLocal()
    
    try:
        linked_count = 0
        results = []
        
        # Get all users without agent_id
        users_without_agents = db.query(User).filter(User.agent_id == None).all()
        
        for user in users_without_agents:
            # Find matching agent by email
            agent = db.query(Agent).filter(Agent.email == user.email).first()
            
            if agent:
                user.agent_id = agent.id
                linked_count += 1
                results.append({
                    "user_email": user.email,
                    "user_name": user.full_name,
                    "agent_id": agent.id,
                    "agent_name": agent.name
                })
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Linked {linked_count} users to their agents",
            "linked_users": results,
            "total_users_checked": len(users_without_agents)
        }
    except Exception as e:
        db.rollback()
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }
    finally:
        db.close()

@debug_router.post("/clear-all-data")
def clear_all_data():
    """Clear all properties and agents for fresh seed"""
    from app.database import SessionLocal
    from app.properties.models import Property
    from app.agents.models import Agent
    
    db = SessionLocal()
    
    try:
        # Delete all properties
        prop_count = db.query(Property).count()
        db.query(Property).delete()
        
        # Delete all agents
        agent_count = db.query(Agent).count()
        db.query(Agent).delete()
        
        db.commit()
        
        return {
            "success": True,
            "message": "All data cleared",
            "properties_deleted": prop_count,
            "agents_deleted": agent_count
        }
    except Exception as e:
        db.rollback()
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:300]
        }
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup/shutdown logic
    - Verifica conexão database
    - Inicia scheduler para visit reminders (WebSocket)
    """
    # Startup: verify database connection
    from app.database import engine
    from app.properties.models import Property
    import asyncio
    
    # Check if using SQLite (has DB_PATH) or PostgreSQL
    db_path = None
    try:
        from app.database import DB_PATH
        db_path = DB_PATH
        print(f"[STARTUP] Database path: {db_path}")
        print(f"[STARTUP] Database exists: {os.path.exists(db_path)}")
        
        if os.path.exists(db_path):
            file_size = os.path.getsize(db_path)
            print(f"[STARTUP] Database size: {file_size} bytes")
    except ImportError:
        print("[STARTUP] Using PostgreSQL (no DB_PATH)")
    
    # Test connection (this will show if tables exist)
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        count = db.query(Property).count()
        db.close()
        print(f"[STARTUP] Found {count} properties in database")
    except Exception as e:
        print(f"[STARTUP] Database error: {e}")
        if db_path:
            print("[STARTUP] Make sure test.db is copied correctly in Dockerfile")
    
    # Iniciar background task para visit reminders (fault-tolerant)
    scheduler_task = None
    try:
        import asyncio
        from app.core.scheduler import start_visit_reminder_scheduler
        scheduler_task = asyncio.create_task(start_visit_reminder_scheduler())
        print("[STARTUP] Visit reminder scheduler iniciado")
    except Exception as e:
        print(f"[STARTUP] Warning: Scheduler não iniciou: {e}")
    
    yield
    
    # Shutdown: cancelar scheduler se existir
    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            print("[SHUTDOWN] Visit reminder scheduler parado")


# Domínios CORS finais permitidos (pode ser override por env CRMPLUS_CORS_ORIGINS)
DEFAULT_ALLOWED_ORIGINS = [
    "https://crm-plus-site.vercel.app",
    "https://institucional.crmplus.com",
    "https://imoveismais-site.vercel.app",
    "https://imoveismais.pt",
    "https://crm-plus-backoffice.vercel.app",
    "https://app.crmplus.com",
    # Mobile web app
    "https://crm-plus-mobile-app-react-native.vercel.app",
    "https://crm-plus-mobile-app-react-native-git-main-toinos-projects.vercel.app",
    # beta/staging
    "https://beta.crmplus.com",
    "https://web-steel-gamma-66.vercel.app",
    # desenvolvimento
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # Expo mobile web development
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:19006",
    "http://127.0.0.1:19006",
]

app = FastAPI(
    title="CRM PLUS Backend",
    description="API principal do sistema CRM PLUS para gestão imobiliária inteligente.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configurável para ambientes remotos (ex.: Vercel/Expo). Use CRMPLUS_CORS_ORIGINS com lista separada por vírgulas.
raw_origins = os.environ.get("CRMPLUS_CORS_ORIGINS", "")
env_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
# Merge defaults + env to evitar falta de domínios críticos (inclui backoffice vercel)
allow_origins = list({*DEFAULT_ALLOWED_ORIGINS, *env_origins})
if not allow_origins:
    allow_origins = DEFAULT_ALLOWED_ORIGINS

# Função para validar origins dinamicamente (aceita todos os deployments do Vercel)
import re
def verify_origin(origin: str) -> bool:
    """Verifica se a origin é permitida, incluindo todos os deployments do Vercel"""
    if origin in allow_origins:
        return True
    
    # Aceitar qualquer deployment do Vercel (inclui URLs com git-branch-name)
    vercel_patterns = [
        r"^https://crm-plus-backoffice-[a-z0-9-]+-toinos-projects\.vercel\.app$",
        r"^https://backoffice-[a-z0-9-]+-toinos-projects\.vercel\.app$",
        r"^https://web-[a-z0-9-]+-toinos-projects\.vercel\.app$",
        r"^https://imoveismais-site-[a-z0-9-]+-toinos-projects\.vercel\.app$",  # Site montra (inclui git-branch)
        r"^https://crm-plus-site-[a-z0-9-]+-toinos-projects\.vercel\.app$",  # Site montra alternativo
        r"^https://crm-plus-mobile-app-react-native.*\.vercel\.app$",  # Mobile web app (inclui todos os deployments)
        r"^https://[a-z0-9-]+-toinos-projects\.vercel\.app$",  # Qualquer projeto toinos
    ]
    
    for pattern in vercel_patterns:
        if re.match(pattern, origin):
            return True
    
    return False

app.add_middleware(
    CORSMiddleware,
    # Regex atualizado para aceitar qualquer deployment do Vercel com hífens (ex: git-feat-mobile-backend-app)
    allow_origin_regex=r"^https://[a-z0-9-]+-toinos-projects\.vercel\.app$",
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads_router)
@debug_router.post("/migrate-properties-columns")
def migrate_properties_columns():
    """Add missing columns to properties table (is_published, is_featured, bedrooms, bathrooms, parking_spaces, latitude, longitude)"""
    import os
    from sqlalchemy import create_engine, text
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        
        with engine_temp.connect() as conn:
            # Add columns if they don't exist
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS is_featured INTEGER DEFAULT 0;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS latitude FLOAT;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS longitude FLOAT;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;
            """))
            
            conn.execute(text("""
                ALTER TABLE properties 
                ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
            """))
            
            conn.commit()
            
            # Verify columns
            result = conn.execute(text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'properties'
                ORDER BY ordinal_position
            """))
            
            columns = [f"{row[0]}:{row[1]}" for row in result]
            
        return {
            "success": True,
            "message": "Properties columns migrated successfully!",
            "columns": columns
        }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }


@debug_router.post("/remove-duplicate-properties")
def remove_duplicate_properties():
    """Remove duplicate properties keeping only the first occurrence (lowest ID) of each reference"""
    import os
    from sqlalchemy import create_engine, text
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        return {"success": False, "error": "DATABASE_URL not found"}
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    try:
        engine_temp = create_engine(db_url)
        
        with engine_temp.connect() as conn:
            # Find all duplicate references
            result = conn.execute(text("""
                SELECT reference, array_agg(id ORDER BY id) as ids, COUNT(*) as count
                FROM properties
                GROUP BY reference
                HAVING COUNT(*) > 1
                ORDER BY reference
            """))
            
            duplicates = list(result)
            
            if not duplicates:
                return {
                    "success": True,
                    "message": "No duplicate properties found!",
                    "deleted_count": 0
                }
            
            # Prepare deletion info
            to_delete = []
            to_keep = []
            
            for row in duplicates:
                reference, ids, count = row
                ids_list = list(ids)
                keep_id = ids_list[0]  # Keep first ID
                delete_ids = ids_list[1:]  # Delete the rest
                
                to_keep.append({"reference": reference, "id": keep_id})
                for del_id in delete_ids:
                    to_delete.append({"reference": reference, "id": del_id})
            
            # Delete duplicates
            deleted_count = 0
            for item in to_delete:
                conn.execute(text(f"DELETE FROM properties WHERE id = :id"), {"id": item["id"]})
                deleted_count += 1
            
            conn.commit()
            
            # Verify no duplicates remain
            result = conn.execute(text("""
                SELECT COUNT(*) 
                FROM (
                    SELECT reference
                    FROM properties
                    GROUP BY reference
                    HAVING COUNT(*) > 1
                ) duplicates
            """))
            
            remaining = result.scalar()
            
            return {
                "success": True,
                "message": f"Successfully deleted {deleted_count} duplicate properties!",
                "deleted_count": deleted_count,
                "kept": to_keep,
                "deleted": to_delete,
                "remaining_duplicates": remaining,
                "verified": remaining == 0
            }
        
    except Exception as e:
        import traceback
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()[:500]
        }


# =====================================================
# EXCEPTION HANDLERS (FASE 2)
# =====================================================

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.exceptions import (
    BusinessRuleError,
    ResourceNotFoundError,
    UnauthorizedError,
    ConflictError,
    ValidationError,
    ExternalServiceError
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler para erros de validação Pydantic (422)
    Retorna mensagem user-friendly ao invés de dump técnico
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"] if x != "body")
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Dados inválidos",
            "detail": " | ".join(errors),
            "fields": [str(e["loc"][-1]) for e in exc.errors()]
        }
    )


@app.exception_handler(ConflictError)
async def conflict_exception_handler(request: Request, exc: ConflictError):
    """Handler para erros de conflito (409)"""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"error": "Conflito", "detail": exc.detail}
    )


@app.exception_handler(ExternalServiceError)
async def external_service_exception_handler(request: Request, exc: ExternalServiceError):
    """Handler para erros de serviços externos (503)"""
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "error": "Serviço temporariamente indisponível",
            "detail": exc.detail,
            "retry": True
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handler genérico para erros não tratados (500)
    Evita expor stack traces ao cliente
    """
    import logging
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Erro interno do servidor",
            "detail": "Ocorreu um erro inesperado. Por favor, tente novamente.",
            "support": "Se o problema persistir, contacte o suporte."
        }
    )


# =====================================================
# WEBSOCKET ENDPOINT (FASE 2)
# =====================================================

from fastapi import WebSocket, WebSocketDisconnect, Query
from app.core.websocket import connection_manager
from app.security import SECRET_KEY, ALGORITHM
import jwt

@app.websocket("/mobile/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access_token")
):
    """
    WebSocket endpoint para notificações real-time mobile
    
    Autenticação via query param: /mobile/ws?token=<jwt>
    
    Cliente recebe notificações de:
    - new_lead: Novo lead atribuído ao agente
    - visit_scheduled: Visita agendada confirmada
    - visit_reminder: Lembrete 30min antes da visita
    
    Formato mensagem:
    {
        "type": "new_lead",
        "title": "Novo Lead Recebido! 🎉",
        "body": "João Silva - Apartamento T2",
        "data": {...},
        "timestamp": "2024-01-22T10:30:00Z",
        "sound": "default"
    }
    """
    # Validar JWT
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        agent_id = payload.get("agent_id")
        
        if not agent_id:
            await websocket.close(code=1008, reason="Token não contém agent_id")
            return
        
    except jwt.ExpiredSignatureError:
        await websocket.close(code=1008, reason="Token expirado")
        return
    except jwt.InvalidTokenError:
        await websocket.close(code=1008, reason="Token inválido")
        return
    
    # Conectar ao manager
    await connection_manager.connect(websocket, agent_id)
    
    try:
        # Loop para manter conexão aberta
        while True:
            # Receber mensagens do cliente (ping/pong para keep-alive)
            data = await websocket.receive_text()
            
            # Echo back (confirma que está online)
            if data == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.utcnow().isoformat()})
    
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, agent_id)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"WebSocket error: {str(e)}")
        connection_manager.disconnect(websocket, agent_id)


# =====================================================
# ROUTERS
# =====================================================

app.include_router(properties_router)
app.include_router(agents_router)
app.include_router(teams_router)
app.include_router(agencies_router)
app.include_router(calendar_router)
app.include_router(feed_router)
app.include_router(match_plus_router)
app.include_router(assistant_router)
app.include_router(notifications_router)
app.include_router(billing_router)
app.include_router(reports_router)
app.include_router(mobile_router)
app.include_router(users_router)

app.include_router(ingestion_router)
app.include_router(health_db_router)
app.include_router(health_router)
app.include_router(heath_router)
app.include_router(auth_router)
app.include_router(auth_mobile_router)
app.include_router(debug_router)
app.include_router(admin_router)
app.include_router(avatars_router)
app.include_router(dashboard_router)
app.include_router(admin_migration_router)

os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")


@app.get("/")
def root():
    return {"message": "CRM PLUS backend operacional."}


@app.get("/debug/db")
def debug_db():
    """Debug endpoint para verificar DB no Railway"""
    from app.database import SessionLocal
    try:
        db = SessionLocal()
        from app.properties.models import Property
        count = db.query(Property).count()
        db.close()
        return {"database": "connected", "properties_count": count}
    except Exception as e:
        return {"database": "error", "error": str(e), "type": type(e).__name__}
