# Domínios por Ambiente - CRM PLUS

## Desenvolvimento (Local)
```
Frontend:  http://localhost:3000
Backend:   http://localhost:8000
Database:  localhost:5432
Redis:     localhost:6379
```

### Variáveis de Ambiente
**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
```

**Backend** (`.env`):
```env
DATABASE_URL=postgresql+psycopg2://crmplus:crmplus@localhost:5432/crmplus
REDIS_URL=redis://localhost:6379/0
CRMPLUS_CORS_ORIGINS=http://localhost:3000,http://localhost:3001
JWT_SECRET=dev-secret-change-in-production
```

---

## Staging/UAT
```
Frontend:  https://staging.crmplus.com
Backend:   https://api-staging.crmplus.com
```

### DNS
```
staging.crmplus.com         CNAME   cname.vercel-dns.com
api-staging.crmplus.com     CNAME   crm-plus-staging.up.railway.app
```

### Variáveis de Ambiente
**Frontend** (Vercel):
```env
NEXT_PUBLIC_API_BASE_URL=https://api-staging.crmplus.com
NODE_ENV=production
```

**Backend** (Railway):
```env
DATABASE_URL=postgresql+psycopg2://user:pass@staging-db:5432/crmplus_staging
REDIS_URL=redis://staging-redis:6379/0
CRMPLUS_CORS_ORIGINS=https://staging.crmplus.com,http://localhost:3000
JWT_SECRET=[secret-key-staging]
ENVIRONMENT=staging
```

---

## Produção
```
Frontend:  https://crmplus.com
           https://www.crmplus.com
Backend:   https://api.crmplus.com
```

### DNS
```
crmplus.com             A       76.76.21.21
www.crmplus.com         CNAME   cname.vercel-dns.com
api.crmplus.com         CNAME   crm-plus-production.up.railway.app
```

### Variáveis de Ambiente
**Frontend** (Vercel):
```env
NEXT_PUBLIC_API_BASE_URL=https://api.crmplus.com
NODE_ENV=production
```

**Backend** (Railway):
```env
DATABASE_URL=postgresql+psycopg2://user:pass@prod-db:5432/crmplus_prod
REDIS_URL=redis://prod-redis:6379/0
CRMPLUS_CORS_ORIGINS=https://crmplus.com,https://www.crmplus.com
JWT_SECRET=[secure-secret-key-prod]
ENVIRONMENT=production
```

---

## Preview/Branch Deploys

### Vercel Preview Automático
Para cada PR/branch, Vercel cria:
```
https://crm-plus-[hash].vercel.app
https://crm-plus-[branch-name].vercel.app
```

### Railway Preview
Para cada branch, Railway pode criar:
```
https://crm-plus-[branch]-[hash].up.railway.app
```

### Custom Branch Domains
Para domínio personalizado por branch:
```
[branch-name].crmplus.com         CNAME   cname.vercel-dns.com
api-[branch-name].crmplus.com     CNAME   crm-plus-[branch].up.railway.app
```

---

## Wildcard Domains (Opcional)

Para suportar múltiplos subdomínios automaticamente:

### DNS
```
*.crmplus.com           A       [LoadBalancer IP]
```

### Kubernetes Ingress
```yaml
spec:
  tls:
    - hosts:
        - "*.crmplus.com"
      secretName: wildcard-tls
  rules:
    - host: "*.crmplus.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: crmplus-frontend
                port:
                  number: 80
```

---

## Multi-Região (Opcional)

Para deploy em múltiplas regiões:

### Europa
```
eu.crmplus.com          A       [EU LoadBalancer IP]
api-eu.crmplus.com      A       [EU LoadBalancer IP]
```

### América
```
us.crmplus.com          A       [US LoadBalancer IP]
api-us.crmplus.com      A       [US LoadBalancer IP]
```

### Ásia
```
asia.crmplus.com        A       [ASIA LoadBalancer IP]
api-asia.crmplus.com    A       [ASIA LoadBalancer IP]
```

---

## CDN e Cache

### Cloudflare (Recomendado)
1. Apontar nameservers para Cloudflare
2. Configurar DNS no Cloudflare
3. Ativar proxy (nuvem laranja) para cache
4. Configurar regras de cache:
   - `/api/*` → bypass cache
   - `/static/*` → cache tudo
   - `/` → cache com revalidação

### Vercel Edge Network
Vercel já inclui CDN global automático.

---

## Backup e Disaster Recovery

### DNS Secundário
Configure DNS secundário para redundância:
```
crmplus.com             A       [Primary IP]
crmplus.com             A       [Secondary IP]
```

### Failover
Use healthchecks e failover automático:
```
api.crmplus.com         A       [Primary IP]    (TTL: 60)
                        A       [Backup IP]     (weight: 0)
```

---

## Monitoramento

### Uptime Checks
Configure checks em:
- https://crmplus.com
- https://api.crmplus.com/health

### SSL Monitoring
Monitorar expiração de certificados:
```bash
# Vercel/Railway renovam automaticamente
# Para K8s, cert-manager renova automaticamente

# Verificar manualmente
curl -vI https://api.crmplus.com 2>&1 | grep expire
```

### DNS Monitoring
Verificar propagação e resolução:
- https://www.whatsmydns.net
- https://dnschecker.org

---

## Segurança

### HTTPS Only
- Todos os ambientes devem usar HTTPS
- Configurar redirect HTTP → HTTPS
- HSTS headers habilitados

### CORS
- Listar apenas domínios necessários
- Nunca usar `*` em produção
- Incluir protocolo e porta

### Rate Limiting
Configurar no Ingress/Load Balancer:
```yaml
nginx.ingress.kubernetes.io/limit-rps: "100"
nginx.ingress.kubernetes.io/limit-connections: "50"
```

---

## Custos Estimados

### Vercel
- Hobby: Grátis (domínio customizado incluído)
- Pro: $20/mês (mais recursos)

### Railway
- Free: $5 crédito/mês
- Developer: $5/mês + uso
- Production: ~$20-50/mês dependendo do uso

### Kubernetes (Cloud)
- DigitalOcean: $12/mês (básico)
- GKE/EKS: $70-100/mês (mínimo)

### Domínio
- .com: $10-15/ano
- SSL: Grátis (Let's Encrypt)
