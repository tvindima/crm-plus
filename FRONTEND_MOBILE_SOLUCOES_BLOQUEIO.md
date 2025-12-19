# 📱 SOLUÇÕES PARA DEV TEAM FRONTEND - Bloqueio Backend

**Data:** 18 de dezembro de 2025  
**Destinatário:** Dev Team Frontend Mobile  
**Prioridade:** 🔴 CRÍTICA  
**Contexto:** Backend Vercel com erro SQLAlchemy bloqueando 100% do mobile

---

## 🎯 SUMÁRIO EXECUTIVO

O backend mobile deployado no Vercel está **completamente bloqueado** devido a um erro SQLAlchemy nos relacionamentos entre modelos `Visit` e `Lead`. 

✅ **BOA NOTÍCIA:** O fix já está no código (commits `b6fcd4b` + `05d4ff6`)  
❌ **PROBLEMA:** Vercel não está a aplicar o deployment do fix (webhook/cache issue)

**IMPACTO NO MOBILE:**
- Login → 500 Internal Server Error
- Dashboard → Não carrega (sem autenticação)
- Todas as features → Bloqueadas

**ESTE DOCUMENTO:** Soluções práticas para frontend team **contornar o bloqueio** e continuar desenvolvimento.

---

## 📊 ANÁLISE DO PROBLEMA

### Root Cause (Backend)

SQLAlchemy está a falhar na inicialização dos mappers devido a inconsistência nos relacionamentos:

```python
# backend/app/models/visit.py (CORRETO)
class Visit(Base):
    lead_obj = relationship("Lead", back_populates="visits")
                                                    ^^^^^^^^
# backend/app/leads/models.py (ESTAVA BUGADO)
class Lead(Base):
    visits = relationship("Visit", back_populates="lead")  # ❌ Procura Visit.lead (não existe)
                                                  ^^^^^^
    # FIX aplicado (commit b6fcd4b):
    visits = relationship("Visit", back_populates="lead_obj")  # ✅ Agora está correto
```

### Stack Trace Simplificado

```
POST /auth/login
  → authenticate_user()
    → get_user_by_email()
      → db.query(User)  # ← SQLAlchemy inicializa mappers aqui
        → ERRO: Visit model has no property 'lead'
          → 500 Internal Server Error
```

**Tradução:** Qualquer endpoint que toque na database falha **antes** de executar lógica de negócio.

### Estado Atual

| Componente | Status | Detalhes |
|------------|--------|----------|
| **Backend Code (Git)** | ✅ CORRETO | Fix aplicado em `b6fcd4b` |
| **Vercel Deployment** | ❌ BUGADO | Serve código antigo com erro |
| **Railway Database** | ✅ OK | PostgreSQL funcionando normalmente |
| **Backoffice Web** | ✅ OK | Usa outro deployment (não afetado) |

---

## 🚀 SOLUÇÕES PROPOSTAS (Ordenadas por Prioridade)

### OPÇÃO 1: Desenvolvimento Local com Backend Local ⭐ RECOMENDADO

**Vantagem:** Desbloqueia 100% do desenvolvimento IMEDIATAMENTE  
**Tempo:** 15 minutos setup  
**Complexidade:** Baixa

#### Passos

1. **Clonar/atualizar repositório backend:**
```bash
cd ~/Desktop/CRM\ PLUS/backend
git checkout feat/mobile-backend-app
git pull origin feat/mobile-backend-app
# Confirmar que tem o fix:
grep "back_populates" app/leads/models.py
# Output esperado: back_populates="lead_obj"  ✅
```

2. **Aplicar migration (se ainda não aplicou):**
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
# Isto cria a tabela refresh_tokens
```

3. **Iniciar backend local:**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Servidor roda em http://127.0.0.1:8000
```

4. **Atualizar `.env` na app mobile:**
```dotenv
# mobile/app/.env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# ⚠️ IMPORTANTE: Se estiver a testar em telemóvel físico via Expo Go:
# EXPO_PUBLIC_API_BASE_URL=http://SEU_IP_LOCAL:8000
# (ex: http://192.168.50.14:8000)
```

