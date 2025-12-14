# 🌐 Setup Domínio Público - Branch de Testes

## ✅ Passos Simples para Ter um Link Público

### Opção A: URL Automática (Mais Rápido - 5 minutos)

Quando você fizer push deste branch, o Vercel cria automaticamente uma URL tipo:
```
https://crm-plus-git-copilot-create-domain-tvindima.vercel.app
```

**Não precisa fazer nada!** A URL já funciona assim que o deploy terminar.

---

### Opção B: Domínio Personalizado (Recomendado - 10 minutos)

Para ter uma URL bonita tipo `test.crmplus.com`:

#### 1️⃣ No Cloudflare (DNS)

Entre em: https://dash.cloudflare.com

```
┌─────────────────────────────────────────┐
│ DNS → Records → Add record              │
├─────────────────────────────────────────┤
│ Type:     CNAME                         │
│ Name:     test                          │
│ Target:   cname.vercel-dns.com          │
│ Proxy:    🟠 ON (nuvem laranja ativa)   │
│ TTL:      Auto                          │
└─────────────────────────────────────────┘
```

Clique **Save**

#### 2️⃣ No Vercel (Domínio)

Entre em: https://vercel.com/dashboard

1. Clique no projeto **crm-plus**
2. Vá em **Settings** (menu lateral)
3. Vá em **Domains** (menu lateral)
4. Clique **Add**
5. Digite: `test.crmplus.com`
6. Clique **Add**
7. Quando perguntar "assign to branch", escolha: `copilot/create-domain-for-branch`

#### 3️⃣ Pronto! 🎉

Aguarde 2-5 minutos e acesse: **https://test.crmplus.com**

---

## 📋 Configurações Necessárias

### Cloudflare SSL (Importante!)

No Cloudflare:
1. Vá em **SSL/TLS** (menu lateral)
2. Escolha: **Full (strict)** ✅
3. Ative: **Always Use HTTPS** ✅

### Vercel - Variável de Ambiente

No Vercel, configure para este branch:
```
Nome:      NEXT_PUBLIC_API_BASE_URL
Valor:     https://crm-plus-production.up.railway.app
Ambiente:  Production
Branch:    copilot/create-domain-for-branch
```

### Backend - CORS (Railway)

No Railway, adicione ao `CRMPLUS_CORS_ORIGINS`:
```
https://test.crmplus.com,https://crm-plus-production.up.railway.app
```

---

## 🧪 Como Testar

```bash
# Ver se DNS está OK
dig test.crmplus.com

# Testar site
curl -I https://test.crmplus.com

# Deve retornar: 200 OK
```

Ou simplesmente abra no navegador: **https://test.crmplus.com**

---

## ❓ Problemas Comuns

### "Site não encontrado"
- ✅ Aguarde 5 minutos (DNS propagando)
- ✅ Verifique CNAME no Cloudflare
- ✅ Verifique domínio adicionado no Vercel

### "Erro SSL" ou "Não seguro"
- ✅ Cloudflare SSL em "Full (strict)"
- ✅ Aguarde 2-3 minutos (certificado gerando)
- ✅ Limpe cache do navegador

### "API não conecta"
- ✅ Variável `NEXT_PUBLIC_API_BASE_URL` configurada no Vercel
- ✅ CORS atualizado no Railway
- ✅ Backend está funcionando: https://crm-plus-production.up.railway.app/docs

---

## 📝 Resumo Visual

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  1. Cloudflare DNS                                   │
│     test.crmplus.com → cname.vercel-dns.com          │
│                                                      │
│  2. Vercel                                           │
│     Add domain: test.crmplus.com                     │
│     Branch: copilot/create-domain-for-branch         │
│                                                      │
│  3. Aguardar 2-5 minutos                             │
│                                                      │
│  4. ✅ https://test.crmplus.com ONLINE!              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 URLs Finais

Depois de configurar:

```
Frontend (Branch):  https://test.crmplus.com
Backend (API):      https://crm-plus-production.up.railway.app
Docs API:           https://crm-plus-production.up.railway.app/docs
```

---

## 🔗 Links Úteis

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app
- **Verificar DNS**: https://www.whatsmydns.net

---

## ⚡ Comandos Rápidos (Opcional)

Se preferir usar terminal:

```bash
# Push do código
git push origin copilot/create-domain-for-branch

# Adicionar domínio via CLI Vercel
vercel login
vercel domains add test.crmplus.com

# Ver status
vercel domains ls
```

---

**Branch**: `copilot/create-domain-for-branch`  
**Domínio Sugerido**: `test.crmplus.com`  
**Tempo Total**: ~10 minutos  
**Dificuldade**: ⭐⭐ Fácil
