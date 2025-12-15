# 🚀 Deploy Backoffice - Guia Rápido

## ⚠️ Pré-requisitos CRÍTICOS

### 1. Backend Railway DEVE estar online
**Status atual:** ❌ OFFLINE (erro 502)

Antes de fazer deploy do backoffice, **RESOLVER PRIMEIRO**:
- [ ] Verificar logs do Railway
- [ ] Reiniciar serviço no Railway
- [ ] Testar: `curl https://crm-plus-production.up.railway.app/auth/login`
- [ ] Deve retornar 405 (Method Not Allowed) e NÃO 502

---

## 📋 Checklist de Deploy Vercel

### Passo 1: Configurar Variável de Ambiente
1. Ir a: [Vercel Dashboard](https://vercel.com)
2. Selecionar projeto do backoffice
3. Settings → Environment Variables
4. Adicionar:
   ```
   Nome: NEXT_PUBLIC_API_BASE_URL
   Valor: https://crm-plus-production.up.railway.app
   Environments: Production, Preview, Development
   ```
5. Clicar **Save**

### Passo 2: Trigger Redeploy
**Opção A - Via Dashboard:**
1. Deployments → último deploy
2. Menu ⋮ → Redeploy
3. ✅ Use existing Build Cache (mais rápido)
4. Clicar **Redeploy**

**Opção B - Via Git Push:**
```bash
cd /Users/tiago.vindima/Desktop/CRM\ PLUS
git add frontend/backoffice/.env.example frontend/backoffice/README.md
git commit -m "docs(backoffice): update env config and deployment guide"
git push origin main
```

### Passo 3: Verificar Build
1. Aguardar build completar (~2-3 min)
2. Ver logs no Vercel
3. Procurar por:
   ```
   ✓ Creating an optimized production build
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ```

### Passo 4: Testar Login
1. Abrir URL do backoffice (ex: `https://backoffice-crmplus.vercel.app`)
2. Ir para `/backoffice/login`
3. Testar credenciais:
   - Email: `tvindima@imoveismais.pt`
   - Password: `testepassword123`
4. **Deve funcionar SE backend Railway estiver online**

---

## ❌ Troubleshooting

### Erro: "Falha na autenticação"
**Causa:** Backend Railway offline (502)
**Solução:** 
1. Verificar Railway: https://railway.app
2. Ver logs do serviço
3. Reiniciar se necessário

### Erro: "NEXT_PUBLIC_API_BASE_URL is not defined"
**Causa:** Variável de ambiente não configurada no Vercel
**Solução:** Repetir Passo 1 acima

### Login funciona mas dashboard vazio
**Causa:** Backend retorna 502 para endpoints de dados
**Solução:** Mesmo que auth funcione, outros endpoints precisam estar online

---

## 🔄 Desenvolvimento Local

Para testar localmente ANTES de fazer deploy:

```bash
# Terminal 1 - Backend
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Backoffice
cd frontend/backoffice
npm install
npm run dev
# Acessar: http://localhost:3000/backoffice/login
```

**Credenciais locais (mesmas que produção):**
- Email: `tvindima@imoveismais.pt`
- Password: `testepassword123`

---

## 📝 Commits Recentes

Arquivos alterados para este deploy:
- `frontend/backoffice/.env.example` - URL do backend atualizada
- `frontend/backoffice/README.md` - Instruções de setup adicionadas
- `BACKOFFICE_DEPLOY.md` - Este guia criado

---

**Status:** ⏳ Pronto para deploy assim que backend Railway estiver online