5. **Reiniciar Expo:**
```bash
cd mobile/app
# Matar processo anterior:
pkill -9 -f "expo"

# Reiniciar com cache limpo:
npx expo start --clear

# No simulador iOS:
# Press 'i' para abrir no simulator
```

6. **Testar login:**
```
Email: tvindima@imoveismais.pt
Password: testepassword123
```

#### ✅ Vantagens

- ✅ **Zero dependência do Vercel** - desenvolvimento 100% local
- ✅ **Debugging facilitado** - logs em tempo real no terminal
- ✅ **Testes rápidos** - sem latência de rede
- ✅ **Hot reload backend** - mudanças refletem instantaneamente
- ✅ **Mesma database Railway** - dados reais de produção

#### ⚠️ Limitações

- ⚠️ Testar em telemóvel físico requer ambos na mesma rede WiFi
- ⚠️ Não testa performance/latência de produção
- ⚠️ Expo Go precisa acessar `http://` (não HTTPS)

---

### OPÇÃO 2: Mock Backend Temporário

**Vantagem:** Permite UI/UX development sem backend funcional  
**Tempo:** 30 minutos implementação  
**Complexidade:** Média

#### Implementação

Criar `mobile/app/src/services/mockApi.ts`:

```typescript
/**
 * Mock API para desenvolvimento enquanto Vercel está bloqueado
 * USAR APENAS EM MODO DEV - REMOVER ANTES DE PRODUÇÃO
 */

const MOCK_USER = {
  id: 1,
  name: 'Tiago Vindima',
  email: 'tvindima@imoveismais.pt',
  role: 'AGENT',
  agent_id: 1,
  avatar_url: null,
};

const MOCK_TOKENS = {
  access_token: 'mock_access_token_123456',
  refresh_token: 'mock_refresh_token_123456',
  token_type: 'bearer',
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockApi = {
  async login(email: string, password: string) {
    // Simular latência de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === 'tvindima@imoveismais.pt' && password === 'testepassword123') {
      return {
        ...MOCK_TOKENS,
        user: MOCK_USER,
      };
    }

    throw new Error('Credenciais inválidas');
  },

  async getProfile() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_USER;
  },

  async getDashboard() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      properties_count: 12,
      active_leads_count: 8,
      visits_this_week: 5,
      conversion_rate: 32.5,
    };
  },

  async getUpcomingVisits(limit: number = 5) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 1,
        property_id: 101,
        property_title: 'T3 Lumiar - Vista Rio',
        scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'SCHEDULED',
      },
      {
        id: 2,
        property_id: 102,
        property_title: 'T2 Carnide - Remodelado',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'CONFIRMED',
      },
    ];
  },

  async getRecentLeads(limit: number = 10) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [
      {
        id: 1,
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+351912345678',
        property_id: 101,
        status: 'NEW',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ];
  },

  async createLead(data: any) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      id: Math.floor(Math.random() * 1000),
      ...data,
      agent_id: MOCK_USER.agent_id,
      status: 'NEW',
      created_at: new Date().toISOString(),
    };
  },
};
```

Criar toggle em `mobile/app/src/services/api.ts`:

```typescript
import { mockApi } from './mockApi';

// Flag de desenvolvimento (pode vir de .env)
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

class ApiService {
  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Se mock ativo, interceptar chamadas
    if (USE_MOCK) {
      return this.handleMockRequest<T>(endpoint, options);
    }

    // Lógica real...
  }

  private async handleMockRequest<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    console.log('🎭 MOCK API:', endpoint);

    // Mapear endpoints para mocks
    if (endpoint.includes('/auth/login')) {
      const body = JSON.parse(options?.body as string);
      return mockApi.login(body.email, body.password) as T;
    }

    if (endpoint.includes('/mobile/dashboard')) {
      return mockApi.getDashboard() as T;
    }

    if (endpoint.includes('/mobile/visits/upcoming')) {
      return mockApi.getUpcomingVisits() as T;
    }

    if (endpoint.includes('/mobile/leads')) {
      if (options?.method === 'POST') {
        const body = JSON.parse(options?.body as string);
        return mockApi.createLead(body) as T;
      }
      return mockApi.getRecentLeads() as T;
    }

    throw new Error(`Mock not implemented for ${endpoint}`);
  }
}
```

