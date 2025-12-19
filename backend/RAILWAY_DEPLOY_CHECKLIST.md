# ✅ RAILWAY DEPLOYMENT - CHECKLIST EXECUTIVO

**Tempo estimado:** 10 minutos  
**Complexidade:** Baixa (apenas configuração visual)  
**Risco:** Zero (não afeta Vercel ou backoffice)

---

## 📋 PASSO A PASSO (Copy/Paste Ready)

### PASSO 1: Aceder Railway (1 min)

1. Abrir: **https://railway.com/login**
2. Login com GitHub (botão azul)
3. **Selecionar projeto** onde está PostgreSQL do backoffice

---

### PASSO 2: Criar Service Mobile API (2 min)

1. **Clicar botão "+ New"** (canto superior direito)
2. **Selecionar "GitHub Repo"**
3. **Configurar:**
   - Repository: `tvindima/crm-plus` (ou teu username GitHub)
   - **Branch:** `feat/mobile-backend-app` ⚠️ CRÍTICO
   - Service Name: `mobile-api`
4. **Clicar "Deploy"**

Railway vai detectar Dockerfile automaticamente ✅

---

### PASSO 3: Configurar Root Directory (30 seg)

⚠️ **IMPORTANTE:** Backend está em subdirectório

1. **Clicar no service `mobile-api`** (acabou de criar)
2. **Tab "Settings"**
3. **Scroll até "Root Directory"**
4. **Definir:** `backend`
5. **Save Changes**

---

### PASSO 4: Adicionar Variáveis de Ambiente (3 min)

1. **Ainda no service `mobile-api`**
2. **Tab "Variables"**
3. **Clicar "New Variable"** e adicionar TODAS:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
CRMPLUS_AUTH_SECRET=change_me_crmplus_secret
CLOUDINARY_CLOUD_NAME=dtpk4oqoa
CLOUDINARY_API_KEY=857947842586369
CLOUDINARY_API_SECRET=YPqbqy_A-AdI6HyzFhYTe46cde4
CORS_ORIGINS=*
ENVIRONMENT=production
PORT=8000
```

💡 **DICA:** Se PostgreSQL está no mesmo projeto Railway:
- Usar `${{Postgres.DATABASE_URL}}` (Railway resolve automaticamente)
- Caso contrário, copiar URL manual do backoffice

4. **Save Variables**

---

### PASSO 5: Configurar Health Check (1 min)

1. **Tab "Settings"** (ainda no service mobile-api)
2. **Scroll até "Health Check"**
3. **Configurar:**
   - Path: `/health`
   - Timeout: `120` segundos
4. **Save**

---

### PASSO 6: Trigger Deployment (Automático)

Railway já iniciou deployment quando criaste o service.

**Monitorar progresso:**
1. **Tab "Deployments"** 
2. **Clicar no deployment mais recente** (top da lista)
3. **Ver logs em tempo real:**

Logs esperados (success):
```
✓ Cloning repository...
✓ Building Docker image...
✓ Installing Python dependencies...
✓ Running: alembic upgrade head
✓ Migration successful
✓ Starting uvicorn server...
✓ Health check passed (/health → 200 OK)
✓ Deployment complete!
```

**Tempo:** 3-5 minutos

---

### PASSO 7: Obter URL Produção (30 seg)

Após deployment success:

1. **Tab "Settings"** (service mobile-api)
2. **Section "Domains"**
3. **Copiar URL gerada:**
   ```
   https://crm-plus-mobile-production.up.railway.app
   ```
   (nome pode variar - copiar o que aparecer)

---

### PASSO 8: Validar Backend (2 min)

**Teste 1 - Health Check:**
```bash
curl https://SEU_URL_RAILWAY/health
```

Esperado:
```json
{"service":"CRM PLUS API","status":"ok","timestamp":"..."}
```

✅ **Sucesso:** Backend está up

---

**Teste 2 - Login:**
```bash
curl -X POST https://SEU_URL_RAILWAY/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"testepassword123"}'
```

Esperado (200 OK):
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_at": "..."
}
```

✅ **Sucesso:** Autenticação funcional com dados PostgreSQL

❌ **Se retornar 401:** Credenciais incorretas (ok, testa com user que existe)  
❌ **Se retornar 500 SQLAlchemy:** Problema no deployment (ver logs Railway)

