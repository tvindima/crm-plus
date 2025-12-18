# 🔍 Auditoria Completa de APIs - Mobile Backend

> **Branch:** `feat/mobile-backend-app`  
> **Data:** 18 de dezembro de 2025  
> **Status:** ✅ Auditoria Completa

---

## 📊 RESUMO EXECUTIVO

### APIs Existentes: **15 módulos**
### Total de Endpoints: **~100+ endpoints**
### Cobertura Mobile Atual: **30%**
### Endpoints a Criar: **~25 novos**

---

## 1️⃣ AUTENTICAÇÃO & USERS

### ✅ Existente - `/api/v1/auth`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/auth/login` | POST | ✅ | ✅ Token JWT |
| `/auth/me` | GET | ✅ | ✅ |

### 🔴 Faltante - Autenticação Multi-Device
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/auth/refresh` | POST | 🔴 Alta | Refresh token para sessões longas |
| `/auth/logout` | POST | 🟡 Média | Invalidar token |
| `/auth/devices` | GET | 🟢 Baixa | Listar dispositivos ativos |
| `/auth/devices/{id}/revoke` | DELETE | 🟢 Baixa | Revogar acesso de dispositivo |

### ✅ Existente - `/users`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/users/` | GET | ✅ | ⚠️ Precisa paginação |
| `/users/me` | GET | ✅ | ✅ |
| `/users/{id}` | GET | ✅ | ✅ |
| `/users/` | POST | ✅ | ❌ Admin only |
| `/users/{id}` | PUT | ✅ | ⚠️ |
| `/users/me/profile` | PUT | ✅ | ✅ |
| `/users/me/password` | PUT | ✅ | ✅ |
| `/users/{id}` | DELETE | ✅ | ❌ Admin only |

**Avaliação:** 
- ✅ CRUD completo
- ⚠️ Falta rate limiting para mobile
- ⚠️ Falta validação de força de password

---

## 2️⃣ PROPRIEDADES (PROPERTIES)

### ✅ Existente - `/properties`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/properties/` | GET | ✅ | ⚠️ Filtros básicos |
| `/properties/{id}` | GET | ✅ | ✅ |
| `/properties/` | POST | ✅ | ✅ |
| `/properties/{id}` | PUT | ✅ | ✅ |
| `/properties/{id}` | DELETE | ✅ | ✅ |
| `/properties/{id}/upload` | POST | ✅ | ⚠️ Validação mobile |

### ✅ Mobile Optimizado - `/mobile/properties`
| Endpoint | Método | Status | Funcionalidade |
|----------|--------|--------|----------------|
| `/mobile/properties` | GET | ✅ | Filtros avançados + my_properties |
| `/mobile/properties/{id}` | GET | ✅ | Detalhes completos |
| `/mobile/properties` | POST | ✅ | Auto-assign a agente |
| `/mobile/properties/{id}` | PUT | ✅ | Com validação permissões |
| `/mobile/properties/{id}/status` | PATCH | ✅ | Update rápido |
| `/mobile/properties/{id}/photos/upload` | POST | ✅ | Max 10MB, otimizado |

### 🔴 Faltante - Funcionalidades Avançadas
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/mobile/properties/{id}/favorite` | POST | 🟡 Média | Favoritar propriedade |
| `/mobile/properties/{id}/share` | POST | 🟡 Média | Gerar link partilha |
| `/mobile/properties/{id}/qrcode` | GET | 🔴 Alta | Gerar QR code dinâmico |
| `/mobile/properties/nearby` | GET | 🟢 Baixa | Propriedades próximas (GPS) |
| `/mobile/properties/{id}/analytics` | GET | 🟢 Baixa | Visualizações, cliques, etc |

**Avaliação:**
- ✅ CRUD mobile completo
- ✅ Upload otimizado
- 🔴 Falta QR codes
- 🔴 Falta sistema de favoritos
- 🔴 Falta analytics

---

## 3️⃣ LEADS

### ✅ Existente - `/leads`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/leads/` | GET | ✅ | ⚠️ Filtros limitados |
| `/leads/{id}` | GET | ✅ | ✅ |
| `/leads/` | POST | ✅ | ✅ |
| `/leads/from-website` | POST | ✅ | ❌ Não mobile |
| `/leads/{id}` | PUT | ✅ | ✅ |
| `/leads/{id}/assign` | POST | ✅ | ⚠️ |
| `/leads/distribute` | POST | ✅ | ❌ Admin only |
| `/leads/{id}` | DELETE | ✅ | ✅ |
| `/leads/stats` | GET | ✅ | ⚠️ Precisa otimização |
| `/leads/analytics/conversion` | GET | ✅ | ⚠️ |
| `/leads/analytics/agent-performance` | GET | ✅ | ⚠️ |
| `/leads/analytics/funnel` | GET | ✅ | ⚠️ |

