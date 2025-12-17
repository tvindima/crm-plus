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


@router.get("/audit-database")
def audit_database(db: Session = Depends(get_db)):
    """
    Gera relatório completo do estado da database.
    
    Retorna:
    - Estatísticas de propriedades (total, com/sem imagens, com/sem vídeo)
    - Estatísticas de agentes (total, com/sem foto, com/sem vídeo)
    - Breakdown por tipo de propriedade
    - Top agentes por número de propriedades
    - Análise de URLs de imagens (Cloudinary vs Unsplash)
    """
    import json
    
    try:
        # === PROPRIEDADES ===
        total_props = db.execute(text("SELECT COUNT(*) FROM properties")).scalar()
        with_images = db.execute(text("""
            SELECT COUNT(*) FROM properties 
            WHERE images IS NOT NULL AND jsonb_array_length(images) > 0
        """)).scalar()
        without_images = total_props - with_images
        with_video = db.execute(text("""
            SELECT COUNT(*) FROM properties 
            WHERE video_url IS NOT NULL AND video_url != ''
        """)).scalar()
        published = db.execute(text("SELECT COUNT(*) FROM properties WHERE is_published = true")).scalar()
        
        # Breakdown por tipo
        tipos_result = db.execute(text("""
            SELECT property_type, COUNT(*) as count
            FROM properties
            GROUP BY property_type
            ORDER BY count DESC
        """)).fetchall()
        tipos = [{"tipo": t[0] or "Não definido", "count": t[1]} for t in tipos_result]
        
        # Top 10 agentes
        agentes_result = db.execute(text("""
            SELECT a.name, COUNT(p.id) as count
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
            GROUP BY a.name
            ORDER BY count DESC
            LIMIT 10
        """)).fetchall()
        top_agentes = [{"name": a[0] or "Sem agente", "count": a[1]} for a in agentes_result]
        
        # === AGENTES ===
        total_agents = db.execute(text("SELECT COUNT(*) FROM agents")).scalar()
        agents_with_photo = db.execute(text("""
            SELECT COUNT(*) FROM agents 
            WHERE photo IS NOT NULL AND photo != ''
        """)).scalar()
        agents_without_photo = total_agents - agents_with_photo
        agents_with_video = db.execute(text("""
            SELECT COUNT(*) FROM agents 
            WHERE video_url IS NOT NULL AND video_url != ''
        """)).scalar()
        
        # === ANÁLISE DE IMAGENS ===
        images_result = db.execute(text("""
            SELECT 
                SUM(jsonb_array_length(images)) as total_images,
                COUNT(DISTINCT id) as properties_with_images
            FROM properties
            WHERE images IS NOT NULL
        """)).fetchone()
        
        total_images = images_result[0] or 0
        props_with_images = images_result[1] or 0
        avg_images = total_images / props_with_images if props_with_images > 0 else 0
        
        # URLs Unsplash vs Cloudinary
        unsplash_count = db.execute(text("""
            SELECT COUNT(DISTINCT id)
            FROM properties, jsonb_array_elements_text(images) as url
            WHERE url LIKE '%unsplash%'
        """)).scalar() or 0
        
        cloudinary_count = db.execute(text("""
            SELECT COUNT(DISTINCT id)
            FROM properties, jsonb_array_elements_text(images) as url
            WHERE url LIKE '%cloudinary%'
        """)).scalar() or 0
        
        # === VÍDEOS ===
        youtube_props = db.execute(text("""
            SELECT COUNT(*)
            FROM properties
            WHERE video_url LIKE '%youtube%' OR video_url LIKE '%youtu.be%'
        """)).scalar() or 0
        
        youtube_agents = db.execute(text("""
            SELECT COUNT(*)
            FROM agents
            WHERE video_url LIKE '%youtube%' OR video_url LIKE '%youtu.be%'
        """)).scalar() or 0
        
        return {
            "success": True,
            "properties": {
                "total": total_props,
                "published": published,
                "with_images": with_images,
                "without_images": without_images,
                "with_video": with_video,
                "without_video": total_props - with_video,
                "by_type": tipos,
                "top_agents": top_agentes
            },
            "agents": {
                "total": total_agents,
                "with_photo": agents_with_photo,
                "without_photo": agents_without_photo,
                "with_video": agents_with_video,
                "without_video": total_agents - agents_with_video
            },
            "images": {
                "total_urls": total_images,
                "avg_per_property": round(avg_images, 1),
                "unsplash_count": unsplash_count,
                "cloudinary_count": cloudinary_count
            },
            "videos": {
                "properties_youtube": youtube_props,
                "agents_youtube": youtube_agents
            },
            "priorities": {
                "critical": f"{without_images} propriedades SEM IMAGENS",
                "important": f"{agents_without_photo} agentes SEM FOTO",
                "optional": f"{total_props - with_video} propriedades SEM VÍDEO"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao auditar database: {str(e)}")

