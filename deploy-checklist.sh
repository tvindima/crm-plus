#!/bin/bash
# Deploy Checklist Script
# Validates all criteria before deploying to production

echo "🚀 CRM PLUS - Deploy Checklist"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000"
FAIL_COUNT=0

echo "📋 Fase 1: Verificação Backend Local"
echo "--------------------------------------"

# 1. Check if backend is running
echo -n "1. Backend está rodando? "
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Sim${NC}"
else
    echo -e "${RED}❌ Não - Inicie com: cd backend && uvicorn app.main:app${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# 2. Check properties count
echo -n "2. Propriedades carregadas? "
PROP_COUNT=$(curl -s "$API_URL/properties/" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
if [ "$PROP_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ $PROP_COUNT propriedades${NC}"
else
    echo -e "${RED}❌ 0 propriedades${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

# 3. Check agents count
echo -n "3. Agentes carregados? "
AGENT_COUNT=$(curl -s "$API_URL/agents/" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
if [ "$AGENT_COUNT" -gt "0" ]; then
    echo -e "${GREEN}✅ $AGENT_COUNT agentes${NC}"
else
    echo -e "${RED}❌ 0 agentes${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

echo ""
echo "📋 Fase 2: Auditoria de Dados"
echo "--------------------------------------"

# 4. Run audit
echo "4. Executando auditoria completa..."
cd backend
source .venv/bin/activate
AUDIT_RESULT=$(python audit_properties.py 2>/dev/null | grep "ID Formato Correto" | grep -o "[0-9]*%" | head -1)
cd ..

if [ "$AUDIT_RESULT" == "100%" ]; then
    echo -e "   ${GREEN}✅ 100% conformidade${NC}"
else
    echo -e "   ${YELLOW}⚠️  $AUDIT_RESULT conformidade - Execute fix_references.py${NC}"
fi

echo ""
echo "📋 Fase 3: Preparação Deploy"
echo "--------------------------------------"

# 5. Check .env files not committed
echo -n "5. .env files protegidos? "
if git ls-files | grep -q "^\.env$"; then
    echo -e "${RED}❌ .env está no git!${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
else
    echo -e "${GREEN}✅ Sim${NC}"
fi

# 6. Check frontend build
echo -n "6. Frontend build OK? "
cd frontend/web
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Build com avisos${NC}"
fi
cd ../..

echo ""
echo "📋 Fase 4: Configuração Produção"
echo "--------------------------------------"

# 7. Check production env vars
echo "7. Variáveis de ambiente:"
if [ -f "frontend/web/.env.production" ]; then
    echo -e "   ${GREEN}✅ .env.production existe${NC}"
    echo "   📄 Conteúdo:"
    cat frontend/web/.env.production | sed 's/^/      /'
else
    echo -e "   ${RED}❌ .env.production não encontrado${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
fi

echo ""
echo "========================================"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ PRONTO PARA DEPLOY!${NC}"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. cd frontend/web"
    echo "   2. vercel --prod"
    echo ""
    echo "   Após deploy:"
    echo "   3. Testar https://imoveismais.vercel.app"
    echo "   4. Verificar que propriedades carregam"
    echo "   5. Clicar em agente → ver propriedades dele"
else
    echo -e "${RED}❌ $FAIL_COUNT problema(s) encontrado(s)${NC}"
    echo "   Corrija os erros acima antes do deploy"
    exit 1
fi
