# 📋 JIRA TICKETS - MOBILE APP IMÓVEIS MAIS (B2E)

> **Projeto:** Mobile App para Agentes  
> **Tipo:** B2E (Business-to-Employee) - App Interna  
> **Data:** 18 de dezembro de 2025

---

## 🎯 PROJETO: Mobile App Agentes Imóveis Mais

**Descrição do Projeto:**
Aplicação mobile exclusiva para agentes imobiliários Imóveis Mais (colaboradores internos), permitindo gestão de angariações, leads, visitas e tarefas em campo. Extensão mobile do backoffice CRM.

**Utilizadores:** ✅ Agentes Imóveis Mais (colaboradores)  
**Objetivo:** ✅ Aumentar produtividade em campo  
**Dados:** ✅ Backoffice CRM  
**NÃO É:** ❌ Portal público, marketplace, app B2C

📖 **Product Brief:** [MOBILE_APP_PRODUCT_BRIEF.md](MOBILE_APP_PRODUCT_BRIEF.md)

---

## 📊 EPICS

### Epic 1: 🔐 Autenticação B2E - Acesso Restrito Agentes
**ID:** MOBILE-001  
**Prioridade:** 🔴 Alta  
**Status:** 🟢 Completo  
**Sprint:** Sprint 1

**Descrição:**
Sistema de autenticação JWT exclusivo para agentes imobiliários Imóveis Mais. NÃO há registo público - contas são criadas pelo Admin no backoffice CRM.

**User Persona:** João Silva, Agente Imobiliário de 32 anos

**Stakeholders:**
- Product Owner
- Backend Dev Team
- Frontend Mobile Dev Team
- IT/Admin (criação de contas)

**Definition of Done:**
- [ ] Apenas emails corporativos/aprovados podem fazer login
- [ ] JWT token funcional (Bearer auth)
- [ ] Refresh token implementado
- [ ] NÃO existe ecrã de registo na app
- [ ] Documentação API completa
- [ ] Testes de integração

---

### Epic 2: 📊 Dashboard Agente - Produtividade Interna
**ID:** MOBILE-002  
**Prioridade:** 🔴 Alta  
**Status:** 🟡 Em Progresso  
**Sprint:** Sprint 1-2

**Descrição:**
Dashboard personalizado mostrando KPIs de produtividade do agente (suas angariações, leads, visitas, tarefas). NÃO é pesquisa pública de imóveis.

**User Persona:** João Silva, precisa de visão geral do seu dia de trabalho

**Stakeholders:**
- Product Owner
- UX Designer (wireframes com persona de agente)
- Frontend Mobile Dev Team
- Backend Dev Team

**Definition of Done:**
- [ ] Dashboard mostra apenas dados do agente autenticado
- [ ] Widget "Minhas Angariações" (não "Imóveis Disponíveis")
- [ ] Widget "Meus Leads" com pipeline
- [ ] Widget "Visitas de Hoje" com check-in rápido
- [ ] Widget "Tarefas Pendentes"
- [ ] KPIs: nº propriedades, leads ativos, visitas hoje
- [ ] NÃO mostra pesquisa pública
- [ ] NÃO mostra dados de outros agentes

---

### Epic 3: 🏠 Gestão de Angariações - Portfólio do Agente
**ID:** MOBILE-003  
**Prioridade:** 🔴 Alta  
**Status:** ⏳ Não Iniciado  
**Sprint:** Sprint 2-3

**Descrição:**
Ferramentas para agentes gerirem suas próprias angariações em campo: criar, editar, upload de fotos, gerar QR codes. NÃO é catálogo público de imóveis.

**User Persona:** João Silva, está no terreno e precisa registar nova angariação imediatamente

**Stakeholders:**
- Product Owner
- UX Designer
- Frontend Mobile Dev Team
- Backend Dev Team
- Cloudinary (storage de imagens)

**Definition of Done:**
- [ ] Lista "Minhas Angariações" (filtros: tipo, status, zona)
- [ ] Criar nova angariação (form completo)
- [ ] Upload de fotos via mobile (Cloudinary)
- [ ] Upload de vídeos via mobile
- [ ] Editar detalhes da propriedade
- [ ] Gerar QR code para partilha
- [ ] Apenas agente proprietário pode editar
- [ ] NÃO mostra propriedades de outros agentes
- [ ] Terminologia: "Angariações" (não "Imóveis")

