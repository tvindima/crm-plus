#!/usr/bin/env python3
"""
Script para corrigir agent_id baseado nos agentes REAIS do sistema.
"""
import os
import psycopg2

DATABASE_URL = 'postgresql://postgres:UrAXdgrmLTZhYpHvtIqCtkZLQQWjWTri@junction.proxy.rlwy.net:55713/railway'

# Mapeamento CORRETO baseado nos agentes REAIS
# Baseado em: curl /agents/ 
AGENT_INITIALS_MAP = {
    "NF": 20,  # Nuno Faria
    "PO": 21,  # Pedro Olaio
    "JO": 22,  # João Olaio
    "FP": 23,  # Fábio Passos
    "AS": 24,  # António Silva
    "HB": 25,  # Hugo Belo
    "BL": 26,  # Bruno Libânio
    "NN": 27,  # Nélson Neto
    "JP": 28,  # João Paiva (será o principal JP, há conflito com João Pereira id=33)
    "MB": 29,  # Marisa Barosa
    "EC": 30,  # Eduardo Coelho
    "JS": 31,  # João Silva
    "HM": 32,  # Hugo Mota
    # "JP": 33,  # João Pereira - CONFLITO com João Paiva! Comentado
    "JC": 34,  # João Carvalho
    "TV": 35,  # Tiago Vindima
    "MS": 36,  # Mickael Soares
    "PR": 37,  # Paulo Rodrigues
    "IM": 38,  # Imóveis Mais Leiria
}

def fix_agent_ids():
    """Reverte correções erradas e aplica o mapeamento correto."""
    
    try:
        print("🔌 Conectando ao PostgreSQL...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🚀 Corrigindo agent_id com mapeamento CORRETO...\n")
        
        # Get all properties
        cur.execute("SELECT id, reference, agent_id FROM properties")
        properties = cur.fetchall()
        
        print(f"📊 Total de propriedades: {len(properties)}\n")
        
        # Statistics
        stats_by_initials = {}
        updated_count = 0
        skipped_count = 0
        wrong_agent_ids = []
        
        # Process each property
        updates_to_apply = []
        
        for prop_id, reference, current_agent_id in properties:
            if not reference or len(reference) < 2:
                skipped_count += 1
                continue
            
            initials = reference[:2].upper()
            
            if initials not in AGENT_INITIALS_MAP:
                # Iniciais desconhecidas
                if current_agent_id and current_agent_id not in [20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38]:
                    # Agent ID inválido!
                    wrong_agent_ids.append({
                        'reference': reference,
                        'initials': initials,
                        'wrong_agent_id': current_agent_id
                    })
                skipped_count += 1
                continue
            
            correct_agent_id = AGENT_INITIALS_MAP[initials]
            
            # Track statistics
            if initials not in stats_by_initials:
                stats_by_initials[initials] = {
                    'total': 0,
                    'correct': 0,
                    'updated': 0
                }
            
            stats_by_initials[initials]['total'] += 1
            
            if current_agent_id == correct_agent_id:
                stats_by_initials[initials]['correct'] += 1
            else:
                updates_to_apply.append({
                    'id': prop_id,
                    'reference': reference,
                    'old_agent_id': current_agent_id,
                    'new_agent_id': correct_agent_id,
                    'initials': initials
                })
                stats_by_initials[initials]['updated'] += 1
                updated_count += 1
        
        # Show properties with wrong agent_id (IDs that don't exist)
        if wrong_agent_ids:
            print("⚠️  Propriedades com agent_id INVÁLIDO (não existe no sistema):")
            for item in wrong_agent_ids[:10]:
                print(f"  • {item['reference']} ({item['initials']}): agent_id={item['wrong_agent_id']} (INVÁLIDO)")
            if len(wrong_agent_ids) > 10:
                print(f"  ... e mais {len(wrong_agent_ids) - 10}")
            print()
        
        # Show what will be updated
        if updates_to_apply:
            print(f"🔄 {len(updates_to_apply)} propriedades precisam de correção:\n")
            for update in updates_to_apply[:15]:
                print(f"  • {update['reference']} ({update['initials']}): agent_id {update['old_agent_id']} → {update['new_agent_id']}")
            if len(updates_to_apply) > 15:
                print(f"  ... e mais {len(updates_to_apply) - 15} propriedades")
            print()
            
            # Apply updates
            for update in updates_to_apply:
                cur.execute(
                    "UPDATE properties SET agent_id = %s WHERE id = %s",
                    (update['new_agent_id'], update['id'])
                )
            
            conn.commit()
            print("✅ Correções aplicadas com sucesso!\n")
        else:
            print("✅ Nenhuma correção necessária!\n")
        
        # Show statistics
        print("📊 Estatísticas por iniciais:")
        print("-" * 70)
        for initials in sorted(stats_by_initials.keys()):
            stats = stats_by_initials[initials]
            agent_id = AGENT_INITIALS_MAP[initials]
            print(f"{initials} (agent_id={agent_id}): {stats['total']} total | {stats['correct']} corretos | {stats['updated']} atualizados")
        
        print("-" * 70)
        print(f"\n✨ Resumo:")
        print(f"  • Total processadas: {len(properties)}")
        print(f"  • Atualizadas: {updated_count}")
        print(f"  • Já corretas: {len(properties) - updated_count - skipped_count}")
        print(f"  • Ignoradas (iniciais desconhecidas): {skipped_count}")
        print(f"  • Com agent_id INVÁLIDO: {len(wrong_agent_ids)}")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        raise

if __name__ == "__main__":
    fix_agent_ids()