Ativar em `.env`:

```dotenv
# mobile/app/.env
EXPO_PUBLIC_USE_MOCK=true
```

#### ✅ Vantagens

- ✅ **Desenvolvimento UI/UX completo** sem backend
- ✅ **Controlo total** sobre dados de teste
- ✅ **Testes offline** - não precisa de internet
- ✅ **Estados de erro** facilmente simulados
- ✅ **Performance consistente** - sem variação de rede

#### ⚠️ Limitações

- ⚠️ Dados estáticos - não persiste entre sessões
- ⚠️ Não testa integração real com backend
- ⚠️ Precisa implementar cada endpoint manualmente
- ⚠️ Risco de divergência entre mock e API real

---

### OPÇÃO 3: Railway Temporary Deploy (Backend Team)

**Vantagem:** Backend em produção alternativo ao Vercel  
**Tempo:** 1-2 horas (backend team)  
**Complexidade:** Alta (requer infraestrutura)

#### Arquitetura

```
┌─────────────────────────────────────────┐
│  Railway (JÁ EXISTE)                   │
│  ┌─────────────────────────────────┐   │
│  │ PostgreSQL Database              │   │
│  │ - Mesma database do backoffice   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ FastAPI Backend (NOVO)          │◄──┼── Mobile App
│  │ - Branch: feat/mobile-backend    │   │
│  │ - Com fix SQLAlchemy aplicado   │   │
│  │ - URL: api-mobile.railway.app   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### Passos (Para Backend Team)

1. **Criar novo serviço Railway:**
   - Login em railway.app
   - Criar novo serviço no projeto existente
   - Nome: "CRM PLUS Mobile API"

2. **Configurar deploy:**
   ```bash
   # Em railway.toml (root do projeto)
   [build]
   builder = "DOCKERFILE"
   dockerfilePath = "backend/Dockerfile"

   [deploy]
   startCommand = "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
   ```

3. **Variáveis de ambiente Railway:**
   ```
   DATABASE_URL=<mesma do backoffice>
   JWT_SECRET=<mesmo do backoffice>
   CLOUDINARY_URL=<mesmo do backoffice>
   ENVIRONMENT=production
   ```

4. **Deploy manual:**
   ```bash
   railway up --service mobile-api
   ```

5. **Obter URL gerada:**
   ```
   https://crm-plus-mobile-api.up.railway.app
   ```

6. **Comunicar URL ao frontend:**
   ```
   Update no .env mobile:
   EXPO_PUBLIC_API_BASE_URL=https://crm-plus-mobile-api.up.railway.app
   ```

#### ✅ Vantagens

- ✅ **Produção real** - mesmo ambiente do backoffice
- ✅ **HTTPS nativo** - funciona em telemóvel físico
- ✅ **Mesma database** - dados sincronizados
- ✅ **Escalável** - Railway auto-scale
- ✅ **Logs centralizados** - monitoring integrado

#### ⚠️ Limitações

- ⚠️ Custo adicional Railway (pequeno)
- ⚠️ Requer setup infraestrutura (backend team)
- ⚠️ Mais um deployment para manter

---

### OPÇÃO 4: Aguardar Fix Vercel (NÃO RECOMENDADO)

**Tempo Estimado:** ❓ Desconhecido (pode ser horas ou dias)  
**Risco:** 🔴 Alto - bloqueia todo o desenvolvimento

#### Ações Pendentes (Backend Team)

1. **Verificar dashboard Vercel:**
   - Último deployment: commit hash, status, timestamp
   - Settings → Git: branch configurado
   - Build logs: erros de compilação?

2. **Possíveis causas webhook failure:**
   - [ ] Branch `feat/mobile-backend-app` não está no auto-deploy
   - [ ] Vercel está deployando de `main` (que não tem o fix)
   - [ ] Webhook GitHub → Vercel desconfigurado
   - [ ] Build cache corrompido
   - [ ] Limite de deployments Vercel atingido

3. **Soluções Vercel:**
   - Trigger manual deployment no dashboard
   - Clear build cache + force redeploy
   - Remover projeto + criar novo (última opção)
   - Verificar logs completos no dashboard

#### ⚠️ Por que NÃO RECOMENDADO para frontend?

- ⚠️ **Zero controlo** sobre timeline
- ⚠️ **Bloqueia progresso** - não há trabalho alternativo
- ⚠️ **Dependência externa** - equipa fica idle
- ⚠️ **Risco de escalação** - problema pode ser complexo

---

## 📋 PLANO DE AÇÃO SUGERIDO

### CURTO PRAZO (Hoje - 18/12/2025)

**Para Frontend Team:**

1. ✅ **Optar por OPÇÃO 1** (Backend Local)
   - Setup: 15 minutos
   - Desbloqueia: 100% do desenvolvimento
   - Risco: Zero

2. ✅ **Validar PASSO 1 completo:**
   - Login funcional com credenciais reais
   - Dashboard carrega métricas PostgreSQL
   - Navegação entre tabs
   - Refresh token automático

3. ✅ **Avançar para PASSO 2-3:**
   - Lista de propriedades com filtros
   - Detalhes de propriedade com galeria
   - Testes de UX mobile

**Para Backend Team:**

1. 🔴 **URGENTE:** Investigar Vercel deployment
   - Acessar dashboard Vercel
   - Verificar branch configurado
   - Ler logs de build completos
   - Identificar causa root do bloqueio

2. 🟡 **PARALLEL:** Considerar OPÇÃO 3 (Railway)
   - Se Vercel demorar >2h para resolver
   - Deploy alternativo garante uptime
   - Mesma database = zero migration

### MÉDIO PRAZO (19-20/12/2025)

1. **Backend deployment resolvido:**
   - Vercel funcionando OU
   - Railway production ativo

2. **Frontend atualiza `.env`:**
   - Mudar de `http://127.0.0.1:8000` para URL produção
   - Testes em telemóvel físico via Expo Go

