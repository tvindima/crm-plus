# Configuração de Domínio - CRM PLUS

Este documento descreve como configurar domínios personalizados para o CRM PLUS em diferentes ambientes de deploy.

## Visão Geral

O CRM PLUS utiliza os seguintes domínios recomendados:
- **Frontend/Site Público**: `crmplus.com` ou `www.crmplus.com`
- **Backend API**: `api.crmplus.com`
- **Backoffice**: `backoffice.crmplus.com` (opcional, pode usar subpath)

## 1. Configuração DNS

### Registros DNS Necessários

Configure os seguintes registros no seu provedor DNS (ex: Cloudflare, Route53, GoDaddy):

#### Para Deploy em Vercel (Frontend)
```
Type: CNAME
Name: crmplus.com (ou www)
Value: cname.vercel-dns.com
TTL: 3600
```

```
Type: A
Name: @
Value: 76.76.21.21 (IP do Vercel)
TTL: 3600
```

#### Para Deploy em Railway/Kubernetes (Backend)
```
Type: CNAME
Name: api
Value: crm-plus-production.up.railway.app (ou seu cluster K8s)
TTL: 3600
```

#### Para Deploy em Kubernetes com Ingress
```
Type: A
Name: api
Value: [IP do LoadBalancer do K8s]
TTL: 3600
```

### Exemplo de Configuração Completa
```
crmplus.com             A       76.76.21.21
www.crmplus.com         CNAME   cname.vercel-dns.com
api.crmplus.com         CNAME   crm-plus-production.up.railway.app
backoffice.crmplus.com  CNAME   cname.vercel-dns.com
```

## 2. Configuração Vercel

### Via Interface Web
1. Acesse o dashboard Vercel: https://vercel.com/dashboard
2. Selecione o projeto CRM PLUS
3. Vá para **Settings** → **Domains**
4. Adicione seu domínio:
   - `crmplus.com`
   - `www.crmplus.com`
5. Vercel fornecerá instruções de DNS
6. Aguarde propagação DNS (pode levar até 48h, geralmente 5-10min)
7. Vercel configurará automaticamente SSL/TLS

### Via Vercel CLI
```bash
# Instalar CLI
npm i -g vercel

# Login
vercel login

# Adicionar domínio
vercel domains add crmplus.com
vercel domains add www.crmplus.com

# Verificar status
vercel domains ls
```

### Variáveis de Ambiente Vercel
Configure no dashboard Vercel → **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_BASE_URL=https://api.crmplus.com
NODE_ENV=production
```

## 3. Configuração Railway (Backend)

### Domínio Personalizado Railway
1. Acesse Railway dashboard: https://railway.app
2. Selecione o projeto CRM PLUS
3. Vá para **Settings** → **Domains**
4. Clique em **Add Custom Domain**
5. Digite `api.crmplus.com`
6. Railway fornecerá um CNAME para configurar no DNS
7. Configure o CNAME no seu provedor DNS
8. Aguarde verificação (geralmente alguns minutos)

### Variáveis de Ambiente Railway
Configure no dashboard Railway:

```
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/crmplus
CRMPLUS_CORS_ORIGINS=https://crmplus.com,https://www.crmplus.com,https://backoffice.crmplus.com,http://localhost:3000
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://redis:6379/0
```

## 4. Configuração Kubernetes

### Pré-requisitos
- Cluster Kubernetes configurado
- NGINX Ingress Controller instalado
- cert-manager instalado (para SSL automático)

### Instalar NGINX Ingress Controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

### Instalar cert-manager
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Aplicar Configurações
```bash
# Deploy dos serviços
kubectl apply -f infra/k8s/backend-deployment.yaml
kubectl apply -f infra/k8s/frontend-deployment.yaml
kubectl apply -f infra/k8s/redis.yaml

# Configurar Ingress e SSL
kubectl apply -f infra/k8s/ingress.yaml

