#!/usr/bin/env python3
"""
Restaurar avatares originais no Cloudinary.
Reverte a remoção de fundos aplicada incorretamente.
"""

import cloudinary
import cloudinary.uploader
from cloudinary import api as cloudinary_api
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent))
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Mapeamento: nome arquivo -> ID agente
AVATAR_MAPPING = {
    "António Silva.png": 24,
    "Bruno Libânio.png": 26,
    "Eduardo Coelho.png": 30,
    "Fabio Passos.png": 42,
    "Hugo Belo.png": 25,
    "Hugo Mota.png": 32,
    "João Carvalho.png": 34,
    "João olaio.png": 41,
    "João Paiva.png": 28,
    "João Pereira.png": 33,
    "João Silva.png": 31,
    "Marisa Barosa.png": 29,
    "Mickael Soares.png": 36,
    "Nelson Neto.png": 27,
    "Nuno Faria.png": 39,
    "Paulo Rodrigues.png": 37,
    "Pedro Olaio.png": 40,
}

def restore_avatars():
    """Restaurar avatares originais"""
    
    avatars_dir = Path.home() / "Downloads" / "Consultores "
    
    if not avatars_dir.exists():
        print(f"❌ Pasta não encontrada: {avatars_dir}")
        return
    
    print(f"📁 Restaurando de: {avatars_dir}\n")
    
    success = 0
    errors = 0
    
    for filename, agent_id in AVATAR_MAPPING.items():
        filepath = avatars_dir / filename
        
        if not filepath.exists():
            print(f"⚠️  {filename}: arquivo não encontrado")
            errors += 1
            continue
        
        # Normalizar nome para slug
        name_slug = filename.replace('.png', '').lower()
        name_slug = name_slug.replace('ã', 'a').replace('é', 'e').replace('ú', 'u')
        name_slug = name_slug.replace('ó', 'o').replace('í', 'i').replace('â', 'a')
        name_slug = name_slug.replace(' ', '-')
        
        public_id = f"crm-plus/agents/{agent_id}/{name_slug}"
        
        print(f"🔄 {filename} → {public_id}")
        
        try:
            result = cloudinary.uploader.upload(
                str(filepath),
                public_id=public_id,
                overwrite=True,
                invalidate=True,  # Limpar cache CDN
                folder=f"crm-plus/agents/{agent_id}"
            )
            
            print(f"   ✅ {result['secure_url'][:80]}...")
            success += 1
            
        except Exception as e:
            print(f"   ❌ Erro: {e}")
            errors += 1
    
    print(f"\n{'='*70}")
    print(f"✅ Sucesso: {success}")
    print(f"❌ Erros: {errors}")
    print(f"📊 Total: {len(AVATAR_MAPPING)}")

if __name__ == '__main__':
    print("="*70)
    print("RESTAURAR AVATARES ORIGINAIS - CLOUDINARY")
    print("="*70)
    print("\nIsso irá sobrescrever os avatares com as versões ORIGINAIS\n")
    
    if len(sys.argv) > 1 and sys.argv[1] == '--confirm':
        confirm = 'sim'
    else:
        confirm = input("Continuar? (sim/não): ").strip().lower()
    
    if confirm != 'sim':
        print("❌ Cancelado")
        sys.exit(0)
    
    restore_avatars()
