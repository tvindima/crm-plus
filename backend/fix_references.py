"""
Fix property reference IDs to match agent initials.
Updates 5 properties with mismatched reference prefixes.
"""
import sqlite3
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / "test.db"

CORRECTIONS = [
    ("FA1006", "FP1006", "Fábio Passos"),
    ("FA1007", "FP1007", "Fábio Passos"),
    ("CB1031", "EC1031", "Eduardo Coelho"),
    ("JR1044", "JS1044", "João Silva"),
    ("JR1041", "JS1041", "João Silva"),
]

def fix_references():
    """Apply reference corrections."""
    if not DB_PATH.exists():
        print(f"❌ Database not found: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("🔧 Aplicando correções de referências...\n")
    
    for old_ref, new_ref, agent_name in CORRECTIONS:
        # Check if old reference exists
        cursor.execute("SELECT id, title FROM properties WHERE reference = ?", (old_ref,))
        old_result = cursor.fetchone()
        
        # Check if new reference already exists
        cursor.execute("SELECT id, title FROM properties WHERE reference = ?", (new_ref,))
        new_result = cursor.fetchone()
        
        if old_result and not new_result:
            prop_id, title = old_result
            print(f"✓ {old_ref} → {new_ref} ({agent_name})")
            print(f"  ID: {prop_id}, Título: {title[:50]}")
            
            # Update reference
            cursor.execute("UPDATE properties SET reference = ? WHERE reference = ?", (new_ref, old_ref))
        elif new_result and not old_result:
            print(f"✅ {new_ref} já existe (correção anterior)")
        elif old_result and new_result:
            print(f"⚠️  CONFLITO: {old_ref} e {new_ref} ambos existem! Mantendo ambos.")
        else:
            print(f"⚠️  {old_ref} não encontrado")
    
    conn.commit()
    
    # Verify corrections
    print("\n📊 Verificação pós-correção:")
    for old_ref, new_ref, agent_name in CORRECTIONS:
        cursor.execute("SELECT COUNT(*) FROM properties WHERE reference = ?", (new_ref,))
        count = cursor.fetchone()[0]
        if count > 0:
            print(f"✅ {new_ref} existe (correção aplicada)")
        else:
            print(f"❌ {new_ref} não encontrado")
    
    conn.close()
    print("\n✅ Correções concluídas!")
    return True

if __name__ == "__main__":
    success = fix_references()
    sys.exit(0 if success else 1)
