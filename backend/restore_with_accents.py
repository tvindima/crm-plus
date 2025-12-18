#!/usr/bin/env python3
"""
Restaurar avatares originais COM acentos corretos.
"""

import cloudinary
import cloudinary.uploader
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).parent))
load_dotenv()

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Mapeamento: arquivo -> (ID, slug_correto_com_acentos)
AVATAR_MAPPING = {
    "António Silva.png": (24, "antónio-silva"),
    "Bruno Libânio.png": (26, "bruno-libânio"),
    "Eduardo Coelho.png": (30, "eduardo-coelho"),
    "Fabio Passos.png": (42, "fábio-passos"),
    "Hugo Belo.png": (25, "hugo-belo"),
    "Hugo Mota.png": (32, "hugo-mota"),
    "João Carvalho.png": (34, "joão-carvalho"),
    "João olaio.png": (41, "joão-olaio"),
    "João Paiva.png": (28, "joão-paiva"),
    "João Pereira.png": (33, "joão-pereira"),
    "João Silva.png": (31, "joão-silva"),
    "Marisa Barosa.png": (29, "marisa-barosa"),
    "Mickael Soares.png": (36, "mickael-soares"),
    "Nelson Neto.png": (27, "nélson-neto"),
    "Nuno Faria.png": (39, "nuno-faria"),
    "Paulo Rodrigues.png": (37, "paulo-rodrigues"),
    "Pedro Olaio.png": (40, "pedro-olaio"),
    "Tiago Vindima.png": (35, "tiago-vindima"),
}

def restore_with_accents():
    """Restaurar com acentos preservados"""
    
    avatars_dir = Path.home() / "Downloads" / "Consultores "
    
    if not avatars_dir.exists():
        print(f"❌ Pasta não encontrada: {avatars_dir}")
        return
    
    print(f"📁 Restaurando de: {avatars_dir}\n")
    
    success = 0
    errors = 0
    
    for filename, (agent_id, slug) in AVATAR_MAPPING.items():
        filepath = avatars_dir / filename
        
        if not filepath.exists():
            print(f"⚠️  {filename}: arquivo não encontrado")
            errors += 1
            continue
        
        public_id = f"crm-plus/agents/{agent_id}/{slug}"
        
        print(f"🔄 {filename}")
        print(f"   → {public_id}")
        
        try:
            result = cloudinary.uploader.upload(
                str(filepath),
                public_id=public_id,
                overwrite=True,
                invalidate=True,
                resource_type="image"
            )
            
            url = result['secure_url']
            print(f"   ✅ v{result['version']}")
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
    print("RESTAURAR COM ACENTOS CORRETOS")
    print("="*70)
    print("\nSobrescrever avatares mantendo acentos nos nomes\n")
    
    if len(sys.argv) > 1 and sys.argv[1] == '--confirm':
        confirm = 'sim'
    else:
        confirm = input("Continuar? (sim/não): ").strip().lower()
    
    if confirm != 'sim':
        print("❌ Cancelado")
        sys.exit(0)
    
    restore_with_accents()
