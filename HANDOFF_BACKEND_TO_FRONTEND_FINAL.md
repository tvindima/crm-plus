# 🚨 HANDOFF CRÍTICO: Gaps Bloqueantes para Mobile App - Frontend → Backend

**Data:** 18 de Dezembro de 2024  
**De:** Frontend Mobile Dev Team  
**Para:** Backend Dev Team  
**Status:** 🔴 **3 BLOQUEADORES CRÍTICOS - REQUER IMPLEMENTAÇÃO URGENTE**

---

## 🚨 RESUMO EXECUTIVO

A **análise do handoff inicial** revelou **3 gaps críticos** que **bloqueiam o desenvolvimento** do Mobile App:

1. ❌ **Refresh Token** - Sessões persistentes (BLOQUEADOR) ⏰ **4h dev**
2. ❌ **POST /mobile/leads** - Criar leads em campo (BLOQUEADOR) ⏰ **1h dev**
3. ❌ **GET /mobile/visits/upcoming** - Widget próximas visitas (IMPORTANTE) ⏰ **30min dev**

**Impacto:** Frontend Mobile **NÃO pode avançar** sem estes endpoints.  
**Urgência:** **MÁXIMA** - MVP launch 15/01/2025 em risco.

---

## 🔴 ENDPOINTS NECESSÁRIOS (BLOQUEADORES)

### 1. Sistema de Refresh Token - **BLOQUEADOR CRÍTICO**

**Problema Atual:**  
Endpoint `POST /auth/login` **NÃO retorna refresh token**. Sessões expiram em 1h, forçando re-login constante (UX péssima).

**Solução Necessária:**  
Novo endpoint `POST /auth/mobile/login` que retorna **access_token + refresh_token**.

#### **SPEC: POST /auth/mobile/login**
```http
POST /auth/mobile/login
Content-Type: application/json

Request:
{
  "email": "agente@imoveismais.pt",
  "password": "senha123"
}

Response ESPERADA:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "kJ8x_9mPqL3vN2wRtY5sZ7...",  // ← NOVO
  "token_type": "bearer",
  "expires_at": "2024-12-19T18:00:00Z"
}
```

**Requisitos Backend:**
- ❌ Access token deve expirar em **24 horas** (atualmente 60min)
- ❌ Refresh token deve expirar em **7 dias**
- ❌ JWT deve incluir `agent_id` no payload
- ❌ Armazenar `device_info` (User-Agent) no database

#### **SPEC: POST /auth/refresh**
```http
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refresh_token": "kJ8x_9mPqL3vN2wRtY5sZ7..."
}

Response ESPERADA:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",  // Novo token
  "refresh_token": "aB4c_5dEfG6hI7jK8lM9nO...",  // Novo refresh token (rotation)
  "token_type": "bearer",
  "expires_at": "2024-12-20T18:00:00Z"
}
```

**Requisitos de Segurança Backend:**
- ❌ **Token Rotation** - Refresh token antigo DEVE ser revogado
- ❌ Validar expiração do refresh token
- ❌ Validar se token não foi revogado
- ❌ Validar se user ainda está ativo

**Requisitos Database:**
- ❌ Criar tabela `refresh_tokens` (campos: id, token, user_id, device_info, expires_at, is_revoked, created_at)
- ❌ Criar migration Alembic
- ❌ Índices: token (unique), user_id, expires_at

---

### 2. Criar Lead em Campo - **BLOQUEADOR CRÍTICO**

**Problema Atual:**  
Endpoint `POST /mobile/leads` **NÃO existe**. Agentes não conseguem criar leads durante visitas em campo.

