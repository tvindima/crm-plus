# 🗺️ MAPA DE ARQUITETURA - CRM PLUS MOBILE

**Data:** 18 Dezembro 2025  
**Status:** Backend ✅ Deployed | Frontend Mobile ✅ Desenvolvido | Web Preview 🚧 Em desenvolvimento

---

## 📊 VISÃO GERAL DA ARQUITETURA

```
┌─────────────────────────────────────────────────────────────────┐
│                     ECOSSISTEMA CRM PLUS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌──────────────┐ │
│  │   BACKOFFICE   │    │  SITE MONTRA   │    │  APP MOBILE  │ │
│  │   (Next.js)    │    │   (Next.js)    │    │(React Native)│ │
│  │   [Railway]    │    │   [Railway]    │    │  [Expo Go]   │ │
│  └────────┬───────┘    └────────┬───────┘    └──────┬───────┘ │
│           │                     │                    │          │
│           └─────────────┬───────┴────────────────────┘          │
│                         │                                       │
│                   ┌─────▼──────┐                               │
│                   │   BACKEND  │                               │
│                   │  (FastAPI) │                               │
│                   │  [Vercel]  │                               │
│                   └─────┬──────┘                               │
│                         │                                       │
│           ┌─────────────┼─────────────┐                        │
│           │             │             │                        │
│    ┌──────▼──────┐ ┌───▼────┐ ┌──────▼────────┐              │
│    │  PostgreSQL │ │  Redis │ │  Cloudinary   │              │
│    │  [Railway]  │ │[Local] │ │  [Cloud CDN]  │              │
│    └─────────────┘ └────────┘ └───────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ESTRUTURA DO PROJETO MOBILE

### 📁 Estrutura de Pastas

```
CRM PLUS/
├── backend/                          ✅ DEPLOYED (Vercel)
│   ├── app/
│   │   ├── main.py                   # Entry point FastAPI
│   │   ├── auth/                     # Autenticação JWT
│   │   │   ├── routes.py             # /auth/mobile/login, /auth/refresh
│   │   │   └── schemas.py            # LoginRequest, TokenResponse
│   │   ├── mobile/                   # Endpoints Mobile
│   │   │   └── routes.py             # /mobile/leads, /mobile/visits, /mobile/dashboard
│   │   ├── calendar/                 # Gestão de Visitas
│   │   │   ├── routes.py             # CRUD Visitas
│   │   │   └── schemas.py            # Visit schemas (20+ classes)
│   │   ├── properties/               # Gestão de Imóveis
│   │   └── models/                   # SQLAlchemy Models
│   │       ├── user.py
│   │       ├── property.py
│   │       ├── visit.py
│   │       └── lead.py
│   ├── vercel.json                   # Config Vercel Serverless
│   ├── pyproject.toml                # Dependencies
│   └── .env.production               # Env vars (DB, Cloudinary, JWT)
│
├── mobile/
│   ├── app/                          ✅ DESENVOLVIDO (React Native)
│   │   ├── app.json                  # Expo config
│   │   ├── package.json              # Dependencies
│   │   ├── .env                      # EXPO_PUBLIC_API_BASE_URL
│   │   ├── src/
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.tsx  # Root Navigator
│   │   │   │   ├── AuthNavigator.tsx # Login flow
│   │   │   │   └── MainNavigator.tsx # Bottom Tabs
│   │   │   ├── screens/
│   │   │   │   ├── LoginScreen.tsx       ✅ Implementado
│   │   │   │   ├── HomeScreen.tsx        ✅ Com widget visitas
│   │   │   │   ├── LeadsScreen.tsx       🚧 Service pronto
│   │   │   │   ├── PropertiesScreen.tsx  🚧 A implementar
│   │   │   │   ├── AgendaScreen.tsx      🚧 A implementar
│   │   │   │   └── AgentScreen.tsx       🚧 A implementar
│   │   │   ├── services/
│   │   │   │   ├── auth.ts           ✅ Login + Refresh + Logout
│   │   │   │   ├── api.ts            ✅ Interceptor 401 + Refresh
│   │   │   │   ├── leads.ts          ✅ list() + create()
│   │   │   │   └── visits.ts         ✅ getUpcoming()
│   │   │   └── components/
│   │   │       └── [UI Components]
│   │   └── App.tsx                   # Root component
│   │
│   └── web-preview/                  🚧 EM DESENVOLVIMENTO
│       ├── index.html                # Landing page (rejeitado)
│       ├── app.html                  # Web interativa (novo)
│       └── vercel.json               # Static site config
│
└── [Documentação]
    ├── BACKEND_FRONTEND_INTEGRATION_ANALYSIS.md
    ├── INTEGRACAO_BACKEND_STATUS.md
    └── MAPA_ARQUITETURA_MOBILE.md (este ficheiro)
