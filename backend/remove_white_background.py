#!/usr/bin/env python3
"""
Remove fundo branco de avatares Ana Vindima (19.png) e Sara Ferreira (22.png).
Usa Pillow para converter pixels brancos em transparentes.
"""

from PIL import Image
import os
from pathlib import Path

AVATARS_DIR = Path(__file__).parent.parent / "frontend/web/public/avatars"

AVATARS_TO_PROCESS = [
    ("19.png", "Ana Vindima"),
    ("22.png", "Sara Ferreira"),
]

def remove_white_background(input_path: Path, output_path: Path, tolerance=30):
    """
    Remove fundo branco de uma imagem PNG.
    
    Args:
        input_path: Caminho da imagem original
        output_path: Caminho para salvar resultado
        tolerance: Tolerância para considerar pixel como branco (0-255)
    """
    print(f"📸 Processando: {input_path.name}")
    
    # Abrir imagem
    img = Image.open(input_path)
    
    # Converter para RGBA se necessário
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # Obter dados dos pixels
    datas = img.getdata()
    
    new_data = []
    pixels_changed = 0
    
    print(f"   🔄 Removendo fundo branco (tolerância: {tolerance})...")
    
    for item in datas:
        # Pixel branco ou quase branco -> transparente
        if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
            # Tornar completamente transparente
            new_data.append((255, 255, 255, 0))
            pixels_changed += 1
        else:
            # Manter pixel original
            new_data.append(item)
    
    # Atualizar imagem
    img.putdata(new_data)
    
    # Salvar
    img.save(output_path, 'PNG', optimize=True)
    
    # Stats
    total_pixels = len(datas)
    percentage = (pixels_changed / total_pixels) * 100
    
    print(f"   ✅ Salvo: {output_path.name}")
    print(f"   📊 {pixels_changed:,} pixels tornados transparentes ({percentage:.1f}%)")
    print(f"   💾 Tamanho: {output_path.stat().st_size / 1024:.1f}KB")
    
    return True

def main():
    print("=" * 70)
    print("🎨 REMOÇÃO DE FUNDO BRANCO - Uniformização de Avatares")
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
        backup_path = AVATARS_DIR / f"{filename}.backup"
        if not backup_path.exists():
            print(f"💾 Backup: {filename} → {filename}.backup")
            import shutil
            shutil.copy2(input_path, backup_path)
        
        try:
            remove_white_background(input_path, input_path, tolerance=30)
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
        print("💾 Backups salvos como *.backup")
        print()
        print("📋 PRÓXIMOS PASSOS:")
        print("  1. Verificar visualmente os avatares no site")
        print("  2. Se OK, deletar backups (.backup)")
        print("  3. Fazer commit das alterações")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
