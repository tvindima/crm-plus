# 📚 CRM PLUS MOBILE API - Documentação Completa

**Versão:** 2.0 (FASE 1 + FASE 2)  
**Base URL:** `https://crm-plus-backend-production.up.railway.app`  
**Autenticação:** JWT Bearer Token  
**Total Endpoints:** 33

---

## 🔐 Autenticação

### POST /auth/mobile/login

**Descrição:** Login exclusivo para agentes mobile  
**Body:**
```json
{
  "email": "agente@example.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "qwZ8KpR3vT2nL6mD9jH4fY1cX5bN0aW...",
  "token_type": "bearer",
  "expires_at": "2025-01-23T10:30:00Z"
}
```

**Errors:**
- `401` - Email ou password inválidos
- `403` - Conta inativa ou utilizador sem agent_id

---

### POST /auth/refresh

**Descrição:** Renovar access_token usando refresh_token (rotation)  
**Body:**
```json
{
  "refresh_token": "qwZ8KpR3vT2nL6mD9jH4fY1cX5bN0aW..."
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "NEW_TOKEN_HERE...",  // Novo token (antigo revogado)
  "token_type": "bearer",
  "expires_at": "2025-01-23T10:30:00Z"
}
```

**Errors:**
- `401` - Refresh token inválido ou expirado

---

### GET /auth/sessions

**Descrição:** Listar todos os dispositivos ativos (FASE 2)  
**Headers:**
- `Authorization: Bearer <JWT>`
- `X-Refresh-Token: <REFRESH_TOKEN>` (opcional - marca sessão atual)

**Response 200:**
```json
[
  {
    "id": 1,
    "device_name": "iPhone 14 Pro",
    "device_type": "iOS",
    "ip_address": "192.168.1.10",
    "created_at": "2025-01-20T10:00:00Z",
    "last_used_at": "2025-01-22T15:30:00Z",
    "is_current": true
  },
  {
    "id": 2,
    "device_name": "Samsung Galaxy S23",
    "device_type": "Android",
    "ip_address": "192.168.1.11",
    "created_at": "2025-01-15T08:00:00Z",
    "last_used_at": "2025-01-21T12:00:00Z",
    "is_current": false
  }
]
```

---

### DELETE /auth/sessions/{session_id}

**Descrição:** Logout de dispositivo específico (FASE 2)

**Response 200:**
```json
{
  "message": "Logout efetuado em iPhone 14 Pro",
  "device_name": "iPhone 14 Pro",
  "device_type": "iOS"
}
```

**Errors:**
- `404` - Sessão não encontrada
- `400` - Sessão já revogada

---

### POST /auth/sessions/revoke-all

**Descrição:** Logout em todos os dispositivos EXCETO o atual (FASE 2)  
**Headers:**
- `Authorization: Bearer <JWT>`
- `X-Refresh-Token: <REFRESH_TOKEN>` (obrigatório)

**Response 200:**
```json
{
  "message": "Logout efetuado em 3 dispositivo(s)",
  "revoked_sessions": 3,
  "current_device": "iPhone 14 Pro"
}
```

**Errors:**
- `401` - Refresh token inválido

---

## 🏠 Properties

### GET /mobile/properties

**Descrição:** Listar propriedades do agente

**Query Params:**
- `skip` (int, default=0)
- `limit` (int, default=50, max=100)
- `status` (string, opcional): "available", "reserved", "sold"
- `search` (string, opcional): busca por título/referência

**Response 200:**
```json
[
  {
    "id": 123,
    "reference": "REF-001",
    "title": "Apartamento T2 Moderno com Varanda",
    "address": "Av. da Liberdade, 123, Lisboa",
    "location": "Lisboa",
    "price": 350000,
    "bedrooms": 2,
    "bathrooms": 2,
    "area": 85,
    "property_type": "Apartamento",
    "status": "available",
    "photos": "https://res.cloudinary.com/.../photo1.jpg,https://res.cloudinary.com/.../photo2.jpg",
    "agent_id": 5,
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-20T14:30:00Z"
  }
]
```

