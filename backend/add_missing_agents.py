#!/usr/bin/env python3
"""
Script para adicionar agentes em falta à base de dados Railway
"""
import os
import requests

# URL da API Railway
API_BASE = "https://crm-plus-production.up.railway.app"

# Agentes em falta (do CSV que não estão na BD)
missing_agents = [
    {
        "name": "Nuno Faria",
        "email": "nfaria@imoveismais.pt",
        "phone": "914039335"
    },
    {
        "name": "Pedro Olaio",
        "email": "polaio@imoveismais.pt",
        "phone": "915213221"
    },
    {
        "name": "João Olaio",
        "email": "jolaio@imoveismais.pt",
        "phone": "912332330"
    },
    {
        "name": "Fábio Passos",
        "email": "fpassos@imoveismais.pt",
        "phone": "927799119"
    }
]

def add_agent(agent_data):
    """Adiciona um agente via API"""
    try:
        response = requests.post(
            f"{API_BASE}/agents/",
            json=agent_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 201:
            print(f"✅ {agent_data['name']} adicionado com sucesso!")
            return True
        elif response.status_code == 400 and "already exists" in response.text.lower():
            print(f"⚠️  {agent_data['name']} já existe na base de dados")
            return True
        else:
            print(f"❌ Erro ao adicionar {agent_data['name']}: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Exceção ao adicionar {agent_data['name']}: {e}")
        return False

def main():
    print("=" * 60)
    print("🔧 Adicionando agentes em falta à base de dados Railway")
    print("=" * 60)
    print()
    
    success_count = 0
    
    for agent in missing_agents:
        print(f"Processando: {agent['name']} ({agent['email']})...")
        if add_agent(agent):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"✅ Concluído! {success_count}/{len(missing_agents)} agentes processados")
    print("=" * 60)
    
    # Verificar total de agentes agora
    try:
        response = requests.get(f"{API_BASE}/agents/?limit=50", timeout=10)
        if response.ok:
            agents = response.json()
            print(f"\n📊 Total de agentes na base de dados: {len(agents)}")
            print("   (Esperado: 19 agentes + 1 agência = 20 total)")
    except Exception as e:
        print(f"\n❌ Erro ao verificar total: {e}")

if __name__ == "__main__":
    main()
