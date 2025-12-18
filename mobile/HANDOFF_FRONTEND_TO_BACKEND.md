# 🤝 HANDOFF: Frontend Mobile → Backend Dev Team

**Data:** 18 de Dezembro de 2024  
**De:** Frontend Mobile Dev Team  
**Para:** Backend Dev Team  
**Projeto:** CRM PLUS Mobile App (B2E - Business-to-Employee)

---

## 📋 CONTEXTO EXECUTIVO

### ✅ O QUE ESTÁ PRONTO (Frontend)

O **frontend mobile está 100% implementado** e alinhado ao **[MOBILE_APP_PRODUCT_BRIEF.md](../MOBILE_APP_PRODUCT_BRIEF.md)**. A app é uma **ferramenta interna B2E** exclusiva para agentes imobiliários Imóveis Mais gerirem suas angariações, leads e visitas em campo.

**Stack:**
- React Native + Expo 51.0.0
- TypeScript (strict mode)
- React Navigation v6 (Stack + Bottom Tabs)
- 5 telas principais + 3 componentes reutilizáveis
- 45+ métodos de API prontos para integração

**Documentação:**
- ✅ [BACKEND_DEV_TEAM_DIRETRIZES.md](./BACKEND_DEV_TEAM_DIRETRIZES.md) - **49 endpoints especificados**
- ✅ [AUDITORIA_ALINHAMENTO_PRODUCT_BRIEF.md](./AUDITORIA_ALINHAMENTO_PRODUCT_BRIEF.md) - Conformidade B2E
- ✅ [RELATORIO_EXECUTIVO_MOBILE.md](./RELATORIO_EXECUTIVO_MOBILE.md) - Relatório completo

---

## 🎯 USER PERSONA (CRÍTICO - LEIA PRIMEIRO)

### ⚠️ ESTA APP NÃO É PARA CLIENTES FINAIS

**User Persona Única:**
- **Nome:** João Silva, 32 anos
- **Cargo:** Agente Imobiliário (colaborador interno Imóveis Mais)
- **Objetivo:** Gerir angariações, leads e visitas em campo
- **Contexto:** App B2E (Business-to-Employee), não B2C

**A app NÃO tem:**
❌ Registo público  
❌ Pesquisa pública de imóveis  
❌ Funcionalidades de cliente final  
❌ Marketplace ou catálogo aberto

**A app TEM:**
✅ Login restrito (apenas agentes criados pelo Admin)  
✅ Dashboard pessoal do agente  
✅ Gestão de "Minhas Angariações"  
✅ Pipeline de "Meus Leads"  
✅ Check-in GPS em visitas

**Ref:** [MOBILE_APP_PRODUCT_BRIEF.md](../MOBILE_APP_PRODUCT_BRIEF.md) seções 1 e 2

---

## 🔐 CORREÇÕES CRÍTICAS APLICADAS (18/12/2024)

### Problema Identificado:
Após auditoria do Product Brief, identificámos **terminologia genérica** que sugeria app pública (B2C) em vez de interna (B2E).

### Correções Aplicadas:

| Antes ❌ | Depois ✅ | Motivo |
|----------|-----------|--------|
| "Propriedades" | "Angariações" | Terminologia interna conforme Product Brief 3.8 |
| "Propriedades" (KPI) | "Minhas Angariações" | Deixar claro que são do agente autenticado |
| "Leads" (KPI) | "Meus Leads" | Reforçar posse do agente |
| "Todas" (filtro) | "Todas Minhas Angariações" | Contexto de dados do agente |

**Impacto para Backend:**
- ✅ Endpoints devem retornar **apenas dados do agente autenticado** (filtro por `agent_id`)
- ✅ Validação de permissões: agente só vê/edita seus próprios recursos
- ✅ Sem endpoints de pesquisa pública ou catálogo aberto

**Docs:** [AUDITORIA_ALINHAMENTO_PRODUCT_BRIEF.md](./AUDITORIA_ALINHAMENTO_PRODUCT_BRIEF.md)

---

## 🚀 O QUE O BACKEND PRECISA IMPLEMENTAR

### FASE 1 - URGENTE (3 dias) ⏰

Endpoints mínimos para MVP funcional:

#### 1. Autenticação (3 endpoints)
```http
✅ POST /auth/login       # Já existe
🚀 POST /auth/refresh     # Necessário
🚀 GET /auth/me           # Verificar se retorna role="agent"
```

**Validação Crítica:**
- ✅ Apenas emails `@imoveismais.pt` ou aprovados pelo Admin
- ✅ JWT deve incluir `role: "agent"` e `agent_id`
- ✅ Token expira em 24h, refresh token em 7 dias

#### 2. Dashboard Metrics (1 endpoint)
```http
🚀 GET /dashboard/metrics
Response: {
  angariações: { total, disponíveis, vendidas, arrendadas },
  leads: { total, novos, contactados, qualificados, convertidos },
  visitas: { hoje, semana, mês, concluídas },
  conversões: { total, mês, taxa }
}
```

**Filtro Obrigatório:** Apenas dados do `agent_id` autenticado

#### 3. Minhas Angariações (5 endpoints)
```http
🚀 GET /properties?agent_id={current_agent}    # Listar minhas angariações
🚀 GET /properties/:id                         # Detalhes (validar ownership)
🚀 POST /properties                            # Criar (auto-atribuir ao agente)
🚀 PUT /properties/:id                         # Editar (validar ownership)
🚀 POST /properties/:id/photos                 # Upload fotos (Cloudinary)
```

**Validações:**
- ✅ `POST /properties` deve **auto-atribuir** `agent_id` do token JWT
- ✅ `GET /properties` deve **filtrar** por `agent_id` automaticamente
- ✅ `PUT/DELETE` devem validar que `property.agent_id == current_user.agent_id`

#### 4. Meus Leads (4 endpoints)
```http
🚀 GET /leads?agent_id={current_agent}         # Listar meus leads
🚀 GET /leads/:id                              # Detalhes (validar ownership)
🚀 POST /leads                                 # Criar (auto-atribuir ao agente)
🚀 PATCH /leads/:id/status                     # Atualizar status no pipeline
```

**Pipeline de Status:**
- `new` → `contacted` → `qualified` → `proposal` → `converted` ou `lost`

#### 5. Visitas (✅ Já Implementado)
```http
✅ GET /visits                   # Já existe (validar filtro por agent_id)
✅ POST /visits                  # Já existe
✅ POST /visits/:id/check-in     # Já existe (GPS validation)
✅ POST /visits/:id/check-out    # Já existe
🚀 GET /visits/today             # Necessário para widget "Visitas Hoje"
🚀 GET /visits/upcoming?limit=5  # Necessário para widget "Próximas Visitas"
```

**Ref:** [BACKEND_FRONTEND_VISITS.md](./BACKEND_FRONTEND_VISITS.md)

---

### FASE 2 - ALTA PRIORIDADE (5 dias)

#### 6. Estatísticas
```http
🚀 GET /properties/stats         # Estatísticas das minhas angariações
🚀 GET /leads/stats              # Estatísticas dos meus leads
```

#### 7. Upload de Mídia (Cloudinary)
```http
🚀 POST /uploads/media           # Upload genérico (fotos/vídeos)
```

**Integração Cloudinary:**
- Backend precisa SDK configurado
- Variáveis de ambiente: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Retornar: `{ url, public_id, format, resource_type }`

#### 8. Notificações Push
```http
🚀 POST /notifications/register  # Registar token do dispositivo
🚀 GET /notifications/preferences # Preferências de notificações
🚀 PUT /notifications/preferences # Atualizar preferências
```

---

### FASE 3 - MÉDIA PRIORIDADE (7 dias)

- Geolocalização e geocoding
- Permissões RBAC refinadas
- Sincronização offline
- Configurações dinâmicas do app

**Detalhes completos:** [BACKEND_DEV_TEAM_DIRETRIZES.md](./BACKEND_DEV_TEAM_DIRETRIZES.md) seções 7-10

---

## 🔒 REGRAS DE SEGURANÇA (CRÍTICO)

### 1. Filtro Automático por Agent ID

**Todos os endpoints de listagem DEVEM filtrar automaticamente por `agent_id`:**