---

### GET /mobile/properties/{id}

**Descrição:** Detalhes completos de uma propriedade

**Response 200:**
```json
{
  "id": 123,
  "reference": "REF-001",
  "title": "Apartamento T2 Moderno com Varanda",
  "description": "Excelente apartamento totalmente renovado...",
  "address": "Av. da Liberdade, 123, Lisboa",
  "location": "Lisboa",
  "price": 350000,
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 85,
  "property_type": "Apartamento",
  "status": "available",
  "photos": "url1,url2,url3",
  "agent_id": 5,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-20T14:30:00Z"
}
```

**Errors:**
- `404` - Propriedade não encontrada
- `403` - Sem permissão (se não for do agente)

---

### POST /mobile/cloudinary/upload-config

**Descrição:** Obter configuração para upload direto Cloudinary (FASE 2)

**Response 200:**
```json
{
  "cloud_name": "dtpk4oqoa",
  "upload_preset": "crm-plus-mobile",
  "api_base_url": "https://api.cloudinary.com/v1_1/dtpk4oqoa/image/upload",
  "folder": "crm-plus/mobile-uploads",
  "max_file_size_mb": 10,
  "allowed_formats": ["jpg", "jpeg", "png", "heic", "webp"]
}
```

---

### POST /mobile/properties/{id}/photos/bulk

**Descrição:** Salvar múltiplas fotos (URLs Cloudinary) (FASE 2)

**Body:**
```json
{
  "photos": [
    {"url": "https://res.cloudinary.com/dtpk4oqoa/image/upload/v1234/photo1.jpg"},
    {"url": "https://res.cloudinary.com/dtpk4oqoa/image/upload/v1234/photo2.jpg"}
  ]
}
```

**Response 200:**
```json
{
  "success": true,
  "property_id": 123,
  "photos_uploaded": 2,
  "total_photos": 5,
  "urls": [
    "https://res.cloudinary.com/dtpk4oqoa/image/upload/v1234/photo1.jpg",
    "https://res.cloudinary.com/dtpk4oqoa/image/upload/v1234/photo2.jpg"
  ]
}
```

**Errors:**
- `400` - URL inválida (não é do Cloudinary correto)
- `404` - Propriedade não encontrada
- `403` - Sem permissão

---

## 👥 Leads

### GET /mobile/leads

**Descrição:** Listar leads do agente

**Query Params:**
- `skip` (int, default=0)
- `limit` (int, default=50)
- `status` (string, opcional): "new", "contacted", "qualified", "visit_scheduled", "negotiating", "converted", "lost"

**Response 200:**
```json
[
  {
    "id": 456,
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+351 912 345 678",
    "source": "Website",
    "notes": "Interessado em T2 em Lisboa",
    "property_id": 123,
    "assigned_agent_id": 5,
    "status": "new",
    "created_at": "2025-01-22T10:00:00Z",
    "updated_at": "2025-01-22T10:00:00Z"
  }
]
```

---

### POST /mobile/leads

**Descrição:** Criar lead em campo (auto-atribuição)

**Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+351 912 987 654",
  "source": "Mobile App",
  "notes": "Conheci na feira imobiliária. Quer apartamento T3."
}
```

**Response 201:**
```json
{
  "id": 457,
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "+351 912 987 654",
  "source": "Mobile App",
  "notes": "Conheci na feira imobiliária. Quer apartamento T3.",
  "assigned_agent_id": 5,  // Auto-atribuído do JWT
  "status": "new",  // Sempre NEW ao criar
  "created_at": "2025-01-22T11:00:00Z"
}
```

**Side Effects (FASE 2):**
- Envia notificação WebSocket `new_lead` ao agente

**Errors:**
- `403` - User não tem agent_id (não é agente)
- `422` - Dados inválidos (nome obrigatório)

---

### PATCH /mobile/leads/{id}/status

**Descrição:** Atualizar status do lead

**Body:**
```json
{
  "status": "qualified"
}
```

**Response 200:**
```json
{
  "id": 456,
  "status": "qualified",
  "updated_at": "2025-01-22T11:30:00Z"
}
```

**Errors:**
- `404` - Lead não encontrado
- `403` - Sem permissão
- `422` - Status inválido

---

## 📅 Visits

### GET /mobile/visits/upcoming

**Descrição:** Próximas visitas do agente (próximas 7 dias)

**Response 200:**
```json
[
  {
    "id": 789,
    "property_id": 123,
    "property": {
      "reference": "REF-001",
      "title": "Apartamento T2 Moderno",
      "address": "Av. da Liberdade, 123"
    },
    "lead_id": 456,
    "lead": {
      "name": "João Silva",
      "phone": "+351 912 345 678"
    },
    "scheduled_at": "2025-01-23T14:00:00Z",
    "duration": 60,
    "status": "scheduled",
    "notes": "Cliente muito interessado"
  }
]
```

---

### POST /mobile/visits

**Descrição:** Agendar nova visita

**Body:**
```json
{
  "property_id": 123,
  "lead_id": 456,
  "scheduled_date": "2025-01-25T14:00:00Z",
  "duration": 60,
  "notes": "Primeira visita - mostrar todos os quartos"
}
```

**Response 201:**
```json
{
  "id": 790,
  "property_id": 123,
  "lead_id": 456,
  "agent_id": 5,  // Auto do JWT
  "scheduled_date": "2025-01-25T14:00:00Z",
  "scheduled_at": "2025-01-25T14:00:00Z",
  "duration": 60,
  "notes": "Primeira visita - mostrar todos os quartos",
  "status": "scheduled",
  "created_at": "2025-01-22T11:00:00Z"
}
```

**Side Effects:**
- Atualiza lead status para `visit_scheduled`
- Cria task automática no calendário
- **(FASE 2)** Envia notificação WebSocket `visit_scheduled`

**Errors:**
- `404` - Property ou Lead não encontrados
- `403` - User sem agent_id

---

### PATCH /mobile/visits/{id}/status

**Descrição:** Atualizar status da visita

**Body:**
```json
{
  "status": "completed"  // ou "cancelled", "rescheduled"
}
```

**Response 200:**
```json
{
  "id": 789,
  "status": "completed",
  "updated_at": "2025-01-23T15:00:00Z"
}
```

---

### POST /mobile/visits/{id}/check-in

**Descrição:** Fazer check-in na visita (GPS tracking)

**Body:**
```json
{
  "latitude": 38.7223,
  "longitude": -9.1393,
  "timestamp": "2025-01-23T14:00:00Z"
}
```

**Response 200:**
```json
{
  "visit_id": 789,
  "check_in_time": "2025-01-23T14:00:00Z",
  "location": {
    "latitude": 38.7223,
    "longitude": -9.1393
  },
  "message": "Check-in efetuado com sucesso"
}
```

---

### POST /mobile/visits/{id}/check-out

**Descrição:** Fazer check-out da visita

**Body:**
```json
{
  "latitude": 38.7223,
  "longitude": -9.1393,
  "timestamp": "2025-01-23T15:00:00Z",
  "client_showed_up": true
}
```

**Response 200:**
```json
{
  "visit_id": 789,
  "check_out_time": "2025-01-23T15:00:00Z",
  "duration_minutes": 60,
  "message": "Check-out efetuado com sucesso"
}
```

---

## 📊 Dashboard

### GET /mobile/dashboard/stats

**Descrição:** Estatísticas do agente (hoje/mês)

**Response 200:**
```json
{
  "today": {
    "visits": 3,
    "tasks": 5,
    "new_leads": 2
  },
  "month": {
    "properties_added": 12,
    "leads_converted": 8,
    "total_visits": 45,
    "pending_tasks": 15
  },
  "quick_stats": {
    "active_properties": 23,
    "total_leads": 67,
    "upcoming_visits": 8
  }
}
```

---

## 🔔 WebSocket Real-Time (FASE 2)

### WS /mobile/ws?token={JWT}

**Descrição:** Conexão WebSocket para notificações real-time

**Connection:**
```javascript
const ws = new WebSocket('wss://crm-plus-backend-production.up.railway.app/mobile/ws?token=<JWT_TOKEN>');
```

**Mensagens Recebidas:**

**1. Conexão estabelecida:**
```json
{
  "type": "connected",
  "message": "WebSocket conectado com sucesso",
  "timestamp": "2025-01-22T10:00:00Z"
}
```

**2. Novo lead:**
```json
{
  "type": "new_lead",
  "title": "Novo Lead Recebido! 🎉",
  "body": "João Silva - Apartamento T2",
  "data": {
    "lead_id": 123,
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "+351 912 345 678",
    "source": "Website"
  },
  "timestamp": "2025-01-22T10:30:00Z",
  "sound": "default"
}
```

**3. Visita agendada:**
```json
{
  "type": "visit_scheduled",
  "title": "Visita Agendada 📅",
  "body": "2025-01-25 14:00 - Rua das Flores, 123",
  "data": {
    "visit_id": 456,
    "property_id": 789,
    "property_address": "Rua das Flores, 123",
    "scheduled_at": "2025-01-25T14:00:00Z",
    "lead_name": "Maria Santos"
  },
  "timestamp": "2025-01-22T10:31:00Z",
  "sound": "default"
}
```

**4. Lembrete visita (30min antes):**
```json
{
  "type": "visit_reminder",
  "title": "Lembrete: Visita em 30 minutos! ⏰",
  "body": "Rua das Flores, 123",
  "data": {
    "visit_id": 456,
    "property_address": "Rua das Flores, 123",
    "minutes_until": 30
  },
  "timestamp": "2025-01-25T13:30:00Z",
  "sound": "alarm",
  "priority": "high"
}
```

**Keep-alive (ping/pong):**
```javascript
// Cliente envia:
ws.send('ping');

