#!/bin/bash
# DON'T exit on error during migrations - allow API to start even if migrations fail
# set -e

echo "🚀 [STARTUP] Iniciando CRM Plus Backend..."
echo ""

# Check if migrations should be skipped (useful when DB is unstable)
if [ "$SKIP_MIGRATIONS" = "true" ]; then
    echo "⏭️  [MIGRATIONS] SKIP_MIGRATIONS=true, pulando migrations..."
    echo "⚠️  AVISO: Aplicar migrations manualmente quando DB estiver estável"
    echo ""
elif [ "$RUN_MIGRATIONS" = "false" ]; then
    echo "⏭️  [MIGRATIONS] RUN_MIGRATIONS=false, pulando migrations..."
    echo ""
else
    echo "📦 [MIGRATIONS] Aplicando migrações Alembic (non-blocking)..."
    
    # Retry logic para lidar com timeouts temporários
    MAX_RETRIES=2
    RETRY_COUNT=0
    MIGRATION_SUCCESS=false
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if timeout 30 alembic upgrade head 2>&1; then
            echo "✅ [MIGRATIONS] Migrações aplicadas com sucesso!"
            MIGRATION_SUCCESS=true
            break
        else
            RETRY_COUNT=$((RETRY_COUNT + 1))
            if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
                echo "⚠️  [MIGRATIONS] Tentativa $RETRY_COUNT falhou, aguardando 3s..."
                sleep 3
            fi
        fi
    done
    
    if [ "$MIGRATION_SUCCESS" = "false" ]; then
        echo "❌ [MIGRATIONS] Falhou após $MAX_RETRIES tentativas"
        echo "⚠️  [MIGRATIONS] Continuando startup - API funcionará com schema existente"
        echo "💡 Dica: Aplicar manualmente quando DB estiver OK: railway run alembic upgrade head"
    fi
    echo ""
fi

echo "🌐 [UVICORN] Iniciando servidor na porta ${PORT:-8000}..."
echo ""

exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
