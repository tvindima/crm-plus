#!/usr/bin/env python3
"""
Script para aplicar migrações no ambiente de produção.
Usa DATABASE_URL diretamente com SQL raw para garantir compatibilidade.
"""
import os
import sys

# Tentar usar psycopg2 diretamente se disponível
try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("psycopg2 não disponível, usando SQLAlchemy")
    psycopg2 = None

from sqlalchemy import create_engine, text, inspect

def get_database_url():
    """Obtém a URL da base de dados"""
    url = os.environ.get("DATABASE_URL")
    if not url:
        print("⚠️  DATABASE_URL não definida, a usar SQLite local")
        return "sqlite:///./test.db"
    
    # Railway usa postgres://, SQLAlchemy precisa de postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    
    return url

def run_migrations():
    """Executa migrações manualmente"""
    database_url = get_database_url()
    print(f"🔄 A conectar à base de dados...")
    
    engine = create_engine(database_url)
    
    with engine.connect() as conn:
        # Verificar colunas existentes na tabela agents
        inspector = inspect(engine)
        
        if 'agents' not in inspector.get_table_names():
            print("❌ Tabela 'agents' não existe!")
            return False
        
        existing_columns = [col['name'] for col in inspector.get_columns('agents')]
        print(f"📊 Colunas existentes em 'agents': {existing_columns}")
        
        # Colunas a adicionar
        columns_to_add = {
            'license_ami': 'VARCHAR(50)',
            'bio': 'TEXT',
            'instagram': 'VARCHAR(255)',
            'facebook': 'VARCHAR(255)',
            'linkedin': 'VARCHAR(255)',
            'whatsapp': 'VARCHAR(50)'
        }
        
        for col_name, col_type in columns_to_add.items():
            if col_name not in existing_columns:
                try:
                    print(f"➕ A adicionar coluna '{col_name}'...")
                    conn.execute(text(f"ALTER TABLE agents ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f"✅ Coluna '{col_name}' adicionada com sucesso!")
                except Exception as e:
                    print(f"⚠️  Erro ao adicionar '{col_name}': {e}")
            else:
                print(f"✓ Coluna '{col_name}' já existe")
        
        # Verificar/criar tabela agent_site_preferences
        if 'agent_site_preferences' not in inspector.get_table_names():
            print("➕ A criar tabela 'agent_site_preferences'...")
            try:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS agent_site_preferences (
                        id SERIAL PRIMARY KEY,
                        agent_id INTEGER NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
                        theme VARCHAR(20) DEFAULT 'dark',
                        primary_color VARCHAR(20) DEFAULT '#D4AF37',
                        secondary_color VARCHAR(20) DEFAULT '#1A1A2E',
                        hero_property_ids_json TEXT DEFAULT '[]',
                        bio TEXT,
                        instagram VARCHAR(255),
                        facebook VARCHAR(255),
                        linkedin VARCHAR(255),
                        whatsapp VARCHAR(50),
                        youtube VARCHAR(255),
                        tiktok VARCHAR(255),
                        website VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                conn.commit()
                print("✅ Tabela 'agent_site_preferences' criada!")
            except Exception as e:
                print(f"⚠️  Erro ao criar tabela: {e}")
        else:
            print("✓ Tabela 'agent_site_preferences' já existe")
        
        print("\n✅ Migrações concluídas com sucesso!")
        return True

if __name__ == "__main__":
    try:
        success = run_migrations()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Erro fatal: {e}")
        sys.exit(1)
