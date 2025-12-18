#!/usr/bin/env python3
"""Upload dos avatares restantes com IDs corretos."""

import requests
from pathlib import Path

API_BASE = "https://crm-plus-production.up.railway.app"
AVATARS_DIR = Path(__file__).parent.parent / "frontend/web/public/avatars"

# IDs corretos dos agentes que faltam
REMAINING_AVATARS = {
    "nuno-faria.png": (39, "Nuno Faria"),
    "pedro-olaio.png": (40, "Pedro Olaio"),
    "joao-olaio.png": (41, "João Olaio"),
    "fabio-passos.png": (42, "Fábio Passos"),
}

# Avatares numéricos (staff não-agente)
NUMERIC_AVATARS = {
    "19.png": (19, "Ana Vindima (Staff)"),
    "20.png": (20, "Maria Olaio (Staff)"),
    "21.png": (21, "Andreia Borges (Staff)"),
    "22.png": (22, "Sara Ferreira (Staff)"),
    "23.png": (23, "António Vieira (Staff)"),
}

def upload_avatar(filename, agent_id, agent_name):
    """Upload single avatar."""
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
    print("📸 UPLOAD AVATARES RESTANTES")
    print("=" * 70)
    print()
    
    # Agentes principais
    print("🔹 AGENTES PRINCIPAIS (4 restantes)")
    print("-" * 70)
    success_main = 0
    fail_main = 0
    
    for filename, (agent_id, agent_name) in REMAINING_AVATARS.items():
        print(f"📤 {agent_name} (ID: {agent_id})")
        result = upload_avatar(filename, agent_id, agent_name)
        
        if result["success"]:
            print(f"   ✅ {result['photo_url']}")
            success_main += 1
        else:
            print(f"   ❌ {result.get('error', 'Unknown')}")
            fail_main += 1
        print()
    
    # Staff numéricos (se existirem IDs na DB)
    print()
    print("🔹 STAFF (avatares numéricos - se existirem na DB)")
    print("-" * 70)
    success_staff = 0
    fail_staff = 0
    
    for filename, (agent_id, agent_name) in NUMERIC_AVATARS.items():
        print(f"📤 {agent_name} (ID: {agent_id})")
        result = upload_avatar(filename, agent_id, agent_name)
        
        if result["success"]:
            print(f"   ✅ {result['photo_url']}")
            success_staff += 1
        else:
            print(f"   ❌ {result.get('error', 'Unknown')}")
            fail_staff += 1
        print()
    
    print("=" * 70)
    print("📊 RESUMO")
    print("=" * 70)
    print(f"  Agentes: {success_main}✅ / {fail_main}❌")
    print(f"  Staff:   {success_staff}✅ / {fail_staff}❌")
    print(f"  TOTAL:   {success_main + success_staff}✅ / {fail_main + fail_staff}❌")
    print("=" * 70)

if __name__ == "__main__":
    main()
