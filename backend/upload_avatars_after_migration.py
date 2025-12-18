#!/usr/bin/env python3
"""
FINAL UPLOAD: 18 agent avatars to Cloudinary after photo column migration.

Este script executa DEPOIS de:
1. Railway deploy com endpoint /debug/add-agent-photo-column
2. Execução bem-sucedida de POST /debug/add-agent-photo-column
3. Verificação que coluna 'photo' existe na tabela agents

Aguardar confirmação de sucesso da migração antes de rodar.
"""

import requests
from pathlib import Path

API_BASE = "https://crm-plus-production.up.railway.app"
AVATARS_DIR = Path(__file__).parent.parent / "frontend/web/public/avatars"

# Mapeamento ficheiro → (agent_id, agent_name)
AVATAR_FILES = {
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

def upload_avatar(filename, agent_id, agent_name):
    """Upload single avatar to Cloudinary."""
    filepath = AVATARS_DIR / filename
    
    if not filepath.exists():
        return {"success": False, "error": f"File not found: {filepath}"}
    
    url = f"{API_BASE}/agents/{agent_id}/upload-photo"
    
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (filename, f, 'image/png')}
            response = requests.post(url, files=files, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            return {
                "success": True,
                "photo_url": data.get("photo"),
                "message": data.get("message")
            }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "error": response.text[:200]
            }
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    print("=" * 70)
    print("📸 UPLOAD FINAL DE AVATARES - Após Migração Coluna Photo")
    print("=" * 70)
    print()
    
    success_count = 0
    fail_count = 0
    results = []
    
    for filename, (agent_id, agent_name) in AVATAR_FILES.items():
        print(f"📤 {agent_name} (ID: {agent_id})")
        print(f"   Ficheiro: {filename}")
        
        result = upload_avatar(filename, agent_id, agent_name)
        
        if result["success"]:
            print(f"   ✅ Sucesso!")
            print(f"   URL: {result['photo_url']}")
            success_count += 1
        else:
            print(f"   ❌ Erro: {result.get('error', 'Unknown error')}")
            if "status_code" in result:
                print(f"   HTTP {result['status_code']}")
            fail_count += 1
        
        results.append({
            "agent": agent_name,
            "id": agent_id,
            **result
        })
        print()
    
    print("=" * 70)
    print("📊 RESUMO FINAL")
    print("=" * 70)
    print(f"  ✅ Sucesso: {success_count}")
    print(f"  ❌ Falhas: {fail_count}")
    print(f"  📁 Total: {len(AVATAR_FILES)}")
    print()
    
    if success_count == len(AVATAR_FILES):
        print("🎉 TODOS OS AVATARES UPLOADED COM SUCESSO!")
        print()
        print("📋 PRÓXIMOS PASSOS:")
        print("  1. Verificar GET /agents/ retorna campo 'photo' com URLs Cloudinary")
        print("  2. Partilhar RELATORIO_AVATARES_AGENTES_FRONTEND.md com frontend team")
        print("  3. Frontend implementar dynamic loading (hardcoded → agent.photo)")
        print("  4. Testar SafeImage component com fallback")
        print("  5. Deploy frontend com alterações")
    else:
        print("⚠️  ALGUNS UPLOADS FALHARAM - Ver detalhes acima")
        print()
        print("Falhas:")
        for r in results:
            if not r["success"]:
                print(f"  - {r['agent']} (ID {r['id']}): {r.get('error', 'Unknown')}")
    
    print("=" * 70)

if __name__ == "__main__":
    main()
