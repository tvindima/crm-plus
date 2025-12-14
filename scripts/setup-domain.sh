#!/bin/bash
# Script auxiliar para configurar domínio em diferentes ambientes
# Uso: ./scripts/setup-domain.sh [production|staging|development]

set -e

ENVIRONMENT="${1:-production}"

echo "======================================"
echo "CRM PLUS - Setup de Domínio"
echo "======================================"
echo "Ambiente: $ENVIRONMENT"
echo ""

case $ENVIRONMENT in
  production)
    FRONTEND_DOMAIN="crmplus.com"
    API_DOMAIN="api.crmplus.com"
    ;;
  staging)
    FRONTEND_DOMAIN="staging.crmplus.com"
    API_DOMAIN="api-staging.crmplus.com"
    ;;
  development)
    FRONTEND_DOMAIN="dev.crmplus.com"
    API_DOMAIN="api-dev.crmplus.com"
    ;;
  *)
    echo "Ambiente desconhecido: $ENVIRONMENT"
    echo "Use: production, staging ou development"
    exit 1
    ;;
esac

echo "Frontend: https://$FRONTEND_DOMAIN"
echo "API:      https://$API_DOMAIN"
echo ""

# Função para exibir configuração DNS
show_dns_config() {
    echo "=== Configuração DNS Necessária ==="
    echo ""
    echo "Configure os seguintes registros no seu provedor DNS:"
    echo ""
    echo "Para Vercel (Frontend):"
    echo "  $FRONTEND_DOMAIN          A       76.76.21.21"
    echo "  www.$FRONTEND_DOMAIN      CNAME   cname.vercel-dns.com"
    echo ""
    echo "Para Railway (Backend):"
    echo "  $API_DOMAIN               CNAME   crm-plus-production.up.railway.app"
    echo ""
    echo "Ou para Kubernetes:"
    echo "  $API_DOMAIN               A       [Seu LoadBalancer IP]"
    echo ""
}

# Função para exibir configuração Vercel
show_vercel_config() {
    echo "=== Configuração Vercel ==="
    echo ""
    echo "1. Adicionar domínio:"
    echo "   vercel domains add $FRONTEND_DOMAIN"
    echo ""
    echo "2. Configurar variáveis de ambiente:"
    echo "   NEXT_PUBLIC_API_BASE_URL=https://$API_DOMAIN"
    echo ""
}

# Função para exibir configuração Railway
show_railway_config() {
    echo "=== Configuração Railway ==="
    echo ""
    echo "1. Via Dashboard:"
    echo "   Settings → Domains → Add Custom Domain → $API_DOMAIN"
    echo ""
    echo "2. Configurar variáveis de ambiente:"
    echo "   CRMPLUS_CORS_ORIGINS=https://$FRONTEND_DOMAIN,https://www.$FRONTEND_DOMAIN"
    echo "   DATABASE_URL=postgresql+psycopg2://..."
    echo "   JWT_SECRET=..."
    echo ""
}

# Função para exibir configuração Kubernetes
show_k8s_config() {
    echo "=== Configuração Kubernetes ==="
    echo ""
    echo "1. Obter IP do LoadBalancer:"
    echo "   kubectl get service ingress-nginx-controller -n ingress-nginx"
    echo ""
    echo "2. Aplicar configurações:"
    echo "   kubectl apply -f infra/k8s/backend-deployment.yaml"
    echo "   kubectl apply -f infra/k8s/frontend-deployment.yaml"
    echo "   kubectl apply -f infra/k8s/ingress.yaml"
    echo ""
    echo "3. Verificar certificado SSL:"
    echo "   kubectl get certificates"
    echo ""
}

# Função para criar arquivo de configuração
create_env_file() {
    echo "=== Criando arquivos .env ==="
    echo ""
    
    # Frontend env
    cat > "/tmp/frontend-${ENVIRONMENT}.env" <<EOF
# Frontend Environment: $ENVIRONMENT
NEXT_PUBLIC_API_BASE_URL=https://$API_DOMAIN
NODE_ENV=production
EOF
    
    # Backend env
    cat > "/tmp/backend-${ENVIRONMENT}.env" <<EOF
# Backend Environment: $ENVIRONMENT
CRMPLUS_CORS_ORIGINS=https://$FRONTEND_DOMAIN,https://www.$FRONTEND_DOMAIN,http://localhost:3000
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/crmplus_${ENVIRONMENT}
REDIS_URL=redis://redis:6379/0
JWT_SECRET=change-me-in-${ENVIRONMENT}
ENVIRONMENT=$ENVIRONMENT
EOF
    
    echo "Arquivos criados em /tmp:"
    echo "  - frontend-${ENVIRONMENT}.env"
    echo "  - backend-${ENVIRONMENT}.env"
    echo ""
    echo "Copie o conteúdo para seu provedor de deploy."
    echo ""
}

# Exibir todas as configurações
show_dns_config
show_vercel_config
show_railway_config
show_k8s_config
create_env_file

echo "======================================"
echo "Próximos Passos:"
echo "======================================"
echo "1. Configure DNS conforme acima"
echo "2. Configure domínio no Vercel/Railway"
echo "3. Configure variáveis de ambiente"
echo "4. Aguarde propagação DNS (5-10 min)"
echo "5. Execute validação:"
echo "   ./scripts/validate-domain.sh $FRONTEND_DOMAIN $API_DOMAIN"
echo ""
echo "Para mais detalhes, consulte:"
echo "  - docs/domain-setup.md"
echo "  - docs/domain-quickstart.md"
echo ""
