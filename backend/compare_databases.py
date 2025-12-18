"""
Compara atribuições de propriedades entre SQLite local e PostgreSQL Railway.
"""
import os
from sqlalchemy import create_engine, text

# Propriedades de teste (casos conhecidos do CSV)
TEST_PROPERTIES = [
    "FP1073",  # CSV: António Silva
    "FP1090",  # CSV: João Paiva
    "MB1018",  # CSV: Nuno Faria
    "TV1265",  # CSV: Pedro Olaio
    "HM1369",  # CSV: Fábio Passos
    "BL1088",  # CSV: Nélson Neto
    "JS1120",  # CSV: Eduardo Coelho
    "PR1319",  # CSV: António Silva
    "PR1337",  # CSV: Fábio Passos
    "FP1169",  # CSV: António Silva (mais um FP*)
]

# SQLite local
sqlite_engine = create_engine('sqlite:///test.db')

# PostgreSQL Railway
railway_url = os.getenv('DATABASE_URL') or os.getenv('DATABASE_PRIVATE_URL')
if not railway_url:
    print("❌ DATABASE_URL não encontrada no .env")
    exit(1)

postgres_engine = create_engine(railway_url)

print("=" * 100)
print("COMPARAÇÃO: SQLite Local vs PostgreSQL Railway")
print("=" * 100)

# Buscar dados de ambas
for ref in TEST_PROPERTIES:
    print(f"\n📋 {ref}:")
    
    # SQLite
    with sqlite_engine.connect() as conn:
        result = conn.execute(text("""
            SELECT p.reference, p.agent_id, a.name 
            FROM properties p 
            LEFT JOIN agents a ON p.agent_id = a.id 
            WHERE p.reference = :ref
        """), {"ref": ref}).fetchone()
        
        if result:
            print(f"  SQLite:     agent_id={result[1]}, name={result[2]}")
        else:
            print(f"  SQLite:     ❌ Não encontrada")
    
    # PostgreSQL
    with postgres_engine.connect() as conn:
        result = conn.execute(text("""
            SELECT p.reference, p.agent_id, a.name 
            FROM properties p 
            LEFT JOIN agents a ON p.agent_id = a.id 
            WHERE p.reference = :ref
        """), {"ref": ref}).fetchone()
        
        if result:
            print(f"  PostgreSQL: agent_id={result[1]}, name={result[2]}")
        else:
            print(f"  PostgreSQL: ❌ Não encontrada")

print("\n" + "=" * 100)
print("\n💡 Agora verifica no CSV qual está correto:")
print("   - FP1073 → António Silva (ID 24)")
print("   - FP1090 → João Paiva (ID 28)")
print("   - MB1018 → Nuno Faria (ID 39)")
print("   - TV1265 → Pedro Olaio (ID 40)")
print("   - HM1369 → Fábio Passos (ID 42)")
