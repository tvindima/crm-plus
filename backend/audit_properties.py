#!/usr/bin/env python3
"""
Auditoria completa de imóveis para montra imobiliária.
Verifica: visibilidade, imagens, associação agente, responsabilidade.
"""
import json
import sys
from collections import defaultdict
import requests

API_BASE = "http://localhost:8000"

def fetch_data():
    """Fetch properties and agents from API."""
    try:
        props_resp = requests.get(f"{API_BASE}/properties/", timeout=10)
        agents_resp = requests.get(f"{API_BASE}/agents/", timeout=10)
        
        if props_resp.status_code != 200:
            print(f"❌ Erro ao buscar properties: {props_resp.status_code}")
            return [], []
        
        if agents_resp.status_code != 200:
            print(f"❌ Erro ao buscar agents: {agents_resp.status_code}")
            return [], []
        
        return props_resp.json(), agents_resp.json()
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return [], []

def get_agent_initials(agent_name):
    """Get initials from agent name."""
    if not agent_name:
        return ""
    parts = agent_name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    elif len(parts) == 1:
        return parts[0][:2].upper()
    return ""

def audit_properties(properties, agents):
    """Generate complete audit report."""
    
    # Create agent lookup by ID
    agent_by_id = {a['id']: a for a in agents}
    
    # Stats
    total = len(properties)
    visible = 0
    with_images = 0
    correct_id_format = 0
    correct_agent_association = 0
    
    # Issues tracking
    issues = defaultdict(list)
    
    print("\n" + "="*80)
    print("📋 RELATÓRIO DE AUDITORIA - MONTRA IMOBILIÁRIA")
    print("="*80)
    print(f"\n📊 TOTAL DE IMÓVEIS: {total}")
    print(f"👥 TOTAL DE AGENTES: {len(agents)}\n")
    
    # Group by agent
    by_agent = defaultdict(list)
    for prop in properties:
        agent_id = prop.get('agent_id')
        by_agent[agent_id].append(prop)
    
    # Analyze each property
    for agent_id, props in sorted(by_agent.items()):
        agent = agent_by_id.get(agent_id)
        agent_name = agent['name'] if agent else "SEM AGENTE"
        agent_initials = get_agent_initials(agent_name) if agent else "XX"
        
        print(f"\n{'─'*80}")
        print(f"👤 AGENTE: {agent_name} ({agent_initials})")
        print(f"   Total de imóveis: {len(props)}")
        print(f"{'─'*80}\n")
        
        for prop in props:
            ref = prop.get('reference', 'N/A')
            prop_id = prop.get('id', 'N/A')
            title = prop.get('title', 'Sem título')[:50]
            images = prop.get('images') or []
            
            # Check visibility (assume visible if has reference and title)
            is_visible = bool(ref and title)
            visible += 1 if is_visible else 0
            
            # Check images
            has_images = len(images) > 0 if isinstance(images, list) else bool(images)
            with_images += 1 if has_images else 0
            
            # Check ID format (should start with agent initials)
            ref_initials = ref[:2].upper() if ref and len(ref) >= 2 else "??"
            id_correct = ref_initials == agent_initials
            correct_id_format += 1 if id_correct else 0
            
            # Check agent association
            agent_correct = agent_id is not None
            correct_agent_association += 1 if agent_correct else 0
            
            # Status indicators
            status_visibility = "✅" if is_visible else "❌"
            status_images = "✅" if has_images else "⚠️ "
            status_id = "✅" if id_correct else "❌"
            status_agent = "✅" if agent_correct else "❌"
            
            # Overall status
            if is_visible and has_images and id_correct and agent_correct:
                overall = "✅ OK"
            elif not is_visible:
                overall = "❌ NÃO VISÍVEL"
                issues['invisivel'].append(f"{ref} - {agent_name}")
            elif not has_images:
                overall = "⚠️  SEM IMAGEM"
                issues['sem_imagem'].append(f"{ref} - {agent_name}")
            elif not id_correct:
                overall = "❌ ID ERRADO"
                issues['id_errado'].append(f"{ref} - esperado {agent_initials}XX, atual {ref}")
            elif not agent_correct:
                overall = "❌ SEM AGENTE"
                issues['sem_agente'].append(f"{ref}")
            else:
                overall = "⚠️  REVISAR"
            
            print(f"  {overall:15} | {ref:12} | {status_visibility} Vis | {status_images} Img | {status_id} ID | {status_agent} Agente")
            print(f"                    └─ {title}")
            
            # Detailed issues
            if not is_visible:
                print(f"                       ⚠️  Problema: Não aparece na montra (título ou ref em falta)")
            if not has_images:
                print(f"                       ⚠️  Problema: Sem imagens (precisa placeholder ou fotos)")
            if not id_correct:
                print(f"                       ⚠️  Problema: ID {ref} não começa com {agent_initials} (agente {agent_name})")
            if not agent_correct:
                print(f"                       ⚠️  Problema: Não associado a nenhum agente")
    
    # Summary
    print(f"\n{'='*80}")
    print("📊 RESUMO GERAL")
    print(f"{'='*80}\n")
    
    print(f"✅ Visibilidade:          {visible}/{total} ({100*visible//total if total else 0}%)")
    print(f"✅ Com Imagens:           {with_images}/{total} ({100*with_images//total if total else 0}%)")
    print(f"✅ ID Formato Correto:    {correct_id_format}/{total} ({100*correct_id_format//total if total else 0}%)")
    print(f"✅ Agente Associado:      {correct_agent_association}/{total} ({100*correct_agent_association//total if total else 0}%)")
    
    # Issues summary
    print(f"\n{'─'*80}")
    print("🔍 PROBLEMAS IDENTIFICADOS")
    print(f"{'─'*80}\n")
    
    if issues['invisivel']:
        print(f"❌ Imóveis não visíveis ({len(issues['invisivel'])}):")
        for item in issues['invisivel'][:10]:
            print(f"   - {item}")
        if len(issues['invisivel']) > 10:
            print(f"   ... e mais {len(issues['invisivel'])-10}")
    
    if issues['sem_imagem']:
        print(f"\n⚠️  Imóveis sem imagem ({len(issues['sem_imagem'])}):")
        for item in issues['sem_imagem'][:10]:
            print(f"   - {item}")
        if len(issues['sem_imagem']) > 10:
            print(f"   ... e mais {len(issues['sem_imagem'])-10}")
    
    if issues['id_errado']:
        print(f"\n❌ IDs com formato errado ({len(issues['id_errado'])}):")
        for item in issues['id_errado'][:10]:
            print(f"   - {item}")
        if len(issues['id_errado']) > 10:
            print(f"   ... e mais {len(issues['id_errado'])-10}")
    
    if issues['sem_agente']:
        print(f"\n❌ Imóveis sem agente associado ({len(issues['sem_agente'])}):")
        for item in issues['sem_agente'][:10]:
            print(f"   - {item}")
        if len(issues['sem_agente']) > 10:
            print(f"   ... e mais {len(issues['sem_agente'])-10}")
    
    if not any(issues.values()):
        print("✅ Nenhum problema crítico identificado!")
    
    print(f"\n{'='*80}")
    print("✅ Auditoria completa!")
    print(f"{'='*80}\n")

def main():
    print("🔍 Iniciando auditoria de imóveis...")
    properties, agents = fetch_data()
    
    if not properties:
        print("❌ Não foi possível obter dados dos imóveis.")
        print("   Verifique se o backend está a correr em http://localhost:8000")
        sys.exit(1)
    
    audit_properties(properties, agents)

if __name__ == "__main__":
    main()
