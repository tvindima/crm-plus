# Scripts - CRM PLUS

Scripts auxiliares para configuração e manutenção do CRM PLUS.

## Scripts Disponíveis

### `setup-domain.sh`
Assistente de configuração de domínio personalizado.

**Uso:**
```bash
./scripts/setup-domain.sh [production|staging|development]
```

**Exemplo:**
```bash
# Setup para produção
./scripts/setup-domain.sh production

# Setup para staging
./scripts/setup-domain.sh staging

# Setup para desenvolvimento
./scripts/setup-domain.sh development
```

**O que faz:**
- Exibe configuração DNS necessária
- Gera comandos para Vercel, Railway e Kubernetes
- Cria arquivos `.env` de exemplo
- Lista próximos passos

### `validate-domain.sh`
Valida configuração de domínio e testa conectividade.

**Uso:**
```bash
./scripts/validate-domain.sh [dominio-frontend] [dominio-api]
```

**Exemplo:**
```bash
# Validar domínios padrão
./scripts/validate-domain.sh crmplus.com api.crmplus.com

# Validar staging
./scripts/validate-domain.sh staging.crmplus.com api-staging.crmplus.com
```

**O que verifica:**
- ✓ Resolução DNS
- ✓ Conectividade HTTPS
- ✓ Certificados SSL válidos
- ✓ Configuração CORS
- ✓ API acessível

## Workflow Recomendado

### 1. Setup Inicial
```bash
# Executar setup para ambiente desejado
./scripts/setup-domain.sh production

# Seguir instruções exibidas
# - Configurar DNS
# - Configurar Vercel/Railway
# - Configurar variáveis de ambiente
```

### 2. Aguardar Propagação
```
# DNS geralmente propaga em 5-10 minutos
# Pode levar até 48 horas em casos raros
```

### 3. Validar Configuração
```bash
# Executar validação
./scripts/validate-domain.sh crmplus.com api.crmplus.com

# Se todos os testes passarem, domínio está configurado!
```

### 4. Troubleshooting
Se validação falhar, consulte:
- `docs/domain-setup.md` - Seção Troubleshooting
- Logs de deploy (Vercel/Railway/K8s)
- Status do DNS em https://www.whatsmydns.net

## Exemplos de Uso

### Setup Completo para Produção
```bash
# 1. Setup
./scripts/setup-domain.sh production

# 2. Configurar DNS no provedor
# (seguir output do script)

# 3. Configurar Vercel
vercel domains add crmplus.com

# 4. Aguardar propagação (10 min)
sleep 600

# 5. Validar
./scripts/validate-domain.sh crmplus.com api.crmplus.com
```

### Setup para Múltiplos Ambientes
```bash
# Staging
./scripts/setup-domain.sh staging
# Configurar DNS e plataformas...
./scripts/validate-domain.sh staging.crmplus.com api-staging.crmplus.com

# Production
./scripts/setup-domain.sh production
# Configurar DNS e plataformas...
./scripts/validate-domain.sh crmplus.com api.crmplus.com
```

## Dependências

Os scripts requerem as seguintes ferramentas instaladas:
- `bash`
- `dig` (geralmente em `dnsutils` ou `bind-tools`)
- `curl`
- `openssl`

### Instalar Dependências

**Ubuntu/Debian:**
```bash
sudo apt-get install dnsutils curl openssl
```

**macOS:**
```bash
brew install bind curl openssl
```

**Alpine Linux:**
```bash
apk add bind-tools curl openssl
```

## Notas

- Scripts são idempotentes - podem ser executados múltiplas vezes
- Não fazem alterações automáticas - apenas exibem instruções
- Arquivos `.env` gerados vão para `/tmp` e não são commitados
- Sempre revise variáveis antes de usar em produção

## Suporte

Para mais informações, consulte:
- `docs/domain-setup.md` - Documentação completa
- `docs/domain-quickstart.md` - Guias rápidos
- `docs/domain-environments.md` - Configuração por ambiente