3. **Validação E2E:**
   - Login produção
   - Dashboard produção
   - Leads criadas sincronizam com backoffice

### LONGO PRAZO (21-23/12/2025)

1. **Post-mortem Vercel:**
   - Documentar causa root
   - Implementar safeguards (alertas de deploy failure)
   - Considerar CI/CD mais robusto

2. **OPÇÃO 2 (Mock API):**
   - Implementar como fallback permanente
   - Útil para demos offline
   - Onboarding novos devs

---

## 🧪 TESTES DE VALIDAÇÃO

### Quando Backend Estiver Funcional (Local OU Produção)

Execute estes testes para confirmar que tudo está OK:

#### Teste 1: Health Check
```bash
curl http://127.0.0.1:8000/health
# OU
curl https://appmobile-e5yu401gp-toinos-projects.vercel.app/health

# Expected: {"service":"CRM PLUS API","status":"ok",...}
```

#### Teste 2: Login Válido
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"testepassword123"}'

# Expected: 200 OK
# {
#   "access_token": "eyJ...",
#   "refresh_token": "eyJ...",
#   ...
# }
```

#### Teste 3: Login Inválido (Deve retornar 401, NÃO 500)
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tvindima@imoveismais.pt","password":"wrong"}'

# Expected: 401 Unauthorized
# {"detail":"Email ou password incorretos"}
# 
# ❌ Se retornar 500 SQLAlchemy → backend ainda bugado
```

#### Teste 4: Dashboard Protegido
```bash
TOKEN="<access_token do teste 2>"

curl http://127.0.0.1:8000/mobile/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Expected: 200 OK
# {
#   "properties_count": 12,
#   "active_leads_count": 8,
#   ...
# }
```

#### Teste 5: Refresh Token
```bash
REFRESH="<refresh_token do teste 2>"

curl -X POST http://127.0.0.1:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$REFRESH\"}"

# Expected: 200 OK com NOVO par de tokens
# (token rotation - old token revocado)
```

---

## 📞 COMUNICAÇÃO ENTRE EQUIPAS

### Frontend → Backend

