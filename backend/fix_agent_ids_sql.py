#!/usr/bin/env python3
"""
Script para corrigir agent_id de propriedades baseado nas iniciais da referência.
Usa raw SQL para evitar problemas de import de models.
"""
import os
import psycopg2

# PostgreSQL connection
DATABASE_URL = 'postgresql://postgres:UrAXdgrmLTZhYpHvtIqCtkZLQQWjWTri@junction.proxy.rlwy.net:55713/railway'

# Mapeamento de iniciais → agent_id (baseado no backend real)
AGENT_INITIALS_MAP = {
    "TV": 35,  # Tiago Vindima
    "MB": 29,  # Marisa Barosa
    "NN": 27,  # Neuza Nogueira
    "VC": 31,  # Vitor Castro
    "SN": 33,  # Sónia Neves
    "LM": 25,  # Leonor Marques
    "PS": 23,  # Paulo Silva
    "CF": 21,  # Carlos Fernandes
    "AR": 19,  # Ana Ribeiro
    "MS": 17,  # Miguel Santos
    "JP": 24,  # João Pereira
    "IF": 22,  # Inês Ferreira
    "RC": 20,  # Rita Costa
    "DP": 18,  # David Pinto
    "BA": 26,  # Beatriz Almeida
    "FR": 28,  # Fernando Rocha
    "SM": 30,  # Sandra Martins
    "GM": 32,  # Gonçalo Monteiro
}

def fix_agent_ids():
    """Corrige agent_id de todas as propriedades baseado nas iniciais da referência."""
    
    try:
        # Connect to PostgreSQL
        print("🔌 Conectando ao PostgreSQL...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("🚀 Iniciando correção de agent_id baseado em iniciais da referência...\n")
        
        # Get all properties
        cur.execute("SELECT id, reference, agent_id FROM properties")
        properties = cur.fetchall()
        
        print(f"📊 Total de propriedades: {len(properties)}\n")
        
        # Statistics
        stats_by_initials = {}
        updated_count = 0
        skipped_count = 0
        
        # Process each property
        updates_to_apply = []
        
        for prop_id, reference, current_agent_id in properties:
            if not reference or len(reference) < 2:
                skipped_count += 1
                continue
            
            # Extract initials (first 2 chars of reference)
            initials = reference[:2].upper()
            
            if initials not in AGENT_INITIALS_MAP:
                # Unknown initials, skip
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
                # Already correct
                stats_by_initials[initials]['correct'] += 1
            else:
                # Need to update
                updates_to_apply.append({
                    'id': prop_id,
                    'reference': reference,
                    'old_agent_id': current_agent_id,
                    'new_agent_id': correct_agent_id,
                    'initials': initials
                })
                stats_by_initials[initials]['updated'] += 1
                updated_count += 1
        
        # Show what will be updated
        if updates_to_apply:
            print(f"🔄 {len(updates_to_apply)} propriedades precisam de correção:\n")
            for update in updates_to_apply[:10]:  # Show first 10
                print(f"  • {update['reference']} ({update['initials']}): agent_id {update['old_agent_id']} → {update['new_agent_id']}")
            if len(updates_to_apply) > 10:
                print(f"  ... e mais {len(updates_to_apply) - 10} propriedades")
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
            print("✅ Nenhuma correção necessária - todos os agent_id estão corretos!\n")
        
        # Show statistics by initials
        print("📊 Estatísticas por iniciais:")
        print("-" * 60)
        for initials in sorted(stats_by_initials.keys()):
            stats = stats_by_initials[initials]
            agent_id = AGENT_INITIALS_MAP[initials]
            print(f"{initials} (agent_id={agent_id}): {stats['total']} total | {stats['correct']} já corretos | {stats['updated']} atualizados")
        
        print("-" * 60)
        print(f"\n✨ Resumo:")
        print(f"  • Total de propriedades processadas: {len(properties)}")
        print(f"  • Propriedades atualizadas: {updated_count}")
        print(f"  • Propriedades já corretas: {len(properties) - updated_count - skipped_count}")
        print(f"  • Propriedades ignoradas: {skipped_count}")
        
        # Close connection
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro durante a correção: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        raise

if __name__ == "__main__":
    fix_agent_ids()
