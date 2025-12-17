"""
Script para remover propriedades duplicadas no PostgreSQL do Railway.
Mantém apenas a primeira ocorrência (menor ID) de cada referência.
"""
import os
import sys
from sqlalchemy import create_engine, text

# Get DATABASE_URL from environment
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in environment")
    sys.exit(1)

# Fix old postgres:// URLs
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"[DATABASE] Connecting to PostgreSQL...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        # Find all duplicate references
        result = conn.execute(text("""
            SELECT reference, array_agg(id ORDER BY id) as ids, COUNT(*) as count
            FROM properties
            GROUP BY reference
            HAVING COUNT(*) > 1
            ORDER BY reference
        """))
        
        duplicates = list(result)
        
        if not duplicates:
            print("✅ No duplicates found!")
            sys.exit(0)
        
        print(f"\n🔍 Found {len(duplicates)} references with duplicates:\n")
        
        total_to_delete = 0
        for row in duplicates:
            reference, ids, count = row
            ids_to_keep = ids[:1]  # Keep first ID
            ids_to_delete = ids[1:]  # Delete the rest
            total_to_delete += len(ids_to_delete)
            print(f"  📌 {reference}: {count} duplicates")
            print(f"     ✅ Keep ID: {ids_to_keep[0]}")
            print(f"     ❌ Delete IDs: {ids_to_delete}")
        
        print(f"\n⚠️  Total properties to DELETE: {total_to_delete}")
        print(f"✅ Total properties to KEEP: {len(duplicates)}")
        
        # Ask for confirmation
        confirm = input("\n⚠️  Proceed with deletion? (yes/no): ").strip().lower()
        
        if confirm != "yes":
            print("❌ Operation cancelled.")
            sys.exit(0)
        
        # Delete duplicates
        deleted_count = 0
        for row in duplicates:
            reference, ids, count = row
            ids_to_delete = ids[1:]  # Delete all except first
            
            for id_to_delete in ids_to_delete:
                conn.execute(text(f"DELETE FROM properties WHERE id = {id_to_delete}"))
                deleted_count += 1
                print(f"  🗑️  Deleted property ID {id_to_delete} (ref: {reference})")
        
        conn.commit()
        
        print(f"\n✅ Successfully deleted {deleted_count} duplicate properties!")
        
        # Verify no duplicates remain
        result = conn.execute(text("""
            SELECT COUNT(*) 
            FROM (
                SELECT reference
                FROM properties
                GROUP BY reference
                HAVING COUNT(*) > 1
            ) duplicates
        """))
        
        remaining = result.scalar()
        if remaining == 0:
            print("✅ Verification passed: No duplicates remaining!")
        else:
            print(f"⚠️  Warning: {remaining} duplicate references still found!")

except Exception as e:
    print(f"❌ ERROR: {e}")
    sys.exit(1)