**Quando reportar problema:**
```
Template:

Subject: [MOBILE] Endpoint X retorna erro Y

Endpoint: POST /auth/login
Request:
{
  "email": "tvindima@imoveismais.pt",
  "password": "testepassword123"
}

Response: 500 Internal Server Error
Error: {"detail": "...copiar mensagem completa..."}

Ambiente:
- Backend URL: https://appmobile...
- Mobile versão: 0.1.0
- Dispositivo: iPhone 15 Simulator / iOS 17.5

Passos reprodução:
1. Abrir app
2. Preencher credenciais
3. Clicar "Entrar"
4. Erro aparece

Expected: Login sucesso com tokens
Actual: Erro 500

Logs anexo: [screenshot/logs]
```

### Backend → Frontend

**Quando comunicar fix deployed:**
```
Template:

Subject: [RESOLVIDO] Backend mobile Vercel deployment OK

✅ FIX DEPLOYED

Deployment: https://appmobile-e5yu401gp-toinos-projects.vercel.app
Commit: b6fcd4b
Timestamp: 18/12/2025 22:15

Mudanças:
- Corrigido relacionamento SQLAlchemy Visit ↔ Lead
- Todos os endpoints agora funcionais
- Migration refresh_tokens aplicada

Testes validados:
✅ GET /health
✅ POST /auth/login
✅ POST /auth/refresh
✅ GET /mobile/dashboard

Ações frontend:
1. Atualizar .env (se estava usando localhost):
   EXPO_PUBLIC_API_BASE_URL=https://appmobile-e5yu401gp-toinos-projects.vercel.app
2. Reiniciar Expo
3. Testar login com credenciais reais
4. Validar PASSO 1 completo

Qualquer issue, reportar neste thread.
```

---

## 🔧 TROUBLESHOOTING COMUM

### Problema: "Network request failed" na app

**Sintomas:**
- App mobile mostra erro de rede
- Não consegue conectar ao backend

**Soluções:**

1. **Verificar URL no `.env`:**
   ```bash
   cd mobile/app
   cat .env | grep API_BASE_URL
   
   # Se backend local:
   # EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
   
   # Se backend produção:
   # EXPO_PUBLIC_API_BASE_URL=https://appmobile...
   ```

2. **Testar conectividade:**
   ```bash
   # Do Mac (onde Expo roda):
   curl http://127.0.0.1:8000/health
   
   # Se falhar → backend não está a correr
   # Iniciar backend:
   cd backend
   source .venv/bin/activate
   uvicorn app.main:app --reload
   ```

3. **Simulador vs Telemóvel Físico:**
   ```
   Simulador iOS: http://127.0.0.1:8000 ✅
   Telemóvel físico: http://192.168.X.X:8000 ✅
                     (IP do Mac na rede local)
   
   Para descobrir IP do Mac:
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

4. **Firewall macOS:**
   ```bash
   # Se backend local não responde de telemóvel físico:
   # System Preferences → Security → Firewall
   # Permitir conexões para Python/uvicorn
   ```

### Problema: "Invalid token" ou "Token expired"

**Sintomas:**
- Login sucede mas dashboard falha
- 401 Unauthorized em requests autenticados

**Soluções:**

1. **Limpar storage da app:**
   ```typescript
   // No código mobile, adicionar botão debug:
   import AsyncStorage from '@react-native-async-storage/async-storage';
   
   const clearStorage = async () => {
     await AsyncStorage.clear();
     console.log('Storage limpo - fazer login novamente');
   };
   ```

2. **Verificar JWT no backend:**
   ```bash
   # Backend terminal deve mostrar:
   # Decoded JWT: {'sub': 1, 'email': '...', 'role': 'AGENT', 'agent_id': 1}
   
   # Se faltar agent_id → backend antigo sem fix
   # Confirmar branch:
   cd backend
   git branch --show-current
   # Deve ser: feat/mobile-backend-app
   ```

3. **Token rotation:**
   ```
   Se refresh falha:
   - Fazer logout completo
   - Limpar AsyncStorage
   - Fazer login novamente
   - Novo par de tokens será gerado
   ```

### Problema: "CORS error" no browser (Expo Web)

**Sintomas:**
- Erro CORS ao testar no browser
- Funciona no simulador mas não no web

**Solução:**

Backend precisa permitir origem Expo web:

```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",  # Expo web dev
        "exp://127.0.0.1:8081",    # Expo Go
        # ... outros
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 RECURSOS ADICIONAIS

