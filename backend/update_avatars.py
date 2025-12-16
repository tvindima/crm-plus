"""
Script para adicionar avatares aos agentes na base de dados
"""
import os
import sys
from sqlalchemy import create_engine, text

# Database URL - Use production PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:nQLSDohPMPlmkKacgcXDSoQQkWMnLfJC@postgres.railway.internal:5432/railway")
# Fix Railway's postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

# Mapeamento de IDs para nomes e avatares (equipa de suporte)
STAFF_AGENTS = {
    19: {"name": "Ana Vindima", "email": "ana.vindima@imoveismais.pt", "avatar": "/avatars/19.png"},
    20: {"name": "Maria Olaio", "email": "maria.olaio@imoveismais.pt", "avatar": "/avatars/20.png"},
    21: {"name": "Andreia Borges", "email": "andreia.borges@imoveismais.pt", "avatar": "/avatars/21.png"},
    22: {"name": "Sara Ferreira", "email": "sara.ferreira@imoveismais.pt", "avatar": "/avatars/22.png"},
    23: {"name": "Cláudia Libânio", "email": "claudia.libanio@imoveismais.pt", "avatar": "/avatars/23.png"},
}

# Mapeamento de avatares para agentes existentes
AVATAR_MAPPING = {
    24: "/avatars/antonio-silva.png",
    25: "/avatars/hugo-belo.png",
    26: "/avatars/bruno-libanio.png",
    27: "/avatars/nelson-neto.png",
    28: "/avatars/joao-paiva.png",
    29: "/avatars/marisa-barosa.png",
    30: "/avatars/eduardo-coelho.png",
    31: "/avatars/joao-silva.png",
    32: "/avatars/hugo-mota.png",
    33: "/avatars/joao-pereira.png",
    34: "/avatars/joao-carvalho.png",
    35: "/avatars/tiago-vindima.png",
    36: "/avatars/mickael-soares.png",
    37: "/avatars/paulo-rodrigues.png",
}

def main():
    print(f"🔗 Connecting to: {DATABASE_URL[:50]}...")
    
    with engine.connect() as conn:
        # 1. Add avatar_url column if it doesn't exist
        print("\n1️⃣ Adding avatar_url column...")
        try:
            conn.execute(text("""
                ALTER TABLE agents 
                ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
            """))
            conn.commit()
            print("✅ Column added/verified")
        except Exception as e:
            print(f"⚠️  {e}")
            conn.rollback()
        
        # 2. Create/update staff agents (IDs 19-23)
        print("\n2️⃣ Creating/updating staff agents...")
        for agent_id, data in STAFF_AGENTS.items():
            try:
                # Check if agent exists
                result = conn.execute(
                    text("SELECT id FROM agents WHERE id = :id"),
                    {"id": agent_id}
                )
                exists = result.fetchone()
                
                if exists:
                    # Update existing
                    conn.execute(
                        text("""
                            UPDATE agents 
                            SET name = :name, email = :email, avatar_url = :avatar
                            WHERE id = :id
                        """),
                        {"id": agent_id, "name": data["name"], "email": data["email"], "avatar": data["avatar"]}
                    )
                    print(f"✅ Updated agent {agent_id}: {data['name']}")
                else:
                    # Create new
                    conn.execute(
                        text("""
                            INSERT INTO agents (id, name, email, avatar_url)
                            VALUES (:id, :name, :email, :avatar)
                        """),
                        {"id": agent_id, "name": data["name"], "email": data["email"], "avatar": data["avatar"]}
                    )
                    print(f"✅ Created agent {agent_id}: {data['name']}")
                
                conn.commit()
            except Exception as e:
                print(f"❌ Error with agent {agent_id}: {e}")
                conn.rollback()
        
        # 3. Update avatars for existing agents
        print("\n3️⃣ Updating avatars for existing agents...")
        for agent_id, avatar_url in AVATAR_MAPPING.items():
            try:
                result = conn.execute(
                    text("UPDATE agents SET avatar_url = :avatar WHERE id = :id"),
                    {"avatar": avatar_url, "id": agent_id}
                )
                conn.commit()
                if result.rowcount > 0:
                    print(f"✅ Updated avatar for agent {agent_id}")
            except Exception as e:
                print(f"❌ Error updating agent {agent_id}: {e}")
        
        # 4. Verify updates
        print("\n4️⃣ Verifying all agents with avatars...")
        result = conn.execute(text("""
            SELECT id, name, avatar_url 
            FROM agents 
            WHERE avatar_url IS NOT NULL
            ORDER BY id
        """))
        
        agents_with_avatars = result.fetchall()
        print(f"\n✅ {len(agents_with_avatars)} agents with avatars:")
        for agent in agents_with_avatars:
            print(f"  {agent[0]:2d}. {agent[1]:25s} → {agent[2]}")

if __name__ == "__main__":
    main()
