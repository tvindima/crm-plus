# 🌐 Configuração de Domínio - CRM PLUS

## ✅ Resumo da Configuração Criada

Este branch adiciona suporte completo para configuração de domínios personalizados no CRM PLUS.

### 📁 Arquivos Criados

#### Documentação (`docs/`)
- **`domain-setup.md`** (7.4KB) - Guia completo de configuração
  - DNS, SSL/TLS, CORS
  - Vercel, Railway e Kubernetes
  - Troubleshooting detalhado
  
- **`domain-quickstart.md`** (5.5KB) - Guias rápidos
  - Cenário 1: Vercel + Railway
  - Cenário 2: Kubernetes completo
  - Cenário 3: Deploy misto
  
- **`domain-environments.md`** (5.4KB) - Configuração por ambiente
  - Development, Staging, Production
  - Variáveis de ambiente por ambiente
  - Multi-região e CDN

#### Infraestrutura (`infra/`)
- **`k8s/ingress.yaml`** (2.3KB) - Configuração Kubernetes
  - Ingress com SSL automático (Let's Encrypt)
  - Suporte multi-domínio
  - CORS configurado
  - Redirects HTTPS

#### Scripts (`scripts/`)
- **`setup-domain.sh`** (4.4KB) - Assistente de setup
  - Configuração interativa
  - Gera comandos específicos
  - Cria arquivos .env
  
- **`validate-domain.sh`** (5.0KB) - Validação
  - Testa DNS, HTTPS, SSL
  - Verifica CORS
  - Testa conectividade API

- **`README.md`** (3.4KB) - Documentação dos scripts

#### Configuração Vercel
- **`vercel-domain.json`** (1.2KB) - Config Vercel
  - Domain settings
  - Env vars
  - API proxy

### 🚀 Como Usar

#### Setup Rápido (3 passos)

```bash
# 1. Executar setup assistido
./scripts/setup-domain.sh production

# 2. Seguir instruções exibidas
# - Configurar DNS
# - Configurar Vercel/Railway
# - Aguardar propagação (5-10 min)

# 3. Validar configuração
./scripts/validate-domain.sh crmplus.com api.crmplus.com
```

#### Documentação Detalhada

Para configuração manual ou troubleshooting, consulte:
- [`docs/domain-setup.md`](docs/domain-setup.md) - Guia completo
- [`docs/domain-quickstart.md`](docs/domain-quickstart.md) - Guias rápidos

### 📊 Estrutura de Domínios Recomendada

```
Production:
  Frontend:    crmplus.com, www.crmplus.com
  Backend:     api.crmplus.com

Staging:
  Frontend:    staging.crmplus.com
  Backend:     api-staging.crmplus.com

Development:
  Frontend:    dev.crmplus.com (ou localhost:3000)
  Backend:     api-dev.crmplus.com (ou localhost:8000)
```

### 🔧 Tecnologias Suportadas

- **Vercel** - Frontend (Next.js)
- **Railway** - Backend (FastAPI)
- **Kubernetes** - Deploy completo
- **Let's Encrypt** - SSL/TLS automático
- **NGINX Ingress** - Roteamento e balanceamento

### 📝 Checklist de Deploy

- [ ] Registrar domínio
- [ ] Configurar DNS (registros A/CNAME)
- [ ] Configurar domínio na plataforma (Vercel/Railway)
- [ ] Configurar variáveis de ambiente
- [ ] Aguardar propagação DNS (5-10 min)
- [ ] Validar com `validate-domain.sh`
- [ ] Testar aplicação end-to-end

### 🛠️ Comandos Úteis

```bash
# Ver configuração DNS
dig crmplus.com
dig api.crmplus.com

# Testar HTTPS
curl -I https://crmplus.com
curl -I https://api.crmplus.com

# Verificar SSL
openssl s_client -connect api.crmplus.com:443

# Ver logs Kubernetes
kubectl logs -f deployment/crmplus-backend
kubectl get certificates
```

### 📖 Recursos Adicionais

- [README Principal](README.md) - Informação do projeto
- [Deploy/UAT Guide](docs/deploy-uat.md) - Deploy e testes
- [Infrastructure README](infra/README.md) - Infra e K8s
- [Scripts README](scripts/README.md) - Documentação scripts

### 🎯 Exemplos de Configuração

#### Exemplo 1: Vercel + Railway
```bash
# DNS
crmplus.com         A       76.76.21.21
api.crmplus.com     CNAME   crm-plus-production.up.railway.app

# Vercel
vercel domains add crmplus.com
vercel env add NEXT_PUBLIC_API_BASE_URL https://api.crmplus.com

# Railway
# Dashboard → Settings → Domains → api.crmplus.com
# Dashboard → Variables → CRMPLUS_CORS_ORIGINS=https://crmplus.com
```

#### Exemplo 2: Kubernetes
```bash
# Obter IP do LoadBalancer
kubectl get svc ingress-nginx-controller -n ingress-nginx

# DNS
crmplus.com         A       [LoadBalancer IP]
api.crmplus.com     A       [LoadBalancer IP]

# Deploy
kubectl apply -f infra/k8s/
```

### 💡 Dicas

- DNS pode levar até 48h para propagar (geralmente 5-10 min)
- SSL é automático via Let's Encrypt
- Use scripts para automatizar validação
- Consulte troubleshooting em caso de problemas

### 🔗 Links Úteis

- [Vercel Docs](https://vercel.com/docs/concepts/projects/domains)
- [Railway Docs](https://docs.railway.app/deploy/custom-domains)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [cert-manager](https://cert-manager.io/docs/)

---

**Criado para:** Branch `copilot/create-domain-for-branch`  
**Objetivo:** Adicionar suporte completo para configuração de domínios personalizados  
**Status:** ✅ Completo