### Documentação Relevante

- [BACKEND_RESPONSE_TO_FRONTEND.md](./BACKEND_RESPONSE_TO_FRONTEND.md) - Guia completo da API mobile
- [MOBILE_APP_PRODUCT_BRIEF.md](./MOBILE_APP_PRODUCT_BRIEF.md) - Contexto B2E e personas
- [JIRA_TICKETS_MOBILE_B2E.md](./JIRA_TICKETS_MOBILE_B2E.md) - User stories e acceptance criteria

### Endpoints Disponíveis (Quando Backend Funcionar)

#### Autenticação
```
POST /auth/login           → Login com email/password
POST /auth/refresh         → Renovar access token
POST /auth/logout          → Revogar refresh token
```

#### Dashboard
```
GET /mobile/dashboard      → Métricas agente (properties, leads, visits, conversion)
```

#### Propriedades
```
GET /mobile/properties     → Lista com filtros (minha=true, status, tipo)
GET /mobile/properties/{id} → Detalhes completos
POST /mobile/properties     → Criar angariação (PASSO 4)
PUT /mobile/properties/{id} → Editar (PASSO 4)
```

#### Leads
```
GET /mobile/leads          → Lista (status, data_inicio, data_fim)
POST /mobile/leads         → Criar lead (auto-assign agent_id)
PUT /mobile/leads/{id}     → Atualizar status/notes
```

#### Visitas
```
GET /mobile/visits/upcoming → Widget próximas visitas (limit, futuras, ordenadas ASC)
GET /mobile/visits         → Lista completa com filtros
POST /mobile/visits        → Agendar visita
PUT /mobile/visits/{id}    → Atualizar status/notes
```

#### Perfil
```
GET /mobile/profile        → Dados agente autenticado
PUT /mobile/profile        → Atualizar dados (telefone, avatar)
```

### Ferramentas de Teste

#### Postman Collection

Importar collection para testes rápidos:

```json
{
  "info": { "name": "CRM PLUS Mobile API" },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"email\":\"tvindima@imoveismais.pt\",\"password\":\"testepassword123\"}"
        }
      }
    },
    {
      "name": "Dashboard",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/mobile/dashboard",
        "header": [
          { "key": "Authorization", "value": "Bearer {{accessToken}}" }
        ]
      }
    }
  ]
}
```

Variáveis:
```
baseUrl: http://127.0.0.1:8000 (ou URL produção)
accessToken: <copiar do response do login>
```

---

## ✅ CHECKLIST FINAL

### Para Frontend Team Começar Desenvolvimento HOJE:

- [ ] **Setup backend local (OPÇÃO 1):**
  - [ ] Git pull `feat/mobile-backend-app`
  - [ ] Confirmar fix SQLAlchemy (`grep back_populates app/leads/models.py`)
  - [ ] Aplicar migration (`alembic upgrade head`)
  - [ ] Iniciar servidor (`uvicorn app.main:app --reload`)
  - [ ] Testar `/health` retorna 200 OK

