# 🎯 RELATÓRIO DE IMPLEMENTAÇÃO BACKEND - SISTEMA MOBILE

> **Branch:** `feat/mobile-backend-app`  
> **Data:** 18 de dezembro de 2025  
> **Dev Team:** Backend  
> **Status:** ✅ Sistema de Visitas COMPLETO  
> **Tipo:** App B2E para Agentes Imobiliários

---

## 🎯 CONTEXTO: Ferramenta para Agentes (B2E)

**⚠️ Este sistema é para AGENTES IMOBILIÁRIOS registarem visitas a imóveis com clientes.**

- **Utilizador:** Agente Imóveis Mais (colaborador interno)
- **Use Case:** Agente leva cliente a visitar propriedade → check-in GPS → feedback
- **NÃO É:** Sistema para clientes finais marcarem visitas (isso não existe nesta app)

📖 Ver âmbito completo: [MOBILE_APP_PRODUCT_BRIEF.md](MOBILE_APP_PRODUCT_BRIEF.md)

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **SISTEMA DE VISITAS COMPLETO** 🔴 PRIORIDADE ALTA

#### Model: `Visit`
**Arquivo:** `backend/app/models/visit.py`

Campos implementados:
```python
- id, property_id, lead_id, agent_id
- scheduled_date, duration_minutes, status
- checked_in_at, checked_out_at
- checkin_latitude, checkin_longitude, checkin_accuracy_meters
- distance_from_property_meters
- rating (1-5), interest_level, feedback_notes
- will_return, next_steps, notes
- cancellation_reason
- reminder_sent, confirmation_sent
- created_at, updated_at
```

**Status disponíveis:**
- `scheduled` - Agendada
- `confirmed` - Confirmada
- `in_progress` - Em andamento (após check-in)
- `completed` - Concluída
- `cancelled` - Cancelada
- `no_show` - Cliente não compareceu

**Níveis de interesse:**
- `muito_baixo`, `baixo`, `medio`, `alto`, `muito_alto`

---

#### Endpoints Implementados
**Arquivo:** `backend/app/mobile/routes.py`

| Endpoint | Método | Descrição | Status |
|----------|--------|-----------|--------|
| `/mobile/visits` | GET | Listar visitas com paginação e filtros | ✅ |
| `/mobile/visits/today` | GET | Widget visitas de hoje | ✅ |
| `/mobile/visits/{id}` | GET | Detalhes de visita | ✅ |
| `/mobile/visits` | POST | Criar/agendar nova visita | ✅ |
| `/mobile/visits/{id}` | PUT | Reagendar/editar visita | ✅ |
| `/mobile/visits/{id}/status` | PATCH | Atualizar status rapidamente | ✅ |
| `/mobile/visits/{id}/check-in` | POST | Check-in com GPS | ✅ |
| `/mobile/visits/{id}/check-out` | POST | Check-out com feedback | ✅ |
| `/mobile/visits/{id}/feedback` | POST | Adicionar feedback pós-visita | ✅ |

**Total:** 9 endpoints + 1 widget = **10 novos endpoints**

---

#### Funcionalidades Implementadas

##### ✅ **Listagem de Visitas**
```http
GET /mobile/visits?page=1&per_page=50&status=scheduled
```
**Filtros:**
- `page`, `per_page` (paginação)
- `status` (scheduled, confirmed, completed, etc)
- `date_from`, `date_to` (range de datas)
- `property_id`, `lead_id` (filtrar por propriedade/lead)

**Response:**
```json
{
  "visits": [...],
  "total": 100,
  "page": 1,
  "per_page": 50,
  "pages": 2
}
```

##### ✅ **Widget Visitas de Hoje**
```http
GET /mobile/visits/today
```
**Response otimizado para dashboard:**
```json
{
  "visits": [
    {
      "id": 123,
      "property_reference": "MOV-2024-001",
      "property_location": "Porto",
      "lead_name": "Maria Santos",
      "scheduled_time": "15:00",
      "status": "confirmed",
      "is_next": true
    }
  ],
  "count": 3,
  "next_visit": {
    "id": 123,
    "time": "15:00",
    "countdown_minutes": 45,
    "property_reference": "MOV-2024-001"
  }
}
```

##### ✅ **Criar Visita**
```http
POST /mobile/visits
```
**Body:**
```json
{
  "property_id": 45,
  "lead_id": 78,
  "scheduled_date": "2025-12-20T15:00:00Z",
  "duration_minutes": 30,
  "notes": "Cliente interessado em T3"
}
```