### ✅ Mobile Optimizado - `/mobile/leads`
| Endpoint | Método | Status | Funcionalidade |
|----------|--------|--------|----------------|
| `/mobile/leads` | GET | ✅ | Filtros + my_leads default |
| `/mobile/leads/{id}` | GET | ✅ | Com validação permissões |
| `/mobile/leads/{id}/status` | PATCH | ✅ | Update rápido |
| `/mobile/leads/{id}/contact` | POST | ✅ | Registar contacto |

### 🔴 Faltante - Funcionalidades Mobile
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/mobile/leads/{id}/call` | POST | 🔴 Alta | Iniciar chamada + log automático |
| `/mobile/leads/{id}/whatsapp` | POST | 🔴 Alta | Abrir WhatsApp + template mensagem |
| `/mobile/leads/{id}/email` | POST | 🟡 Média | Enviar email + template |
| `/mobile/leads/{id}/schedule-visit` | POST | 🔴 Alta | Agendar visita rápida |
| `/mobile/leads/{id}/notes` | GET | 🟡 Média | Histórico de notas |
| `/mobile/leads/{id}/notes` | POST | 🟡 Média | Adicionar nota |
| `/mobile/leads/quick-stats` | GET | 🟡 Média | Stats rápidas widget |

**Avaliação:**
- ✅ CRUD básico mobile
- ✅ Contactos básicos
- 🔴 Falta integração chamadas/WhatsApp
- 🔴 Falta agendamento visitas
- 🔴 Falta sistema de notas estruturado

---

## 4️⃣ TAREFAS & CALENDAR

### ✅ Existente - `/calendar/tasks`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/calendar/tasks` | GET | ✅ | ⚠️ |
| `/calendar/tasks/{id}` | GET | ✅ | ✅ |
| `/calendar/tasks` | POST | ✅ | ✅ |
| `/calendar/tasks/{id}` | PUT | ✅ | ✅ |
| `/calendar/tasks/{id}/complete` | POST | ✅ | ✅ |
| `/calendar/tasks/{id}/cancel` | POST | ✅ | ✅ |
| `/calendar/tasks/{id}` | DELETE | ✅ | ✅ |
| `/calendar/tasks/today` | GET | ✅ | ✅ |
| `/calendar/tasks/week` | GET | ✅ | ✅ |
| `/calendar/tasks/overdue` | GET | ✅ | ✅ |
| `/calendar/tasks/stats` | GET | ✅ | ⚠️ |

### ✅ Existente - `/calendar` (Eventos)
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/calendar/` | GET | ✅ | ⚠️ |
| `/calendar/{id}` | GET | ✅ | ✅ |
| `/calendar/` | POST | ✅ | ✅ |
| `/calendar/{id}` | PUT | ✅ | ✅ |
| `/calendar/{id}` | DELETE | ✅ | ✅ |

### ✅ Mobile Optimizado - `/mobile/tasks`
| Endpoint | Método | Status | Funcionalidade |
|----------|--------|--------|----------------|
| `/mobile/tasks` | GET | ✅ | Filtros + my_tasks |
| `/mobile/tasks/today` | GET | ✅ | Widget otimizado |
| `/mobile/tasks` | POST | ✅ | Auto-assign |
| `/mobile/tasks/{id}/status` | PATCH | ✅ | Update rápido |

### 🔴 Faltante - Visitas & Agendamentos
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/mobile/visits` | GET | 🔴 Alta | Listar visitas agendadas |
| `/mobile/visits/{id}` | GET | 🔴 Alta | Detalhes visita |
| `/mobile/visits` | POST | 🔴 Alta | Agendar nova visita |
| `/mobile/visits/{id}` | PUT | 🔴 Alta | Reagendar |
| `/mobile/visits/{id}/status` | PATCH | 🔴 Alta | Confirmar/cancelar |
| `/mobile/visits/{id}/check-in` | POST | 🔴 Alta | Check-in com GPS |
| `/mobile/visits/{id}/feedback` | POST | 🟡 Média | Feedback pós-visita |
| `/mobile/visits/today` | GET | 🔴 Alta | Widget visitas hoje |
| `/mobile/calendar/sync` | GET | 🟢 Baixa | Export para Google Cal |