```python
# ERRADO ❌
@router.get("/properties")
def list_properties():
    return db.query(Property).all()  # Retorna TODAS as propriedades

# CORRETO ✅
@router.get("/properties")
def list_properties(current_user: User = Depends(get_current_user)):
    return db.query(Property).filter(
        Property.agent_id == current_user.id
    ).all()  # Retorna apenas do agente autenticado
```

### 2. Validação de Ownership

**Edição/eliminação devem validar posse:**

```python
# CORRETO ✅
@router.put("/properties/{property_id}")
def update_property(
    property_id: int,
    data: PropertyUpdate,
    current_user: User = Depends(get_current_user)
):
    property = db.query(Property).filter(Property.id == property_id).first()
    
    # Validar ownership
    if property.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não autorizado")
    
    # Atualizar...
```

### 3. Auto-Atribuição na Criação

**Criação deve auto-atribuir ao agente:**

```python
# CORRETO ✅
@router.post("/properties")
def create_property(
    data: PropertyCreate,
    current_user: User = Depends(get_current_user)
):
    new_property = Property(
        **data.dict(),
        agent_id=current_user.id  # Auto-atribuir
    )
    db.add(new_property)
    db.commit()
    return new_property
```

---

## 📊 ENDPOINTS PRIORITIZADOS

### Sprint 1 (Esta Semana):
1. ✅ `POST /auth/refresh`
2. ✅ `GET /dashboard/metrics`
3. ✅ `GET /properties` (com filtro agent_id)
4. ✅ `POST /properties` (com auto-atribuição)
5. ✅ `GET /leads` (com filtro agent_id)
6. ✅ `POST /leads` (com auto-atribuição)
7. ✅ `PATCH /leads/:id/status`
8. ✅ `GET /visits/today`
9. ✅ `GET /visits/upcoming`

**Total:** 9 endpoints (mínimo para app funcional)

### Sprint 2 (Próxima Semana):
- Estatísticas (`/stats`)
- Upload Cloudinary
- Edição de propriedades/leads
- Notificações push

---

## 🧪 TESTES ESPERADOS

### Backend deve fornecer:

1. **Swagger/OpenAPI** ✅
   - Documentação automática
   - Exemplos de request/response
   - Try it out funcional

2. **Postman Collection** ✅
   - Collection completa
   - Ambientes (dev, staging, prod)
   - Variáveis pré-configuradas

3. **Testes Automatizados** ✅
   - 80%+ coverage
   - Testes de ownership validation
   - Testes de filtros por agent_id

4. **Dados de Seed** ✅
   - 3 agentes de teste
   - 10 propriedades por agente
   - 5 leads por agente
   - 5 visitas por agente

---

## 🔗 INTEGRAÇÃO FRONTEND ↔ BACKEND

### Como Frontend vai Consumir:

1. **Autenticação:**
```typescript
// Login
const { access_token, refresh_token, user } = await authService.login(email, password);
// Armazenar tokens no AsyncStorage
// Usar em todos os requests subsequentes
```

2. **Dashboard:**
```typescript
// Carregar métricas
const metrics = await dashboardService.getMetrics();
// Atualizar estado: setStats(metrics.angariações)
```

3. **Angariações:**
```typescript
// Listar minhas angariações (backend filtra automaticamente)
const properties = await propertiesService.list();
// Frontend NÃO precisa filtrar por agent_id (backend já faz)
```

4. **Criar Angariação:**
```typescript
// Criar nova angariação (backend auto-atribui ao agente)
const newProperty = await propertiesService.create({
  title: "Moradia T3",
  price: 250000,
  // agent_id NÃO é enviado (backend pega do JWT)
});
```

### Frontend já tem:
- ✅ Cliente HTTP com interceptors JWT
- ✅ Refresh token automático
- ✅ Tratamento de erros 401/403
- ✅ Retry logic
- ✅ Loading states
- ✅ Error handling

**Arquivo:** [api.ts](./app/src/services/api.ts)

---

## 📞 PRÓXIMA REUNIÃO

### Agenda Proposta:

1. **Review de Endpoints (30 min)**
   - Backend apresenta Swagger/OpenAPI
   - Frontend valida request/response schemas
   - Alinhar nomes de campos (snake_case vs camelCase)

