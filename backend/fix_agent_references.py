#!/usr/bin/env python3
"""
Script para corrigir atribuição de propriedades por prefixo de referência.
Garante que propriedades PR* vão para Paulo Rodrigues, TV* para Tiago Vindima, etc.
"""
import os
import sys
from sqlalchemy import create_engine, text

# Mapeamento: Prefixo → Agent ID → Nome
REFERENCE_TO_AGENT = {
    'PR': (37, 'Paulo Rodrigues'),
    'TV': (35, 'Tiago Vindima'),
    'PO': (40, 'Pedro Olaio'),
    'NF': (39, 'Nuno Faria'),
    'JO': (41, 'João Olaio'),
    'FP': (42, 'Fábio Passos'),
    'AS': (24, 'António Silva'),
    'HB': (25, 'Hugo Belo'),
    'BL': (26, 'Bruno Libânio'),
    'NN': (27, 'Nélson Neto'),
    'MB': (29, 'Marisa Barosa'),
    'EC': (30, 'Eduardo Coelho'),
    'JS': (31, 'João Silva'),
    'HM': (32, 'Hugo Mota'),
    'JC': (34, 'João Carvalho'),
    'MS': (36, 'Mickael Soares'),
}

def main():
    db_url = os.environ.get("DATABASE_URL")
    
    if not db_url:
        print("❌ DATABASE_URL não encontrada")
        print("Execute: export DATABASE_URL='postgresql://...'")
        sys.exit(1)
    
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    
    engine = create_engine(db_url)
    
    print("🔍 Corrigindo atribuição de propriedades por prefixo...\n")
    
    total_updated = 0
    
    with engine.connect() as conn:
        for prefix, (agent_id, agent_name) in REFERENCE_TO_AGENT.items():
            # Contar quantas propriedades precisam ser corrigidas
            count_query = text("""
                SELECT COUNT(*) 
                FROM properties 
                WHERE reference LIKE :prefix 
                AND (agent_id IS NULL OR agent_id != :agent_id)
            """)
            
            result = conn.execute(count_query, {
                "prefix": f"{prefix}%",
                "agent_id": agent_id
            })
            count = result.scalar()
            
            if count > 0:
                print(f"📝 {prefix}* → {agent_name} (ID {agent_id}): {count} propriedades")
                
                # Executar update
                update_query = text("""
                    UPDATE properties 
                    SET agent_id = :agent_id 
                    WHERE reference LIKE :prefix
                    AND (agent_id IS NULL OR agent_id != :agent_id)
                """)
                
                conn.execute(update_query, {
                    "prefix": f"{prefix}%",
                    "agent_id": agent_id
                })
                conn.commit()
                
                total_updated += count
            else:
                print(f"✅ {prefix}* → {agent_name} (ID {agent_id}): OK")
    
    print(f"\n🎉 Total atualizado: {total_updated} propriedades")
    print("✅ Atribuição corrigida com sucesso!")

if __name__ == "__main__":
    main()