// Servidor responde:
{
  "type": "pong",
  "timestamp": "2025-01-22T10:35:00Z"
}
```

---

## ⚠️ Error Responses (FASE 2)

Todos os endpoints retornam erros padronizados:

### 400 - Bad Request
```json
{
  "error": "Dados inválidos",
  "detail": "Descrição específica do erro"
}
```

### 401 - Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 - Forbidden
```json
{
  "error": "Sem permissão",
  "detail": "Não tem permissão para esta ação"
}
```

### 404 - Not Found
```json
{
  "error": "Recurso não encontrado",
  "detail": "Propriedade com ID 123 não encontrada"
}
```

### 409 - Conflict
```json
{
  "error": "Conflito",
  "detail": "Email já está em uso"
}
```

### 422 - Validation Error
```json
{
  "error": "Dados inválidos",
  "detail": "email: field required | phone: invalid format",
  "fields": ["email", "phone"]
}
```

### 503 - Service Unavailable
```json
{
  "error": "Serviço temporariamente indisponível",
  "detail": "Falha no upload para Cloudinary",
  "retry": true
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor",
  "detail": "Ocorreu um erro inesperado. Por favor, tente novamente.",
  "support": "Se o problema persistir, contacte o suporte."
}
```

---

## 📝 Resumo Endpoints

| Categoria | Endpoint | Método | Descrição |
|-----------|----------|--------|-----------|
| **Auth** | `/auth/mobile/login` | POST | Login agente |
| | `/auth/refresh` | POST | Renovar token |
| | `/auth/sessions` | GET | Listar dispositivos (FASE 2) |
| | `/auth/sessions/{id}` | DELETE | Logout dispositivo (FASE 2) |
| | `/auth/sessions/revoke-all` | POST | Logout todos (FASE 2) |
| **Profile** | `/mobile/auth/me` | GET | Perfil agente |
| **Properties** | `/mobile/properties` | GET | Listar propriedades |
| | `/mobile/properties/{id}` | GET | Detalhes propriedade |
| | `/mobile/properties` | POST | Criar propriedade |
| | `/mobile/properties/{id}` | PUT | Editar propriedade |
| | `/mobile/properties/{id}/status` | PATCH | Atualizar status |
| | `/mobile/properties/{id}/photos/upload` | POST | Upload foto (file) |
| | `/mobile/properties/{id}/photos/bulk` | POST | Upload fotos (URLs) (FASE 2) |
| | `/mobile/cloudinary/upload-config` | GET | Config Cloudinary (FASE 2) |
| **Leads** | `/mobile/leads` | GET | Listar leads |
| | `/mobile/leads/{id}` | GET | Detalhes lead |
| | `/mobile/leads` | POST | Criar lead |
| | `/mobile/leads/{id}` | PUT | Editar lead |
| | `/mobile/leads/{id}/status` | PATCH | Atualizar status |
| | `/mobile/leads/{id}/contact` | POST | Registar contacto |
| **Visits** | `/mobile/visits` | GET | Listar visitas |
| | `/mobile/visits/upcoming` | GET | Próximas visitas |
| | `/mobile/visits/today` | GET | Visitas hoje |
| | `/mobile/visits/{id}` | GET | Detalhes visita |
| | `/mobile/visits` | POST | Agendar visita |
| | `/mobile/visits/{id}` | PUT | Editar visita |
| | `/mobile/visits/{id}/status` | PATCH | Atualizar status |
| | `/mobile/visits/{id}/check-in` | POST | Check-in |
| | `/mobile/visits/{id}/check-out` | POST | Check-out |
| | `/mobile/visits/{id}/feedback` | POST | Adicionar feedback |
| **Tasks** | `/mobile/tasks` | GET | Listar tarefas |
| | `/mobile/tasks/today` | GET | Tarefas hoje |
| | `/mobile/tasks` | POST | Criar tarefa |
| | `/mobile/tasks/{id}/status` | PATCH | Atualizar status |
| **Dashboard** | `/mobile/dashboard/stats` | GET | Estatísticas |
| | `/mobile/dashboard/recent-activity` | GET | Atividade recente |
| **Calendar** | `/mobile/calendar/day/{date}` | GET | Visitas do dia |
| | `/mobile/calendar/month/{year}/{month}` | GET | Visitas do mês |
| **WebSocket** | `/mobile/ws?token={JWT}` | WS | Real-time notifications (FASE 2) |

**Total:** 33 endpoints (20 FASE 1 + 13 FASE 2)

---

## 🧪 Testing

### Swagger UI
Aceder: `https://crm-plus-backend-production.up.railway.app/docs`

### Exemplo cURL

```bash
# 1. Login
curl -X POST https://crm-plus-backend-production.up.railway.app/auth/mobile/login \
  -H "Content-Type: application/json" \
  -d '{"email": "agente@example.com", "password": "senha123"}'

# 2. Listar propriedades
curl -X GET https://crm-plus-backend-production.up.railway.app/mobile/properties \
  -H "Authorization: Bearer <JWT_TOKEN>"

# 3. Criar lead
curl -X POST https://crm-plus-backend-production.up.railway.app/mobile/leads \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@example.com", "phone": "+351912345678"}'
```

---

## 📦 QA Data

Script de seed data disponível: `backend/seed_qa_data.py`

```bash
# Criar dados de teste
cd backend
source .venv/bin/activate
python seed_qa_data.py --reset --properties 10 --leads 15 --visits 20

# Login agente teste:
# Email: agente.teste@crmplus.com
# Password: teste123
```

---

**Documentação gerada:** 22 Jan 2025  
**Backend Version:** 2.0 (FASE 1 + FASE 2 complete)
