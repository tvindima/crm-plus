#!/bin/bash
set -e

echo "🚀 [STARTUP] Iniciando CRM Plus Backend..."
echo ""

echo "📦 [MIGRATIONS] Aplicando migrações Alembic..."
alembic upgrade head

if [ $? -eq 0 ]; then
    echo "✅ [MIGRATIONS] Migrações aplicadas com sucesso!"
    echo ""
else
    echo "❌ [MIGRATIONS] ERRO ao aplicar migrações!"
    exit 1
fi

echo "🌐 [UVICORN] Iniciando servidor na porta ${PORT:-8000}..."
echo ""

exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
