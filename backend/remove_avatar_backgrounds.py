#!/usr/bin/env python3
"""
Remove background de avatares Ana Vindima (19.png) e Sara Ferreira (22.png).
Uniformizar visualmente todos os avatares da equipa.
"""

from pathlib import Path
from rembg import remove
from PIL import Image
import io

AVATARS_DIR = Path(__file__).parent.parent / "frontend/web/public/avatars"

# Avatares para processar
AVATARS_TO_PROCESS = [
    ("19.png", "Ana Vindima"),
    ("22.png", "Sara Ferreira"),
]

def remove_background(input_path: Path, output_path: Path):
    """Remove background de uma imagem e salva com fundo transparente."""
    print(f"📸 Processando: {input_path.name}")
    
    # Abrir imagem original
    with open(input_path, 'rb') as f:
        input_data = f.read()
    
    # Remover fundo
    print(f"   🔄 Removendo fundo...")
    output_data = remove(input_data)
    
    # Abrir como PIL Image
    img = Image.open(io.BytesIO(output_data))
    
    # Garantir que é RGBA
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Salvar
    img.save(output_path, 'PNG', optimize=True)
    
    # Stats
    original_size = len(input_data) / 1024
    new_size = output_path.stat().st_size / 1024
    
    print(f"   ✅ Salvo: {output_path.name}")
    print(f"   📊 {original_size:.1f}KB → {new_size:.1f}KB")
    
    return True

def main():
    print("=" * 70)
    print("🎨 REMOÇÃO DE FUNDO - Uniformização de Avatares")
    print("=" * 70)
    print()
    
    success_count = 0
    fail_count = 0
    
    for filename, name in AVATARS_TO_PROCESS:
        input_path = AVATARS_DIR / filename
        
        if not input_path.exists():
            print(f"❌ {name}: Ficheiro não encontrado - {input_path}")
            fail_count += 1
            continue
        
        # Backup original
        backup_path = AVATARS_DIR / f"{filename}.original"
        if not backup_path.exists():
            print(f"💾 Backup: {filename} → {filename}.original")
            import shutil
            shutil.copy2(input_path, backup_path)
        
        try:
            remove_background(input_path, input_path)
            success_count += 1
            print()
        except Exception as e:
            print(f"❌ Erro ao processar {name}: {e}")
            fail_count += 1
            print()
    
    print("=" * 70)
    print("📊 RESUMO")
    print("=" * 70)
    print(f"  ✅ Processados: {success_count}")
    print(f"  ❌ Erros: {fail_count}")
    print(f"  📁 Total: {len(AVATARS_TO_PROCESS)}")
    print()
    
    if success_count > 0:
        print("✨ Avatares uniformizados com fundo transparente!")
        print("💾 Backups salvos como *.original")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