---

### Epic 4: 👥 Pipeline de Leads - CRM do Agente
**ID:** MOBILE-004  
**Prioridade:** 🔴 Alta  
**Status:** ⏳ Não Iniciado  
**Sprint:** Sprint 3-4

**Descrição:**
Sistema de gestão de leads para agentes acompanharem seus clientes e oportunidades de negócio. NÃO é formulário público de contacto.

**User Persona:** João Silva, conheceu potencial cliente em campo e precisa registá-lo no CRM

**Stakeholders:**
- Product Owner
- Sales Manager
- Frontend Mobile Dev Team
- Backend Dev Team

**Definition of Done:**
- [ ] Lista "Meus Leads" (filtros: status, origem, data)
- [ ] Criar lead em campo (form rápido)
- [ ] Detalhes do lead (histórico completo)
- [ ] Atualizar status no pipeline (novo → fechado)
- [ ] Adicionar notas privadas
- [ ] Agendar follow-up (cria task)
- [ ] Apenas leads do agente são visíveis
- [ ] NÃO é formulário público
- [ ] Pipeline: novo, contactado, visitou, proposta, fechado/perdido

---

### Epic 5: 📍 Sistema de Visitas - Check-in GPS
**ID:** MOBILE-005  
**Prioridade:** 🔴 Alta  
**Status:** 🟢 Backend Completo / 🟡 Frontend Em Progresso  
**Sprint:** Sprint 2-3

**Descrição:**
Sistema completo de registo de visitas a imóveis com check-in/check-out GPS, feedback e auto-criação de tasks. Agente leva cliente a visitar propriedade.

**User Persona:** João Silva, chegou ao imóvel com cliente e precisa fazer check-in GPS

**Stakeholders:**
- Product Owner
- Frontend Mobile Dev Team
- Backend Dev Team (✅ completo)
- GPS/Location Services

**Backend Status:** ✅ 10 endpoints, model Visit, schemas, migration aplicada

**Definition of Done:**
- [x] Backend: 10 endpoints REST
- [x] Backend: Model Visit (24 campos)
- [x] Backend: GPS Haversine validation
- [ ] Frontend: Lista de visitas (filtros)
- [ ] Frontend: Criar visita agendada
- [ ] Frontend: Check-in GPS (distância < 500m)
- [ ] Frontend: Check-out com feedback obrigatório
- [ ] Frontend: Widget "Visitas de Hoje"
- [ ] Frontend: Histórico de visitas da propriedade
- [ ] Auto-criação de task de follow-up
- [ ] Auto-update de lead baseado em feedback
- [ ] NÃO permite clientes marcarem visitas
- [ ] Terminologia: "Check-in" (não "Marcar Visita")

**Documentação:**
- [BACKEND_STATUS_VISITS.md](BACKEND_STATUS_VISITS.md) - Guia de integração frontend

---

### Epic 6: 📅 Agenda e Tarefas - Organização do Agente
**ID:** MOBILE-006  
**Prioridade:** 🟡 Média  
**Status:** ⏳ Não Iniciado  
**Sprint:** Sprint 4

**Descrição:**
Calendário pessoal e gestão de tarefas do agente para organização diária. NÃO é agenda partilhada com clientes.

**User Persona:** João Silva, precisa ver tasks de hoje e criar lembrete rápido

**Stakeholders:**
- Product Owner
- Frontend Mobile Dev Team
- Backend Dev Team

**Definition of Done:**
- [ ] Calendário de tasks (vista dia/semana/mês)
- [ ] Lista de tasks pendentes (filtros: prioridade, data)
- [ ] Criar task rápida em campo
- [ ] Marcar task como concluída
- [ ] Notificações push de lembretes
- [ ] Integração com sistema de visitas
- [ ] Tasks pessoais do agente (não partilhadas)
- [ ] NÃO permite agendamento por terceiros

---

### Epic 7: 🔔 Notificações Push - Lembretes e Alertas
**ID:** MOBILE-007  
**Prioridade:** 🟡 Média  
**Status:** ⏳ Não Iniciado  
**Sprint:** Sprint 4-5

