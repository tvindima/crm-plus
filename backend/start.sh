#!/bin/bash
set -e

echo "🚀 [STARTUP] Iniciando CRM Plus Backend..."
echo ""

# Check if migrations should be skipped (useful when DB is unstable)
if [ "$SKIP_MIGRATIONS" = "true" ]; then
    echo "⏭️  [MIGRATIONS] SKIP_MIGRATIONS=true, pulando migrations..."
    echo "⚠️  AVISO: Aplicar migrations manualmente quando DB estiver estável"
    echo ""
else
    echo "📦 [MIGRATIONS] Aplicando migrações Alembic..."
    
    # Retry logic para lidar com timeouts temporários
    MAX_RETRIES=3
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if alembic upgrade head; then
            echo "✅ [MIGRATIONS] Migrações aplicadas com sucesso!"
            echo ""
            break
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo "⚠️  [MIGRATIONS] Tentativa $RETRY_COUNT falhou, aguardando 5s..."
                sleep 5
            else
                echo "❌ [MIGRATIONS] ERRO após $MAX_RETRIES tentativas!"
                echo "💡 Dica: Se DB está instável, defina SKIP_MIGRATIONS=true"
                exit 1
            fi
        fi
    done
fi

echo "🌐 [UVICORN] Iniciando servidor na porta ${PORT:-8000}..."
echo ""

exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