2. **Demo de Integração (20 min)**
   - Backend faz deploy em staging
   - Frontend testa integração real
   - Identificar ajustes necessários

3. **Planning Sprint 2 (10 min)**
   - Priorizar features FASE 2
   - Definir datas de entrega
   - Estabelecer daily sync

**Sugestão de Data:** Segunda-feira (21/12/2024) às 10h

---

## 🚀 PRÓXIMAS AÇÕES - FRONTEND DEV TEAM

### Esta Semana (Aguardando Backend):

#### 1. **Criar Tela de Agenda/Tarefas** ⏰
**Prioridade:** ALTA  
**Tempo Estimado:** 2 dias  
**Dependência:** Endpoints de tarefas (FASE 2)

**O que implementar:**
- ✅ Calendário de tarefas (react-native-calendars)
- ✅ Lista de tasks pendentes
- ✅ Criar nova task
- ✅ Marcar como concluída
- ✅ Notificações de lembretes

**Epic Referência:** Product Brief Seção 4.1 - Epic 6

**Endpoints Necessários (Backend):**
```http
🚀 GET /tasks?agent_id={current_agent}
🚀 POST /tasks
🚀 PATCH /tasks/:id/complete
🚀 DELETE /tasks/:id
```

**Priorização Backend:** Incluir na FASE 2 (após FASE 1 completa)

---

#### 2. **Implementar Tela de Detalhes da Angariação** 🏠
**Prioridade:** ALTA  
**Tempo Estimado:** 1 dia  
**Dependência:** Endpoint `GET /properties/:id`

**O que implementar:**
- ✅ Galeria de fotos (swiper)
- ✅ Detalhes completos (quartos, área, localização)
- ✅ Mapa com pin (Google Maps / Mapbox)
- ✅ Histórico de visitas
- ✅ Leads interessados
- ✅ Ações: Editar, Eliminar, Gerar QR Code

**Wireframe:**
```
┌─────────────────────────────────┐
│ [Swiper de Fotos]               │
├─────────────────────────────────┤
│ Moradia T3 - Cascais            │
│ 450.000€                        │
│ [DISPONÍVEL]                    │
├─────────────────────────────────┤
│ 3 🛏️  2 🛁  120m²               │
├─────────────────────────────────┤
│ 📍 Mapa                         │
│ [Ver Localização]               │
├─────────────────────────────────┤
│ 📊 3 Leads Interessados         │
│ 📅 5 Visitas Realizadas         │
├─────────────────────────────────┤
│ [Editar] [QR Code] [Eliminar]   │
└─────────────────────────────────┘
```

---

#### 3. **Implementar Tela de Detalhes do Lead** 👤
**Prioridade:** ALTA  
**Tempo Estimado:** 1 dia  
**Dependência:** Endpoint `GET /leads/:id`

**O que implementar:**
- ✅ Informações de contacto
- ✅ Propriedades de interesse
- ✅ Histórico de interações
- ✅ Timeline de atividades
- ✅ Notas do agente
- ✅ Ações: Ligar, Email, WhatsApp, Agendar Visita

**Wireframe:**
```
┌─────────────────────────────────┐
│ 👤 Maria Silva                  │
│ maria@email.com | 912345678     │
│ [Contactado]                    │
├─────────────────────────────────┤
│ 🏠 Interesse:                   │
│ • Moradia T3 Cascais            │
│ • Apartamento T2 Lisboa         │
├─────────────────────────────────┤
│ 📝 Notas:                       │
│ "Procura imóvel até 300k..."    │
│ [Adicionar Nota]                │
├─────────────────────────────────┤
│ 📅 Timeline:                    │
│ • 15/12 - Visita Moradia T3     │
│ • 10/12 - Primeiro contacto     │
├─────────────────────────────────┤
│ [📞] [✉️] [💬] [Agendar Visita] │
└─────────────────────────────────┘
```

---

#### 4. **Implementar Upload de Fotos/Vídeos** 📸
**Prioridade:** MÉDIA  
**Tempo Estimado:** 2 dias  
**Dependência:** Endpoint `POST /properties/:id/photos` (Cloudinary)