**Side Effects:**
- ✅ Auto-assign ao agente atual
- ✅ Criar task automática no calendário
- ✅ Atualizar status do lead para `visit_scheduled`

##### ✅ **Check-in com GPS**
```http
POST /mobile/visits/{id}/check-in
```
**Body:**
```json
{
  "latitude": 41.1579,
  "longitude": -8.6291,
  "accuracy_meters": 15
}
```

**Validações:**
- ✅ Cálculo de distância via fórmula Haversine
- ✅ Alerta se distância > 500m da propriedade
- ✅ Validação de horário (±30 minutos do agendado)
- ✅ Status deve estar `scheduled` ou `confirmed`

**Response:**
```json
{
  "success": true,
  "checked_in_at": "2025-12-20T15:02:00Z",
  "distance_from_property_meters": 5.2,
  "status": "in_progress",
  "message": "Check-in realizado com sucesso"
}
```

##### ✅ **Check-out com Feedback**
```http
POST /mobile/visits/{id}/check-out
```
**Body:**
```json
{
  "rating": 4,
  "interest_level": "alto",
  "feedback_notes": "Cliente muito interessado",
  "will_return": true,
  "next_steps": "Aguardar aprovação de crédito"
}
```

**Side Effects:**
- ✅ Calcular duração real da visita
- ✅ Atualizar status do lead (se interesse alto/muito alto → `qualified`)
- ✅ Marcar task relacionada como `completed`
- ✅ Status da visita → `completed`

**Response:**
```json
{
  "success": true,
  "checked_out_at": "2025-12-20T15:35:00Z",
  "duration_minutes": 33,
  "status": "completed",
  "message": "Check-out realizado! Duração: 33min"
}
```

##### ✅ **Atualizar Status**
```http
PATCH /mobile/visits/{id}/status
```
**Transições válidas:**
- `scheduled` → `confirmed`, `cancelled`, `no_show`
- `confirmed` → `in_progress`, `cancelled`, `no_show`
- `in_progress` → `completed`, `cancelled`

---

#### Schemas Pydantic
**Arquivo:** `backend/app/schemas/visit.py`

Schemas criados:
- ✅ `VisitCreate` - Criação de visita
- ✅ `VisitUpdate` - Atualização
- ✅ `VisitStatusUpdate` - Update rápido de status
- ✅ `VisitCheckIn` - Check-in GPS
- ✅ `VisitCheckOut` - Check-out feedback
- ✅ `VisitFeedback` - Feedback standalone
- ✅ `VisitOut` - Output completo
- ✅ `VisitTodayWidget` - Widget dashboard
- ✅ `VisitListResponse` - Paginação

**Validações implementadas:**
- ✅ Data futura obrigatória
- ✅ Duração 15-180 minutos
- ✅ GPS válido (-90/90 lat, -180/180 lon)
- ✅ Rating 1-5
- ✅ Campos com max_length

---

#### Migration Alembic
**Arquivo:** `backend/alembic/versions/20251218_155904_add_visits_table.py`

```sql
CREATE TABLE visits (
    id INTEGER PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id),
    lead_id INTEGER REFERENCES leads(id),
    agent_id INTEGER NOT NULL REFERENCES agents(id),
    scheduled_date DATETIME NOT NULL,
    duration_minutes INTEGER,
    status VARCHAR,
    -- Check-in/out fields
    checked_in_at DATETIME,
    checked_out_at DATETIME,
    checkin_latitude FLOAT,
    checkin_longitude FLOAT,
    checkin_accuracy_meters FLOAT,
    distance_from_property_meters FLOAT,
    -- Feedback fields
    rating INTEGER,
    interest_level VARCHAR,
    feedback_notes TEXT,
    will_return BOOLEAN,
    next_steps TEXT,
    -- Metadata
    notes TEXT,
    cancellation_reason TEXT,
    reminder_sent BOOLEAN,
    confirmation_sent BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME
);

-- Indexes
CREATE INDEX ix_visits_property_id ON visits(property_id);
CREATE INDEX ix_visits_lead_id ON visits(lead_id);
CREATE INDEX ix_visits_agent_id ON visits(agent_id);
CREATE INDEX ix_visits_scheduled_date ON visits(scheduled_date);
CREATE INDEX ix_visits_status ON visits(status);
CREATE INDEX ix_visits_created_at ON visits(created_at);
```

---