**Descrição:**
Sistema de notificações push para alertar agente sobre tasks, visitas, leads e atualizações do backoffice.

**User Persona:** João Silva, está em viagem e recebe alerta de visita daqui a 30 minutos

**Stakeholders:**
- Product Owner
- Frontend Mobile Dev Team
- Backend Dev Team
- Push Notification Service (Firebase/OneSignal)

**Definition of Done:**
- [ ] Notificação: Lembrete de visita (30min antes)
- [ ] Notificação: Task pendente
- [ ] Notificação: Novo lead atribuído
- [ ] Notificação: Atualização de propriedade
- [ ] Configurações de preferências
- [ ] Badge count no ícone da app
- [ ] Deep linking para conteúdo relevante

---

### Epic 8: 📸 Media Upload - Fotos e Vídeos em Campo
**ID:** MOBILE-008  
**Prioridade:** 🔴 Alta  
**Status:** ⏳ Não Iniciado  
**Sprint:** Sprint 3

**Descrição:**
Upload de fotos e vídeos de propriedades diretamente do campo para Cloudinary, com compressão automática.

**User Persona:** João Silva, acabou de angariar imóvel e quer fotografar todas as divisões

**Stakeholders:**
- Product Owner
- Frontend Mobile Dev Team
- Backend Dev Team
- Cloudinary (storage)

**Definition of Done:**
- [ ] Câmara integrada na app
- [ ] Galeria de fotos da propriedade
- [ ] Upload múltiplo (até 20 fotos)
- [ ] Compressão automática
- [ ] Upload de vídeos (até 100MB)
- [ ] Progress indicator
- [ ] Thumbnail preview
- [ ] Delete foto
- [ ] Reordenar fotos (foto principal)

---

### Epic 9: 🔗 QR Codes - Marketing de Propriedades
**ID:** MOBILE-009  
**Prioridade:** 🔴 Alta  
**Status:** 🟡 Backend Planeado  
**Sprint:** Sprint 3-4

**Descrição:**
Geração de QR codes para propriedades e agentes, com analytics de scans. Ferramenta de marketing para agentes.

**User Persona:** João Silva, quer gerar QR code da propriedade para colocar na montra

**Stakeholders:**
- Product Owner
- Marketing Team
- Frontend Mobile Dev Team
- Backend Dev Team

**Definition of Done:**
- [ ] Backend: GET /mobile/qr/property/{id}
- [ ] Backend: GET /mobile/qr/agent/{id}
- [ ] Backend: POST /mobile/qr/scan
- [ ] Backend: GET /mobile/qr/analytics
- [ ] Frontend: Gerar QR code de propriedade
- [ ] Frontend: Gerar QR code de agente
- [ ] Frontend: Partilhar QR (download/share)
- [ ] Frontend: Analytics de scans
- [ ] QR code redireciona para site montra

---

### Epic 10: 🔄 Refresh Token - Multi-Device Support
**ID:** MOBILE-010  
**Prioridade:** 🔴 Alta  
**Status:** 🟡 Planeado  
**Sprint:** Sprint 2

**Descrição:**
Sistema de refresh tokens para manter sessão ativa e suportar múltiplos dispositivos (telefone pessoal + tablet).

**User Persona:** João Silva, usa app no iPhone pessoal e iPad da empresa

**Stakeholders:**
- Product Owner
- Backend Dev Team
- IT/Security

**Definition of Done:**
- [ ] Backend: POST /auth/refresh
- [ ] Backend: GET /auth/devices
- [ ] Backend: DELETE /auth/devices/{id}
- [ ] Backend: Model DeviceSession
- [ ] Frontend: Auto-refresh quando token expira
- [ ] Frontend: Lista de dispositivos ativos
- [ ] Frontend: Logout remoto de dispositivo
- [ ] Security: Rate limiting
- [ ] Security: Device fingerprint

---

### Epic 11: 🌐 WebSockets - Notificações Real-Time
**ID:** MOBILE-011  
**Prioridade:** 🟡 Média  
**Status:** 🟡 Planeado  
**Sprint:** Sprint 5

**Descrição:**
WebSockets para notificações em tempo real (novos leads, atualizações de visitas, mensagens do backoffice).

