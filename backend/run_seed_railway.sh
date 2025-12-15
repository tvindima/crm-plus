#!/bin/bash

echo "🚀 EXECUTANDO SEED NO RAILWAY POSTGRESQL"
echo "========================================"
echo ""

# Railway auto-executa seed_postgres.py no Dockerfile
# Basta fazer redeploy para forçar seed

echo "📋 Opção 1: Forçar redeploy (recomendado)"
echo "   git commit --allow-empty -m 'chore: trigger seed' && git push origin main"
echo ""

echo "📋 Opção 2: Executar seed localmente (se tiver DATABASE_URL)"
echo "   export DATABASE_URL='postgresql://...'"
echo "   python3 seed_postgres.py"
echo ""

echo "📋 Opção 3: Criar endpoint de seed no backend"
echo "   POST /admin/seed (protegido com auth)"
echo ""

echo "✅ ESCOLHA UMA OPÇÃO E EXECUTE"
