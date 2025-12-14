# ⚡ START HERE - Link Público para Testes

## O que você precisa fazer (2 opções)

### 🎯 Opção 1: URL Automática (0 minutos - JÁ FUNCIONA!)

Assim que o Vercel terminar o deploy deste branch, você terá automaticamente uma URL tipo:

```
https://crm-plus-git-copilot-create-domain-tvindima.vercel.app
```

**Como encontrar a URL:**
1. Vá para https://vercel.com/dashboard
2. Clique no projeto `crm-plus`
3. Vá em "Deployments"
4. Procure o deployment do branch `copilot/create-domain-for-branch`
5. Clique e copie a URL

**Pronto! Compartilhe essa URL para testes.** ✅

---

### 🌐 Opção 2: Domínio Personalizado (10 minutos)

Para ter `test.crmplus.com` (ou outro subdomínio):

#### No Cloudflare:
```
DNS → Add Record:
  Type:    CNAME
  Name:    test
  Target:  cname.vercel-dns.com
  Proxy:   🟠 ON (ativa a nuvem laranja)
```

#### No Vercel:
```
Settings → Domains → Add:
  Domain: test.crmplus.com
  Branch: copilot/create-domain-for-branch
```

#### Aguarde 5 minutos → Acesse: `https://test.crmplus.com` ✅

---

## Isso é tudo! 🎉

Mais detalhes (se precisar):
- **[SETUP_RAPIDO.md](SETUP_RAPIDO.md)** - Guia visual completo
- **[BRANCH_DEPLOY.md](BRANCH_DEPLOY.md)** - Troubleshooting
- **[CLOUDFLARE_SETUP.md](CLOUDFLARE_SETUP.md)** - Configurações avançadas

---

**Dica**: Use a Opção 1 primeiro para testar rápido. Depois configure o domínio personalizado se quiser uma URL mais bonita.
