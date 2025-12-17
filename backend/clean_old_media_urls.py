"""
Remove URLs antigas de /media/ que não existem mais (Railway filesystem).
Mantém apenas URLs externas (Unsplash, Cloudinary, etc).
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/crm_plus"
)

def clean_old_media_urls():
    """Remove URLs antigas de /media/ properties"""
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
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
            print("✅ Nenhuma URL antiga encontrada!")
            return
        
        print(f"🔍 Encontradas {len(properties)} propriedades com URLs antigas:\n")
        
        cleaned = 0
        for prop in properties:
            prop_id, reference, images_json = prop
            
            # Parse JSON array
            import json
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
                print(f"  - ID {prop_id} ({reference}): {removed} URLs antigas removidas, {len(cleaned_images)} mantidas")
                
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
                
                cleaned += 1
        
        db.commit()
        
        print(f"\n✅ Limpeza concluída!")
        print(f"   - {cleaned} propriedades atualizadas")
        print(f"   - URLs antigas removidas")
        print(f"   - URLs externas (Unsplash, etc) mantidas")
        print(f"\n💡 Próximo passo: fazer upload de novas imagens via backoffice (irão para Cloudinary)")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("🧹 LIMPEZA DE URLs ANTIGAS (/media/)")
    print("=" * 60)
    print()
    
    # Confirmar
    if len(sys.argv) > 1 and sys.argv[1] == "--confirm":
        clean_old_media_urls()
    else:
        print("⚠️  Este script vai remover URLs antigas de /media/ que retornam 404")
        print("   URLs externas (Unsplash, Cloudinary) serão mantidas")
        print()
        print("Para executar:")
        print("  python clean_old_media_urls.py --confirm")
        print()
        print("Ou via Railway:")
        print("  railway run python clean_old_media_urls.py --confirm")