# Verificar status
kubectl get ingress
kubectl get certificates
```

### Obter IP do LoadBalancer
```bash
kubectl get service ingress-nginx-controller -n ingress-nginx
```

Configure o IP retornado nos seus registros DNS tipo A.

## 5. Configuração SSL/TLS

### Vercel
SSL é automático via Let's Encrypt. Não requer configuração.

### Railway
SSL é automático para domínios personalizados. Não requer configuração.

### Kubernetes com cert-manager
SSL é automático via Let's Encrypt usando a configuração em `ingress.yaml`.

O cert-manager:
1. Detecta o Ingress
2. Solicita certificados Let's Encrypt
3. Renova automaticamente antes da expiração

### Verificar Certificados
```bash
# Kubernetes
kubectl get certificates
kubectl describe certificate crmplus-tls

# Via navegador
curl -vI https://api.crmplus.com
```

## 6. Ambientes Múltiplos

### Desenvolvimento
```
frontend: http://localhost:3000
backend:  http://localhost:8000
```

### Staging/UAT
```
frontend: https://staging.crmplus.com
backend:  https://api-staging.crmplus.com
```

### Produção
```
frontend: https://crmplus.com
backend:  https://api.crmplus.com
```

### Configuração de Branches
Para diferentes branches, use subdomínios:
```
branch-name.crmplus.com → Deploy automático Vercel
api-branch-name.crmplus.com → Railway/K8s
```

## 7. Verificação e Testes

### Verificar DNS
```bash
# Verificar propagação DNS
dig crmplus.com
dig api.crmplus.com

# Verificar CNAME
dig www.crmplus.com CNAME
```

### Verificar SSL
```bash
# Testar conexão HTTPS
curl -I https://crmplus.com
curl -I https://api.crmplus.com

# Verificar certificado
openssl s_client -connect api.crmplus.com:443 -servername api.crmplus.com
```

### Verificar CORS
```bash
# Testar CORS do backend
curl -I -X OPTIONS https://api.crmplus.com/properties \
  -H "Origin: https://crmplus.com" \
  -H "Access-Control-Request-Method: GET"
```

### Checklist de Verificação
- [ ] DNS configurado e propagado
- [ ] Domínio frontend acessível via HTTPS
- [ ] Domínio backend/API acessível via HTTPS
- [ ] Certificados SSL válidos e confiáveis
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend consegue chamar API
- [ ] Redirects HTTP→HTTPS funcionando
- [ ] www → apex redirect funcionando

## 8. Troubleshooting

### DNS não propaga
- Aguardar até 48h (geralmente 5-10 minutos)
- Verificar TTL baixo nos registros DNS
- Limpar cache DNS local: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

### SSL não funciona
- Verificar registros DNS corretos
- Aguardar emissão de certificado (pode levar minutos)
- Verificar logs cert-manager: `kubectl logs -n cert-manager deployment/cert-manager`

### CORS bloqueado
- Verificar `CRMPLUS_CORS_ORIGINS` inclui domínio frontend
- Verificar protocolo (http vs https)
- Verificar porta na origem

### 404 ou 502 errors
- Verificar serviços rodando: `kubectl get pods`
- Verificar logs: `kubectl logs <pod-name>`
- Verificar configuração Ingress: `kubectl describe ingress crmplus-ingress`

## 9. Manutenção

### Renovação SSL
Automática via cert-manager ou plataforma (Vercel/Railway).

### Adicionar Novo Domínio
1. Adicionar registro DNS
2. Adicionar ao Ingress/Vercel
3. Atualizar CORS no backend
4. Testar

### Mudar Domínio
1. Configurar novo domínio
2. Testar completamente
3. Atualizar variáveis de ambiente
4. Redirect domínio antigo (opcional)
5. Remover domínio antigo após migração

## 10. Referências

- [Vercel Domains Documentation](https://vercel.com/docs/concepts/projects/domains)
- [Railway Custom Domains](https://docs.railway.app/deploy/custom-domains)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