#### Relationships
**Modificados:**
- ✅ `Property.visits` → relationship com Visit
- ✅ `Lead.visits` → relationship com Visit
- ✅ `Agent.visits` → relationship com Visit

---

## 📊 ESTATÍSTICAS DA IMPLEMENTAÇÃO

| Métrica | Valor |
|---------|-------|
| **Novos Endpoints** | 10 |
| **Novos Models** | 1 (Visit) |
| **Novos Schemas** | 9 |
| **Linhas de Código** | ~920 |
| **Migration Files** | 1 |
| **Relationships** | 3 atualizadas |
| **Validações** | 15+ |
| **Status Possíveis** | 6 |

---

## 🎯 PRÓXIMAS PRIORIDADES BACKEND

### 🔴 **ALTA** (Implementar próximo)

#### 1. QR Codes
```
GET /mobile/qr/property/{id}
GET /mobile/qr/agent/{id}
GET /mobile/qr/visit/{id}
POST /mobile/qr/scan
GET /mobile/qr/analytics
```

#### 2. Refresh Token & Device Management
```
POST /auth/refresh
POST /auth/logout
GET /auth/devices
DELETE /auth/devices/{id}
```
**Model:** `DeviceSession`

#### 3. WebSockets
```
WS /ws/notifications
WS /ws/leads
WS /ws/tasks
```

#### 4. Dashboard KPIs Avançado
```
GET /mobile/dashboard/kpis
GET /mobile/dashboard/performance
```

---

## 📋 DIRETRIZES PARA FRONTEND

### **1. INTEGRAÇÃO COM SISTEMA DE VISITAS**

#### **Telas a Implementar:**

##### 📅 **Lista de Visitas**
```typescript
// GET /mobile/visits?page=1&per_page=20&status=scheduled
interface VisitListScreen {
  filters: {
    status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed'
    dateRange: { from: Date, to: Date }
  }
  pagination: { page: number, perPage: number }
}
```

**Funcionalidades:**
- Filtrar por status (tabs/chips)
- Filtrar por data (date picker)
- Paginação infinita ou numérica
- Pull-to-refresh
- Cards com: propriedade, lead, horário, status

##### 🏠 **Detalhes da Visita**
```typescript
// GET /mobile/visits/{id}
interface VisitDetailScreen {
  visit: Visit
  actions: [
    'check-in',
    'cancel',
    'reschedule',
    'add-feedback'
  ]
}
```

**Informações a mostrar:**
- Dados da propriedade (foto, referência, localização)
- Dados do lead (nome, telefone, email)
- Horário agendado
- Duração estimada
- Notas do agente
- Status atual
- Botões de ação baseados no status

##### ➕ **Criar Visita**
```typescript
// POST /mobile/visits
interface CreateVisitScreen {
  form: {
    property: Property      // Select/autocomplete
    lead?: Lead            // Opcional, autocomplete
    scheduledDate: DateTime // Date + Time picker
    duration: number       // Slider 15-180min
    notes?: string         // Textarea
  }
}
```

**Validações client-side:**
- Data deve ser futura
- Duração entre 15-180 minutos
- Propriedade obrigatória

**Side effects a mostrar:**
- "✅ Visita criada"
- "📅 Task adicionada ao calendário"
- "📧 Lead notificado" (se implementado)

##### 📍 **Check-in GPS**
```typescript
// POST /mobile/visits/{id}/check-in
interface CheckInScreen {
  gps: {
    latitude: number
    longitude: number
    accuracy: number
  }
  confirmation: {
    distance: number        // Mostrar distância calculada
    propertyLocation: string
    warning?: string        // Se > 100m da propriedade
  }
}
```

**Fluxo:**
1. Botão "Check-in" na tela de detalhes
2. Solicitar permissão de GPS
3. Obter coordenadas
4. Mostrar confirmação: "Você está a Xm da propriedade"
5. Botão confirmar check-in
6. POST para API
7. Mostrar sucesso ou erro

**Validações:**
- GPS deve estar ativado
- Accuracy < 50m (ideal)
- Alerta se distance > 100m

##### ✅ **Check-out com Feedback**
```typescript
// POST /mobile/visits/{id}/check-out
interface CheckOutScreen {
  form: {
    rating: 1 | 2 | 3 | 4 | 5      // Stars
    interestLevel: InterestLevel   // Chips/select
    feedbackNotes: string          // Textarea
    willReturn: boolean            // Toggle
    nextSteps?: string             // Textarea
  }
  summary: {
    duration: number               // Calculado automaticamente
    checkedInAt: DateTime
  }
}
```

