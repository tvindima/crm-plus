#!/usr/bin/env python3
"""
Corrige atribuições de propriedades baseado na coluna 'angariador' do CSV original.

REGRA:
- Fonte de verdade = coluna "angariador" no CSV
- Fábio Passos = apenas propriedades FA* (não FP*)
- Propriedades FP* = pertencem aos agentes listados no CSV
"""

import csv
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Mapeamento nome angariador → agent_id
ANGARIADOR_TO_AGENT = {
    "António Silva": 24,
    "Hugo Belo": 25,
    "Bruno Libânio": 26,
    "Nélson Neto": 27,
    "João Paiva": 28,
    "Marisa Barosa": 29,
    "Eduardo Coelho": 30,
    "João Silva": 31,
    "Hugo Mota": 32,
    "João Pereira": 33,
    "João Carvalho": 34,
    "Tiago Vindima": 35,
    "Mickael Soares": 36,
    "Paulo Rodrigues": 37,
    "Imóveis Mais Leiria": 38,
    "Nuno Faria": 39,
    "Pedro Olaio": 40,
    "João Olaio": 41,
    "Fábio Passos": 42,
    # Agentes antigos/não mapeados
    "Sofia Garcia": None,
    "Maria Rosa": None,
    "António Barosa": None,
    "Maria Mendes": None,
    "Ricardo Vila": None,
    "Maria Olaio": None,
}

def main():
    print("🔧 CORREÇÃO DE ATRIBUIÇÕES BASEADA NO CSV")
    print("=" * 60)
    
    engine = create_engine(DATABASE_URL)
    
    # Ler CSV
    csv_path = "scripts/propriedades.csv"
    updates = []
    skipped = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            referencia = row['referencia']
            angariador = row['angariador']
            
            # Mapear angariador → agent_id
            agent_id = ANGARIADOR_TO_AGENT.get(angariador)
            
            if agent_id is None:
                skipped.append((referencia, angariador))
                continue
            
            updates.append({
                'referencia': referencia,
                'agent_id': agent_id,
                'angariador': angariador
            })
    
    print(f"📊 Total de propriedades no CSV: {len(updates) + len(skipped)}")
    print(f"✅ Atribuições válidas: {len(updates)}")
    print(f"⚠️  Angariadores não mapeados: {len(skipped)}")
    
    if skipped:
        print("\n⚠️  Angariadores sem mapeamento:")
        angariadores_unicos = set(ang for _, ang in skipped)
        for ang in sorted(angariadores_unicos):
            count = sum(1 for _, a in skipped if a == ang)
            print(f"   - {ang}: {count} propriedades")
    
    print("\n" + "=" * 60)
    resposta = input("Confirmar atualização no banco? (sim/não): ")
    
    if resposta.lower() != 'sim':
        print("❌ Operação cancelada")
        return
    
    # Executar updates
    print("\n🔄 Atualizando banco de dados...")
    
    with engine.connect() as conn:
        updated = 0
        errors = []
        
        for update in updates:
            try:
                result = conn.execute(
                    text("""
                        UPDATE properties 
                        SET agent_id = :agent_id 
                        WHERE reference = :referencia
                    """),
                    {
                        'agent_id': update['agent_id'],
                        'referencia': update['referencia']
                    }
                )
                
                if result.rowcount > 0:
                    updated += 1
                    
            except Exception as e:
                errors.append((update['referencia'], str(e)))
        
        conn.commit()
    
    print("\n" + "=" * 60)
    print(f"✅ Propriedades atualizadas: {updated}")
    print(f"❌ Erros: {len(errors)}")
    
    if errors:
        print("\n❌ Erros encontrados:")
        for ref, err in errors[:10]:
            print(f"   {ref}: {err}")
    
    # Validação
    print("\n🔍 Validando atribuições...")
    
    with engine.connect() as conn:
        # Verificar Fábio Passos
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM properties 
            WHERE agent_id = 42 
            AND reference LIKE 'FA%'
        """))
        fa_count = result.fetchone()[0]
        
        result = conn.execute(text("""
            SELECT COUNT(*) as count
            FROM properties 
            WHERE agent_id = 42
        """))
        total_fp = result.fetchone()[0]
        
        print(f"   Fábio Passos (ID 42):")
        print(f"      - Total propriedades: {total_fp}")
        print(f"      - Propriedades FA*: {fa_count}")
        
        if fa_count == 2 and total_fp == 2:
            print("      ✅ CORRETO (apenas FA*)")
        else:
            print(f"      ⚠️  ATENÇÃO: Tem {total_fp - fa_count} propriedades não-FA")
    
    print("\n✅ Correção concluída!")

if __name__ == "__main__":
    main()