```

---

## 🔄 FLUXO DE AUTENTICAÇÃO

```
┌─────────────────┐
│  LoginScreen    │
│  (Mobile App)   │
└────────┬────────┘
         │
         │ 1. POST /auth/mobile/login
         │    { username, password }
         │
         ▼
┌─────────────────────────┐
│  Backend (Vercel)       │
│  app/auth/routes.py     │
└────────┬────────────────┘
         │
         │ 2. Valida credenciais (PostgreSQL)
         │ 3. Gera tokens JWT
         │
         ▼
┌─────────────────────────┐
│  Response               │
│  {                      │
│    access_token: "...", │  ← 24h validade
│    refresh_token: "..." │  ← 7 dias validade
│    expires_at: 123456   │
│  }                      │
└────────┬────────────────┘
         │
         │ 4. Guarda em AsyncStorage
         │
         ▼
┌─────────────────────────┐
│  MainNavigator          │
│  (Bottom Tabs)          │
│  - Home                 │
│  - Leads                │
│  - Propriedades         │
│  - Agenda               │
│  - Agente               │
└─────────────────────────┘
```

### 🔐 Refresh Token Flow

```
API Request → 401 Unauthorized
     ↓
api.ts interceptor detecta erro
     ↓
Chama refreshAccessToken()
     ↓
POST /auth/refresh 
{ refresh_token: "..." }
     ↓
Backend valida refresh token
     ↓
Retorna novo access_token + novo refresh_token (rotation)
     ↓
Guarda novos tokens em AsyncStorage
     ↓
Retry original request com novo token
     ↓
Success! ✅
```

---

## 📱 TELAS DA APP MOBILE

### 🏠 HomeScreen (Dashboard)
**Status:** ✅ Implementado  
**Ficheiro:** `mobile/app/src/screens/HomeScreen.tsx`

**Componentes:**
- Header com avatar e nome do agente
- Stats cards: Visitas hoje, Leads novos, Propriedades
- Widget "Próximas Visitas" (GET /mobile/visits/upcoming?limit=5)
- Cards de propriedades em destaque

**Endpoints usados:**
```typescript
GET /mobile/dashboard/stats
GET /mobile/visits/upcoming?limit=5
```

---

### 👥 LeadsScreen
**Status:** 🚧 Service pronto, UI a implementar  
**Ficheiro:** `mobile/app/src/screens/LeadsScreen.tsx` (não existe ainda)

**Funcionalidades planeadas:**
- Lista de leads atribuídos ao agente
- Filtros: Todos, Novos, Em Contacto, Convertidos
- Botão criar novo lead
- Card com: Nome, Interesse, Status, Última atividade

**Endpoints disponíveis:**
```typescript
GET /mobile/leads?my_leads=true        // Lista leads do agente
POST /mobile/leads                      // Criar novo lead
  { name, phone, email, message, source }