**O que implementar:**
- ✅ react-native-image-picker (câmara/galeria)
- ✅ Preview antes do upload
- ✅ Compressão de imagens (otimização)
- ✅ Upload múltiplo (até 10 fotos)
- ✅ Progress bar
- ✅ Gestão de fotos (ordenar, eliminar)

**Bibliotecas:**
```bash
npm install react-native-image-picker
npm install react-native-image-resizer
```

**Fluxo:**
```
1. Agente está em "Detalhes da Angariação"
2. Clica em "Adicionar Fotos"
3. Escolhe Câmara ou Galeria
4. Tira/seleciona fotos
5. Preview com opção de editar
6. Confirma upload
7. Backend faz upload para Cloudinary
8. Retorna URLs
9. Frontend atualiza galeria
```

---

#### 5. **Implementar Dark Mode** 🌙
**Prioridade:** BAIXA  
**Tempo Estimado:** 1 dia  
**Dependência:** Nenhuma (feature frontend)

**O que implementar:**
- ✅ Criar `Colors.dark` no theme.ts
- ✅ Context para alternar tema
- ✅ AsyncStorage para persistir preferência
- ✅ Aplicar em todas as telas
- ✅ Toggle no ProfileScreen (já existe estrutura)

**Já existe:**
- ✅ Toggle no ProfileScreen
- ✅ Estrutura de tema no `constants/theme.ts`

**Falta:**
- 🚀 Implementar `Colors.dark`
- 🚀 ThemeContext
- 🚀 Aplicar condicionalmente

---

#### 6. **Implementar Notificações Push** 🔔
**Prioridade:** MÉDIA  
**Tempo Estimado:** 2 dias  
**Dependência:** Endpoints `/notifications/*` (FASE 2)

**O que implementar:**
- ✅ expo-notifications
- ✅ Pedir permissão ao utilizador
- ✅ Registar token no backend
- ✅ Receber notificações (foreground/background)
- ✅ Navegação ao clicar em notificação
- ✅ Badge count

**Casos de Uso:**
- 🔔 Lembrete de visita (30 min antes)
- 🔔 Novo lead atribuído
- 🔔 Lead mudou de status
- 🔔 Task pendente

---

#### 7. **Implementar Modo Offline** 📴
**Prioridade:** BAIXA (FUTURO)  
**Tempo Estimado:** 5 dias  
**Dependência:** Endpoints `/sync/*` (FASE 3)

**O que implementar:**
- ✅ AsyncStorage para cache local
- ✅ Sincronização bidirecional
- ✅ Conflict resolution
- ✅ Queue de operações offline
- ✅ Indicador de status (online/offline/syncing)

**Bibliotecas:**
```bash
npm install @react-native-async-storage/async-storage
npm install netinfo
```

---

### Sugestão de Priorização:

#### **SPRINT ATUAL (18-22 Dez):**
Aguardar Backend FASE 1 + Implementar:
1. ✅ Tela de Agenda/Tarefas (se backend priorizar endpoints)
2. ✅ Tela de Detalhes da Angariação
3. ✅ Tela de Detalhes do Lead

#### **SPRINT 2 (Janeiro 2025):**
Após Backend FASE 2:
4. ✅ Upload de Fotos/Vídeos (Cloudinary)
5. ✅ Notificações Push
6. ✅ Dark Mode

#### **SPRINT 3 (Fevereiro 2025):**
Polimento e otimizações:
7. ✅ Modo Offline
8. ✅ Animações e transições
9. ✅ Testes E2E

---

## 📝 PERGUNTAS PARA BACKEND TEAM

### Urgentes (Responder esta semana):

1. **Autenticação:**
   - ✅ JWT já inclui `role: "agent"` e `agent_id`?
   - ✅ Refresh token está implementado?
   - ✅ Endpoint `/auth/me` retorna dados completos do agente?

2. **Filtros Automáticos:**
   - ✅ Endpoints de listagem já filtram por `agent_id` automaticamente?
   - ✅ Ou frontend precisa enviar `?agent_id={id}` explicitamente?

3. **Cloudinary:**
   - ✅ Backend já tem integração Cloudinary configurada?
   - ✅ Qual o formato esperado do upload? (multipart/form-data?)
   - ✅ Backend retorna URLs ou frontend precisa construir?