- [ ] **Configurar mobile app:**
  - [ ] Atualizar `.env` → `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
  - [ ] Limpar cache Expo (`npx expo start --clear`)
  - [ ] Abrir simulador iOS

- [ ] **Validar PASSO 1:**
  - [ ] Login com `tvindima@imoveismais.pt / testepassword123`
  - [ ] Dashboard carrega 4 métricas (não mock - dados reais PostgreSQL)
  - [ ] Navegação tabs funciona
  - [ ] Logout + Login novamente (refresh token rotation)

- [ ] **Avançar desenvolvimento:**
  - [ ] Implementar PASSO 2 (lista propriedades)
  - [ ] Implementar PASSO 3 (detalhes propriedade)
  - [ ] Preparar UI para PASSO 4 (criar angariação)

### Para Backend Team Resolver Vercel:

- [ ] **Investigação:**
  - [ ] Acessar dashboard Vercel
  - [ ] Verificar último deployment (commit hash, status)
  - [ ] Verificar Settings → Git (branch configurado)
  - [ ] Ler build logs completos

- [ ] **Identificar causa:**
  - [ ] Webhook GitHub funcionando?
  - [ ] Branch correto (`feat/mobile-backend-app` ou `main`)?
  - [ ] Build cache issue?
  - [ ] Erro de compilação nos logs?

- [ ] **Aplicar fix:**
  - [ ] Trigger manual deployment se necessário
  - [ ] Clear cache + force redeploy
  - [ ] OU merge para `main` se Vercel só deploya main

- [ ] **Validar produção:**
  - [ ] Teste login retorna 200 (não 500 SQLAlchemy)
  - [ ] Teste credenciais inválidas retorna 401 (não 500)
  - [ ] Dashboard retorna métricas

- [ ] **Comunicar frontend:**
  - [ ] Avisar quando deployment OK
  - [ ] Fornecer URL atualizada se mudou
  - [ ] Confirmar migration aplicada

### Plano B (Se Vercel não resolver em 2h):

- [ ] **Considerar OPÇÃO 3 (Railway):**
  - [ ] Criar novo serviço Railway
  - [ ] Deploy `feat/mobile-backend-app`
  - [ ] Aplicar migration
  - [ ] Testar endpoints
  - [ ] Comunicar nova URL ao frontend

---

## 📊 PRIORIZAÇÃO DE SOLUÇÕES

| Opção | Tempo Setup | Complexidade | Desbloqueia Dev | Recomendação |
|-------|-------------|--------------|-----------------|--------------|
| **1. Backend Local** | 15 min | 🟢 Baixa | ✅ 100% | ⭐⭐⭐⭐⭐ |
| **2. Mock API** | 30 min | 🟡 Média | ✅ 80% UI/UX | ⭐⭐⭐ |
| **3. Railway Deploy** | 1-2h | 🔴 Alta | ✅ 100% + Prod | ⭐⭐⭐⭐ |
| **4. Aguardar Vercel** | ❓ | - | ❌ 0% | ⭐ |

**DECISÃO RECOMENDADA:**

1. **Frontend:** Optar por OPÇÃO 1 imediatamente
2. **Backend:** Investigar Vercel em paralelo
3. **Se Vercel >2h:** Backend implementa OPÇÃO 3
4. **OPÇÃO 2:** Implementar como fallback permanente (útil para demos)

---

## 🆘 CONTACTOS E SUPORTE

### Escalação

- **Nível 1:** Testar soluções deste documento (frontend autonomia)
- **Nível 2:** Reportar issue a backend team (se soluções falharem)
- **Nível 3:** Reunião frontend + backend (se bloqueio >4h)

### Canais Comunicação

- **Slack:** #mobile-dev (updates diários)
- **Slack:** #backend-api (issues técnicas)
- **Email:** tvindima@imoveismais.pt (escalações)

### Horários

- **Suporte Dev:** 9h-18h (dias úteis)
- **Emergências:** Via Slack (notificações ativas)

---

## 📝 CONCLUSÃO

**MENSAGEM CHAVE PARA FRONTEND:**

> **Não ficam bloqueados!** 🚀
> 
> O problema Vercel é **infraestrutura backend**, NÃO impede desenvolvimento mobile.
> 
> **Ação imediata:** Setup backend local (15 min) → 100% funcional
> 
> Enquanto isso, backend team resolve deployment produção em paralelo.

**TIMELINE ESPERADO:**

- **Hoje (18/12):** Frontend desenvolve com backend local (PASSO 1-3)
- **Amanhã (19/12):** Backend resolve Vercel OU deploya Railway
- **20/12:** Testes end-to-end em produção
- **23/12:** Review completa FASE 1 (20 endpoints)

---

**FIM DO RELATÓRIO**

*Gerado: 18/12/2025 21:50*  
*Autor: Backend Dev Team*  
*Destinatário: Frontend Mobile Team*  
*Próxima revisão: Após resolução Vercel*