**Campos:**
- ⭐ Rating (estrelas clicáveis)
- 📊 Nível de interesse (chips: Muito Baixo → Muito Alto)
- 📝 Notas de feedback (textarea)
- 🔄 Cliente vai retornar? (switch)
- 📋 Próximos passos (textarea opcional)

**Side effects a mostrar:**
- "✅ Check-out realizado"
- "⏱️ Duração: 33min"
- "📈 Lead atualizado para 'Qualificado'" (se aplicável)

##### 📊 **Widget Dashboard**
```typescript
// GET /mobile/visits/today
interface VisitsTodayWidget {
  nextVisit?: {
    time: string
    countdownMinutes: number
    propertyReference: string
    leadName: string
  }
  todayVisits: VisitSummary[]
  count: number
}
```

**Localização:** Home/Dashboard

**Layout:**
```
┌─────────────────────────────────┐
│  📅 Próxima Visita              │
│  MOV-2024-001 com Maria         │
│  🕐 15:00 (em 45 min)           │
│  [Ver Detalhes]                 │
├─────────────────────────────────┤
│  📋 Visitas Hoje: 3             │
│  • 10:00 - T3 Porto ✅          │
│  • 15:00 - T2 Lisboa 🔴 (próx)│
│  • 17:00 - Moradia Gaia         │
└─────────────────────────────────┘
```

---

### **2. ESTADOS DA APLICAÇÃO**

#### **Status da Visita → UI**

| Status | Cor | Ícone | Ações Disponíveis |
|--------|-----|-------|-------------------|
| `scheduled` | 🟡 Amarelo | 📅 | Confirmar, Cancelar, Reagendar |
| `confirmed` | 🔵 Azul | ✅ | Check-in, Cancelar |
| `in_progress` | 🟢 Verde | 📍 | Check-out |
| `completed` | ⚫ Cinza | ✔️ | Ver Feedback |
| `cancelled` | 🔴 Vermelho | ❌ | Reagendar |
| `no_show` | 🟠 Laranja | 👻 | Reagendar |

#### **Transições de Status**

```
scheduled ─→ confirmed ─→ in_progress ─→ completed
    ↓           ↓              ↓
cancelled   cancelled      cancelled
    ↓
no_show
```

---

### **3. PERMISSÕES E VALIDAÇÕES**

#### **Regras de Negócio Client-Side:**

1. ✅ **Apenas visitas do agente logado**
   ```typescript
   // Filtro automático no GET /mobile/visits
   // Backend já faz isso, mas validar no frontend também
   ```

2. ✅ **Não editar visitas concluídas/canceladas**
   ```typescript
   const canEdit = !['completed', 'cancelled'].includes(visit.status)
   ```

3. ✅ **Check-in apenas se scheduled/confirmed**
   ```typescript
   const canCheckIn = ['scheduled', 'confirmed'].includes(visit.status)
   ```

4. ✅ **Check-out apenas se in_progress**
   ```typescript
   const canCheckOut = visit.status === 'in_progress'
   ```

5. ✅ **Data agendada deve ser futura**
   ```typescript
   const minDate = new Date()
   ```

---

### **4. INTEGRAÇÃO COM GPS**

#### **Permissions (React Native):**

```typescript
// Android
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

// iOS
NSLocationWhenInUseUsageDescription
```

#### **Código de Exemplo:**

```typescript
import Geolocation from '@react-native-community/geolocation'

const checkIn = async (visitId: number) => {
  // Solicitar permissão
  const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
  
  if (permission !== 'granted') {
    Alert.alert('GPS necessário', 'Ative o GPS para fazer check-in')
    return
  }
  
  // Obter coordenadas
  Geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude, accuracy } = position.coords
      
      // Enviar para API
      const response = await api.post(`/mobile/visits/${visitId}/check-in`, {
        latitude,
        longitude,
        accuracy_meters: accuracy
      })
      
      if (response.data.distance_from_property_meters > 100) {
        Alert.alert(
          'Distância da propriedade',
          `Você está a ${Math.round(response.data.distance_from_property_meters)}m da propriedade. Confirma check-in?`
        )
      }
    },
    (error) => {
      Alert.alert('Erro GPS', 'Não foi possível obter localização')
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  )
}
```

---

### **5. NOTIFICAÇÕES E ALERTAS**

#### **Implementar:**

