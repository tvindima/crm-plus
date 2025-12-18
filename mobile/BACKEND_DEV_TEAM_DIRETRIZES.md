# 📋 DIRETRIZES PARA BACKEND DEV TEAM - CRM PLUS MOBILE APP

**Data:** 18 de Dezembro de 2024  
**Versão:** 1.0.0  
**Status:** Aguardando Implementação Backend

---

## 📱 CONTEXTO

O **Frontend Mobile App** foi desenvolvido com **React Native + Expo 51.0.0** e está **80% completo**. Este documento especifica os endpoints e funcionalidades backend necessários para completar a integração e tornar o app totalmente funcional.

---

## 🔐 AUTENTICAÇÃO

### ✅ Endpoints Já Implementados
- `POST /auth/login` - Login com OAuth2 FormData (username/password)
- `GET /auth/me` - Obter usuário atual

### 🚀 Endpoints Necessários
- `POST /auth/refresh` - Refresh token JWT
- `POST /auth/logout` - Invalidar token
- `PUT /auth/me` - Atualizar perfil do usuário
- `PUT /auth/me/password` - Alterar senha

---

## 🏠 PROPRIEDADES

### 🚀 Endpoints Necessários

#### 1. Listagem e Busca
```http
GET /properties
Query Params:
  - search: string (busca por título/endereço)
  - status: 'available' | 'sold' | 'rented'
  - type: 'house' | 'apartment' | 'land' | 'commercial'
  - min_price: number
  - max_price: number
  - bedrooms: number
  - agent_id: number (filtrar por agente)

Response: Property[]
```

#### 2. Detalhes da Propriedade
```http
GET /properties/:id
Response: Property (com todas as relações)
```

#### 3. Criar Propriedade
```http
POST /properties
Body: {
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  address: string;
  city: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  features?: string[];
  photos?: string[];
}
Response: Property
```

#### 4. Atualizar Propriedade
```http
PUT /properties/:id
Body: Partial<PropertyCreateInput>
Response: Property
```

#### 5. Deletar Propriedade
```http
DELETE /properties/:id
Response: 204 No Content
```

#### 6. Upload de Fotos
```http
POST /properties/:id/photos
Content-Type: multipart/form-data
Body: FormData with 'photos' field
Response: { urls: string[] }
```

#### 7. Propriedades do Agente
```http
GET /agents/:agentId/properties
Response: Property[]
```

#### 8. Estatísticas
```http
GET /properties/stats
Response: {
  total: number;
  available: number;
  sold: number;
  rented: number;
  total_value: number;
}
```

---

## 👤 LEADS

### 🚀 Endpoints Necessários

#### 1. Listagem e Busca
```http
GET /leads
Query Params:
  - search: string (busca por nome/email/telefone)
  - status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
  - source: 'website' | 'referral' | 'social' | 'email' | 'phone' | 'other'
  - agent_id: number

Response: Lead[]
```

#### 2. Detalhes do Lead
```http
GET /leads/:id
Response: Lead (com histórico de interações)
```

#### 3. Criar Lead
```http
POST /leads
Body: {
  name: string;
  email?: string;
  phone?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  property_interest_id?: number;
}
Response: Lead
```

#### 4. Atualizar Lead
```http
PUT /leads/:id
Body: Partial<LeadCreateInput>
Response: Lead
```

#### 5. Atualizar Status
```http
PATCH /leads/:id/status
Body: { status: LeadStatus }
Response: Lead
```

#### 6. Deletar Lead
```http
DELETE /leads/:id
Response: 204 No Content
```

#### 7. Leads do Agente
```http
GET /agents/:agentId/leads
Response: Lead[]
```

#### 8. Estatísticas
```http
GET /leads/stats
Response: {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}
```

#### 9. Adicionar Nota
```http
POST /leads/:id/notes
Body: { note: string }
Response: Lead
```

#### 10. Registrar Interação
```http
POST /leads/:id/interactions
Body: {
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'other';
  notes?: string;
}
Response: 201 Created
```

---

## 📅 VISITAS

### ✅ Endpoints Já Implementados (conforme BACKEND_FRONTEND_VISITS.md)
- `GET /visits` - Listar visitas
- `GET /visits/:id` - Detalhes da visita
- `POST /visits` - Criar visita
- `PUT /visits/:id` - Atualizar visita
- `DELETE /visits/:id` - Deletar visita
- `POST /visits/:id/check-in` - Check-in com GPS
- `POST /visits/:id/check-out` - Check-out
- `POST /visits/:id/cancel` - Cancelar visita
- `POST /visits/:id/reschedule` - Reagendar visita
- `GET /visits/stats` - Estatísticas

### 🚀 Endpoints Adicionais Necessários

#### 1. Visitas do Dia
```http
GET /visits/today
Response: Visit[]
```