4. **Visitas:**
   - ✅ Endpoints do sistema de visitas estão 100% funcionais?
   - ✅ Check-in GPS já valida proximidade (<500m)?
   - ✅ Auto-criação de tasks de follow-up está implementada?

5. **Deploy:**
   - ✅ Qual a URL do backend em staging?
   - ✅ Swagger/OpenAPI estará disponível em qual URL?
   - ✅ Quando estará pronto para testes de integração?

### Médio Prazo:

6. **Tarefas/Agenda:**
   - Backend planeja implementar endpoints de `/tasks` na FASE 2?
   - Ou devemos priorizar outra feature primeiro?

7. **Notificações:**
   - Backend vai usar Firebase Cloud Messaging ou Expo Push?
   - Qual serviço de push notifications está configurado?

---

## 📚 DOCUMENTAÇÃO DE REFERÊNCIA

### Para Backend Team:
1. ⭐ **[BACKEND_DEV_TEAM_DIRETRIZES.md](./BACKEND_DEV_TEAM_DIRETRIZES.md)** - 49 endpoints especificados
2. 📱 **[MOBILE_APP_PRODUCT_BRIEF.md](../MOBILE_APP_PRODUCT_BRIEF.md)** - Contexto B2E obrigatório
3. 🔍 **[AUDITORIA_ALINHAMENTO_PRODUCT_BRIEF.md](./AUDITORIA_ALINHAMENTO_PRODUCT_BRIEF.md)** - Conformidade
4. 📊 **[RELATORIO_EXECUTIVO_MOBILE.md](./RELATORIO_EXECUTIVO_MOBILE.md)** - Status completo
5. 📅 **[BACKEND_FRONTEND_VISITS.md](./BACKEND_FRONTEND_VISITS.md)** - Sistema de visitas

### Para Frontend Team:
1. 📝 **Este documento** - Próximas ações e dependências
2. 🎨 **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)** - Componentes reutilizáveis
3. 🛠️ **[FRONTEND_DEVELOPMENT_GUIDELINES.md](./FRONTEND_DEVELOPMENT_GUIDELINES.md)** - Guidelines

---

## ✅ CHECKLIST DE HANDOFF

### Backend Dev Team deve:
- [ ] Ler [MOBILE_APP_PRODUCT_BRIEF.md](../MOBILE_APP_PRODUCT_BRIEF.md) (contexto B2E)
- [ ] Ler [BACKEND_DEV_TEAM_DIRETRIZES.md](./BACKEND_DEV_TEAM_DIRETRIZES.md) (49 endpoints)
- [ ] Implementar endpoints da FASE 1 (9 endpoints prioritários)
- [ ] Criar Swagger/OpenAPI documentation
- [ ] Deploy em staging com dados de seed
- [ ] Responder às perguntas urgentes (acima)
- [ ] Agendar reunião de alinhamento (sugestão: 21/12 às 10h)

### Frontend Dev Team vai:
- [ ] Aguardar FASE 1 do backend (endpoints mínimos)
- [ ] Implementar telas de detalhes (Angariação, Lead)
- [ ] Implementar tela de Agenda/Tarefas (se backend priorizar)
- [ ] Testar integração em staging
- [ ] Reportar bugs/ajustes necessários
- [ ] Preparar SPRINT 2 (Upload fotos, Notificações, Dark Mode)

---

## 🎯 OBJETIVO FINAL

**Lançamento do MVP:** 15 de Janeiro de 2025  
**Requisitos:**
- ✅ Backend FASE 1 + FASE 2 completos
- ✅ Frontend com todas as telas principais
- ✅ Testes E2E aprovados pelo QA Team
- ✅ Deploy em produção
- ✅ App Store / Google Play submissions

**Timeline:**
- **22 Dez:** Backend FASE 1 completo
- **05 Jan:** Backend FASE 2 completo + Frontend integração
- **12 Jan:** QA completo + Ajustes
- **15 Jan:** Deploy produção + Submissions

---

**Preparado por:** Frontend Mobile Dev Team  
**Data:** 18/12/2024 às 16:00  
**Próxima atualização:** Após reunião com Backend Team

**Dúvidas?** Criar issue no GitHub ou mencionar no Slack #mobile-backend-sync