1. **Lembrete 15min antes da visita**
   ```typescript
   // Local notification
   if (visit.nextVisit?.countdownMinutes === 15) {
     LocalNotifications.schedule({
       title: 'Visita em 15 minutos',
       body: `${visit.propertyReference} com ${visit.leadName}`,
       trigger: { seconds: 0 }
     })
   }
   ```

2. **Check-in reminder**
   ```typescript
   // No horário da visita
   if (visit.status === 'confirmed' && isNow(visit.scheduledDate)) {
     Alert.alert('Visita agora', 'Não esqueça de fazer check-in!')
   }
   ```

3. **Check-out reminder**
   ```typescript
   // Após duração estimada
   if (visit.status === 'in_progress' && exceedsDuration(visit)) {
     Alert.alert('Concluir visita?', 'Faça check-out e adicione feedback')
   }
   ```

---

### **6. CACHE E OFFLINE**

#### **Estratégia Recomendada:**

```typescript
// React Query / TanStack Query
const { data, isLoading } = useQuery({
  queryKey: ['visits', 'today'],
  queryFn: () => api.get('/mobile/visits/today'),
  staleTime: 5 * 60 * 1000, // 5min
  cacheTime: 30 * 60 * 1000, // 30min
})

// Offline-first para check-in
const checkInMutation = useMutation({
  mutationFn: (data) => api.post('/mobile/visits/123/check-in', data),
  onError: (error) => {
    // Guardar localmente para retry
    AsyncStorage.setItem('pending_checkin', JSON.stringify(data))
  }
})
```

---

### **7. TESTES RECOMENDADOS**

#### **Cenários Frontend:**

1. ✅ **Criar visita** → Deve aparecer na lista
2. ✅ **Filtrar por status** → Deve filtrar corretamente
3. ✅ **Check-in com GPS** → Calcular distância
4. ✅ **Check-in sem GPS** → Mostrar erro
5. ✅ **Check-out** → Marcar como completed
6. ✅ **Editar visita concluída** → Botão disabled
7. ✅ **Widget dashboard** → Mostrar próxima visita
8. ✅ **Paginação** → Load more infinito
9. ✅ **Pull-to-refresh** → Atualizar lista
10. ✅ **Offline** → Cache funcionando

---

### **8. ESTRUTURA DE PASTAS SUGERIDA**

```
src/
├── screens/
│   ├── visits/
│   │   ├── VisitListScreen.tsx
│   │   ├── VisitDetailScreen.tsx
│   │   ├── CreateVisitScreen.tsx
│   │   ├── CheckInScreen.tsx
│   │   └── CheckOutScreen.tsx
├── components/
│   ├── visits/
│   │   ├── VisitCard.tsx
│   │   ├── VisitStatusBadge.tsx
│   │   ├── VisitsTodayWidget.tsx
│   │   ├── VisitFeedbackForm.tsx
│   │   └── VisitFilters.tsx
├── services/
│   └── api/
│       └── visits.ts
├── hooks/
│   ├── useVisits.ts
│   ├── useVisitDetail.ts
│   └── useGeoLocation.ts
├── types/
│   └── visit.ts
└── utils/
    ├── gps.ts
    └── visit-status.ts
```

---

### **9. TYPES TYPESCRIPT**

```typescript
// types/visit.ts
export enum VisitStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum InterestLevel {
  VERY_LOW = 'muito_baixo',
  LOW = 'baixo',
  MEDIUM = 'medio',
  HIGH = 'alto',
  VERY_HIGH = 'muito_alto',
}

export interface Visit {
  id: number
  property_id: number
  lead_id?: number
  agent_id: number
  scheduled_date: string // ISO 8601
  duration_minutes: number
  status: VisitStatus
  notes?: string
  
  // Check-in/out
  checked_in_at?: string
  checked_out_at?: string
  checkin_latitude?: number
  checkin_longitude?: number
  distance_from_property_meters?: number
  
  // Feedback
  rating?: 1 | 2 | 3 | 4 | 5
  interest_level?: InterestLevel
  feedback_notes?: string
  will_return?: boolean
  next_steps?: string
  
  // Relationships
  property?: PropertySummary
  lead?: LeadSummary
  agent?: AgentSummary
  
  created_at: string
  updated_at?: string
}

export interface VisitListResponse {
  visits: Visit[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface VisitTodayWidget {
  id: number
  property_reference: string
  property_location?: string
  lead_name?: string
  scheduled_time: string // HH:MM
  status: VisitStatus
  is_next: boolean
}

export interface VisitTodayResponse {
  visits: VisitTodayWidget[]
  count: number
  next_visit?: {
    id: number
    time: string
    countdown_minutes: number
    property_reference?: string
  }
}
```

