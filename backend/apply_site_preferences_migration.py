"""
Script para aplicar migração de preferências de site no Railway.
Executa via psycopg2 diretamente.

Uso:
    python apply_site_preferences_migration.py
"""
import os
import psycopg2
from psycopg2 import sql

# Get DATABASE_URL from environment
DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL não encontrada!")
    print("   Configure a variável de ambiente antes de executar.")
    exit(1)

# Fix postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Connecting to database...")

try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'agent_site_preferences'
        );
    """)
    table_exists = cursor.fetchone()[0]
    
    if table_exists:
        print("⚠️  Tabela 'agent_site_preferences' já existe!")
    else:
        print("📦 Criando tabela 'agent_site_preferences'...")
        
        cursor.execute("""
            CREATE TABLE agent_site_preferences (
                id SERIAL PRIMARY KEY,
                agent_id INTEGER NOT NULL UNIQUE REFERENCES agents(id) ON DELETE CASCADE,
                theme VARCHAR(20) DEFAULT 'dark',
                primary_color VARCHAR(7) DEFAULT '#ef4444',
                secondary_color VARCHAR(7) DEFAULT '#ffffff',
                hero_property_ids_json TEXT DEFAULT '[]',
                bio TEXT,
                instagram VARCHAR(255),
                facebook VARCHAR(255),
                linkedin VARCHAR(255),
                whatsapp VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        cursor.execute("""
            CREATE INDEX idx_agent_site_preferences_agent_id 
            ON agent_site_preferences(agent_id);
        """)
        
        print("✅ Tabela 'agent_site_preferences' criada com sucesso!")
    
    # Check and add columns to agents table
    print("\n📦 Verificando colunas na tabela 'agents'...")
    
    columns_to_add = [
        ('license_ami', 'VARCHAR(50)'),
        ('bio', 'TEXT'),
        ('instagram', 'VARCHAR(255)'),
        ('facebook', 'VARCHAR(255)'),
        ('linkedin', 'VARCHAR(255)'),
        ('whatsapp', 'VARCHAR(50)'),
    ]
    
    for col_name, col_type in columns_to_add:
        cursor.execute(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_name = 'agents' AND column_name = '{col_name}'
            );
        """)
        col_exists = cursor.fetchone()[0]
        
        if col_exists:
            print(f"   ⚠️  Coluna '{col_name}' já existe")
        else:
            cursor.execute(f"ALTER TABLE agents ADD COLUMN {col_name} {col_type};")
            print(f"   ✅ Coluna '{col_name}' adicionada")
    
    print("\n🎉 Migração concluída com sucesso!")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Erro: {e}")
    exit(1)
