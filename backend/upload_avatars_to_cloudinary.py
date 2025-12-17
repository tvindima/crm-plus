#!/usr/bin/env python3
"""
Upload avatares existentes em /frontend/web/public/avatars/ para Cloudinary
e atualiza campo 'photo' na tabela agents.

Mapeia nome do ficheiro → nome do agente na DB.
"""

import os
import sys
import requests
from pathlib import Path

# Config
API_BASE = "https://crm-plus-production.up.railway.app"
AVATARS_DIR = Path(__file__).parent.parent / "frontend/web/public/avatars"

# Mapeamento ficheiro → nome agente na DB
AVATAR_MAPPING = {
    "tiago-vindima.png": "Tiago Vindima",
    "nuno-faria.png": "Nuno Faria",
    "pedro-olaio.png": "Pedro Olaio",
    "joao-olaio.png": "João Olaio",
    "fabio-passos.png": "Fábio Passos",
    "antonio-silva.png": "António Silva",
    "hugo-belo.png": "Hugo Belo",
    "bruno-libanio.png": "Bruno Libânio",
    "nelson-neto.png": "Nélson Neto",
    "joao-paiva.png": "João Paiva",
    "marisa-barosa.png": "Marisa Barosa",
    "eduardo-coelho.png": "Eduardo Coelho",
    "joao-silva.png": "João Silva",
    "hugo-mota.png": "Hugo Mota",
    "joao-pereira.png": "João Pereira",
    "joao-carvalho.png": "João Carvalho",
    "mickael-soares.png": "Mickael Soares",
    "paulo-rodrigues.png": "Paulo Rodrigues",
}

def get_auth_token():
    """Obter token via argumento ou variável de ambiente"""
    
    # Opção 1: Via argumento
    if len(sys.argv) > 1:
        token = sys.argv[1]
        print(f"✅ Token fornecido via argumento: {token[:20]}...")
        return token
    
    # Opção 2: Via ENV
    token = os.getenv("AUTH_TOKEN")
    if token:
        print(f"✅ Token encontrado em ENV: {token[:20]}...")
        return token
    
    # Opção 3: Pedir ao usuário
    print()
    print("=" * 70)
    print("⚠️  TOKEN NECESSÁRIO")
    print("=" * 70)
    print()
    print("Para obter token:")
    print("1. Fazer login no backoffice: https://crm-plus-backoffice.vercel.app")
    print("2. Abrir DevTools (F12) → Application → Local Storage")
    print("3. Copiar valor de 'access_token'")
    print()
    print("Ou executar:")
    print("  python upload_avatars_to_cloudinary.py <TOKEN>")
    print("  AUTH_TOKEN=<token> python upload_avatars_to_cloudinary.py")
    print()
    
    return None


def get_agents():
    """Buscar todos os agentes"""
    print("\n📊 Buscando agentes...")
    
    response = requests.get(f"{API_BASE}/agents/")
    if response.status_code == 200:
        agents = response.json()
        print(f"✅ {len(agents)} agentes encontrados")
        return {a['name']: a for a in agents}
    else:
        print(f"❌ Erro ao buscar agentes: {response.status_code}")
        return {}


def upload_avatar(agent_id: int, avatar_path: Path, token: str):
    """Upload avatar para agente específico"""
    
    if not avatar_path.exists():
        print(f"  ⚠️  Ficheiro não existe: {avatar_path}")
        return False
    
    print(f"  📤 Uploading {avatar_path.name}...")
    
    with open(avatar_path, 'rb') as f:
        files = {'file': (avatar_path.name, f, 'image/png')}
        headers = {'Authorization': f'Bearer {token}'}
        
        response = requests.post(
            f"{API_BASE}/agents/{agent_id}/upload-photo",
            files=files,
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            url = data.get('photo')
            print(f"  ✅ Upload OK! URL: {url[:60]}...")
            return True
        else:
            print(f"  ❌ Erro: {response.status_code} - {response.text[:100]}")
            return False


def main():
    print("=" * 70)
    print("📸 UPLOAD DE AVATARES PARA CLOUDINARY")
    print("=" * 70)
    print()
    
    # 1. Login
    token = get_auth_token()
    if not token:
        print("\n❌ Não foi possível fazer login. Verifica credenciais.")
        return
    
    # 2. Buscar agentes
    agents_by_name = get_agents()
    if not agents_by_name:
        print("\n❌ Nenhum agente encontrado.")
        return
    
    # 3. Upload de cada avatar
    print(f"\n📤 UPLOADING {len(AVATAR_MAPPING)} AVATARES")
    print("-" * 70)
    
    success_count = 0
    fail_count = 0
    
    for filename, agent_name in AVATAR_MAPPING.items():
        print(f"\n{agent_name}:")
        
        if agent_name not in agents_by_name:
            print(f"  ⚠️  Agente não encontrado na DB!")
            fail_count += 1
            continue
        
        agent = agents_by_name[agent_name]
        agent_id = agent['id']
        avatar_path = AVATARS_DIR / filename
        
        if upload_avatar(agent_id, avatar_path, token):
            success_count += 1
        else:
            fail_count += 1
    
    # 4. Resumo
    print()
    print("=" * 70)
    print("📊 RESUMO")
    print("=" * 70)
    print(f"  ✅ Sucesso: {success_count}")
    print(f"  ❌ Falhas: {fail_count}")
    print(f"  📁 Total: {len(AVATAR_MAPPING)}")
    print()
    
    if success_count > 0:
        print("🎉 Avatares uploaded para Cloudinary!")
        print("   Verifica em: https://imoveismais-site.vercel.app")
        print()


if __name__ == "__main__":
    if not AVATARS_DIR.exists():
        print(f"❌ Pasta de avatares não encontrada: {AVATARS_DIR}")
        sys.exit(1)
    
    print(f"📁 Avatares em: {AVATARS_DIR}")
    print(f"📂 Ficheiros encontrados: {len(list(AVATARS_DIR.glob('*.png')))}")
    print()
    
    main()