**User Persona:** João Silva, recebe notificação instantânea de novo lead atribuído

**Stakeholders:**
- Product Owner
- Backend Dev Team
- Frontend Mobile Dev Team
- Infrastructure Team

**Definition of Done:**
- [ ] Backend: WS /ws/notifications
- [ ] Backend: WS /ws/leads
- [ ] Backend: WS /ws/tasks
- [ ] Frontend: Conexão WebSocket persistente
- [ ] Frontend: Reconnect automático
- [ ] Frontend: Toast notification
- [ ] Events: new_lead, visit_update, task_reminder

---

## 📝 USER STORIES

### Sprint 1: Autenticação + Dashboard Base

#### MOBILE-101: Login de Agente
**Epic:** MOBILE-001  
**Story Points:** 5  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário Imóveis Mais,  
**Quero** fazer login com meu email corporativo,  
**Para** aceder à app mobile e gerir meu trabalho em campo.

**Acceptance Criteria:**
- [ ] Ecrã de login com campos email + password
- [ ] Validação: apenas emails aprovados (ex: @imoveismais.pt)
- [ ] Botão "Entrar" chama API `/auth/login`
- [ ] Sucesso: guarda JWT token e redireciona para Dashboard
- [ ] Erro: mostra mensagem clara (email/password inválidos)
- [ ] ❌ NÃO existe link "Criar Conta" (sem registo público)
- [ ] Link "Recuperar Password" presente

**Mockup:** Usar persona de João Silva (agente)

---

#### MOBILE-102: Dashboard - Visão Geral do Dia
**Epic:** MOBILE-002  
**Story Points:** 8  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** ver um dashboard com minhas métricas do dia,  
**Para** saber o que tenho agendado e priorizar meu trabalho.

**Acceptance Criteria:**
- [ ] Header: "Olá, [Nome do Agente]" + foto de perfil
- [ ] KPI Card: "Minhas Angariações" (não "Imóveis Disponíveis")
- [ ] KPI Card: "Meus Leads" (total + por status)
- [ ] Widget: "Visitas de Hoje" (lista + botão check-in)
- [ ] Widget: "Tarefas Pendentes" (top 5)
- [ ] Pull-to-refresh
- [ ] ❌ NÃO mostra pesquisa pública
- [ ] ❌ NÃO mostra dados de outros agentes

**Mockup:** Terminologia interna (angariações, meus leads)

---

### Sprint 2: Sistema de Visitas

#### MOBILE-201: Lista de Visitas do Agente
**Epic:** MOBILE-005  
**Story Points:** 5  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** ver lista das minhas visitas agendadas,  
**Para** planear meu dia e não esquecer compromissos.

**Acceptance Criteria:**
- [ ] Tela "Minhas Visitas" (não "Visitas Públicas")
- [ ] Filtros: Data, Status, Propriedade
- [ ] Card de visita: Foto da propriedade, morada, data/hora, cliente (lead), status
- [ ] Status: Agendada, Confirmada, Em Curso, Concluída, Cancelada
- [ ] Botão "Criar Visita"
- [ ] Tap no card → Detalhes
- [ ] Paginação (50 itens por página)
- [ ] Empty state: "Não tens visitas agendadas"

**API:** GET /mobile/visits  
**Documentação:** [BACKEND_STATUS_VISITS.md](BACKEND_STATUS_VISITS.md)

---

#### MOBILE-202: Check-in GPS na Visita
**Epic:** MOBILE-005  
**Story Points:** 8  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** fazer check-in GPS quando chego ao imóvel com o cliente,  
**Para** registar que a visita aconteceu e validar minha presença.

**Acceptance Criteria:**
- [ ] Botão "Check-in" visível em visitas "Confirmadas"
- [ ] Solicita permissão de localização
- [ ] Captura GPS (latitude, longitude)
- [ ] Validação: distância < 500m da propriedade
- [ ] Se > 500m: aviso "Estás longe do imóvel" + opção continuar
- [ ] Sucesso: status muda para "Em Curso"
- [ ] Falha GPS: mensagem de erro clara
- [ ] Loading indicator durante validação

**API:** POST /mobile/visits/{id}/check-in  
**Tecnologia:** Expo Location (Haversine distance)

---