```

---

### 🏢 PropertiesScreen
**Status:** 🚧 A implementar  
**Ficheiro:** `mobile/app/src/screens/PropertiesScreen.tsx` (não existe)

**Funcionalidades planeadas:**
- Lista de propriedades do agente
- Filtros: Todas, Ativas, Reservadas, Vendidas
- Busca por referência/título
- Card com: Imagem, Título, Preço, Tipologia, Área, Localização

**Endpoints necessários:**
```typescript
GET /mobile/properties?agent_id={id}   // Lista propriedades
GET /mobile/properties/{id}            // Detalhe propriedade
```

---

### 📅 AgendaScreen
**Status:** 🚧 A implementar  
**Ficheiro:** `mobile/app/src/screens/AgendaScreen.tsx` (não existe)

**Funcionalidades planeadas:**
- Calendário com visitas marcadas
- Lista de visitas por dia
- Filtros: Hoje, Amanhã, Esta semana
- Check-in/Check-out de visitas
- Feedback pós-visita

**Endpoints necessários:**
```typescript
GET /mobile/visits/upcoming            // Próximas visitas
POST /mobile/visits/{id}/checkin       // Check-in
POST /mobile/visits/{id}/checkout      // Check-out + feedback
```

---

### 🤖 AgentScreen (Assistente IA)
**Status:** 🚧 A implementar  
**Ficheiro:** `mobile/app/src/screens/AgentScreen.tsx` (não existe)

**Funcionalidades planeadas:**
- Ações rápidas com IA:
  - 📅 Agendar Visita (sugestão automática)
  - 📊 Gerar Avaliação Imóvel
  - 📸 Curar Post Instagram
  - 📱 Gerar QR Code + Cartão Digital
  - 📋 Relatório de Leads

**Endpoints necessários:**
```typescript
POST /mobile/ai/schedule-visit         // IA sugere melhor horário
POST /mobile/ai/property-valuation     // IA avalia imóvel
POST /mobile/ai/social-post            // IA gera post
POST /mobile/ai/qr-code                // Gera QR code
```

---

## 🌐 ENDPOINTS BACKEND (Vercel)

### 🔐 Autenticação
```
✅ POST   /auth/mobile/login           # Login mobile (JSON)
✅ POST   /auth/refresh                # Refresh token
✅ POST   /auth/logout                 # Logout + revoke refresh token
```

### 📱 Mobile Específico
```
✅ GET    /mobile/leads?my_leads=true  # Lista leads do agente
✅ POST   /mobile/leads                # Criar lead (auto-assign)
✅ GET    /mobile/visits/upcoming      # Próximas visitas (limit=5)
✅ GET    /mobile/dashboard/stats      # Estatísticas dashboard
```

### 📋 Gestão (Partilhado com Backoffice)
```
✅ GET    /properties                  # Lista propriedades
✅ GET    /properties/{id}             # Detalhe propriedade
✅ GET    /visits                      # Lista visitas
✅ POST   /visits                      # Criar visita
✅ GET    /leads                       # Lista leads
```

### 📚 Documentação
```
✅ GET    /health                      # Health check
✅ GET    /docs                        # Swagger UI
✅ GET    /redoc                       # ReDoc
```

**Base URL:** `https://appmobile-e5yu401gp-toinos-projects.vercel.app`

---

## 💾 BASE DE DADOS (Railway PostgreSQL)

### 🔗 Conexão Partilhada
**URL:** `postgresql://postgres:***@junction.proxy.rlwy.net:55713/railway`

**Nota:** A mesma base de dados é utilizada por:
- ✅ Backoffice (Next.js + Prisma)
- ✅ Site Montra (Next.js + Prisma)
- ✅ App Mobile Backend (FastAPI + SQLAlchemy)

### 📊 Tabelas Principais

```sql
-- Utilizadores
users
  ├── id (PK)
  ├── username
  ├── email
  ├── password_hash
  ├── role (ADMIN, MANAGER, AGENT)
  └── is_active

-- Propriedades
properties
  ├── id (PK)
  ├── reference
  ├── title
  ├── price
  ├── type (APARTAMENTO, MORADIA, TERRENO, COMERCIAL)
  ├── status (ATIVO, RESERVADO, VENDIDO)
  ├── typology
  ├── area
  ├── location
  ├── agent_id (FK → users)
  └── photos (JSON)

-- Leads
leads
  ├── id (PK)
  ├── name
  ├── phone
  ├── email
  ├── message
  ├── source (SITE, ANGARIACAO, APP_MOBILE, BACKOFFICE)
  ├── status (NOVO, EM_CONTACTO, CONVERTIDO, PERDIDO)
  ├── agent_id (FK → users)
  └── property_id (FK → properties, nullable)

-- Visitas
visits
  ├── id (PK)
  ├── property_id (FK → properties)
  ├── lead_id (FK → leads)
  ├── agent_id (FK → users)
  ├── scheduled_at
  ├── status (AGENDADA, CONFIRMADA, REALIZADA, CANCELADA)
  ├── checkin_at
  ├── checkout_at
  ├── feedback
  └── notes

-- Refresh Tokens
refresh_tokens
  ├── id (PK)
  ├── user_id (FK → users)
  ├── token (hashed)
  ├── expires_at
  ├── revoked_at
  └── created_at
```

