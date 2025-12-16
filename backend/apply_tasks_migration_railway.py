#!/usr/bin/env python3
"""
Script para aplicar migração de tasks no PostgreSQL do Railway.
Cria a tabela tasks com todos os campos e índices necessários.
"""
import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# DATABASE_URL do Railway (pegar de variável de ambiente ou Railway dashboard)
# Se não tiver em env, usar a última conhecida
DATABASE_URL = os.getenv('DATABASE_URL') or os.getenv('RAILWAY_DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL não encontrada!")
    print("Definir variável de ambiente:")
    print("export DATABASE_URL='postgresql://...'")
    sys.exit(1)

# Converter postgres:// para postgresql:// se necessário
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Conectando ao Railway PostgreSQL...")
print(f"   Host: {DATABASE_URL.split('@')[1].split('/')[0] if '@' in DATABASE_URL else 'hidden'}")

try:
    # Conectar ao PostgreSQL
    conn = psycopg2.connect(DATABASE_URL)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    print("✅ Conexão estabelecida com sucesso!")
    
    # Verificar se tabela tasks já existe
    cursor.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'tasks'
        );
    """)
    exists = cursor.fetchone()[0]
    
    if exists:
        print("⚠️  Tabela 'tasks' já existe!")
        cursor.execute("SELECT COUNT(*) FROM tasks;")
        count = cursor.fetchone()[0]
        print(f"   Contém {count} registros")
        
        response = input("Deseja recriar a tabela? (s/N): ")
        if response.lower() != 's':
            print("❌ Operação cancelada pelo utilizador")
            sys.exit(0)
        
        print("🗑️  Removendo tabela antiga...")
        cursor.execute("DROP TABLE tasks CASCADE;")
        print("✅ Tabela removida")
    
    # Criar tipos ENUM no PostgreSQL
    print("📝 Criando tipos ENUM...")
    
    # TaskType
    cursor.execute("""
        DO $$ BEGIN
            CREATE TYPE tasktype AS ENUM ('VISIT', 'CALL', 'MEETING', 'FOLLOWUP', 'OTHER');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # TaskStatus
    cursor.execute("""
        DO $$ BEGIN
            CREATE TYPE taskstatus AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # TaskPriority
    cursor.execute("""
        DO $$ BEGIN
            CREATE TYPE taskpriority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    print("✅ Tipos ENUM criados")
    
    # Criar tabela tasks
    print("📝 Criando tabela 'tasks'...")
    cursor.execute("""
        CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            title VARCHAR NOT NULL,
            description TEXT,
            
            -- Tipo e status
            task_type tasktype NOT NULL,
            status taskstatus NOT NULL DEFAULT 'PENDING',
            priority taskpriority NOT NULL DEFAULT 'MEDIUM',
            
            -- Datas
            due_date TIMESTAMP NOT NULL,
            completed_at TIMESTAMP,
            reminder_sent BOOLEAN DEFAULT FALSE,
            
            -- Foreign Keys
            lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
            property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
            assigned_agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
            created_by_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
            
            -- Timestamps
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
    """)
    
    print("✅ Tabela 'tasks' criada")
    
    # Criar índices
    print("📝 Criando índices...")
    indexes = [
        "CREATE INDEX ix_tasks_id ON tasks(id);",
        "CREATE INDEX ix_tasks_task_type ON tasks(task_type);",
        "CREATE INDEX ix_tasks_status ON tasks(status);",
        "CREATE INDEX ix_tasks_priority ON tasks(priority);",
        "CREATE INDEX ix_tasks_due_date ON tasks(due_date);",
        "CREATE INDEX ix_tasks_lead_id ON tasks(lead_id);",
        "CREATE INDEX ix_tasks_property_id ON tasks(property_id);",
        "CREATE INDEX ix_tasks_assigned_agent_id ON tasks(assigned_agent_id);"
    ]
    
    for idx_sql in indexes:
        cursor.execute(idx_sql)
        idx_name = idx_sql.split()[2]
        print(f"   ✅ {idx_name}")
    
    print("✅ Todos os índices criados")
    
    # Atualizar tabela alembic_version
    print("📝 Atualizando alembic_version...")
    cursor.execute("""
        INSERT INTO alembic_version (version_num) 
        VALUES ('189fdabc9260')
        ON CONFLICT (version_num) DO NOTHING;
    """)
    print("✅ Versão Alembic atualizada para 189fdabc9260")
    
    # Validar estrutura
    print("\n🔍 Validando estrutura da tabela...")
    cursor.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'tasks'
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    print(f"\n✅ Tabela 'tasks' tem {len(columns)} colunas:")
    for col in columns:
        nullable = "NULL" if col[2] == "YES" else "NOT NULL"
        print(f"   - {col[0]:<20} {col[1]:<20} {nullable}")
    
    # Verificar índices criados
    cursor.execute("""
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'tasks'
        ORDER BY indexname;
    """)
    
    indexes_created = cursor.fetchall()
    print(f"\n✅ {len(indexes_created)} índices criados:")
    for idx in indexes_created:
        print(f"   - {idx[0]}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "="*60)
    print("🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
    print("="*60)
    print("\n✅ Tabela 'tasks' criada no PostgreSQL Railway")
    print("✅ 8 índices criados para performance")
    print("✅ Tipos ENUM registrados (TaskType, TaskStatus, TaskPriority)")
    print("✅ Foreign keys configuradas (leads, properties, agents)")
    print("✅ Alembic version atualizada para 189fdabc9260")
    print("\n🚀 Próximo passo: Testar endpoints em produção!")
    print("   curl https://crm-plus-production.up.railway.app/calendar/tasks")
    
except psycopg2.Error as e:
    print(f"\n❌ Erro PostgreSQL: {e}")
    print(f"   Código: {e.pgcode}")
    print(f"   Mensagem: {e.pgerror}")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Erro: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