#### **SPEC: POST /mobile/leads**
```http
POST /mobile/leads
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "Maria Silva",
  "email": "maria@email.com",
  "phone": "912345678",
  "source": "phone_call",
  "notes": "Interessada em T3 até 300k"
}

Response ESPERADA: 201 Created
{
  "id": 123,
  "name": "Maria Silva",
  "email": "maria@email.com",
  "phone": "912345678",
  "source": "phone_call",
  "status": "new",
  "assigned_agent_id": 5,  // Auto-atribuído do JWT
  "notes": "Interessada em T3 até 300k",
  "created_at": "2024-12-18T15:30:00Z",
  "updated_at": "2024-12-18T15:30:00Z"
}
```

**Requisitos Backend:**
- ❌ **Auto-atribuir** ao `current_user.agent_id` (extrair do JWT)
- ❌ Status SEMPRE inicia como `new`
- ❌ Validar: user precisa ter `agent_id` (retornar 403 se não tiver)
- ❌ Retornar 201 Created ao sucesso

**Validações Necessárias:**
```python
# Backend DEVE validar:
- User autenticado (JWT) ← já existe
- User.agent_id existe (é agente, não admin puro) ← IMPLEMENTAR
- Campos obrigatórios: name
- Campos opcionais: email, phone, source, notes
```

---

### 3. Próximas Visitas (Widget) - **IMPORTANTE**

**Problema Atual:**  
Endpoint `GET /mobile/visits/upcoming` **NÃO existe**. HomeScreen não consegue mostrar widget "Próximas Visitas".

#### **SPEC: GET /mobile/visits/upcoming**
```http
GET /mobile/visits/upcoming?limit=5
Authorization: Bearer {access_token}

Response ESPERADA:
[
  {
    "id": 45,
    "property_title": "Moradia T3 Cascais",
    "scheduled_at": "2024-12-19T14:00:00Z",
    "lead_name": "João Santos",
    "property_reference": "IMV-2024-045",
    "status": "scheduled"
  },
  {
    "id": 46,
    "property_title": "Apartamento T2 Lisboa",
    "scheduled_at": "2024-12-19T16:30:00Z",
    "lead_name": null,
    "property_reference": "IMV-2024-046",
    "status": "confirmed"
  }
]
```

**Requisitos Backend:**
- ❌ Filtrar automaticamente por `current_user.agent_id`
- ❌ Apenas visitas futuras (`scheduled_date >= now`)
- ❌ Apenas status `scheduled` ou `confirmed`
- ❌ Ordenar por `scheduled_date` ASC (mais próxima primeiro)
- ❌ Query param `limit` (default: 5, max: 20)

**Uso Frontend:**
```typescript
// Widget "Próximas Visitas" no HomeScreen
const upcomingVisits = await visitsService.getUpcoming(5);
setUpcomingVisits(upcomingVisits);
```

---

## 🔄 MUDANÇAS NO COMPORTAMENTO

### JWT Payload Atualizado

**Antes:**
```json
{
  "sub": "agente@imoveismais.pt",
  "user_id": 5,
  "email": "agente@imoveismais.pt",
  "role": "agent",
  "exp": 1703096400  // 1 hora
}
```

**Agora:**
```json
{
  "sub": "agente@imoveismais.pt",
  "user_id": 5,
  "email": "agente@imoveismais.pt",
  "role": "agent",
  "agent_id": 3,  // ← NOVO
  "exp": 1703182800  // 24 horas (era 1h)
}
```

**Impacto:**
- ✅ Frontend pode acessar `agent_id` diretamente do token
- ✅ Sessões duram 24h (melhor UX)
- ✅ Refresh permite sessões de 7 dias

---

## 📋 CHECKLIST FASE 1 - STATUS ATUAL

### Autenticação (80% completo)
- [x] `POST /auth/login` - Login backoffice (já existe)
- [ ] **`POST /auth/mobile/login`** - **Login mobile com refresh** ← BLOQUEADOR
- [ ] **`POST /auth/refresh`** - **Renovar access token** ← BLOQUEADOR
- [x] `GET /auth/me` - Perfil do agente (já existe)
- [ ] JWT incluir `agent_id` no payload ← BLOQUEADOR
- [ ] Access token: 24h (atualmente 60min) ← BLOQUEADOR
- [ ] Refresh token: 7 dias ← BLOQUEADOR