---

## ☁️ CLOUDINARY (Storage)

**Config:**
```
CLOUDINARY_CLOUD_NAME=dtpk4oqoa
CLOUDINARY_API_KEY=857947842586369
CLOUDINARY_API_SECRET=YPqbqy_A-AdI6HyzFhYTe46cde4
```

**Uso:**
- 📸 Fotos de propriedades (upload via backoffice)
- 👤 Avatares de agentes
- 📄 Documentos (contratos, escrituras)
- 🎥 Vídeos de propriedades (planeado)

**Nota:** Mesma conta Cloudinary para todo o ecossistema CRM PLUS

---

## 🔑 AUTENTICAÇÃO JWT

### Configuração Atual
```
JWT_SECRET=change_me_crmplus_secret    # ⚠️ Mesmo para todo o sistema
ACCESS_TOKEN_EXPIRE=1440               # 24 horas (1440 min)
REFRESH_TOKEN_EXPIRE=10080             # 7 dias (10080 min)
```

### Token Structure
```json
// Access Token Payload
{
  "sub": "user_id",
  "username": "tiago.vindima",
  "role": "AGENT",
  "exp": 1734567890
}

// Refresh Token (stored in DB)
{
  "user_id": "123",
  "token_hash": "sha256(...)",
  "expires_at": "2025-12-25T10:00:00",
  "revoked_at": null
}
```

---

## 📊 FLUXO DE DADOS - HOME SCREEN

```
App Startup
    ↓
Check AsyncStorage for tokens
    ↓
    ├─→ No tokens? → Navigate to LoginScreen
    │
    └─→ Has tokens?
            ↓
        Validate expiry
            ↓
            ├─→ Expired? → Refresh token
            │
            └─→ Valid?
                    ↓
                Navigate to MainNavigator
                    ↓
                HomeScreen.tsx mounted
                    ↓
            ┌───────┴───────┐
            │               │
    loadStats()     loadUpcomingVisits()
            │               │
            ↓               ↓
    GET /mobile/    GET /mobile/
    dashboard/      visits/
    stats           upcoming?limit=5
            │               │
            ↓               ↓
    Update state    Update state
    (stats)         (visits)
            │               │
            └───────┬───────┘
                    ↓
            Render UI with data
                    ↓
            User sees:
            - Greeting "Boa tarde, Tiago!"
            - Stats: 5 visitas, 14 leads, 4 props
            - Próximas Visitas cards
```

---

## 🚀 DEPLOYMENTS

### Backend (Vercel)
**URL:** https://appmobile-e5yu401gp-toinos-projects.vercel.app  
**Status:** ✅ Production  
**Framework:** FastAPI (Python 3.11)  
**Region:** Washington, D.C., USA (iad1)

**Environment Variables:**
```
✅ DATABASE_URL          # Railway PostgreSQL
✅ CLOUDINARY_CLOUD_NAME
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
✅ CRMPLUS_AUTH_SECRET   # JWT Secret
✅ CORS_ORIGINS=*        # Allow all (dev)
```

### Mobile App
**Status:** 🚧 Desenvolvimento local  
**Framework:** React Native + Expo 51.0.0  
**Testing:** Expo Go (iOS/Android)

**Como testar:**
```bash
cd mobile/app
npm start
# Scan QR code com Expo Go app
```

### Web Preview
**URL:** https://crm-plus-mobile-preview-gamfrtyxr-toinos-projects.vercel.app  
**Status:** 🚧 Em desenvolvimento  
**Versão atual:** Landing page estática (rejeitada)  
**Próxima versão:** App interativa (em planeamento)

---

## 📋 SERVICES IMPLEMENTADOS

### 1. auth.ts ✅
```typescript
class AuthService {
  async login(credentials: LoginCredentials): Promise<void>
  async logout(): Promise<void>
  async refreshToken(): Promise<string>
  async getToken(): Promise<string | null>
  async isAuthenticated(): Promise<boolean>
}
```