#### 2. Próximas Visitas
```http
GET /visits/upcoming
Query Params:
  - limit: number (default: 5)
Response: Visit[]
```

---

## 📊 DASHBOARD

### 🚀 Endpoints Necessários

#### 1. Métricas do Agente
```http
GET /dashboard/metrics
Response: {
  properties: {
    total: number;
    available: number;
    sold: number;
    rented: number;
  };
  leads: {
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
  };
  visits: {
    today: number;
    week: number;
    month: number;
    completed: number;
  };
  conversions: {
    total: number;
    month: number;
    rate: number;
  };
}
```

#### 2. Atividades Recentes
```http
GET /dashboard/activities
Query Params:
  - limit: number (default: 10)
Response: Activity[]

Activity: {
  id: number;
  type: 'property_created' | 'lead_created' | 'visit_scheduled' | 'conversion';
  title: string;
  description: string;
  created_at: string;
}
```

#### 3. Gráfico de Performance
```http
GET /dashboard/performance
Query Params:
  - period: 'week' | 'month' | 'year'
Response: {
  labels: string[];
  properties: number[];
  leads: number[];
  conversions: number[];
}
```

---

## 🤖 ASSISTENTE IA (Futuro)

### 🚀 Endpoints Necessários

#### 1. Chat com Assistente
```http
POST /ai/chat
Body: {
  message: string;
  context?: {
    property_id?: number;
    lead_id?: number;
  };
}
Response: {
  message: string;
  suggestions?: string[];
}
```

#### 2. Análise de Propriedade
```http
POST /ai/analyze-property
Body: {
  property_id: number;
}
Response: {
  market_analysis: string;
  pricing_recommendation: number;
  selling_points: string[];
  improvements: string[];
}
```

#### 3. Sugestões de Lead
```http
GET /ai/lead-suggestions/:leadId
Response: {
  next_actions: string[];
  best_properties: Property[];
  communication_tips: string[];
}
```

---

## 📷 UPLOAD DE MÍDIA

### 🚀 Integração Necessária

**Usar Cloudinary** (conforme documentação existente):

#### 1. Configuração Backend
```python
# Backend precisa:
- Cloudinary SDK instalado
- Variáveis de ambiente configuradas
- Middleware para upload multipart/form-data
```

#### 2. Endpoint de Upload Genérico
```http
POST /uploads/media
Content-Type: multipart/form-data
Body: {
  file: File;
  type: 'property' | 'profile' | 'document';
  entity_id?: number;
}
Response: {
  url: string;
  public_id: string;
  format: string;
  resource_type: string;
}
```

---

## 🔔 NOTIFICAÇÕES PUSH

### 🚀 Endpoints Necessários

#### 1. Registrar Token do Dispositivo
```http
POST /notifications/register
Body: {
  token: string;
  platform: 'ios' | 'android';
  device_id: string;
}
Response: 201 Created
```

#### 2. Preferências de Notificação
```http
GET /notifications/preferences
Response: {
  visits_reminder: boolean;
  new_leads: boolean;
  property_updates: boolean;
  chat_messages: boolean;
}

PUT /notifications/preferences
Body: NotificationPreferences
Response: NotificationPreferences
```

#### 3. Enviar Notificação Manual
```http
POST /notifications/send
Body: {
  title: string;
  body: string;
  data?: object;
  user_id?: number;
}
Response: 201 Created
```

---

## 🗺️ GEOLOCALIZAÇÃO

### 🚀 Funcionalidades Necessárias

#### 1. Validação de Check-in
```python
# Backend deve validar:
- Latitude/Longitude do check-in
- Proximidade com coordenadas da propriedade
- Tolerância de 100 metros
```

#### 2. Geocoding de Endereços
```http
POST /geo/geocode
Body: {
  address: string;
  city: string;
  postal_code: string;
}
Response: {
  latitude: number;
  longitude: number;
  formatted_address: string;
}
```

---

## 📈 ANALYTICS & TRACKING

### 🚀 Eventos a Trackear

O Backend deve armazenar e processar os seguintes eventos:

```typescript
// Eventos do Frontend
{
  "user_login": { timestamp, device, platform },
  "property_viewed": { property_id, duration },
  "lead_created": { lead_id, source },
  "visit_scheduled": { visit_id, property_id, lead_id },
  "visit_check_in": { visit_id, location },
  "visit_check_out": { visit_id, duration },
  "conversion": { property_id, lead_id, value },
  "search_performed": { query, filters, results_count }
}
```

#### Endpoint de Analytics
```http
POST /analytics/track
Body: {
  event: string;
  properties: object;
  timestamp: string;
}
Response: 201 Created
```

---

## 🔒 PERMISSÕES & RBAC

