"""
Script para inicializar tabelas necessárias no Railway
Executa CREATE TABLE IF NOT EXISTS para visits e refresh_tokens
"""
from sqlalchemy import create_engine, text
import os
import sys

def init_tables():
    """Criar tabelas visits e refresh_tokens se não existirem"""
    try:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("[INIT_DB] DATABASE_URL não configurada, pulando...")
            return
        
        print(f"[INIT_DB] Conectando à base de dados...")
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Criar tabela visits
            print("[INIT_DB] Criando tabela visits...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS visits (
                    id SERIAL PRIMARY KEY,
                    property_id INTEGER NOT NULL REFERENCES properties(id),
                    lead_id INTEGER REFERENCES leads(id),
                    agent_id INTEGER NOT NULL REFERENCES agents(id),
                    scheduled_date TIMESTAMP NOT NULL,
                    duration_minutes INTEGER,
                    status VARCHAR,
                    checked_in_at TIMESTAMP,
                    checked_out_at TIMESTAMP,
                    checkin_latitude FLOAT,
                    checkin_longitude FLOAT,
                    checkin_accuracy_meters FLOAT,
                    distance_from_property_meters FLOAT,
                    rating INTEGER,
                    interest_level VARCHAR,
                    feedback_notes TEXT,
                    will_return BOOLEAN,
                    next_steps TEXT,
                    notes TEXT,
                    cancellation_reason TEXT,
                    reminder_sent BOOLEAN,
                    confirmation_sent BOOLEAN,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """))
            
            # Criar índices da tabela visits
            print("[INIT_DB] Criando índices de visits...")
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_visits_property_id ON visits(property_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_visits_agent_id ON visits(agent_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_visits_lead_id ON visits(lead_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_visits_scheduled_date ON visits(scheduled_date)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_visits_status ON visits(status)"))
            
            # Criar tabela refresh_tokens
            print("[INIT_DB] Criando tabela refresh_tokens...")
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    token VARCHAR(500) NOT NULL UNIQUE,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    revoked BOOLEAN DEFAULT FALSE
                )
            """))
            
            # Criar índices da tabela refresh_tokens
            print("[INIT_DB] Criando índices de refresh_tokens...")
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens(user_id)"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_token ON refresh_tokens(token)"))
            
            conn.commit()
            print("[INIT_DB] ✅ Tabelas criadas/verificadas com sucesso!")
            
    except Exception as e:
        print(f"[INIT_DB] ❌ Erro ao criar tabelas: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_tables()
