#!/usr/bin/env python3
"""
Script para associar propriedades aos agentes corretos
Lê o CSV de propriedades e atualiza o agent_id baseado no nome do agente
"""
import csv
import os
import requests
from pathlib import Path

# URL da API Railway
API_BASE = "https://crm-plus-production.up.railway.app"

def get_all_agents():
    """Buscar todos os agentes e criar mapeamento nome -> ID"""
    try:
        response = requests.get(f"{API_BASE}/agents/?limit=50", timeout=10)
        response.raise_for_status()
        agents = response.json()
        
        # Criar dicionário: nome -> id
        agent_map = {agent['name']: agent['id'] for agent in agents}
        
        print(f"✅ {len(agent_map)} agentes carregados da API")
        return agent_map
    except Exception as e:
        print(f"❌ Erro ao buscar agentes: {e}")
        return {}

def get_all_properties():
    """Buscar todas as propriedades"""
    try:
        properties = []
        skip = 0
        limit = 100
        
        while True:
            response = requests.get(
                f"{API_BASE}/properties/?skip={skip}&limit={limit}",
                timeout=10
            )
            response.raise_for_status()
            batch = response.json()
            
            if not batch:
                break
            
            properties.extend(batch)
            skip += limit
            
            if len(batch) < limit:
                break
        
        print(f"✅ {len(properties)} propriedades carregadas da API")
        return properties
    except Exception as e:
        print(f"❌ Erro ao buscar propriedades: {e}")
        return []

def update_property_agent(property_id, agent_id, reference):
    """Atualizar agent_id de uma propriedade"""
    try:
        response = requests.put(
            f"{API_BASE}/properties/{property_id}",
            json={"agent_id": agent_id},
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.ok:
            return True
        else:
            print(f"   ⚠️  Erro {response.status_code} para {reference}: {response.text[:100]}")
            return False
    except Exception as e:
        print(f"   ❌ Exceção ao atualizar {reference}: {e}")
        return False

def main():
    print("=" * 70)
    print("🔧 Associando propriedades aos agentes corretos")
    print("=" * 70)
    print()
    
    # 1. Buscar agentes da API
    print("📋 Passo 1: Buscar agentes da API...")
    agent_map = get_all_agents()
    if not agent_map:
        print("❌ Sem agentes para processar. Abortando.")
        return
    
    print(f"\n📊 Agentes disponíveis:")
    for name, agent_id in sorted(agent_map.items()):
        print(f"   {agent_id:3} - {name}")
    
    # 2. Buscar propriedades da API
    print("\n📋 Passo 2: Buscar propriedades da API...")
    api_properties = get_all_properties()
    if not api_properties:
        print("❌ Sem propriedades para processar. Abortando.")
        return
    
    # Criar mapa de referência -> property
    property_map = {p['reference']: p for p in api_properties if p.get('reference')}
    
    # 3. Ler CSV
    print("\n📋 Passo 3: Ler CSV de propriedades...")
    csv_path = Path(__file__).parent / "scripts" / "propriedades.csv"
    
    if not csv_path.exists():
        print(f"❌ CSV não encontrado: {csv_path}")
        return
    
    csv_assignments = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f, delimiter=';')
        next(reader)  # Skip header
        
        for row in reader:
            if len(row) < 13:
                continue
            
            reference = row[0].strip()
            agent_name = row[12].strip()
            
            csv_assignments.append({
                'reference': reference,
                'agent_name': agent_name
            })
    
    print(f"✅ {len(csv_assignments)} atribuições lidas do CSV")
    
    # 4. Processar atualizações
    print("\n📋 Passo 4: Atualizar propriedades...")
    print()
    
    updated = 0
    skipped = 0
    errors = 0
    not_found_props = []
    not_found_agents = set()
    
    for assignment in csv_assignments:
        reference = assignment['reference']
        agent_name = assignment['agent_name']
        
        # Verificar se propriedade existe na API
        if reference not in property_map:
            not_found_props.append(reference)
            continue
        
        # Verificar se agente existe
        if agent_name not in agent_map:
            not_found_agents.add(agent_name)
            skipped += 1
            continue
        
        property_data = property_map[reference]
        current_agent_id = property_data.get('agent_id')
        correct_agent_id = agent_map[agent_name]
        
        # Se já está correto, skip
        if current_agent_id == correct_agent_id:
            skipped += 1
            continue
        
        # Atualizar
        print(f"🔄 {reference}: {agent_name} (ID {correct_agent_id})")
        if update_property_agent(property_data['id'], correct_agent_id, reference):
            updated += 1
        else:
            errors += 1
    
    # 5. Relatório final
    print()
    print("=" * 70)
    print("📊 RELATÓRIO FINAL")
    print("=" * 70)
    print(f"✅ Atualizadas:  {updated} propriedades")
    print(f"⏭️  Skipped:     {skipped} propriedades (já corretas)")
    print(f"❌ Erros:        {errors} propriedades")
    
    if not_found_props:
        print(f"\n⚠️  Propriedades não encontradas na API ({len(not_found_props)}):")
        for ref in not_found_props[:10]:
            print(f"   - {ref}")
        if len(not_found_props) > 10:
            print(f"   ... e mais {len(not_found_props) - 10}")
    
    if not_found_agents:
        print(f"\n⚠️  Agentes não encontrados ({len(not_found_agents)}):")
        for name in sorted(not_found_agents):
            print(f"   - {name}")
    
    print()
    print("=" * 70)

if __name__ == "__main__":
    main()
