# 🏗️ Modelagem de Endpoints Mobile - Especificação Técnica

> **Branch:** `feat/mobile-backend-app`  
> **Data:** 18 de dezembro de 2025  
> **Fase:** Planeamento e Design de Dados

---

## 📐 CONVENÇÕES E PADRÕES

### Naming Convention
- **URL Pattern:** `/mobile/{recurso}/{id?}/{ação?}`
- **Métodos HTTP:** GET, POST, PUT, PATCH, DELETE
- **Response Format:** JSON (snake_case para consistência Python)
- **Timestamps:** ISO 8601 UTC
- **IDs:** Integer (auto-increment)

### Paginação Padrão
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "per_page": 50,
  "pages": 2
}
```

### Response Padrão Sucesso
```json
{
  "success": true,
  "data": {...},
  "message": "Operação realizada com sucesso"
}
```

### Response Padrão Erro
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descrição do erro",
    "details": {...}
  }
}
```

### Rate Limiting
- **Default:** 100 requests/minuto por utilizador
- **Upload:** 10 requests/minuto
- **IA:** 20 requests/minuto

---

## 🔐 1. AUTENTICAÇÃO MULTI-DEVICE

### `POST /auth/refresh`
**Descrição:** Renovar access token sem fazer login novamente

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_at": "2025-12-19T15:30:00Z"
}
```

**Implementação:**
- JWT com exp 60min (access) e 30 dias (refresh)
- Refresh token guardado em DB com device_info
- Invalidação em logout

---

### `POST /auth/logout`
**Descrição:** Invalidar token e sessão do dispositivo

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "device_id": "uuid-device-123",
  "logout_all": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sessão terminada"
}
```

---

### `GET /auth/devices`
**Descrição:** Listar dispositivos com sessão ativa

**Response:**
```json
{
  "devices": [
    {
      "id": "uuid-device-123",
      "name": "iPhone 14 Pro",
      "platform": "iOS",
      "app_version": "1.0.0",
      "last_active": "2025-12-18T14:00:00Z",
      "is_current": true
    }
  ]
}
```

---

### `DELETE /auth/devices/{device_id}`
**Descrição:** Revogar acesso de dispositivo específico

**Response:**
```json
{
  "success": true,
  "message": "Dispositivo removido"
}
```

---

## 📍 2. SISTEMA DE VISITAS

### Model: `Visit`
```python
class Visit(Base):
    __tablename__ = "visits"
    
    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    
    scheduled_date = Column(DateTime)
    duration_minutes = Column(Integer, default=30)
    
    status = Column(String)  # scheduled, confirmed, in_progress, completed, cancelled, no_show
    
    # Check-in/out
    checked_in_at = Column(DateTime, nullable=True)
    checked_out_at = Column(DateTime, nullable=True)
    checkin_location = Column(String, nullable=True)  # GPS coords
    
    # Feedback
    rating = Column(Integer, nullable=True)  # 1-5
    feedback_notes = Column(Text, nullable=True)
    interest_level = Column(String, nullable=True)  # baixo, medio, alto
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    property = relationship("Property")
    lead = relationship("Lead")
    agent = relationship("Agent")
```

---

### `GET /mobile/visits`
**Descrição:** Listar visitas do agente com filtros

**Query Params:**
- `page` (int, default: 1)
- `per_page` (int, default: 50, max: 100)
- `status` (string: scheduled, completed, etc)
- `date_from` (ISO date)
- `date_to` (ISO date)
- `property_id` (int)
- `lead_id` (int)

**Response:**
```json
{
  "visits": [
    {
      "id": 123,
      "property": {
        "id": 45,
        "reference": "MOV-2024-001",
        "location": "Porto",
        "photos": ["https://..."]
      },
      "lead": {
        "id": 78,
        "name": "Maria Santos",
        "phone": "+351 912345678"
      },
      "scheduled_date": "2025-12-20T15:00:00Z",
      "duration_minutes": 30,
      "status": "scheduled",
      "created_at": "2025-12-18T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 50
}
```

---

### `GET /mobile/visits/today`
**Descrição:** Widget - visitas de hoje