#### MOBILE-203: Check-out com Feedback
**Epic:** MOBILE-005  
**Story Points:** 8  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** fazer check-out e registar feedback após a visita,  
**Para** documentar interesse do cliente e próximos passos.

**Acceptance Criteria:**
- [ ] Botão "Check-out" visível em visitas "Em Curso"
- [ ] Form obrigatório de feedback:
  - [ ] Nível de interesse (1-5 estrelas)
  - [ ] Cliente gostou? (sim/não/talvez)
  - [ ] Observações (text area)
  - [ ] Próximos passos (dropdown)
- [ ] Sucesso: status muda para "Concluída"
- [ ] Auto-criação de task de follow-up (se interesse > 3)
- [ ] Auto-update status do lead
- [ ] Confirmação: "Visita concluída com sucesso"

**API:** POST /mobile/visits/{id}/check-out  
**Side Effects:** Create Task + Update Lead

---

#### MOBILE-204: Widget "Visitas de Hoje"
**Epic:** MOBILE-005  
**Story Points:** 3  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** ver widget no dashboard com visitas de hoje,  
**Para** ter acesso rápido sem navegar para outra tela.

**Acceptance Criteria:**
- [ ] Widget no dashboard (após KPIs)
- [ ] Título: "Visitas de Hoje" (não "Visitas Públicas")
- [ ] Lista: máximo 3 próximas visitas
- [ ] Card compacto: hora, morada, cliente, botão check-in
- [ ] Botão "Ver Todas" → vai para tela de visitas
- [ ] Empty state: "Sem visitas agendadas hoje"
- [ ] Refresh automático quando volta para dashboard

**API:** GET /mobile/visits/today

---

### Sprint 3: Propriedades + QR Codes

#### MOBILE-301: Lista de Angariações do Agente
**Epic:** MOBILE-003  
**Story Points:** 5  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** ver lista das minhas angariações,  
**Para** gerir meu portfólio de propriedades.

**Acceptance Criteria:**
- [ ] Tela "Minhas Angariações" (não "Imóveis Disponíveis")
- [ ] Filtros: Tipo (T1-T5+, Loja, etc), Status, Zona
- [ ] Card: Foto principal, tipo, morada, preço, nº leads, nº visitas
- [ ] Botão "Criar Angariação"
- [ ] Tap no card → Detalhes
- [ ] ❌ NÃO mostra angariações de outros agentes
- [ ] Empty state: "Ainda não tens angariações"

**API:** GET /mobile/properties

---

#### MOBILE-302: Upload de Fotos da Propriedade
**Epic:** MOBILE-008  
**Story Points:** 8  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** fazer upload de fotos da propriedade no local,  
**Para** ter registo visual imediato sem voltar ao escritório.

**Acceptance Criteria:**
- [ ] Botão "Adicionar Fotos" nos detalhes da propriedade
- [ ] Opções: Tirar Foto / Escolher da Galeria
- [ ] Upload múltiplo (até 20 fotos)
- [ ] Compressão automática antes do upload
- [ ] Progress bar por foto
- [ ] Thumbnail preview
- [ ] Definir foto principal (arrasta para primeiro lugar)
- [ ] Delete foto (swipe left)

**API:** POST /mobile/properties/{id}/photos  
**Storage:** Cloudinary

---

#### MOBILE-303: Gerar QR Code da Propriedade
**Epic:** MOBILE-009  
**Story Points:** 5  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** gerar QR code da propriedade,  
**Para** colocar na montra e facilitar partilha com clientes.

**Acceptance Criteria:**
- [ ] Botão "Gerar QR Code" nos detalhes da propriedade
- [ ] Gera QR code (API backend)
- [ ] Mostra QR code grande (fullscreen)
- [ ] Opções: Download / Partilhar
- [ ] QR code redireciona para página pública no site montra
- [ ] Analytics: regista quem gerou o QR

**API:** GET /mobile/qr/property/{id}

---

### Sprint 4: Leads + Tarefas

#### MOBILE-401: Pipeline de Leads do Agente
**Epic:** MOBILE-004  
**Story Points:** 8  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** ver pipeline dos meus leads,  
**Para** acompanhar oportunidades de negócio.