### 🚀 Sistema de Roles Necessário

```typescript
// Roles
enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  VIEWER = 'viewer'
}

// Permissões por Role
{
  admin: ['*'], // Todas as permissões
  manager: [
    'properties.*',
    'leads.*',
    'visits.*',
    'team.view',
    'reports.*'
  ],
  agent: [
    'properties.view',
    'properties.create',
    'properties.update:own',
    'leads.*',
    'visits.*'
  ],
  viewer: [
    'properties.view',
    'leads.view',
    'visits.view'
  ]
}
```

#### Endpoint de Verificação
```http
GET /auth/permissions
Response: {
  role: UserRole;
  permissions: string[];
  can: (action: string) => boolean;
}
```

---

## 📱 CONFIGURAÇÕES DO APP

### 🚀 Endpoint de Configurações Dinâmicas

```http
GET /config/app
Response: {
  features: {
    dark_mode: boolean;
    ai_assistant: boolean;
    offline_mode: boolean;
    analytics: boolean;
  };
  limits: {
    max_property_photos: number;
    max_visit_duration_hours: number;
  };
  contact: {
    support_email: string;
    support_phone: string;
    whatsapp: string;
  };
  version: {
    minimum_required: string;
    latest: string;
    force_update: boolean;
  };
}
```

---

## 🔄 SINCRONIZAÇÃO OFFLINE

### 🚀 Endpoints para Modo Offline

#### 1. Sincronizar Dados
```http
POST /sync/push
Body: {
  properties: Property[];
  leads: Lead[];
  visits: Visit[];
  last_sync: string;
}
Response: {
  conflicts: any[];
  synced: number;
}
```

#### 2. Download de Dados
```http
GET /sync/pull
Query Params:
  - since: ISO timestamp
Response: {
  properties: Property[];
  leads: Lead[];
  visits: Visit[];
  deleted_ids: {
    properties: number[];
    leads: number[];
    visits: number[];
  };
}
```

---

## 🧪 TESTES NECESSÁRIOS

### Backend deve garantir:

1. **Testes Unitários**
   - Todos os endpoints com 80%+ coverage
   - Validação de inputs
   - Tratamento de erros

2. **Testes de Integração**
   - Fluxo completo de autenticação
   - CRUD de propriedades, leads e visitas
   - Upload de mídia

3. **Testes de Performance**
   - Listagens com paginação eficiente
   - Queries otimizadas com índices
   - Cache para dados frequentes

4. **Testes de Segurança**
   - Validação de tokens JWT
   - Rate limiting por endpoint
   - Sanitização de inputs

---

## 📚 DOCUMENTAÇÃO

### Backend deve fornecer:

1. **Swagger/OpenAPI**
   - Documentação automática de todos os endpoints
   - Exemplos de request/response
   - Schemas de validação

2. **Postman Collection**
   - Collection completa para testes
   - Ambientes (dev, staging, prod)
   - Exemplos de cada endpoint

3. **README Backend**
   - Setup do ambiente
   - Variáveis de ambiente necessárias
   - Como rodar migrations
   - Como popular dados de teste

---

## 🚀 PRIORIZAÇÃO

### FASE 1 (Urgente - 3 dias)
- ✅ Autenticação completa (login, refresh, logout)
- ✅ CRUD Propriedades
- ✅ CRUD Leads
- ✅ Dashboard metrics

### FASE 2 (Alta - 5 dias)
- ✅ Estatísticas e analytics
- ✅ Upload de fotos (Cloudinary)
- ✅ Filtros e busca avançada
- ✅ Notificações push

### FASE 3 (Média - 7 dias)
- ✅ Geolocalização e geocoding
- ✅ Permissões e RBAC
- ✅ Sincronização offline
- ✅ Configurações dinâmicas

### FASE 4 (Baixa - Futuro)
- ⏳ Assistente IA
- ⏳ Analytics avançado
- ⏳ Relatórios complexos

---

## 📞 CONTATO FRONTEND TEAM

Para dúvidas sobre integração ou necessidades adicionais:
- **Slack:** #frontend-mobile
- **Email:** frontend@crmplus.pt
- **Documentação Frontend:** `/mobile/docs/`

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de marcar como concluído, verificar:

- [ ] Todos os endpoints da Fase 1 implementados
- [ ] Swagger/OpenAPI documentado
- [ ] Testes com 80%+ coverage
- [ ] Validação de inputs em todos os endpoints
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Logs estruturados (Winston/similar)
- [ ] Monitoramento (Sentry/similar)
- [ ] CI/CD pipeline configurado
- [ ] Deploy em staging testado
- [ ] Frontend Dev Team notificado

---

**Desenvolvido por:** Frontend Mobile Dev Team  
**Última atualização:** 18/12/2024 às 14:30