### Dashboard ✅
- [x] `GET /mobile/dashboard/stats` - Métricas do agente (já existe)

### Angariações ✅
- [x] `GET /mobile/properties` - Listar (filtro automático agent_id) (já existe)
- [x] `GET /mobile/properties/{id}` - Detalhes (já existe)
- [x] `POST /mobile/properties` - Criar (auto-atribuição) (já existe)
- [x] `PUT /mobile/properties/{id}` - Editar (validação ownership) (já existe)
- [x] `POST /mobile/properties/{id}/photos` - Upload fotos (já existe)

### Leads (75% completo)
- [x] `GET /mobile/leads` - Listar (filtro automático agent_id) (já existe)
- [x] `GET /mobile/leads/{id}` - Detalhes (já existe)
- [ ] **`POST /mobile/leads`** - **Criar (auto-atribuição)** ← BLOQUEADOR
- [x] `PATCH /mobile/leads/{id}/status` - Atualizar status (já existe)

### Visitas (83% completo)
- [x] `GET /mobile/visits` - Listar (já existe)
- [x] `GET /mobile/visits/{id}` - Detalhes (já existe)
- [x] `POST /mobile/visits` - Criar (já existe)
- [x] `POST /mobile/visits/{id}/check-in` - Check-in GPS (já existe)
- [x] `POST /mobile/visits/{id}/check-out` - Check-out (já existe)
- [x] `GET /mobile/visits/today` - Visitas de hoje (já existe)
- [ ] **`GET /mobile/visits/upcoming`** - **Próximas visitas** ← IMPORTANTE

**Status FASE 1:** 17/20 endpoints (85%) - **Faltam 3 bloqueadores**

---

## � SOLICITAÇÃO AO BACKEND DEV TEAM

### Ações Necessárias:

#### 1. Implementar Refresh Token System ⏰ **4h**
- [ ] Criar model `RefreshToken` em `/backend/app/users/refresh_token.py`
- [ ] Criar migration Alembic para tabela `refresh_tokens`
- [ ] Adicionar endpoint `POST /auth/mobile/login`
- [ ] Adicionar endpoint `POST /auth/refresh`
- [ ] Atualizar função `_create_token()` para incluir `agent_id` no JWT
- [ ] Alterar `ACCESS_TOKEN_EXPIRE_MINUTES` de 60 para 1440

#### 2. Implementar POST /mobile/leads ⏰ **1h**
- [ ] Criar endpoint em `/backend/app/mobile/routes.py`
- [ ] Auto-atribuir `assigned_agent_id = current_user.agent_id`
- [ ] Validar `current_user.agent_id` existe (retornar 403 se não)
- [ ] Definir `status = LeadStatus.NEW`

#### 3. Implementar GET /mobile/visits/upcoming ⏰ **30min**
- [ ] Criar endpoint em `/backend/app/mobile/routes.py`
- [ ] Filtrar por `agent_id + scheduled_date >= now + status IN [SCHEDULED, CONFIRMED]`
- [ ] Ordenar por `scheduled_date ASC`
- [ ] Aceitar query param `limit` (default 5, max 20)
- [ ] Retornar array simplificado (id, property_title, scheduled_at, lead_name, property_reference, status)

**Total estimado:** 5.5h desenvolvimento

---

## ✅ CRITÉRIOS DE ACEITAÇÃO (FRONTEND VAI VALIDAR)

### Backend Dev Team deve garantir:

#### 1. **Refresh Token Flow**
```bash
# Teste 1: Mobile login retorna ambos os tokens
curl -X POST http://localhost:8000/auth/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agente@test.pt","password":"test123"}'
# ✅ Deve retornar: access_token, refresh_token, expires_at

# Teste 2: Refresh renova tokens
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"...token_antigo..."}'
# ✅ Deve retornar: novo access_token, novo refresh_token
# ✅ Token antigo deve estar revogado no database

# Teste 3: JWT inclui agent_id
# Decodificar JWT e verificar payload tem "agent_id": 3
```