**Avaliação:**
- ✅ Tasks mobile implementadas
- 🔴 Sistema de visitas NÃO EXISTE
- 🔴 Falta check-in com GPS
- 🔴 Falta feedback de visitas

---

## 5️⃣ DASHBOARD & ANALYTICS

### ✅ Mobile Optimizado - `/mobile/dashboard`
| Endpoint | Método | Status | Funcionalidade |
|----------|--------|--------|----------------|
| `/mobile/dashboard/stats` | GET | ✅ | KPIs resumidos |
| `/mobile/dashboard/recent-activity` | GET | ✅ | Atividade recente |

### 🔴 Faltante - KPIs Avançados
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/mobile/dashboard/kpis` | GET | 🔴 Alta | KPIs completos (visitas hoje, leads novas, conversões) |
| `/mobile/dashboard/performance` | GET | 🟡 Média | Performance do mês |
| `/mobile/dashboard/goals` | GET | 🟢 Baixa | Objetivos e progresso |
| `/mobile/dashboard/leaderboard` | GET | 🟢 Baixa | Ranking de agentes |

**Avaliação:**
- ✅ Dashboard básico
- 🔴 Falta KPIs específicos mobile
- 🔴 Falta dados de performance detalhados

---

## 6️⃣ ASSISTENTE IA

### ✅ Existente - `/assistant`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/assistant/intent/` | POST | ✅ | ⚠️ Muito básico |

### 🔴 Faltante - IA Mobile
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/mobile/ai/schedule-visit` | POST | 🔴 Alta | IA agendar visita |
| `/mobile/ai/property-evaluation` | POST | 🔴 Alta | IA avaliar propriedade |
| `/mobile/ai/suggest-content` | POST | 🟡 Média | Sugestão post Instagram |
| `/mobile/ai/lead-scoring` | POST | 🟡 Média | Score de lead |
| `/mobile/ai/quick-response` | POST | 🟡 Média | Respostas rápidas leads |
| `/mobile/ai/chat` | POST/WS | 🟢 Baixa | Chat com assistente |

**Avaliação:**
- ⚠️ IA muito básica
- 🔴 Sem ações específicas mobile
- 🔴 Falta integração com funcionalidades

---

## 7️⃣ QR CODES & CARTÃO DIGITAL

### 🔴 NÃO EXISTE - Totalmente Novo
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/mobile/qr/property/{id}` | GET | 🔴 Alta | Gerar QR para propriedade |
| `/mobile/qr/agent/{id}` | GET | 🔴 Alta | QR cartão digital agente |
| `/mobile/qr/visit/{id}` | GET | 🟡 Média | QR check-in visita |
| `/mobile/qr/scan` | POST | 🟡 Média | Processar QR scaneado |
| `/mobile/qr/analytics` | GET | 🟢 Baixa | Analytics de scans |

**Avaliação:**
- 🔴 Sistema QR NÃO EXISTE
- 🔴 Prioridade ALTA para mobile

---

## 8️⃣ NOTIFICAÇÕES & WEBSOCKETS

### ✅ Existente - `/notifications`
| Endpoint | Método | Status | Mobile Ready |
|----------|--------|--------|--------------|
| `/notifications/` | GET | ✅ | ⚠️ |
| `/notifications/{id}` | GET | ✅ | ✅ |
| `/notifications/` | POST | ✅ | ✅ |
| `/notifications/{id}` | PUT | ✅ | ✅ |
| `/notifications/{id}` | DELETE | ✅ | ✅ |

### 🔴 Faltante - Real-Time
| Endpoint Necessário | Método | Prioridade | Descrição |
|---------------------|--------|------------|-----------|
| `/ws/notifications` | WebSocket | 🔴 Alta | Notificações real-time |
| `/ws/leads` | WebSocket | 🟡 Média | Novos leads em tempo real |
| `/ws/tasks` | WebSocket | 🟢 Baixa | Updates de tarefas |
| `/mobile/notifications/settings` | GET/PUT | 🟡 Média | Preferências notificações |
| `/mobile/notifications/mark-read` | POST | 🟡 Média | Marcar como lida |

