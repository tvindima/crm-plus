# Guia Rápido - Configuração de Domínio por Ambiente

## Cenário 1: Deploy Vercel (Frontend) + Railway (Backend)

### Passo 1: Configurar DNS
No seu provedor DNS (Cloudflare, GoDaddy, etc.):

```
# Frontend
crmplus.com             A       76.76.21.21
www.crmplus.com         CNAME   cname.vercel-dns.com

# Backend
api.crmplus.com         CNAME   crm-plus-production.up.railway.app
```

### Passo 2: Vercel
```bash
# Via CLI
vercel domains add crmplus.com

# Ou via Dashboard
# Settings → Domains → Add crmplus.com
```

Variáveis de ambiente:
```
NEXT_PUBLIC_API_BASE_URL=https://api.crmplus.com
```

### Passo 3: Railway
```bash
# Via Dashboard
# Settings → Domains → Custom Domain → api.crmplus.com
```

Variáveis de ambiente:
```
CRMPLUS_CORS_ORIGINS=https://crmplus.com,https://www.crmplus.com
DATABASE_URL=postgresql+psycopg2://...
```

### Passo 4: Verificar
```bash
curl https://crmplus.com
curl https://api.crmplus.com/docs
```

---

## Cenário 2: Deploy Kubernetes Completo

### Passo 1: Pré-requisitos
```bash
# Instalar NGINX Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Instalar cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Passo 2: Obter IP do LoadBalancer
```bash
kubectl get service ingress-nginx-controller -n ingress-nginx

# Output exemplo:
# NAME                       TYPE           EXTERNAL-IP      PORT(S)
# ingress-nginx-controller   LoadBalancer   203.0.113.42     80:30080/TCP,443:30443/TCP
```

### Passo 3: Configurar DNS
```
# Use o EXTERNAL-IP do passo anterior
crmplus.com             A       203.0.113.42
www.crmplus.com         A       203.0.113.42
api.crmplus.com         A       203.0.113.42
```

### Passo 4: Deploy
```bash
cd infra/k8s

# Deploy serviços
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f redis.yaml

# Deploy Ingress e SSL
kubectl apply -f ingress.yaml

# Verificar
kubectl get pods
kubectl get ingress
kubectl get certificates
```

### Passo 5: Aguardar SSL
```bash
# Monitorar emissão de certificado (1-5 minutos)
kubectl describe certificate crmplus-tls

# Quando pronto, STATUS será "Certificate is up to date"
```

### Passo 6: Verificar
```bash
curl https://crmplus.com
curl https://api.crmplus.com/docs
```

---

## Cenário 3: Deploy Misto (Frontend Vercel + Backend K8s)

### Passo 1: DNS
```
# Frontend para Vercel
crmplus.com             A       76.76.21.21
www.crmplus.com         CNAME   cname.vercel-dns.com

# Backend para K8s
api.crmplus.com         A       [K8s LoadBalancer IP]
```

### Passo 2: Backend K8s
```bash
kubectl apply -f infra/k8s/backend-deployment.yaml
kubectl apply -f infra/k8s/redis.yaml

# Ingress apenas para backend
kubectl apply -f infra/k8s/ingress.yaml
```

### Passo 3: Frontend Vercel
```bash
vercel domains add crmplus.com
```

Variáveis de ambiente:
```
NEXT_PUBLIC_API_BASE_URL=https://api.crmplus.com
```

---

## Comandos Úteis

### Verificar DNS
```bash
# Verificar propagação
dig crmplus.com
dig api.crmplus.com

# Verificar de servidor específico
dig @8.8.8.8 crmplus.com
```

### Verificar SSL
```bash
# Status do certificado
curl -vI https://api.crmplus.com 2>&1 | grep -i "subject:\|issuer:\|expire"

# Verificar Kubernetes
kubectl get certificates
kubectl describe certificate crmplus-tls
```

### Logs e Debug
```bash
# Vercel
vercel logs

# Railway
railway logs

# Kubernetes
kubectl logs -f deployment/crmplus-backend
kubectl logs -f deployment/crmplus-frontend
kubectl logs -n cert-manager deployment/cert-manager
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

---

## Configuração para Branch Específico

Para configurar domínio para um branch específico (ex: `staging`):

### Opção 1: Subdomínio Manual
```
staging.crmplus.com     CNAME   cname.vercel-dns.com
api-staging.crmplus.com CNAME   [backend URL]
```

### Opção 2: Preview Automático Vercel
Vercel cria automaticamente:
```
[branch-name]-crmplus.vercel.app
```

### Opção 3: Railway Preview
Railway cria automaticamente:
```
crm-plus-production-[random].up.railway.app
```

Para customizar:
1. Railway Dashboard → Settings → Domains
2. Add Custom Domain → `api-[branch].crmplus.com`

---

## Checklist Rápido

### Antes de Começar
- [ ] Domínio registrado
- [ ] Acesso ao painel DNS
- [ ] Acesso a Vercel/Railway/K8s
- [ ] Repositório configurado

### Durante Configuração
- [ ] DNS configurado
- [ ] Aguardar propagação (5-10 min)
- [ ] Domínio adicionado na plataforma
- [ ] Variáveis de ambiente configuradas
- [ ] SSL verificado

### Após Configuração
- [ ] Frontend acessível via HTTPS
- [ ] Backend acessível via HTTPS
- [ ] CORS funcionando
- [ ] Redirects funcionando
- [ ] Aplicação funcionando end-to-end

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| DNS não resolve | Aguardar até 48h, verificar configuração |
| SSL não funciona | Aguardar emissão (5 min), verificar DNS |
| CORS bloqueado | Verificar `CRMPLUS_CORS_ORIGINS` |
| 404 na API | Verificar serviço rodando, logs |
| 502 Bad Gateway | Verificar backend está up, porta correta |
| Redirect loop | Verificar configuração HTTPS |

---

## Suporte

Para mais detalhes, consulte:
- `docs/domain-setup.md` - Documentação completa
- `docs/deploy-uat.md` - Deploy e UAT
- `infra/k8s/ingress.yaml` - Configuração Kubernetes
- `vercel-domain.json` - Configuração Vercel
