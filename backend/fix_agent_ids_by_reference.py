#!/usr/bin/env python3
"""
Script para corrigir agent_id de propriedades baseado nas iniciais da referência.
Cada agente tem suas propriedades identificadas pelas iniciais do nome na referência.
Exemplo: TV1234 → Tiago Vindima (agent_id = 35)
"""
import os

# Force PostgreSQL connection
os.environ['DATABASE_URL'] = 'postgresql://postgres:UrAXdgrmLTZhYpHvtIqCtkZLQQWjWTri@junction.proxy.rlwy.net:55713/railway'

from sqlalchemy import text
from app.database import SessionLocal, engine

# Mapeamento de iniciais → agent_id (baseado no backend real)
AGENT_INITIALS_MAP = {
    "TV": 35,  # Tiago Vindima
    "MB": 29,  # Marisa Barosa
    "NN": 27,  # Nélson Neto
    "NF": 20,  # Nuno Faria
    "PO": 21,  # Pedro Olaio
    "JO": 22,  # João Olaio
    "FP": 23,  # Fábio Passos
    "AS": 24,  # António Silva
    "HB": 25,  # Hugo Belo
    "BL": 26,  # Bruno Libânio
    "JP": 33,  # João Pereira
    "EC": 30,  # Eduardo Coelho
    "JS": 31,  # João Silva
    "HM": 32,  # Hugo Mota
    "JC": 34,  # João Carvalho
    "MS": 36,  # Mickael Soares
    "PR": 37,  # Paulo Rodrigues
    "IL": 38,  # Imóveis Mais Leiria
}


def fix_agent_ids():
    """Corrige agent_id de todas as propriedades baseado nas iniciais da referência."""
    db = SessionLocal()
    try:
        # Buscar todas as propriedades
        properties = db.query(Property).all()
        
        updated_count = 0
        errors = []
        
        print(f"🔍 Analisando {len(properties)} propriedades...\n")
        
        for prop in properties:
            if not prop.reference:
                continue
            
            # Extrair as 2 primeiras letras da referência
            initials = prop.reference[:2].upper()
            
            if initials in AGENT_INITIALS_MAP:
                correct_agent_id = AGENT_INITIALS_MAP[initials]
                
                if prop.agent_id != correct_agent_id:
                    print(f"📝 Corrigindo {prop.reference}: agent_id {prop.agent_id} → {correct_agent_id}")
                    prop.agent_id = correct_agent_id
                    updated_count += 1
            else:
                if initials and initials.isalpha():
                    errors.append(f"⚠️  {prop.reference}: Iniciais '{initials}' não mapeadas")
        
        if updated_count > 0:
            db.commit()
            print(f"\n✅ {updated_count} propriedades atualizadas com sucesso!")
        else:
            print("\n✅ Nenhuma propriedade precisava de correção.")
        
        if errors:
            print(f"\n⚠️  {len(errors)} propriedades com iniciais não mapeadas:")
            for error in errors[:10]:  # Mostrar apenas primeiras 10
                print(f"   {error}")
        
        # Mostrar estatísticas por agente
        print("\n📊 Propriedades por agente (após correção):")
        for initials, agent_id in sorted(AGENT_INITIALS_MAP.items()):
            count = sum(1 for p in properties if p.reference and p.reference[:2].upper() == initials)
            if count > 0:
                # Buscar nome do agente
                agent = db.query(Agent).filter(Agent.id == agent_id).first()
                agent_name = agent.name if agent else f"ID {agent_id}"
                print(f"   {initials}: {count:3d} propriedades - {agent_name}")
    
    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Iniciando correção de agent_id baseado em iniciais da referência...\n")
    fix_agent_ids()
    print("\n✨ Concluído!")
