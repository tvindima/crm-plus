#!/usr/bin/env python3
"""Upload avatares locais para Cloudinary via API"""
import requests
from pathlib import Path

API_BASE = "https://crm-plus-production.up.railway.app"
AVATARS_DIR = Path(__file__).parent.parent / "frontend/web/public/avatars"

# Mapeamento: filename -> (agent_id, agent_name)
MAPPING = {
    "tiago-vindima.png": (35, "Tiago Vindima"),
    "nuno-faria.png": (20, "Nuno Faria"),
    "pedro-olaio.png": (21, "Pedro Olaio"),
    "joao-olaio.png": (22, "João Olaio"),
    "fabio-passos.png": (23, "Fábio Passos"),
    "antonio-silva.png": (24, "António Silva"),
    "hugo-belo.png": (25, "Hugo Belo"),
    "bruno-libanio.png": (26, "Bruno Libânio"),
    "nelson-neto.png": (27, "Nélson Neto"),
    "joao-paiva.png": (28, "João Paiva"),
    "marisa-barosa.png": (29, "Marisa Barosa"),
    "eduardo-coelho.png": (30, "Eduardo Coelho"),
    "joao-silva.png": (31, "João Silva"),
    "hugo-mota.png": (32, "Hugo Mota"),
    "joao-pereira.png": (33, "João Pereira"),
    "joao-carvalho.png": (34, "João Carvalho"),
    "mickael-soares.png": (36, "Mickael Soares"),
    "paulo-rodrigues.png": (37, "Paulo Rodrigues"),
}

print("=" * 70)
print("📸 UPLOAD DE AVATARES PARA CLOUDINARY")
print("=" * 70)
print()

success = 0
failed = 0

for filename, (agent_id, agent_name) in MAPPING.items():
    filepath = AVATARS_DIR / filename
    
    print(f"📤 {agent_name} (ID: {agent_id})")
    print(f"   Ficheiro: {filename}")
    
    if not filepath.exists():
        print(f"   ❌ Ficheiro não encontrado: {filepath}")
        failed += 1
        continue
    
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (filename, f, 'image/png')}
            response = requests.post(
                f"{API_BASE}/agents/{agent_id}/upload-photo",
                files=files,
                timeout=30
            )
        
        if response.status_code == 200:
            data = response.json()
            url = data.get('photo', '')
            print(f"   ✅ Upload OK! URL: {url[:60]}...")
            success += 1
        else:
            print(f"   ❌ Erro HTTP {response.status_code}")
            print(f"   Response: {response.text[:100]}")
            failed += 1
    
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")
        failed += 1
    
    print()

print("=" * 70)
print("📊 RESUMO")
print("=" * 70)
print(f"  ✅ Sucesso: {success}")
print(f"  ❌ Falhas: {failed}")
print(f"  📁 Total: {success + failed}")
print()

if success > 0:
    print("🎉 Avatares uploaded para Cloudinary!")
    print(f"   Verifica: {API_BASE}/agents/")
    print("   Site: https://imoveismais-site.vercel.app")
