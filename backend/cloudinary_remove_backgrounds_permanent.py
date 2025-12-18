#!/usr/bin/env python3
"""
Aplicar remoção de fundo permanente nos avatares Cloudinary.
Sobrescreve as imagens originais com versões sem fundo.
"""

import cloudinary
import cloudinary.uploader
from cloudinary import api as cloudinary_api
import os
import sys
from dotenv import load_dotenv
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

def process_avatars():
    """Processar todos os avatares em crm-plus/agents/"""
    
    print("🔍 Buscando avatares em crm-plus/agents/...")
    
    try:
        # Listar recursos na pasta
        resources = cloudinary_api.resources(
            type="upload",
            prefix="crm-plus/agents/",
            max_results=500
        )
        
        avatars = resources.get('resources', [])
        print(f"📊 Encontrados: {len(avatars)} avatares\n")
        
        for avatar in avatars:
            public_id = avatar['public_id']
            original_url = avatar['secure_url']
            
            print(f"🔄 Processando: {public_id}")
            
            try:
                # Re-upload com transformação e:bgremoval aplicada
                # Isso sobrescreve a imagem original
                result = cloudinary.uploader.upload(
                    original_url,
                    public_id=public_id,
                    overwrite=True,
                    transformation=[
                        {'effect': 'background_removal'},
                        {'quality': 'auto:best'},
                        {'fetch_format': 'auto'}
                    ],
                    invalidate=True  # Limpar cache CDN
                )
                
                new_url = result['secure_url']
                print(f"   ✅ Atualizado: {new_url[:80]}...")
                
            except Exception as e:
                print(f"   ❌ Erro: {e}")
                continue
        
        print(f"\n✅ Processamento concluído!")
        print(f"ℹ️  As URLs originais agora servem imagens SEM FUNDO")
        
    except Exception as e:
        print(f"❌ Erro ao listar avatares: {e}")
        return

if __name__ == '__main__':
    import sys
    
    print("="*70)
    print("APLICAR REMOÇÃO DE FUNDO PERMANENTE - CLOUDINARY")
    print("="*70)
    print("\n⚠️  ATENÇÃO: Isso SOBRESCREVERÁ as imagens originais!")
    print("As URLs existentes servirão imagens sem fundo.\n")
    
    # Aceitar 'sim' via argumento ou input
    if len(sys.argv) > 1 and sys.argv[1] == '--confirm':
        confirm = 'sim'
    else:
        confirm = input("Continuar? (sim/não): ").strip().lower()
    
    if confirm != 'sim':
        print("❌ Cancelado")
        sys.exit(0)
    
    process_avatars()