**Acceptance Criteria:**
- [ ] Tela "Meus Leads" (não "Contactos Públicos")
- [ ] Filtros: Status, Origem, Data
- [ ] Pipeline horizontal: Novo → Contactado → Visitou → Proposta → Fechado/Perdido
- [ ] Card de lead: Nome, telefone, email, imóvel interesse, última interação
- [ ] Botão "Criar Lead"
- [ ] Drag-and-drop para mudar status
- [ ] ❌ NÃO mostra leads de outros agentes

**API:** GET /mobile/leads

---

#### MOBILE-402: Criar Lead em Campo
**Epic:** MOBILE-004  
**Story Points:** 5  
**Prioridade:** 🔴 Alta

**Como** agente imobiliário,  
**Quero** criar lead rapidamente em campo após conhecer potencial cliente,  
**Para** não perder a oportunidade.

**Acceptance Criteria:**
- [ ] Form rápido de criação
- [ ] Campos obrigatórios: Nome, Telefone
- [ ] Campos opcionais: Email, Imóvel de interesse, Orçamento, Observações
- [ ] Auto-atribui lead ao agente autenticado
- [ ] Status inicial: "Novo"
- [ ] Validação: telefone português (9 dígitos)
- [ ] Sucesso: redireciona para detalhes do lead

**API:** POST /mobile/leads

---

#### MOBILE-403: Calendário de Tarefas
**Epic:** MOBILE-006  
**Story Points:** 8  
**Prioridade:** 🟡 Média

**Como** agente imobiliário,  
**Quero** ver calendário das minhas tarefas,  
**Para** organizar meu dia e semana.

**Acceptance Criteria:**
- [ ] Tela "Minhas Tarefas" (não "Tarefas Públicas")
- [ ] Vista: Dia / Semana / Mês
- [ ] Filtros: Prioridade, Status, Tipo
- [ ] Card de task: Título, hora, prioridade, relacionado com (lead/propriedade)
- [ ] Checkbox para marcar como concluída
- [ ] Botão "Criar Tarefa"
- [ ] Notificação 30min antes

**API:** GET /mobile/tasks

---

## 🚫 RED FLAGS - VALIDAÇÃO DE TICKETS

### Antes de Criar/Aprovar Ticket, Validar:

#### ✅ Checklist Obrigatória

- [ ] **User Story usa persona de AGENTE?**
  - ✅ Correto: "Como agente imobiliário, quero..."
  - ❌ Errado: "Como cliente, quero pesquisar imóveis..."

- [ ] **Terminologia é INTERNA?**
  - ✅ "Minhas Angariações" / "Meus Leads" / "Check-in"
  - ❌ "Imóveis Disponíveis" / "Contactos Públicos" / "Marcar Visita"

- [ ] **Funcionalidade é B2E (para agentes)?**
  - ✅ Gestão de leads, visitas, angariações
  - ❌ Pesquisa pública, registo aberto, marketplace

- [ ] **Mockups usam contexto de AGENTE?**
  - ✅ Dashboard com "Minhas Angariações", "Visitas de Hoje"
  - ❌ "Explorar Imóveis", "Buscar Propriedades"

