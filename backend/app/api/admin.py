"""
Admin endpoint to fix agent_id assignments based on reference initials.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])

# Mapeamento de iniciais → agent_id (BASEADO NOS AGENTES REAIS DO SISTEMA)
# Obtido via: curl /agents/
AGENT_INITIALS_MAP = {
    "NF": 20,  # Nuno Faria
    "PO": 21,  # Pedro Olaio
    "JO": 22,  # João Olaio
    "FP": 23,  # Fábio Passos
    "AS": 24,  # António Silva
    "HB": 25,  # Hugo Belo
    "BL": 26,  # Bruno Libânio
    "NN": 27,  # Nélson Neto
    "JP": 28,  # João Paiva (principal JP - conflito com João Pereira id=33)
    "MB": 29,  # Marisa Barosa
    "EC": 30,  # Eduardo Coelho
    "JS": 31,  # João Silva
    "HM": 32,  # Hugo Mota
    "JC": 34,  # João Carvalho
    "TV": 35,  # Tiago Vindima
    "MS": 36,  # Mickael Soares
    "PR": 37,  # Paulo Rodrigues
    "IM": 38,  # Imóveis Mais Leiria
}

@router.post("/fix-agent-ids")
def fix_agent_ids(db: Session = Depends(get_db)):
    """
    Corrige agent_id de todas as propriedades baseado nas iniciais da referência.
    Cada agente tem suas propriedades identificadas pelas iniciais do nome.
    """
    from sqlalchemy import text
    
    # Get all properties
    result = db.execute(text("SELECT id, reference, agent_id FROM properties"))
    properties = result.fetchall()
    
    # Statistics
    stats_by_initials = {}
    updated_count = 0
    skipped_count = 0
    updates = []
    
    # Process each property
    for prop_id, reference, current_agent_id in properties:
        if not reference or len(reference) < 2:
            skipped_count += 1
            continue
        
        # Extract initials
        initials = reference[:2].upper()
        
        if initials not in AGENT_INITIALS_MAP:
            skipped_count += 1
            continue
        
        correct_agent_id = AGENT_INITIALS_MAP[initials]
        
        # Track statistics
        if initials not in stats_by_initials:
            stats_by_initials[initials] = {
                'total': 0,
                'correct': 0,
                'updated': 0,
                'agent_id': correct_agent_id
            }
        
        stats_by_initials[initials]['total'] += 1
        
        if current_agent_id != correct_agent_id:
            # Need to update
            db.execute(
                text("UPDATE properties SET agent_id = :new_id WHERE id = :prop_id"),
                {"new_id": correct_agent_id, "prop_id": prop_id}
            )
            stats_by_initials[initials]['updated'] += 1
            updated_count += 1
            updates.append({
                'reference': reference,
                'old_agent_id': current_agent_id,
                'new_agent_id': correct_agent_id
            })
        else:
            stats_by_initials[initials]['correct'] += 1
    
    # Commit changes
    if updated_count > 0:
        db.commit()
    
    return {
        "total_properties": len(properties),
        "updated": updated_count,
        "already_correct": len(properties) - updated_count - skipped_count,
        "skipped": skipped_count,
        "stats_by_initials": stats_by_initials,
        "sample_updates": updates[:10]  # Show first 10 updates
    }
