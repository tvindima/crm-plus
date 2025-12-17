"""
Admin endpoint to fix agent_id assignments based on reference initials.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, engine

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


@router.post("/migrate/leads")
def migrate_leads():
    """
    🚨 ENDPOINT TEMPORÁRIO - Roda migração da tabela leads
    Adiciona colunas: source, origin, action_type, property_id
    """
    try:
        with engine.begin() as conn:
            results = []
            
            # Check and add source
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='source'
            """))
            if result.fetchone() is None:
                conn.execute(text("ALTER TABLE leads ADD COLUMN source VARCHAR"))
                results.append("✅ Added source")
            else:
                results.append("✓ source exists")
            
            # Check and add origin
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='origin'
            """))
            if result.fetchone() is None:
                conn.execute(text("ALTER TABLE leads ADD COLUMN origin VARCHAR"))
                results.append("✅ Added origin")
            else:
                results.append("✓ origin exists")
            
            # Check and add action_type
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='action_type'
            """))
            if result.fetchone() is None:
                conn.execute(text("ALTER TABLE leads ADD COLUMN action_type VARCHAR"))
                results.append("✅ Added action_type")
            else:
                results.append("✓ action_type exists")
            
            # Check and add property_id
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='leads' AND column_name='property_id'
            """))
            if result.fetchone() is None:
                conn.execute(text("ALTER TABLE leads ADD COLUMN property_id INTEGER REFERENCES properties(id)"))
                results.append("✅ Added property_id")
            else:
                results.append("✓ property_id exists")
            
        return {
            "status": "success",
            "message": "Leads migration completed",
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cleanup-old-media-urls")
def cleanup_old_media_urls(db: Session = Depends(get_db)):
    """
    Remove URLs antigas de /media/ que retornam 404.
    
    ⚠️ Este endpoint é temporário - usado após migração para Cloudinary.
    Remove URLs antigas do Railway filesystem que já não existem.
    Mantém URLs externas (Unsplash, Cloudinary, etc).
    """
    import json
    
    try:
        # Buscar propriedades com URLs antigas
        result = db.execute(text("""
            SELECT id, reference, images 
            FROM properties 
            WHERE images IS NOT NULL 
            AND images::text LIKE '%/media/properties/%'
        """))
        
        properties = result.fetchall()
        
        if not properties:
            return {
                "success": True,
                "message": "✅ Nenhuma URL antiga encontrada!",
                "cleaned": 0,
                "properties": []
            }
        
        cleaned_list = []
        cleaned_count = 0
        
        for prop in properties:
            prop_id, reference, images_json = prop
            
            # Parse JSON array
            try:
                images = json.loads(images_json) if isinstance(images_json, str) else images_json
            except:
                images = images_json if isinstance(images_json, list) else []
            
            if not images:
                continue
            
            # Filtrar apenas URLs válidas (externas)
            old_count = len(images)
            cleaned_images = [
                url for url in images 
                if not url.startswith('/media/') 
                and not 'railway.app/media/' in url
            ]
            
            removed = old_count - len(cleaned_images)
            
            if removed > 0:
                cleaned_list.append({
                    "id": prop_id,
                    "reference": reference,
                    "removed": removed,
                    "kept": len(cleaned_images)
                })
                
                # Update database
                if cleaned_images:
                    db.execute(text("""
                        UPDATE properties 
                        SET images = :images::jsonb
                        WHERE id = :id
                    """), {"images": json.dumps(cleaned_images), "id": prop_id})
                else:
                    # Se não sobrou nenhuma, setar NULL
                    db.execute(text("""
                        UPDATE properties 
                        SET images = NULL
                        WHERE id = :id
                    """), {"id": prop_id})
                
                cleaned_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"✅ Limpeza concluída! {cleaned_count} propriedades atualizadas",
            "cleaned": cleaned_count,
            "total_found": len(properties),
            "properties": cleaned_list
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro na limpeza: {str(e)}")