- [ ] **Dados são do BACKOFFICE CRM?**
  - ✅ API /mobile/* com filtro por agent_id
  - ❌ Scraping do site montra, dados públicos

#### ❌ Rejeitar Ticket Se:

| RED FLAG | Razão |
|----------|-------|
| User story: "Como cliente..." | App é B2E, não B2C |
| Funcionalidade: "Pesquisa pública" | Não é marketplace |
| Funcionalidade: "Registo aberto" | Contas criadas por Admin |
| Funcionalidade: "Portal de imóveis" | É CRM mobile, não portal |
| Mockup: "Explorar Catálogo" | Não é catálogo público |
| API: Dados do site montra | Fonte é backoffice CRM |

---

## 📊 SPRINTS - ROADMAP

### Sprint 1 (2 semanas) - Fundação
- MOBILE-101: Login de Agente ✅
- MOBILE-102: Dashboard Base ✅
- Setup: React Native, Expo, Navigation ✅

### Sprint 2 (2 semanas) - Visitas
- MOBILE-201: Lista de Visitas
- MOBILE-202: Check-in GPS
- MOBILE-203: Check-out Feedback
- MOBILE-204: Widget Dashboard
- MOBILE-010: Refresh Token (backend)

### Sprint 3 (2 semanas) - Propriedades + Media
- MOBILE-301: Lista de Angariações
- MOBILE-302: Upload de Fotos
- MOBILE-303: Gerar QR Code
- MOBILE-009: QR Codes (backend)

### Sprint 4 (2 semanas) - Leads + Tarefas
- MOBILE-401: Pipeline de Leads
- MOBILE-402: Criar Lead
- MOBILE-403: Calendário de Tarefas

### Sprint 5 (2 semanas) - Notificações + Polish
- MOBILE-007: Notificações Push
- MOBILE-011: WebSockets (backend)
- Testing + Bug Fixes
- Performance Optimization

---

## 📋 LABELS JIRA

### Prioridade
- `priority:alta` - Funcionalidades core (visitas, leads, propriedades)
- `priority:media` - Funcionalidades auxiliares (tarefas, notificações)
- `priority:baixa` - Nice-to-have

### Tipo
- `type:feature` - Nova funcionalidade
- `type:bug` - Correção de bug
- `type:docs` - Documentação
- `type:refactor` - Refatoração

### Equipa
- `team:backend` - Backend Dev Team
- `team:frontend` - Frontend Mobile Dev Team
- `team:design` - UX/UI Design
- `team:qa` - Quality Assurance

### Status
- `status:backlog` - Não iniciado
- `status:in-progress` - Em desenvolvimento
- `status:review` - Code review
- `status:testing` - QA testing
- `status:done` - Completo

### Epic
- `epic:autenticacao` - MOBILE-001
- `epic:dashboard` - MOBILE-002
- `epic:propriedades` - MOBILE-003
- `epic:leads` - MOBILE-004
- `epic:visitas` - MOBILE-005
- `epic:tarefas` - MOBILE-006

---

## 📞 PROCESSO DE VALIDAÇÃO

### Antes de Iniciar Development

1. **Product Owner valida:**
   - [ ] User story usa persona de agente?
   - [ ] Terminologia é interna (não pública)?
   - [ ] Funcionalidade é B2E?

2. **Design valida:**
   - [ ] Mockups mostram contexto de agente?
   - [ ] Terminologia correta nos ecrãs?
   - [ ] Fluxos de trabalho do agente?

3. **Tech Lead valida:**
   - [ ] API endpoint está documentado?
   - [ ] Dados vêm do backoffice CRM?
   - [ ] Autenticação JWT necessária?

### Durante Sprint Planning

- [ ] Todos os tickets têm acceptance criteria?
- [ ] User stories seguem template correto?
- [ ] Story points atribuídos?
- [ ] Dependencies identificadas?
- [ ] Mockups aprovados?

### Durante Daily Standup

- [ ] Red flags identificados?
- [ ] Blockers relacionados com âmbito?
- [ ] Clarificações necessárias?

### Durante Sprint Review

- [ ] Demo usa persona de agente?
- [ ] Terminologia está correta?
- [ ] Funcionalidade atende requisitos B2E?
- [ ] Stakeholders validaram?

---

## 📚 RECURSOS

### Documentação Obrigatória
- [MOBILE_APP_PRODUCT_BRIEF.md](MOBILE_APP_PRODUCT_BRIEF.md) - Âmbito completo
- [BACKEND_STATUS_VISITS.md](BACKEND_STATUS_VISITS.md) - Sistema de Visitas
- [MOBILE_API_SPEC.md](MOBILE_API_SPEC.md) - Especificação API
- [MOBILE_DEV_GUIDELINES.md](MOBILE_DEV_GUIDELINES.md) - Guidelines dev

### Templates
- **User Story:** "Como agente imobiliário, quero [ação], para [objetivo]"
- **Acceptance Criteria:** Incluir validação B2E (não público)
- **Mockup Title:** "Dashboard Agente" (não "Portal Público")

---

**Criado por:** Product Owner + Tech Lead  
**Data:** 18 de dezembro de 2025  
**Versão:** 1.0  
**Status:** 🟢 Aprovado para uso

---

**⚠️ Todos os tickets devem referenciar este documento e validar checklist de Red Flags antes de aprovação.**