**Avaliação:**
- ✅ CRUD básico
- 🔴 SEM WebSockets
- 🔴 Falta notificações push mobile

---

## 9️⃣ OUTROS MÓDULOS EXISTENTES

### ✅ `/agents` - Agentes
- ✅ CRUD completo
- ✅ Upload de fotos
- ⚠️ Falta analytics por agente

### ✅ `/reports` - Relatórios
- ✅ Leads, Properties, Agents
- ⚠️ Muito básico para mobile

### ✅ `/billing` - Faturação
- ✅ CRUD planos e registos
- ❌ Não relevante para mobile agente

### ✅ `/teams` - Equipas
- ✅ CRUD básico
- ⚠️ Falta colaboração mobile

### ✅ `/agencies` - Agências
- ✅ CRUD básico
- ❌ Não relevante para mobile agente

### ✅ `/feed` - Feed
- ✅ CRUD básico
- 🟡 Potencial para mobile (atividades)

### ✅ `/match_plus` - Matching
- ✅ CRUD básico
- 🟡 Potencial para mobile (sugestões)

---

## 📈 PRIORIZAÇÃO PARA MOBILE

### 🔴 PRIORIDADE ALTA (Implementar AGORA)
1. **Sistema de Visitas** (`/mobile/visits`)
   - GET, POST, PUT visitas
   - Check-in com GPS
   - Widget visitas hoje
   
2. **QR Codes** (`/mobile/qr`)
   - QR propriedades
   - QR cartão agente
   - Analytics básicas

3. **WebSockets** (`/ws`)
   - Notificações real-time
   - Novos leads

4. **Dashboard KPIs** (`/mobile/dashboard/kpis`)
   - Visitas hoje
   - Leads novas
   - Conversões

5. **Refresh Token** (`/auth/refresh`)
   - Sessões longas mobile

### 🟡 PRIORIDADE MÉDIA (Próxima Sprint)
1. Integração WhatsApp/Chamadas
2. Sistema de Notas estruturado
3. IA actions mobile
4. Favoritos de propriedades
5. Configurações notificações

### 🟢 PRIORIDADE BAIXA (Backlog)
1. Propriedades nearby (GPS)
2. Analytics de propriedades
3. Goals e performance
4. Leaderboard
5. Sincronização Google Calendar

---

## 🎯 GAPS IDENTIFICADOS

### Segurança
- ❌ Falta rate limiting específico mobile
- ❌ Falta gestão de dispositivos
- ❌ Falta refresh token
- ⚠️ Validação de permissões inconsistente

### Performance
- ⚠️ Paginação não padronizada
- ⚠️ Sem cache em endpoints pesados
- ❌ Falta compressão de respostas
- ❌ Falta suporte offline/sync

### Documentação
- ⚠️ Swagger incompleto
- ❌ Falta collection Postman
- ❌ Falta mock data
- ⚠️ Schemas inconsistentes (camelCase vs snake_case)

### Monitoring
- ❌ Sem logs estruturados
- ❌ Sem métricas de performance
- ❌ Sem alertas

---

## 📊 ESTATÍSTICAS

| Categoria | Existente | Mobile Ready | A Criar | Total |
|-----------|-----------|--------------|---------|-------|
| Auth | 2 | 2 | 4 | 6 |
| Properties | 6 | 6 | 5 | 11 |
| Leads | 12 | 4 | 7 | 19 |
| Tasks/Calendar | 16 | 4 | 9 | 25 |
| Dashboard | 2 | 2 | 4 | 6 |
| IA | 1 | 0 | 6 | 7 |
| QR Codes | 0 | 0 | 5 | 5 |
| WebSockets | 0 | 0 | 3 | 3 |
| Notificações | 5 | 0 | 3 | 8 |
| **TOTAL** | **44** | **18** | **46** | **90** |

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Auditoria completa - **DONE**
2. 🔄 Modelar endpoints novos (próximo passo)
3. ⏳ Implementar prioridade ALTA
4. ⏳ Testes e documentação
5. ⏳ Deploy e validação

---

**Última atualização:** 18 de dezembro de 2025  
**Responsável:** Dev Team Backend  
**Próxima revisão:** Após modelagem de endpoints
