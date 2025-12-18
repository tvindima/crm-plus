"""
Correção de agent_id baseado no CSV angariador (fonte de verdade).
Resolve problema de prefixo ≠ agente atual (ex: FP1234 pode ser de António Silva).
"""

import csv
import sys
from sqlalchemy import text
from app.database import SessionLocal

# Mapeamento: Nome no CSV → Agent ID na database
ANGARIADOR_TO_AGENT_ID = {
    "António Silva": 24,
    "Hugo Belo": 25,
    "Bruno Libânio": 26,
    "Nélson Neto": 27,
    "João Paiva": 28,
    "Marisa Barosa": 29,
    "Eduardo Coelho": 30,
    "João Silva": 31,
    "Hugo Mota": 32,
    "João Pereira": 33,
    "João Carvalho": 34,
    "Tiago Vindima": 35,
    "Mickael Soares": 36,
    "Paulo Rodrigues": 37,
    "Imóveis Mais Leiria": 38,
    "Nuno Faria": 39,
    "Pedro Olaio": 40,
    "João Olaio": 41,
    "Fábio Passos": 42,
}

# Angariadores antigos sem agente correspondente (atribuir ao coordenador)
ORPHAN_ANGARIADORES = {
    "Sofia Garcia",
    "Maria Rosa", 
    "António Barosa",
    "Maria Mendes",
    "Ricardo Vila"
}
DEFAULT_AGENT_ID = 35  # Tiago Vindima (coordenador)


def fix_assignments_from_csv(csv_path: str = "backend/scripts/propriedades.csv"):
    """
    Corrige agent_id de todas as propriedades baseado no CSV.
    """
    db = SessionLocal()
    
    try:
        # Ler CSV
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=';')
            
            stats = {
                "total": 0,
                "updated": 0,
                "orphaned": 0,
                "not_found": 0,
                "already_correct": 0,
                "by_agent": {},
                "unmapped_angariadores": set()
            }
            
            for row in reader:
                stats["total"] += 1
                
                referencia = row.get('referencia', '').strip()
                angariador = row.get('angariador', '').strip()
                
                if not referencia:
                    stats["not_found"] += 1
                    continue
                
                # Determinar agent_id correto
                if angariador in ANGARIADOR_TO_AGENT_ID:
                    correct_agent_id = ANGARIADOR_TO_AGENT_ID[angariador]
                elif angariador in ORPHAN_ANGARIADORES:
                    correct_agent_id = DEFAULT_AGENT_ID
                    stats["orphaned"] += 1
                else:
                    stats["unmapped_angariadores"].add(angariador)
                    correct_agent_id = DEFAULT_AGENT_ID
                    stats["orphaned"] += 1
                
                # Buscar propriedade na database
                result = db.execute(
                    text("SELECT id, agent_id FROM properties WHERE reference = :ref"),
                    {"ref": referencia}
                ).fetchone()
                
                if not result:
                    stats["not_found"] += 1
                    continue
                
                property_id, current_agent_id = result
                
                # Atualizar se diferente
                if current_agent_id != correct_agent_id:
                    db.execute(
                        text("UPDATE properties SET agent_id = :agent_id WHERE id = :id"),
                        {"agent_id": correct_agent_id, "id": property_id}
                    )
                    stats["updated"] += 1
                    
                    # Contar por agente
                    agent_name = next(
                        (k for k, v in ANGARIADOR_TO_AGENT_ID.items() if v == correct_agent_id),
                        f"ID {correct_agent_id}"
                    )
                    stats["by_agent"][agent_name] = stats["by_agent"].get(agent_name, 0) + 1
                    
                    print(f"✅ {referencia}: {current_agent_id} → {correct_agent_id} ({angariador})")
                else:
                    stats["already_correct"] += 1
        
        # Commit
        db.commit()
        
        # Relatório final
        print("\n" + "="*60)
        print("📊 RELATÓRIO DE CORREÇÃO")
        print("="*60)
        print(f"Total no CSV: {stats['total']}")
        print(f"Atualizadas: {stats['updated']}")
        print(f"Já corretas: {stats['already_correct']}")
        print(f"Órfãs (angariador antigo): {stats['orphaned']}")
        print(f"Não encontradas na DB: {stats['not_found']}")
        
        if stats["by_agent"]:
            print("\n📋 Atualizações por Agente:")
            for agent, count in sorted(stats["by_agent"].items(), key=lambda x: -x[1]):
                print(f"  {agent}: {count}")
        
        if stats["unmapped_angariadores"]:
            print("\n⚠️ Angariadores sem mapeamento (atribuídos ao coordenador):")
            for ang in sorted(stats["unmapped_angariadores"]):
                print(f"  - {ang}")
        
        print("\n✅ Correção concluída com sucesso!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    import os
    os.chdir("/Users/tiago.vindima/Desktop/CRM PLUS")
    fix_assignments_from_csv()
