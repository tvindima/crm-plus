#!/bin/bash
# Script de validação de configuração de domínio para CRM PLUS
# Uso: ./scripts/validate-domain.sh [dominio]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Domínios padrão se não especificado
FRONTEND_DOMAIN="${1:-crmplus.com}"
API_DOMAIN="${2:-api.crmplus.com}"

echo "======================================"
echo "CRM PLUS - Validação de Domínio"
echo "======================================"
echo ""
echo "Frontend: $FRONTEND_DOMAIN"
echo "API:      $API_DOMAIN"
echo ""

# Função para verificar DNS
check_dns() {
    local domain=$1
    echo -n "Verificando DNS para $domain... "
    
    if dig +short "$domain" | grep -q '^[0-9]'; then
        echo -e "${GREEN}✓ OK${NC}"
        dig +short "$domain" | head -1
        return 0
    else
        echo -e "${RED}✗ FALHOU${NC}"
        echo "  DNS não resolve ou ainda não propagado"
        return 1
    fi
}

# Função para verificar HTTPS
check_https() {
    local domain=$1
    echo -n "Verificando HTTPS para $domain... "
    
    if curl -sI "https://$domain" -o /dev/null -w "%{http_code}" --connect-timeout 5 | grep -q "^[23]"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${RED}✗ FALHOU${NC}"
        echo "  HTTPS não acessível ou erro no servidor"
        return 1
    fi
}

# Função para verificar SSL
check_ssl() {
    local domain=$1
    echo -n "Verificando certificado SSL para $domain... "
    
    expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | \
             openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)
    
    if [ -n "$expiry" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        echo "  Expira em: $expiry"
        return 0
    else
        echo -e "${RED}✗ FALHOU${NC}"
        echo "  Certificado não encontrado ou inválido"
        return 1
    fi
}

# Função para verificar CORS
check_cors() {
    local api_url="https://$API_DOMAIN"
    local origin="https://$FRONTEND_DOMAIN"
    echo -n "Verificando CORS... "
    
    cors_header=$(curl -sI -X OPTIONS "$api_url/properties" \
                  -H "Origin: $origin" \
                  -H "Access-Control-Request-Method: GET" | \
                  grep -i "access-control-allow-origin" | tr -d '\r')
    
    if [ -n "$cors_header" ]; then
        echo -e "${GREEN}✓ OK${NC}"
        echo "  $cors_header"
        return 0
    else
        echo -e "${YELLOW}⚠ AVISO${NC}"
        echo "  Header CORS não encontrado - verifique CRMPLUS_CORS_ORIGINS"
        return 1
    fi
}

# Função para verificar API
check_api() {
    local api_url="https://$API_DOMAIN"
    echo -n "Verificando API docs... "
    
    if curl -sI "$api_url/docs" -o /dev/null -w "%{http_code}" | grep -q "200"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ AVISO${NC}"
        echo "  /docs não acessível"
        return 1
    fi
}

# Executar verificações
echo "=== Verificação DNS ==="
dns_frontend=0
dns_api=0
check_dns "$FRONTEND_DOMAIN" && dns_frontend=1 || dns_frontend=0
check_dns "$API_DOMAIN" && dns_api=1 || dns_api=0
echo ""

echo "=== Verificação HTTPS ==="
https_frontend=0
https_api=0
if [ $dns_frontend -eq 1 ]; then
    check_https "$FRONTEND_DOMAIN" && https_frontend=1 || https_frontend=0
else
    echo "Pulando HTTPS para $FRONTEND_DOMAIN (DNS não resolve)"
fi

if [ $dns_api -eq 1 ]; then
    check_https "$API_DOMAIN" && https_api=1 || https_api=0
else
    echo "Pulando HTTPS para $API_DOMAIN (DNS não resolve)"
fi
echo ""

echo "=== Verificação SSL ==="
if [ $https_frontend -eq 1 ]; then
    check_ssl "$FRONTEND_DOMAIN"
else
    echo "Pulando SSL para $FRONTEND_DOMAIN (HTTPS não disponível)"
fi

if [ $https_api -eq 1 ]; then
    check_ssl "$API_DOMAIN"
else
    echo "Pulando SSL para $API_DOMAIN (HTTPS não disponível)"
fi
echo ""

echo "=== Verificação API e CORS ==="
if [ $https_api -eq 1 ]; then
    check_api
    check_cors
else
    echo "Pulando verificação API (HTTPS não disponível)"
fi
echo ""

# Resumo
echo "======================================"
echo "RESUMO"
echo "======================================"
total_checks=0
passed_checks=0

((total_checks++)) && [ $dns_frontend -eq 1 ] && ((passed_checks++))
((total_checks++)) && [ $dns_api -eq 1 ] && ((passed_checks++))
((total_checks++)) && [ $https_frontend -eq 1 ] && ((passed_checks++))
((total_checks++)) && [ $https_api -eq 1 ] && ((passed_checks++))

echo "Verificações passadas: $passed_checks/$total_checks"
echo ""

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}✓ Todos os testes principais passaram!${NC}"
    exit 0
elif [ $passed_checks -gt 0 ]; then
    echo -e "${YELLOW}⚠ Algumas verificações falharam${NC}"
    echo "Aguarde propagação DNS ou verifique configuração"
    exit 1
else
    echo -e "${RED}✗ Todas as verificações falharam${NC}"
    echo "Verifique configuração DNS e deployment"
    exit 2
fi
