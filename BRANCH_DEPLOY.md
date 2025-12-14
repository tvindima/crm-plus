# 🚀 Deploy do Branch: copilot/create-domain-for-branch

## Domínio de Teste para este Branch

Este branch terá um domínio público próprio para testes reais.

### Opção 1: URL Automática do Vercel (Recomendado para início)

Quando você fizer push deste branch, o Vercel criará automaticamente:

```
https://crm-plus-git-copilot-create-domain-for-branch-[seu-username].vercel.app
```

Esta URL já está disponível e funcional assim que o deploy do Vercel completar.

### Opção 2: Subdomínio Personalizado com Cloudflare

Para um domínio personalizado tipo `test.seudominio.com` ou `branch-test.seudominio.com`:

#### Passo 1: No Cloudflare (DNS)

Adicione um registro CNAME:

```
Type:   CNAME
Name:   test (ou branch-test, staging, etc.)
Target: cname.vercel-dns.com
Proxy:  ✅ Proxied (nuvem laranja ativa)
TTL:    Auto
```

Exemplo completo:
```
test.crmplus.com → cname.vercel-dns.com (Proxied)
```

#### Passo 2: No Vercel Dashboard

1. Vá para seu projeto no Vercel: https://vercel.com/dashboard
2. Selecione o projeto `crm-plus`
3. Vá para **Settings** → **Domains**
4. Clique em **Add Domain**
5. Digite: `test.crmplus.com` (ou seu domínio escolhido)
6. Selecione o branch: `copilot/create-domain-for-branch`
7. Clique **Add**

#### Passo 3: Verificação

O Vercel verificará automaticamente o DNS. Pode levar alguns minutos.

Quando pronto:
- ✅ SSL automático (via Vercel)
- ✅ HTTPS funcionando
- ✅ Deploy automático em cada push

### Configuração Cloudflare (Detalhes)

#### Registros DNS Recomendados

```
# Frontend (este branch)
test.crmplus.com          CNAME   cname.vercel-dns.com   (Proxied ✅)

# Backend (Railway - já existente)
api.crmplus.com           CNAME   crm-plus-production.up.railway.app   (Proxied ✅)
```

#### Configurações Cloudflare SSL/TLS

1. No Cloudflare Dashboard
2. Selecione seu domínio
3. Vá para **SSL/TLS** → **Overview**
4. Modo SSL: **Full (strict)** ✅ (Recomendado)

#### Page Rules (Opcional - para otimização)

```
URL: test.crmplus.com/*
Settings:
  - SSL: Full (Strict)
  - Cache Level: Standard
  - Browser Cache TTL: Respect Existing Headers
```

### URLs Finais

Após configuração completa:

```
Frontend (Branch):  https://test.crmplus.com
Backend (Shared):   https://api.crmplus.com
                    (ou https://crm-plus-production.up.railway.app)
```

### Variáveis de Ambiente no Vercel

Para este branch especificamente, configure no Vercel:

1. Vá para **Settings** → **Environment Variables**
2. Adicione:

```
Variable: NEXT_PUBLIC_API_BASE_URL
Value: https://crm-plus-production.up.railway.app
Environment: Production
Branch: copilot/create-domain-for-branch
```

### Comando Rápido (Vercel CLI)

Se preferir usar CLI:

```bash
# Login no Vercel
vercel login

# Link o projeto (primeira vez)
vercel link

# Adicionar domínio para este branch
vercel domains add test.crmplus.com --scope=copilot/create-domain-for-branch

# Ver status
vercel domains ls

# Deploy manual (se necessário)
vercel --prod
```

### Checklist de Setup

- [ ] Push do código para o branch `copilot/create-domain-for-branch`
- [ ] Deploy automático do Vercel completou
- [ ] URL automática Vercel funcionando
- [ ] (Opcional) Registro CNAME criado no Cloudflare
- [ ] (Opcional) Domínio personalizado adicionado no Vercel
- [ ] (Opcional) Cloudflare SSL em modo Full (Strict)
- [ ] Variável de ambiente `NEXT_PUBLIC_API_BASE_URL` configurada
- [ ] Teste o site: funciona e conecta com a API

### Verificação Rápida

```bash
# Verificar DNS (se usando domínio personalizado)
dig test.crmplus.com

# Deve retornar CNAME para vercel
# com proxy Cloudflare

# Testar HTTPS
curl -I https://test.crmplus.com

# Deve retornar 200 OK com headers do Next.js
```

### Troubleshooting

#### Deploy não aparece
- Verifique que o branch foi pushed: `git push origin copilot/create-domain-for-branch`
- Vá ao Vercel Dashboard → Deployments
- Procure por deployment deste branch

#### Domínio não resolve
- Aguarde propagação DNS (1-5 minutos com Cloudflare)
- Verifique CNAME no Cloudflare: `cname.vercel-dns.com`
- Verifique nuvem laranja está ativa (Proxied)

#### SSL não funciona
- No Cloudflare: SSL/TLS deve estar em "Full (Strict)"
- Aguarde alguns minutos para Vercel emitir certificado
- Limpe cache do Cloudflare se necessário

#### API não conecta
- Verifique variável `NEXT_PUBLIC_API_BASE_URL` no Vercel
- Verifique CORS no backend Railway inclui o novo domínio
- Teste API diretamente: `curl https://crm-plus-production.up.railway.app/docs`

### Estrutura de Branches → Domínios

```
main                              → crmplus.com (produção)
copilot/create-domain-for-branch  → test.crmplus.com (este branch)
staging                           → staging.crmplus.com (staging)
```

### Atualizar CORS no Backend (Railway)

Se usar domínio personalizado, atualize no Railway:

```
CRMPLUS_CORS_ORIGINS=https://test.crmplus.com,https://crmplus.com,http://localhost:3000
```

### Próximos Passos

1. **Agora**: Push este código
   ```bash
   git add .
   git commit -m "Configure domain for branch"
   git push origin copilot/create-domain-for-branch
   ```

2. **Esperar**: Deploy automático Vercel (2-5 min)

3. **Testar**: URL automática Vercel

4. **Configurar** (se quiser domínio custom):
   - DNS no Cloudflare
   - Domínio no Vercel
   - CORS no Railway (se necessário)

5. **Pronto**: Site público para testes!

### Informações Úteis

**Projeto**: CRM PLUS  
**Branch**: copilot/create-domain-for-branch  
**Deploy**: Vercel (automático em cada push)  
**Backend**: https://crm-plus-production.up.railway.app  
**Cloudflare**: Proxy + SSL + Cache  

---

**Nota**: O Vercel já cria automaticamente uma URL para cada branch. O domínio personalizado é opcional mas recomendado para compartilhar com clientes/testers.