---

### **10. API SERVICE**

```typescript
// services/api/visits.ts
import { api } from './client'
import type { 
  Visit, 
  VisitListResponse, 
  VisitTodayResponse,
  VisitStatus,
  InterestLevel
} from '@/types/visit'

export const visitsApi = {
  list: async (params: {
    page?: number
    per_page?: number
    status?: VisitStatus
    date_from?: string
    date_to?: string
    property_id?: number
    lead_id?: number
  }): Promise<VisitListResponse> => {
    const { data } = await api.get('/mobile/visits', { params })
    return data
  },

  today: async (): Promise<VisitTodayResponse> => {
    const { data } = await api.get('/mobile/visits/today')
    return data
  },

  get: async (id: number): Promise<Visit> => {
    const { data } = await api.get(`/mobile/visits/${id}`)
    return data
  },

  create: async (visit: {
    property_id: number
    lead_id?: number
    scheduled_date: string
    duration_minutes: number
    notes?: string
  }): Promise<Visit> => {
    const { data } = await api.post('/mobile/visits', visit)
    return data
  },

  update: async (id: number, updates: Partial<Visit>): Promise<Visit> => {
    const { data } = await api.put(`/mobile/visits/${id}`, updates)
    return data
  },

  updateStatus: async (id: number, status: VisitStatus, notes?: string) => {
    const { data } = await api.patch(`/mobile/visits/${id}/status`, { 
      status, 
      notes 
    })
    return data
  },

  checkIn: async (id: number, gps: {
    latitude: number
    longitude: number
    accuracy_meters?: number
  }) => {
    const { data } = await api.post(`/mobile/visits/${id}/check-in`, gps)
    return data
  },

  checkOut: async (id: number, feedback: {
    rating?: number
    interest_level?: InterestLevel
    feedback_notes?: string
    will_return?: boolean
    next_steps?: string
  }) => {
    const { data } = await api.post(`/mobile/visits/${id}/check-out`, feedback)
    return data
  },

  addFeedback: async (id: number, feedback: {
    rating?: number
    interest_level?: InterestLevel
    feedback_notes?: string
    will_return?: boolean
  }) => {
    const { data } = await api.post(`/mobile/visits/${id}/feedback`, feedback)
    return data
  }
}
```

---

## 🚀 DEPLOY E TESTES

### **Migration Database**

```bash
# Desenvolvimento local
cd backend
alembic upgrade head

# Produção (Railway)
# Migration será aplicada automaticamente no próximo deploy
```

### **Testar Endpoints Localmente**

```bash
# Iniciar servidor
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload

# Acessar docs interativos
open http://localhost:8000/docs

# Testar criação de visita
curl -X POST http://localhost:8000/mobile/visits \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 1,
    "lead_id": 1,
    "scheduled_date": "2025-12-20T15:00:00Z",
    "duration_minutes": 30,
    "notes": "Visita teste"
  }'
```

---

## 📋 CHECKLIST FRONTEND

### **Fase 1: Setup (1-2 dias)**
- [ ] Criar types TypeScript
- [ ] Implementar API service
- [ ] Configurar React Query/TanStack
- [ ] Setup navegação (screens)
- [ ] Configurar permissões GPS

### **Fase 2: UI Básica (2-3 dias)**
- [ ] Tela lista de visitas
- [ ] Tela detalhes
- [ ] Tela criar visita
- [ ] Widget dashboard
- [ ] Componentes reutilizáveis

### **Fase 3: Funcionalidades Avançadas (3-4 dias)**
- [ ] Check-in com GPS
- [ ] Check-out com feedback
- [ ] Filtros e paginação
- [ ] Notificações locais
- [ ] Offline support

### **Fase 4: Polish (1-2 dias)**
- [ ] Loading states
- [ ] Error handling
- [ ] Animações
- [ ] Testes
- [ ] QA completo

---

## 📞 SUPORTE

**Dúvidas técnicas:**
- Documentação: [MOBILE_API_SPEC.md](MOBILE_API_SPEC.md)
- Swagger: http://localhost:8000/docs
- Contact: Dev Team Backend

---

**Última atualização:** 18 de dezembro de 2025  
**Próximo milestone:** QR Codes + Refresh Token  
**Status:** ✅ Pronto para integração frontend