### 2. api.ts ✅
```typescript
// Axios instance com interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token e retry request
    }
    return Promise.reject(error);
  }
)
```

### 3. leads.ts ✅
```typescript
class LeadsService {
  async list(filters?: LeadFilters): Promise<Lead[]>
  async create(data: CreateLeadData): Promise<Lead>
}
```

### 4. visits.ts ✅
```typescript
class VisitsService {
  async getUpcoming(limit: number = 5): Promise<UpcomingVisit[]>
}
```

---

## 🎯 PRÓXIMOS PASSOS

### 🔴 PRIORIDADE ALTA
1. **Definir requisito exato para Web Preview**
   - Opção A: App interativa Next.js/React com UI mobile
   - Opção B: Expo Web (requer downgrade Expo ou fix dependencies)
   - Opção C: Manter preview estático com melhorias visuais

2. **Implementar LeadsScreen**
   - Lista de leads com filtros
   - Formulário criar novo lead
   - Detalhe de lead

3. **Implementar PropertiesScreen**
   - Lista de propriedades
   - Filtros e busca
   - Detalhe de propriedade

### 🟡 PRIORIDADE MÉDIA
4. **Implementar AgendaScreen**
   - Calendário de visitas
   - Check-in/Check-out
   - Feedback pós-visita

5. **Implementar AgentScreen (IA)**
   - Ações rápidas com IA
   - Integrações GPT-4

6. **Testes E2E**
   - Detox para testes automatizados
   - Fluxos críticos: Login, criar lead, agendar visita

### 🟢 PRIORIDADE BAIXA
7. **Notificações Push**
   - Expo Notifications
   - Lembretes de visitas
   - Novos leads

8. **Offline Mode**
   - React Query + AsyncStorage
   - Sincronização automática

9. **Analytics**
   - Sentry para error tracking
   - Mixpanel/Amplitude para analytics

---

## 🔧 TECNOLOGIAS & VERSÕES

### Backend
- Python 3.11
- FastAPI 0.115.5
- SQLAlchemy 2.0.36
- Pydantic 2.10.3
- PyJWT 2.10.1
- Bcrypt 4.2.1

### Mobile App
- React Native 0.74.5
- Expo 51.0.0
- TypeScript 5.3.3
- React Navigation 6.x
- Axios 1.7.9

### Database
- PostgreSQL 14 (Railway)
- Redis 7.0 (local cache)

### Storage
- Cloudinary (CDN global)

### Deployment
- Vercel (Backend Serverless)
- Expo Go (Mobile testing)

---

## 📞 CONTATOS & LINKS

**Backend API:** https://appmobile-e5yu401gp-toinos-projects.vercel.app  
**Docs Swagger:** https://appmobile-e5yu401gp-toinos-projects.vercel.app/docs  
**ReDoc:** https://appmobile-e5yu401gp-toinos-projects.vercel.app/redoc  

**Railway DB:** junction.proxy.rlwy.net:55713  
**Cloudinary:** https://cloudinary.com/console  

---

## ✅ STATUS CHECKLIST

### Backend
- [x] Deploy Vercel
- [x] Configurar env vars
- [x] Endpoints autenticação
- [x] Endpoints mobile específicos
- [x] Visit schemas completos
- [x] Refresh token rotation
- [x] CORS configurado
- [x] Health check endpoint
- [x] Documentação Swagger

### Frontend Mobile
- [x] Estrutura base Expo
- [x] Navigation setup (Stack + Tabs)
- [x] LoginScreen implementado
- [x] HomeScreen com widgets
- [x] Services (auth, api, leads, visits)
- [x] Token storage AsyncStorage
- [x] Interceptor 401 + auto-refresh
- [ ] LeadsScreen
- [ ] PropertiesScreen
- [ ] AgendaScreen
- [ ] AgentScreen

### Integrações
- [x] Railway PostgreSQL
- [x] Cloudinary (mesma conta)
- [x] JWT unificado
- [ ] Notificações Push
- [ ] Analytics
- [ ] Sentry

### Web Preview
- [x] Landing page estática
- [ ] App interativa (definir abordagem)

---

**Última atualização:** 18 Dezembro 2025 - 21:30  
**Documento gerado por:** GitHub Copilot  
**Versão:** 1.0