#### 2. **Criar Lead**
```bash
# Teste 1: Criar lead como agente
curl -X POST http://localhost:8000/mobile/leads \
  -H "Authorization: Bearer {token_agente}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","phone":"912345678"}'
# ✅ Retornar 201 Created
# ✅ assigned_agent_id = agent_id do token JWT
# ✅ status = "new"

# Teste 2: Admin sem agent_id tenta criar lead
curl -X POST http://localhost:8000/mobile/leads \
  -H "Authorization: Bearer {token_admin_sem_agent_id}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# ✅ Retornar 403 Forbidden
```

#### 3. **Widget Visitas**
```bash
# Teste 1: Buscar próximas 5 visitas
curl -X GET "http://localhost:8000/mobile/visits/upcoming?limit=5" \
  -H "Authorization: Bearer {token}"
# ✅ Retornar array com max 5 visitas
# ✅ Todas as visitas scheduled_at >= agora
# ✅ Todas as visitas status = "scheduled" OU "confirmed"
# ✅ Ordenadas por scheduled_at ASC
# ✅ Apenas visitas do agent_id do token

# Teste 2: Validar formato response
# Cada item deve ter: id, property_title, scheduled_at, lead_name, property_reference, status
```

---

## � VALIDAÇÃO PÓS-DEPLOY

### Após Backend implementar, Frontend vai testar:

**Swagger/OpenAPI:**  
Acessar `https://seu-staging.railway.app/docs` e verificar:

- [ ] `POST /auth/mobile/login` visível e funcional
- [ ] `POST /auth/refresh` visível e funcional
- [ ] `POST /mobile/leads` visível e funcional
- [ ] `GET /mobile/visits/upcoming` visível e funcional

**Schemas documentados:**
- [ ] `RefreshRequest`
- [ ] `TokenPairResponse`
- [ ] `LeadCreate`
- [ ] `LeadOut`

---

## 🔒 REQUISITOS DE SEGURANÇA

### Refresh Token Best Practices (Backend DEVE implementar):

1. **Token Rotation** ❌
   - Refresh token antigo DEVE ser revogado após uso
   - Prevenir replay attacks

2. **Expiração** ❌
   - Access: 24h
   - Refresh: 7 dias
   - Validar em cada request

3. **Revogação** ❌
   - Coluna `is_revoked` permite invalidar tokens
   - Logout deve revogar todos os tokens do user

4. **Device Tracking** ❌
   - Armazenar `device_info` (User-Agent)
   - Permite audit trail

5. **Database Indexes** ❌
   - `token` (unique)
   - `user_id`
   - `expires_at`
   - Garantir queries rápidas

---

## � TIMELINE E PRÓXIMOS PASSOS

### Backend Dev Team (URGENTE - Esta Semana):

**Quinta 19/12:**
1. Implementar Refresh Token System (4h)
2. Implementar POST /mobile/leads (1h)
3. Implementar GET /mobile/visits/upcoming (30min)
4. Criar migration Alembic
5. Testar endpoints localmente

**Sexta 20/12:**
6. Code review interno
7. Deploy para staging
8. Aplicar migration: `alembic upgrade head`
9. Restart servidor staging
10. Notificar Frontend Team (Swagger URL)

### Frontend Dev Team (Após Backend Deploy):

**Sábado 21/12:**
1. Atualizar `AuthContext` para refresh token (2h)
2. Atualizar `LeadsScreen` com criação (1h)
3. Atualizar `HomeScreen` com widget (30min)
4. Testes de integração (2h)

**Domingo 22/12:**
5. Testes end-to-end
6. Validação ownership (403 errors)
7. Deploy frontend staging

### Ambos os Teams:

**Segunda 23/12 - 10h:** Reunião de Alinhamento
- Demo endpoints
- Validação integração
- Planning FASE 2 (Cloudinary, Notificações)

