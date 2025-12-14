#!/usr/bin/env python3
"""
Script para corrigir:
1. Caminhos de imagens de .png para .jpg
2. Associar propriedades aos agentes baseado nas iniciais da referência
"""
import re
import sys
from pathlib import Path

# Adicionar o diretório pai ao path para imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.properties.models import Property
from app.agents.models import Agent
# Import all models to resolve relationships
import app.teams.models  # noqa: F401
import app.agencies.models  # noqa: F401
import app.leads.models  # noqa: F401


# Mapeamento de iniciais para agent_id
AGENT_INITIALS_MAP = {
    "NF": 1,   # Nuno Faria
    "PO": 2,   # Pedro Olaio
    "JO": 3,   # João Olaio
    "FP": 4,   # Fábio Passos
    "AS": 5,   # António Silva
    "HB": 6,   # Hugo Belo
    "BL": 7,   # Bruno Libânio
    "NN": 8,   # Nélson Neto
    "JP": 9,   # João Paiva (ou 14 - João Pereira)
    "MB": 10,  # Marisa Barosa
    "EC": 11,  # Eduardo Coelho
    "JS": 12,  # João Silva
    "HM": 13,  # Hugo Mota
    "JC": 15,  # João Carvalho
    "TV": 16,  # Tiago Vindima
    "MS": 17,  # Mickael Soares
    "PR": 18,  # Paulo Rodrigues
    "CB": 11,  # Assume Eduardo Coelho para CB (não existe iniciais CB nos agentes)
    "FA": 4,   # Assume Fábio Passos para FA
    "JR": 12,  # Assume João Silva para JR
}


def extract_initials(reference: str) -> str:
    """Extrai as iniciais (letras) do início da referência."""
    if not reference:
        return ""
    match = re.match(r"^([A-Za-z]+)", reference)
    return match.group(1).upper() if match else ""


def fix_image_paths(images: list) -> list:
    """Substitui .png por .jpg nos caminhos de imagens."""
    if not images:
        return images
    
    fixed = []
    for img in images:
        if img and img.endswith('.png'):
            fixed.append(img.replace('.png', '.jpg'))
        else:
            fixed.append(img)
    return fixed


def main():
    db: Session = SessionLocal()
    
    try:
        properties = db.query(Property).all()
        
        updated_images = 0
        updated_agents = 0
        
        for prop in properties:
            changes = False
            
            # 1. Fix image paths
            if prop.images:
                fixed_images = fix_image_paths(prop.images)
                if fixed_images != prop.images:
                    print(f"[IMG] {prop.reference}: {prop.images} → {fixed_images}")
                    prop.images = fixed_images
                    changes = True
                    updated_images += 1
            
            # 2. Associate agent based on reference initials
            if prop.agent_id is None and prop.reference:
                initials = extract_initials(prop.reference)
                if initials in AGENT_INITIALS_MAP:
                    agent_id = AGENT_INITIALS_MAP[initials]
                    print(f"[AGENT] {prop.reference}: iniciais={initials} → agent_id={agent_id}")
                    prop.agent_id = agent_id
                    changes = True
                    updated_agents += 1
                else:
                    print(f"[WARN] {prop.reference}: iniciais={initials} não encontradas no mapeamento")
            
            if changes:
                db.add(prop)
        
        db.commit()
        
        print(f"\n✅ Concluído!")
        print(f"   - Imagens atualizadas: {updated_images}")
        print(f"   - Agentes associados: {updated_agents}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
