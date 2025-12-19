# 🔴 BLOQUEADOR CRÍTICO: Erro SQLAlchemy no Backend Mobile

**Data:** 18 de dezembro de 2025  
**Prioridade:** CRÍTICA - Sistema mobile 100% bloqueado  
**Branch:** `feat/mobile-backend-app`  
**Deployment:** Vercel (https://appmobile-e5yu401gp-toinos-projects.vercel.app)

---

## 📋 SUMÁRIO EXECUTIVO

O backend mobile está **completamente bloqueado** devido a erro de inicialização SQLAlchemy. Qualquer request que toque na database (incluindo `/auth/login`) falha com erro 500.

**Root Cause Identificada:** Inconsistência nos nomes de relacionamento entre modelos `Visit` e `Lead`

**Fix Aplicado:** ✅ Commit `b6fcd4b` + `05d4ff6` no GitHub  
**Status Deploy:** ❌ Vercel NÃO está a aplicar o fix (possível cache/webhook issue)

---

## 🐛 ERRO COMPLETO

### Stack Trace do Vercel

```python
sqlalchemy.exc.InvalidRequestError: One or more mappers failed to initialize - 
can't proceed with initialization of other mappers. 
Triggering mapper: 'Mapper[Lead(leads)]'. 
Original exception was: Mapper 'Mapper[Visit(visits)]' has no property 'lead'.  
If this property was indicated from other mappers or configure events, 
ensure registry.configure() has been called.
```

### Call Stack
```
File "/var/task/app/api/v1/auth.py", line 41, in login
  user = authenticate_user(db, payload.email, payload.password)
File "/var/task/app/users/services.py", line 113, in authenticate_user
  user = get_user_by_email(db, email)
File "/var/task/app/users/services.py", line 22, in get_user_by_email
  return db.query(models.User).filter(models.User.email == email.lower()).first()
  # ↑ Falha aqui ao inicializar mappers SQLAlchemy
```

### Reprodução
```bash
curl -X POST https://appmobile-e5yu401gp-toinos-projects.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"testepassword123"}'

# Response: 500 Internal Server Error
```

---

## 🔍 ANÁLISE TÉCNICA

### O Problema (ANTES do fix)

**Ficheiro:** `backend/app/models/visit.py` (linha 87)
```python
class Visit(Base):
    # ... outros campos ...
    
    # Relationships
    property_obj = relationship("Property", back_populates="visits")
    lead_obj = relationship("Lead", back_populates="visits")  # ← Usa "visits"
    agent_obj = relationship("Agent", back_populates="visits")
```

**Ficheiro:** `backend/app/leads/models.py` (linha 60 - BUGADO)
```python
class Lead(Base):
    # ... outros campos ...
    
    property = relationship("Property", foreign_keys=[property_id])
    tasks = relationship("Task", back_populates="lead", foreign_keys="Task.lead_id")
    visits = relationship("Visit", back_populates="lead")  # ← ❌ ERRADO! Devia ser "lead_obj"
```

### Por que falha?

SQLAlchemy valida relacionamentos bidirecionais:
- `Visit.lead_obj` declara `back_populates="visits"`
- `Lead.visits` declara `back_populates="lead"` ← procura propriedade `Visit.lead` que NÃO EXISTE
- Mapper initialization fails porque não encontra `Visit.lead`

### O Fix Aplicado

**Commit:** `b6fcd4b` - "fix: corrigir relacionamento Visit.lead_obj no modelo Lead"

**Mudança em:** `backend/app/leads/models.py` (linha 60)
```python
# ANTES (bugado):
visits = relationship("Visit", back_populates="lead")

# DEPOIS (correto):
visits = relationship("Visit", back_populates="lead_obj")
```

**Validação Local:**
```bash
cd backend
cat app/leads/models.py | grep -A 2 "visits = relationship"
# Output: visits = relationship("Visit", back_populates="lead_obj") ✅
```

---

## 📊 ESTADO DO DEPLOYMENT

### Git Status

```bash
git log --oneline -3
# 05d4ff6 (HEAD -> feat/mobile-backend-app) chore: force redeploy to Vercel
# b6fcd4b fix: corrigir relacionamento Visit.lead_obj no modelo Lead
# d9de650 feat(mobile): implementar refresh token, POST leads, GET visits/upcoming
```

✅ Fix commitado e pushed para GitHub  
✅ Branch `feat/mobile-backend-app` atualizado no origin  
❌ Vercel continua a servir código ANTIGO (bugado)

### Teste Vercel (21:43 - AINDA BUGADO)

```bash
curl -s "https://appmobile-e5yu401gp-toinos-projects.vercel.app/auth/login" \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' | head -20

# Response ainda mostra erro antigo:
# "Mapper 'Mapper[Visit(visits)]' has no property 'lead'"
#                                                    ^^^^
# Se o fix estivesse deployed, diria "lead_obj"
```

---

## 🚨 BLOQUEADORES IDENTIFICADOS

### 1. Vercel Webhook/Deploy Issue

**Evidência:**
- 2 commits pushed (b6fcd4b às 21:38, 05d4ff6 às 21:43)
- Passaram 5+ minutos desde primeiro push
- Vercel ainda serve código antigo
- Request direto ao endpoint confirma erro original

**Possíveis Causas:**
- [ ] Webhook do GitHub não disparou
- [ ] Deploy stuck/failed silenciosamente
- [ ] Cache agressivo no Vercel (layer/build cache)
- [ ] Branch `feat/mobile-backend-app` não está configurado para auto-deploy
- [ ] Vercel está a deployar de outro branch (ex: `main`)

### 2. Configuração Vercel Deployment

**Verificar:**
- Qual branch o projeto Vercel está a deployar?
- Auto-deploy está ativo para `feat/mobile-backend-app`?
- Últimos deployments no dashboard Vercel - qual foi o trigger?
- Logs de build do Vercel - mostram o commit correto?

---

## ✅ SOLUÇÕES PROPOSTAS

### Opção 1: Verificar Dashboard Vercel (PRIORITÁRIA)

1. Aceder https://vercel.com/dashboard
2. Navegar para projeto `appmobile` (ou nome similar)
3. Verificar:
   - Últimos deployments: commit hash, status, timestamp
   - Settings → Git: branch configurado para deploy
   - Se deployment falhou, ver logs completos
4. Se necessário: Trigger manual deployment de `feat/mobile-backend-app`

### Opção 2: Force Redeploy via Vercel CLI

```bash
cd backend
npm install -g vercel  # se ainda não tiver
vercel --prod --force
```

### Opção 3: Merge para Main (se Vercel só deploya main)

```bash
cd backend
git checkout main
git pull origin main
git merge feat/mobile-backend-app
git push origin main
# Vercel vai deployar automaticamente se configurado para main
```

### Opção 4: Deploy Manual Railway/Alternativa

Se Vercel continuar com problemas, considerar:
- Deploy backend no Railway (já tem PostgreSQL lá)
- Ou usar Render/Fly.io temporariamente
- Atualizar `API_BASE_URL` no mobile para novo endpoint

---

## 📝 VALIDAÇÃO PÓS-DEPLOY

Quando o fix estiver deployed, validar com:

### Teste 1: Health Check
```bash
curl https://appmobile-e5yu401gp-toinos-projects.vercel.app/health
# Expected: {"service":"CRM PLUS API","status":"ok","timestamp":"..."}
```

### Teste 2: Login com Credenciais Válidas
```bash
curl -X POST https://appmobile-e5yu401gp-toinos-projects.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"testepassword123"}'

# Expected: 200 OK
# {
#   "access_token": "eyJ...",
#   "refresh_token": "eyJ...",
#   "token_type": "bearer",
#   "expires_at": "2025-12-18T22:38:00"
# }
```

### Teste 3: Login com Credenciais Inválidas
```bash
curl -X POST https://appmobile-e5yu401gp-toinos-projects.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"wrong"}'

# Expected: 401 Unauthorized
# {"detail":"Email ou password incorretos"}
# (NÃO erro 500 SQLAlchemy)
```

---

## 🔄 IMPACTO NO MOBILE

### Estado Atual
- ❌ Login bloqueado (erro SQLAlchemy)
- ❌ Dashboard não carrega (sem autenticação)
- ❌ Todas as features PASSO 1 bloqueadas
- ⏸️ Desenvolvimento mobile parado até fix deployed

### Pós-Fix (Expected)
- ✅ Login funcional com JWT real
- ✅ Dashboard carrega dados PostgreSQL
- ✅ Pode prosseguir para PASSO 2-8
- ✅ Testes end-to-end mobile ↔ backend

---

## 📌 PRÓXIMOS PASSOS

### Para Backend Dev Team:

1. **URGENTE:** Verificar dashboard Vercel
   - Por que deployment não está a acontecer?
   - Branch correto configurado?
   - Logs de erro no build?

2. **Após identificar causa:** Deployar `feat/mobile-backend-app`
   - Seja via Vercel dashboard (manual trigger)
   - Seja via CLI
   - Seja via merge para `main` (se for esse o branch de deploy)

3. **Validar:** Testar endpoints acima para confirmar fix

4. **Comunicar:** Avisar mobile team quando estiver deployed

### Para Mobile Dev Team:

1. Aguardar confirmação backend deployment
2. Reload app no simulador (Cmd+R)
3. Testar login com `tvindima@imoveismais.pt / testepassword123`
4. Se sucesso: ✅ Prosseguir PASSO 1 validação
5. Se falhar: Reportar novo erro (se for diferente)

---

## 📎 ANEXOS

### Ficheiros Afetados

```
backend/app/leads/models.py          # FIX APLICADO ✅
backend/app/models/visit.py          # Já estava correto
backend/app/api/v1/auth.py          # Endpoint que falha
backend/app/users/services.py       # Onde SQLAlchemy inicializa
```

### Commits Relevantes

- `05d4ff6` - chore: force redeploy to Vercel (21:43)
- `b6fcd4b` - fix: corrigir relacionamento Visit.lead_obj no modelo Lead (21:38)
- `d9de650` - feat(mobile): implementar refresh token, POST leads, GET visits/upcoming

### Logs Timestamp

- **21:38** - Primeiro commit + push do fix
- **21:40** - Primeiro teste login (ainda erro antigo)
- **21:43** - Force commit para trigger Vercel
- **21:44** - Ainda a servir código antigo (este relatório)

---

## 🆘 CONTACTOS

**Mobile Team:**  
- Tiago Vindima (tvindima@imoveismais.pt)

**Backend Team:**  
- [Preencher contactos]

**Infraestrutura:**  
- Vercel Project: [Preencher link dashboard]
- Railway Database: [Já configurado]

---

**FIM DO RELATÓRIO**

*Última atualização: 18/12/2025 21:44*