**Meta:** FASE 1 100% completa até 23/12

---

## 📚 REFERÊNCIA ARQUIVOS BACKEND

### Backend Team vai criar/modificar:

1. **`backend/app/users/refresh_token.py`** ← CRIAR
   - Model `RefreshToken`
   - Métodos: `generate_token()`, `create_expiry()`, `is_valid()`

2. **`backend/app/api/v1/auth.py`** ← MODIFICAR
   - Adicionar `POST /auth/mobile/login`
   - Adicionar `POST /auth/refresh`
   - Criar helper `_create_access_token(user_id, email, role, agent_id)`
   - Atualizar `ACCESS_TOKEN_EXPIRE_MINUTES = 1440`

3. **`backend/app/mobile/routes.py`** ← MODIFICAR
   - Adicionar `POST /mobile/leads`
   - Adicionar `GET /mobile/visits/upcoming`

4. **`backend/alembic/versions/[timestamp]_add_refresh_tokens.py`** ← CRIAR
   - Migration para tabela `refresh_tokens`
   - Índices: token (unique), user_id, expires_at

### Frontend Team já tem implementado (aguardando backend):

- `mobile/app/src/services/api.ts` - Interceptor com retry logic
- `mobile/app/src/contexts/AuthContext.tsx` - State management auth
- `mobile/app/src/screens/LeadsScreen.tsx` - UI criar lead
- `mobile/app/src/screens/HomeScreen.tsx` - UI widget visitas

---

## ✅ CHECKLIST DEPLOY (Backend Team)

### Antes de notificar Frontend:

```bash
# 1. Rodar migration
cd backend
alembic upgrade head
# ✅ Tabela refresh_tokens criada com sucesso

# 2. Criar agente de teste
# ✅ User com agent_id != null

# 3. Testar mobile login
curl -X POST http://localhost:8000/auth/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agente@test.pt","password":"test123"}'
# ✅ Retorna access_token + refresh_token + expires_at

# 4. Testar refresh
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"...cole_token_acima..."}'
# ✅ Retorna novo par de tokens
# ✅ Token antigo tem is_revoked=true no DB

# 5. Testar criar lead
curl -X POST http://localhost:8000/mobile/leads \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","phone":"912345678"}'
# ✅ Retorna 201 Created
# ✅ assigned_agent_id = agent_id correto

# 6. Testar upcoming visits
curl -X GET "http://localhost:8000/mobile/visits/upcoming?limit=5" \
  -H "Authorization: Bearer {access_token}"
# ✅ Retorna array (pode ser vazio se sem visitas)
# ✅ Se retornar dados, validar filtros corretos

# 7. Deploy staging
# ✅ Push para branch
# ✅ Railway auto-deploy
# ✅ Aplicar migration em staging
# ✅ Testar endpoints em staging

# 8. Notificar Frontend
# ✅ Enviar Swagger URL: https://staging.railway.app/docs
# ✅ Enviar credenciais de teste
```

---

## 🚨 CONCLUSÃO

### Status Atual: 🔴 **FASE 1 BLOQUEADA - 85% COMPLETO**

**Endpoints funcionais:** 17/20 (85%)  
**Gaps bloqueantes:** 3 (Refresh Token, POST /leads, GET /visits/upcoming)  
**Tempo estimado solução:** 5.5h desenvolvimento backend  
**Urgência:** **MÁXIMA** - Frontend bloqueado  

**Ação requerida:** Backend Team implementar 3 endpoints até **20/12/2024**  
**Impacto se não resolver:** MVP launch 15/01/2025 em risco  

---

**Preparado por:** Frontend Mobile Dev Team  
**Data:** 18/12/2024 às 19:00  
**Próxima atualização:** Após Backend implementar e deploy staging  

**Dúvidas/Discussão:** Slack #mobile-backend-sync ou GitHub Issues  
**Reunião proposta:** Segunda 23/12 às 10h (após deploy staging)
