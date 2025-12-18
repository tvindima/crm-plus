#!/usr/bin/env python3
"""
Sincronizar banco de dados com LISTA VERDADE ABSOLUTA
Fonte: LISTA VERDADSE ABSOLUTA DE PROPRIEDADES .csv
"""
import csv
from sqlalchemy import create_engine, text

# Mapeamento angariador → agent_id (IDs corretos do Railway)
ANGARIADOR_TO_AGENT_ID = {
    "António Silva": 24,
    "Beatriz Silva": 25,
    "Bruno Libânio": 26,
    "Nélson Neto": 27,
    "João Paiva": 28,
    "Eduardo Coelho": 30,
    "Hugo Belo": 31,
    "João Silva": 32,
    "Mickael Soares": 33,
    "Ricardo Paiva": 34,
    "Tiago Vindima": 35,
    "João Olaio": 41,
    "Nuno Faria": 39,
    "Pedro Olaio": 40,
    "Fábio Passos": 42,
    "Nuno Silva": 37,
    "Rui Lopes": 36,
    "Cristiano Pereira": 29,
    "Filipe Fernandes": 38,
}

# Agentes órfãos (históricos) → atribuir a Tiago
ORPHAN_ANGARIADORES = {
    "Sofia Garcia", "Maria Rosa", "António Barosa", 
    "Maria Mendes", "Ricardo Vila"
}

def main():
    # Ler CSV verdade
    csv_data = {}
    with open('scripts/propriedades_nova.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            ref = row.get('Referência', '').strip()
            angariador = row.get('Angariador', '').strip()
            if ref:
                csv_data[ref] = angariador
    
    print(f"📊 LISTA VERDADE: {len(csv_data)} propriedades")
    print("="*70)
    
    # Conectar ao banco (Railway PostgreSQL)
    import os
    DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:GVejNLQMPCeKNzfwxqMtcCYhRbEGRvat@autorack.proxy.rlwy.net:18181/railway')
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    print(f"🔗 Conectando a: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'SQLite local'}\n")
    engine = create_engine(DATABASE_URL)
    
    stats = {
        'updated': 0,
        'already_correct': 0,
        'orphaned': 0,
        'not_in_csv': 0,
        'not_found': 0
    }
    
    updates_by_agent = {}
    
    with engine.connect() as conn:
        # Obter todas as propriedades do banco
        db_props = conn.execute(text('''
            SELECT p.id, p.reference, p.agent_id, a.name as current_agent
            FROM properties p
            LEFT JOIN agents a ON p.agent_id = a.id
        ''')).fetchall()
        
        print(f"🗄️  BANCO: {len(db_props)} propriedades\n")
        
        for prop in db_props:
            prop_id, reference, current_agent_id, current_agent_name = prop
            
            # Propriedade não está no CSV verdade
            if reference not in csv_data:
                stats['not_in_csv'] += 1
                continue
            
            angariador_csv = csv_data[reference]
            
            # Determinar agent_id correto
            if angariador_csv in ORPHAN_ANGARIADORES or not angariador_csv:
                target_agent_id = ANGARIADOR_TO_AGENT_ID["Tiago Vindima"]
                target_name = "Tiago Vindima (órfão)"
                stats['orphaned'] += 1
            elif angariador_csv in ANGARIADOR_TO_AGENT_ID:
                target_agent_id = ANGARIADOR_TO_AGENT_ID[angariador_csv]
                target_name = angariador_csv
            else:
                print(f"⚠️  {reference}: Angariador desconhecido '{angariador_csv}'")
                target_agent_id = ANGARIADOR_TO_AGENT_ID["Tiago Vindima"]
                target_name = "Tiago Vindima (desconhecido)"
                stats['orphaned'] += 1
            
            # Verificar se precisa atualizar
            if current_agent_id == target_agent_id:
                stats['already_correct'] += 1
            else:
                # Atualizar
                conn.execute(text('''
                    UPDATE properties 
                    SET agent_id = :new_id 
                    WHERE id = :prop_id
                '''), {
                    'new_id': target_agent_id,
                    'prop_id': prop_id
                })
                
                stats['updated'] += 1
                updates_by_agent[target_name] = updates_by_agent.get(target_name, 0) + 1
                
                print(f"✅ {reference}: {current_agent_id} → {target_agent_id} ({target_name})")
        
        conn.commit()
    
    # Resumo
    print("\n" + "="*70)
    print("📈 RESUMO DA SINCRONIZAÇÃO")
    print("="*70)
    print(f"Total no CSV verdade: {len(csv_data)}")
    print(f"✅ Atualizadas: {stats['updated']}")
    print(f"✓  Já corretas: {stats['already_correct']}")
    print(f"🏚️  Órfãos históricos: {stats['orphaned']}")
    print(f"⚠️  Não no CSV: {stats['not_in_csv']}")
    
    if updates_by_agent:
        print("\n📊 ATUALIZAÇÕES POR AGENTE:")
        for agent, count in sorted(updates_by_agent.items(), key=lambda x: -x[1])[:10]:
            print(f"  • {agent}: {count}")

if __name__ == '__main__':
    main()