---

### PASSO 9: Atualizar Mobile App (1 min)

**No teu Mac:**

```bash
cd /Users/tiago.vindima/Desktop/CRM\ PLUS/mobile/app

# Atualizar .env
echo "EXPO_PUBLIC_API_BASE_URL=https://SEU_URL_RAILWAY" > .env

# Reiniciar Expo
pkill -9 -f "expo"
npx expo start --clear

# Abrir simulador (press 'i')
```

---

### PASSO 10: Testar Login na App (1 min)

1. App abre no simulador
2. **Login com:**
   - Email: `tvindima@imoveismais.pt`
   - Password: `testepassword123`
3. **Clicar "Entrar"**

**Expected:**
- ✅ Loading spinner
- ✅ Request para Railway URL
- ✅ Redirect para Dashboard
- ✅ Dashboard carrega métricas PostgreSQL REAIS

**Console deve mostrar:**
```
[AUTH] Iniciando login com: tvindima@imoveismais.pt
[AUTH] Response status: 200
[AUTH] ✅ Login real bem-sucedido!
[DASHBOARD] ✅ Todos os dados carregados com sucesso
```

---

## ✅ CHECKLIST FINAL

Marca quando completares cada passo:

- [ ] Aceder Railway dashboard
- [ ] Criar service `mobile-api` do GitHub repo
- [ ] Configurar branch `feat/mobile-backend-app`
- [ ] Definir root directory `backend`
- [ ] Adicionar 8 variáveis de ambiente
- [ ] Configurar health check `/health` timeout 120s
- [ ] Aguardar deployment (3-5 min)
- [ ] Copiar URL Railway gerada
- [ ] Testar `curl /health` → 200 OK
- [ ] Testar `curl /auth/login` → 200 OK com tokens
- [ ] Atualizar `mobile/app/.env` com URL Railway
- [ ] Reiniciar Expo com `--clear`
- [ ] Testar login na app → Dashboard carrega dados reais
- [ ] ✅ **PASSO 1 VALIDADO EM PRODUÇÃO**

---

## 🆘 SE ALGO FALHAR

### Deployment Failed

**Ver logs:**
- Tab "Deployments" → Deployment falhado → Scroll logs

**Erros comuns:**
- `requirements.txt not found` → Root directory errado (deve ser `backend`)
- `alembic.ini not found` → Commit não foi pushed (fazer `git push`)
- `DATABASE_URL invalid` → Variável ambiente incorreta (verificar PostgreSQL URL)

### Health Check Failed

**Aumentar timeout:**
- Settings → Health Check → Timeout = `180` segundos
- Migrations podem demorar se há muitos dados

### Login Retorna 500 SQLAlchemy

**Causa:** Branch errado deployado

**Solução:**
- Settings → Source → Branch = `feat/mobile-backend-app`
- Trigger redeploy

---

## 📞 APÓS DEPLOYMENT SUCCESS

**Comunicar frontend team:**

```
Subject: ✅ Backend Mobile DEPLOYED - Railway Production

URL Produção: https://SEU_URL_RAILWAY

Testes validados:
✅ Health check: OK
✅ Login: OK (tokens retornados)
✅ Dashboard: OK (dados PostgreSQL)

Ações frontend:
1. Update .env: EXPO_PUBLIC_API_BASE_URL=https://SEU_URL_RAILWAY
2. Restart Expo
3. Test login
4. Validate PASSO 1

Backend 100% funcional e estável! 🚀
```

---

## 🎯 RESULTADO ESPERADO

**ANTES (Vercel bloqueado):**
- ❌ Login → 500 SQLAlchemy error
- ❌ Dashboard → Não carrega
- ❌ Desenvolvimento mobile → Parado

**DEPOIS (Railway deployed):**
- ✅ Login → 200 OK com JWT tokens
- ✅ Dashboard → Métricas PostgreSQL reais
- ✅ Desenvolvimento mobile → Desbloqueado PASSO 2-8
- ✅ Produção estável com HTTPS
- ✅ Auto-deploy configurado (próximos commits)

---

**TEMPO TOTAL:** ~10 minutos  
**BLOQUEIO RESOLVIDO:** 100%  
**PRÓXIMO PASSO:** Validar PASSO 1 e avançar PASSO 2-3

**LET'S GO! 🚀**