**Response:**
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
    "countdown_minutes": 45
  }
}
```

---

### `POST /mobile/visits`
**Descrição:** Agendar nova visita

**Request:**
```json
{
  "property_id": 45,
  "lead_id": 78,
  "scheduled_date": "2025-12-20T15:00:00Z",
  "duration_minutes": 30,
  "notes": "Cliente interessado em T3"
}
```

**Response:**
```json
{
  "success": true,
  "visit": {
    "id": 123,
    "property_id": 45,
    "lead_id": 78,
    "scheduled_date": "2025-12-20T15:00:00Z",
    "status": "scheduled"
  },
  "calendar_event_created": true
}
```

**Side Effects:**
- Criar evento no calendário
- Enviar notificação ao lead (opcional)
- Criar task automática

---

### `PUT /mobile/visits/{visit_id}`
**Descrição:** Reagendar ou editar visita

**Request:**
```json
{
  "scheduled_date": "2025-12-21T10:00:00Z",
  "notes": "Reagendado a pedido do cliente"
}
```

---

### `PATCH /mobile/visits/{visit_id}/status`
**Descrição:** Atualizar status rapidamente

**Request:**
```json
{
  "status": "confirmed"
}
```

**Status válidos:**
- `scheduled` → `confirmed`
- `confirmed` → `in_progress`
- `in_progress` → `completed`
- `*` → `cancelled`
- `scheduled` → `no_show`

---

### `POST /mobile/visits/{visit_id}/check-in`
**Descrição:** Check-in na visita com GPS

**Request:**
```json
{
  "latitude": 41.1579,
  "longitude": -8.6291,
  "accuracy_meters": 15
}
```

**Response:**
```json
{
  "success": true,
  "checked_in_at": "2025-12-20T15:02:00Z",
  "distance_from_property_meters": 5,
  "status": "in_progress"
}
```

**Validações:**
- Visita deve estar `confirmed` ou `scheduled`
- GPS deve estar próximo da propriedade (<100m alerta, <500m erro)
- Horário deve estar próximo do agendado (±30min)

---

### `POST /mobile/visits/{visit_id}/check-out`
**Descrição:** Check-out com feedback

**Request:**
```json
{
  "rating": 4,
  "interest_level": "alto",
  "feedback_notes": "Cliente muito interessado, vai consultar banco",
  "next_steps": "Aguardar aprovação de crédito"
}
```

**Response:**
```json
{
  "success": true,
  "checked_out_at": "2025-12-20T15:35:00Z",
  "duration_minutes": 33,
  "status": "completed"
}
```

**Side Effects:**
- Atualizar lead status se aplicável
- Criar nota automática no lead
- Marcar task como completa

---

### `POST /mobile/visits/{visit_id}/feedback`
**Descrição:** Adicionar feedback pós-visita (se não fez check-out)

**Request:**
```json
{
  "rating": 3,
  "interest_level": "medio",
  "feedback_notes": "Cliente precisa ver mais opções",
  "will_return": false
}
```

---

## 📱 3. QR CODES DINÂMICOS

### `GET /mobile/qr/property/{property_id}`
**Descrição:** Gerar QR code para propriedade

**Query Params:**
- `size` (int, default: 512, max: 2048) - pixels
- `format` (string: png, svg, default: png)
- `include_logo` (bool, default: true)

**Response:**
```json
{
  "qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?data=...",
  "qr_code_data": "https://crm-plus.pt/p/MOV-2024-001",
  "expires_at": null,
  "analytics_id": "qr_prop_45_abc123"
}
```

**QR Data Structure:**
```
https://crm-plus.pt/p/{reference}?src=qr&aid={agent_id}&qid={analytics_id}
```

---

### `GET /mobile/qr/agent/{agent_id}`
**Descrição:** Gerar QR code para cartão digital do agente

**Response:**
```json
{
  "qr_code_url": "https://...",
  "qr_code_data": "https://crm-plus.pt/agent/joao-silva",
  "vcard_url": "https://crm-plus.pt/agent/joao-silva/vcard",
  "digital_card_url": "https://crm-plus.pt/agent/joao-silva"
}
```

**QR leva para:**
- Página com vCard download
- Links diretos: WhatsApp, Email, Telefone
- Propriedades do agente
- Redes sociais

---

### `GET /mobile/qr/visit/{visit_id}`
**Descrição:** Gerar QR para check-in de visita

**Response:**
```json
{
  "qr_code_url": "https://...",
  "qr_code_data": "crmplus://visit/{visit_id}/checkin?token={temp_token}",
  "expires_at": "2025-12-20T16:00:00Z"
}
```

**Uso:**
- Cliente scaneia para confirmar presença
- Deep link para app ou web
- Token temporário (válido 1h antes/depois)

---

### `POST /mobile/qr/scan`
**Descrição:** Processar QR code scaneado

**Request:**
```json
{
  "qr_data": "crmplus://visit/123/checkin?token=abc...",
  "scanned_at": "2025-12-20T15:00:00Z",
  "location": {
    "latitude": 41.1579,
    "longitude": -8.6291
  }
}
```

**Response:**
```json
{
  "success": true,
  "action": "visit_checkin",
  "visit_id": 123,
  "redirect_url": "/visits/123",
  "message": "Check-in realizado com sucesso"
}
```

---

### `GET /mobile/qr/analytics`
**Descrição:** Analytics de QR scans

**Query Params:**
- `type` (property, agent, visit)
- `id` (int)
- `date_from`, `date_to`

**Response:**
```json
{
  "total_scans": 45,
  "unique_scans": 32,
  "scans_by_date": {
    "2025-12-18": 5,
    "2025-12-19": 8
  },
  "conversion_rate": 0.15,
  "top_sources": [
    {"source": "instagram", "count": 20},
    {"source": "facebook", "count": 15}
  ]
}
```

---

## 📊 4. DASHBOARD KPIs AVANÇADO

### `GET /mobile/dashboard/kpis`
**Descrição:** KPIs completos do agente

**Query Params:**
- `period` (today, week, month, year, default: today)

**Response:**
```json
{
  "period": "today",
  "date": "2025-12-18",
  "kpis": {
    "visits": {
      "today": 3,
      "completed": 1,
      "pending": 2,
      "next_visit_in": "45 minutos"
    },
    "leads": {
      "new_today": 5,
      "total_active": 28,
      "hot_leads": 7,
      "conversions_this_month": 3
    },
    "properties": {
      "total": 45,
      "active": 38,
      "sold_this_month": 2,
      "views_today": 120
    },
    "performance": {
      "response_time_avg_minutes": 12,
      "conversion_rate": 0.18,
      "goal_progress": 0.6
    }
  },
  "alerts": [
    {
      "type": "warning",
      "message": "3 leads sem contacto há mais de 3 dias",
      "action_url": "/leads?filter=no_contact_3d"
    }
  ],
  "quick_actions": [
    {"label": "Adicionar Propriedade", "action": "create_property"},
    {"label": "Ver Visitas Hoje", "action": "visits_today"}
  ]
}
```

---

### `GET /mobile/dashboard/performance`
**Descrição:** Performance detalhada do mês

**Response:**
```json
{
  "month": "2025-12",
  "metrics": {
    "properties_added": 12,
    "leads_converted": 5,
    "visits_completed": 28,
    "revenue_generated": 45000.00,
    "avg_response_time_hours": 2.5
  },
  "trends": {
    "leads": {
      "current": 28,
      "previous": 25,
      "change_percent": 12
    },
    "conversions": {
      "current": 5,
      "previous": 3,
      "change_percent": 66.7
    }
  },
  "ranking": {
    "position": 3,
    "total_agents": 15,
    "top_metric": "response_time"
  }
}
```

---

## 🤖 5. ASSISTENTE IA - AÇÕES MOBILE

### `POST /mobile/ai/schedule-visit`
**Descrição:** IA agendar visita automaticamente

**Request:**
```json
{
  "prompt": "Agendar visita com Maria Santos para a moradia no Porto amanhã às 15h",
  "context": {
    "lead_id": 78,
    "property_reference": "MOV-2024-001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "action": "visit_scheduled",
  "visit": {
    "id": 123,
    "property_id": 45,
    "lead_id": 78,
    "scheduled_date": "2025-12-19T15:00:00Z"
  },
  "ai_response": "Visita agendada para amanhã às 15h com Maria Santos na moradia MOV-2024-001 no Porto.",
  "confirmation_sent": true
}
```

---

### `POST /mobile/ai/property-evaluation`
**Descrição:** IA avaliar propriedade com fotos e dados

**Request:**
```json
{
  "property_id": 45,
  "photos": ["url1", "url2"],
  "additional_info": "Renovada recentemente, cozinha equipada"
}
```

**Response:**
```json
{
  "evaluation": {
    "estimated_value": 350000,
    "confidence": 0.85,
    "value_range": {
      "min": 330000,
      "max": 370000
    },
    "market_comparison": {
      "similar_properties": 5,
      "avg_price_per_sqm": 2333.33
    },
    "suggestions": [
      "Destacar renovação recente no anúncio",
      "Preço competitivo para a zona",
      "Fotos da cozinha podem aumentar interesse"
    ]
  },
  "market_analysis": "...",
  "selling_points": ["Recém renovada", "Localização premium", "Cozinha equipada"]
}
```

---

### `POST /mobile/ai/suggest-content`
**Descrição:** Sugestões de posts para Instagram/Facebook

**Request:**
```json
{
  "property_id": 45,
  "platform": "instagram",
  "tone": "casual"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "text": "🏠 Moradia T3 de sonho no Porto! Recém renovada com acabamentos premium. DM para mais info! 📲",
      "hashtags": ["#ImobiliariaPorto", "#MoradiaT3", "#CasaNova"],
      "best_time_to_post": "2025-12-19T18:00:00Z",
      "estimated_reach": "500-800 pessoas"
    }
  ],
  "image_suggestions": [
    "Destaque da fachada ao pôr do sol",
    "Interior da cozinha com luz natural"
  ]
}
```

---

### `POST /mobile/ai/quick-response`
**Descrição:** Gerar resposta rápida para lead

**Request:**
```json
{
  "lead_id": 78,
  "lead_message": "Gostaria de saber mais sobre a moradia T3 no Porto",
  "context": "whatsapp",
  "tone": "professional"
}
```

**Response:**
```json
{
  "suggested_response": "Olá Maria! Obrigado pelo interesse na nossa moradia T3 no Porto. É uma propriedade fantástica, recém renovada com 150m² e jardim. Tem disponibilidade para uma visita amanhã às 15h? Fico a aguardar o seu contacto!",
  "variations": [
    "Olá! Claro, tenho todo o gosto em partilhar mais detalhes...",
    "Boa tarde Maria! Essa moradia é mesmo especial..."
  ],
  "quick_actions": [
    {"label": "Agendar Visita", "action": "schedule_visit"},
    {"label": "Enviar Fotos", "action": "send_photos"}
  ]
}
```

---

## 🔔 6. WEBSOCKETS REAL-TIME

### `WS /ws/notifications`
**Descrição:** WebSocket para notificações em tempo real

**Connection:**
```javascript
ws://api.crm-plus.pt/ws/notifications?token=<jwt_token>
```

**Messages Received:**
```json
{
  "type": "new_lead",
  "data": {
    "lead_id": 89,
    "name": "João Silva",
    "property_interest": "T2 Lisboa",
    "source": "website"
  },
  "timestamp": "2025-12-18T14:30:00Z",
  "priority": "high"
}
```

**Message Types:**
- `new_lead` - Novo lead atribuído
- `visit_reminder` - Lembrete de visita (15min antes)
- `task_due` - Tarefa vencendo
- `lead_activity` - Lead abriu email/visualizou propriedade
- `message_received` - Nova mensagem de cliente

---

### `WS /ws/leads`
**Descrição:** Updates de leads em tempo real

**Messages:**
```json
{
  "type": "lead_updated",
  "lead_id": 78,
  "changes": {
    "status": "qualificado",
    "updated_by": "system",
    "reason": "Lead respondeu WhatsApp"
  }
}
```

---

## 📋 PRÓXIMOS PASSOS

1. ✅ Modelagem completa
2. 🔄 Criar schemas Pydantic para validação
3. ⏳ Implementar endpoints prioridade ALTA
4. ⏳ Configurar WebSockets
5. ⏳ Documentação Swagger
6. ⏳ Testes unitários e integração

---

**Última atualização:** 18 de dezembro de 2025  
**Responsável:** Dev Team Backend  
**Status:** Modelagem concluída - Pronto para implementação
