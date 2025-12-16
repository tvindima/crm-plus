# Sistema de Gestão de Agenda e Tarefas

## 📋 Visão Geral

Sistema completo de gestão de tarefas para o CRM+, permitindo que agentes criem, acompanhem e concluam tarefas relacionadas a leads, propriedades e atividades diárias.

## 🎯 Funcionalidades

### Tipos de Tarefas
- **VISIT** - Visita a propriedade com cliente
- **CALL** - Chamada telefónica (follow-up, contacto inicial)
- **MEETING** - Reunião (equipa, cliente, parceiro)
- **FOLLOWUP** - Acompanhamento de lead/cliente
- **OTHER** - Outras atividades

### Status de Tarefas
- **PENDING** - Agendada, aguardando execução
- **IN_PROGRESS** - Em andamento
- **COMPLETED** - Concluída
- **CANCELLED** - Cancelada
- **OVERDUE** - Atrasada (auto-detectado)

### Prioridades
- **LOW** - Baixa prioridade
- **MEDIUM** - Média prioridade (padrão)
- **HIGH** - Alta prioridade
- **URGENT** - Urgente

## 🔧 Backend - Estrutura

### Modelos (`app/calendar/models.py`)

```python
class Task(Base):
    id: int
    title: str  # Título da tarefa
    description: str  # Descrição detalhada (opcional)
    
    # Tipo e controlo
    task_type: TaskType  # visit, call, meeting, followup, other
    status: TaskStatus  # pending, in_progress, completed, cancelled, overdue
    priority: TaskPriority  # low, medium, high, urgent
    
    # Datas
    due_date: datetime  # Data/hora de vencimento
    completed_at: datetime  # Data/hora de conclusão (null se não concluída)
    reminder_sent: bool  # Indicador de lembrete enviado
    
    # Relacionamentos
    lead_id: int  # Lead associada (opcional)
    property_id: int  # Propriedade associada (opcional)
    assigned_agent_id: int  # Agente responsável (obrigatório)
    created_by_id: int  # Agente que criou a tarefa
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
```

### Endpoints da API (`/calendar/tasks`)

#### 1. Listar Tarefas
```http
GET /calendar/tasks
```

**Filtros disponíveis:**
- `status`: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, OVERDUE
- `task_type`: VISIT, CALL, MEETING, FOLLOWUP, OTHER
- `priority`: LOW, MEDIUM, HIGH, URGENT
- `assigned_agent_id`: ID do agente
- `lead_id`: ID da lead
- `property_id`: ID da propriedade
- `due_date_start`: Data inicial (ISO 8601)
- `due_date_end`: Data final (ISO 8601)
- `skip`: Paginação (padrão: 0)
- `limit`: Limite de resultados (padrão: 100)

**Exemplo:**
```bash
curl "http://localhost:8000/calendar/tasks?status=pending&assigned_agent_id=1&limit=20"
```

#### 2. Tarefas do Dia
```http
GET /calendar/tasks/today?assigned_agent_id=1
```
Retorna todas as tarefas que vencem hoje.

#### 3. Tarefas da Semana
```http
GET /calendar/tasks/week?assigned_agent_id=1
```
Retorna todas as tarefas dos próximos 7 dias.

#### 4. Tarefas Atrasadas
```http
GET /calendar/tasks/overdue?assigned_agent_id=1
```
Retorna tarefas com vencimento passado e status PENDING ou IN_PROGRESS.

#### 5. Estatísticas de Tarefas
```http
GET /calendar/tasks/stats?assigned_agent_id=1
```

**Resposta:**
```json
{
  "total": 25,
  "pending": 10,
  "in_progress": 5,
  "completed": 8,
  "overdue": 2,
  "today": 5,
  "this_week": 12
}
```

#### 6. Detalhes de uma Tarefa
```http
GET /calendar/tasks/{task_id}
```

**Resposta:**
```json
{
  "id": 1,
  "title": "Visita ao apartamento T2 em Almada",
  "description": "Cliente Sr. João Silva - muito interessado",
  "task_type": "visit",
  "status": "pending",
  "priority": "high",
  "due_date": "2025-12-17T14:00:00",
  "completed_at": null,
  "assigned_agent_id": 1,
  "lead_id": 1,
  "property_id": 1,
  "created_by_id": 1,
  "created_at": "2025-12-16T21:00:00",
  "updated_at": "2025-12-16T21:00:00",
  "assigned_agent": {
    "id": 1,
    "name": "Nuno Faria",
    "email": "nfaria@imoveismais.pt"
  },
  "lead": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "property": {
    "id": 1,
    "reference": "APT-001",
    "title": "Apartamento T2 - Almada"
  }
}
```

#### 7. Criar Tarefa
```http
POST /calendar/tasks
```

**Body:**
```json
{
  "title": "Visita ao apartamento T2",
  "description": "Cliente Sr. João Silva",
  "task_type": "visit",
  "priority": "high",
  "due_date": "2025-12-17T14:00:00",
  "assigned_agent_id": 1,
  "lead_id": 1,
  "property_id": 1
}
```

**Campos obrigatórios:**
- `title`
- `task_type`
- `due_date`
- `assigned_agent_id`

**Query Parameters:**
- `created_by_id`: ID do agente que cria a tarefa (opcional)

#### 8. Atualizar Tarefa
```http
PUT /calendar/tasks/{task_id}
```

**Body (todos os campos opcionais):**
```json
{
  "title": "Novo título",
  "description": "Nova descrição",
  "task_type": "call",
  "status": "in_progress",
  "priority": "urgent",
  "due_date": "2025-12-18T10:00:00",
  "assigned_agent_id": 2
}
```

#### 9. Marcar Tarefa como Concluída
```http
POST /calendar/tasks/{task_id}/complete
```

Automaticamente:
- Define `status = COMPLETED`
- Define `completed_at = now()`

#### 10. Cancelar Tarefa
```http
POST /calendar/tasks/{task_id}/cancel
```

Define `status = CANCELLED`

#### 11. Eliminar Tarefa
```http
DELETE /calendar/tasks/{task_id}
```

Remove a tarefa permanentemente.

## 📊 Lógica de Negócio

### Auto-detecção de Tarefas Atrasadas

O sistema automaticamente marca tarefas como `OVERDUE` quando:
- `due_date` < data atual
- `status` IN (`PENDING`, `IN_PROGRESS`)

Isso acontece:
- Ao listar tarefas
- Ao criar/atualizar tarefas

### Sistema de Lembretes

Funções disponíveis para integração com notificações:

```python
# Buscar tarefas que precisam de lembrete
tasks = get_tasks_for_reminders(db, hours_before=1)

# Marcar que lembrete foi enviado
mark_reminder_sent(db, task_id=1)
```

**Casos de uso:**
- Lembrete 1 hora antes do vencimento
- Lembrete 1 dia antes do vencimento
- Notificação de tarefas atrasadas

## 🗄️ Base de Dados

### Tabela: `tasks`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | PK, auto-increment |
| title | VARCHAR | Título da tarefa |
| description | VARCHAR | Descrição (opcional) |
| task_type | VARCHAR | visit, call, meeting, followup, other |
| status | VARCHAR | pending, in_progress, completed, cancelled, overdue |
| priority | VARCHAR | low, medium, high, urgent |
| due_date | DATETIME | Data/hora de vencimento |
| completed_at | DATETIME | Data/hora de conclusão (nullable) |
| reminder_sent | BOOLEAN | Se lembrete foi enviado |
| lead_id | INTEGER | FK → leads(id) ON DELETE SET NULL |
| property_id | INTEGER | FK → properties(id) ON DELETE SET NULL |
| assigned_agent_id | INTEGER | FK → agents(id) ON DELETE CASCADE |
| created_by_id | INTEGER | FK → agents(id) ON DELETE SET NULL |
| created_at | DATETIME | Timestamp de criação |
| updated_at | DATETIME | Timestamp de atualização |

### Índices
- `ix_tasks_id`
- `ix_tasks_task_type`
- `ix_tasks_status`
- `ix_tasks_priority`
- `ix_tasks_due_date` ← **importante para queries de data**
- `ix_tasks_lead_id`
- `ix_tasks_property_id`
- `ix_tasks_assigned_agent_id` ← **importante para filtrar por agente**

## 🔄 Migração Alembic

**Arquivo:** `backend/app/db/versions/189fdabc9260_add_tasks_table.py`

**Aplicar migração:**
```bash
cd backend
alembic upgrade head
```

**Nota:** Para SQLite, a tabela foi criada manualmente devido a limitações com enums.

## ✅ Testes Realizados

### Criação de Tarefas
✓ Tarefa #1: Visita ao apartamento T2 (visit, high)
✓ Tarefa #2: Ligar para Sr. João (call, medium)
✓ Tarefa #3: Reunião de equipa (meeting, low)
✓ Tarefa #4: Follow-up urgente (followup, urgent)

Todas as tarefas criadas com sucesso no banco de dados local.

## 📝 Próximos Passos

### Frontend - Página de Agenda

Criar em `frontend/backoffice/app/backoffice/agenda/page.tsx`:

1. **Visualização de Calendário**
   - Componente de calendário (react-big-calendar ou similar)
   - Vista dia/semana/mês
   - Código de cores por prioridade

2. **Lista de Tarefas**
   - Tabela com filtros (status, tipo, prioridade, data)
   - Ordenação por due_date
   - Badges visuais para status e prioridade

3. **Formulário de Criação/Edição**
   - Modal ou sidebar com formulário
   - Seleção de lead/propriedade (autocomplete)
   - Date/time picker para due_date

4. **Ações Rápidas**
   - Botão "Marcar como concluída"
   - Botão "Cancelar"
   - Drag & drop para reagendar (opcional)

5. **Dashboard de Estatísticas**
   - Cards com stats (hoje, esta semana, atrasadas)
   - Gráfico de tarefas por tipo
   - Lista de tarefas urgentes

### Sistema de Notificações

1. **Backend - Worker de Notificações**
   - Job periódico (ex: a cada 15 minutos)
   - Buscar tarefas próximas do vencimento
   - Enviar notificações in-app ou email

2. **Frontend - Notificações**
   - Badge no ícone de agenda com número de tarefas
   - Lista dropdown de notificações
   - Som/alerta para tarefas urgentes

## 🔗 Relacionamentos

### Lead → Tasks
Uma lead pode ter múltiplas tarefas (chamadas, visitas, follow-ups)

### Property → Tasks
Uma propriedade pode ter múltiplas tarefas (visitas agendadas)

### Agent → Tasks (assigned_agent)
Um agente pode ter múltiplas tarefas atribuídas

### Agent → Tasks (created_by)
Um agente pode criar tarefas para si ou para outros

## 📦 Arquivos Criados/Modificados

### Backend
- ✅ `backend/app/calendar/models.py` - Modelos Task, TaskType, TaskStatus, TaskPriority
- ✅ `backend/app/calendar/schemas.py` - TaskCreate, TaskUpdate, TaskOut, TaskStats
- ✅ `backend/app/calendar/services.py` - 15+ funções de negócio
- ✅ `backend/app/calendar/routes.py` - 11 endpoints REST
- ✅ `backend/app/calendar/__init__.py` - Exportações do módulo
- ✅ `backend/app/leads/models.py` - Adicionado relacionamento `tasks`
- ✅ `backend/app/properties/models.py` - Adicionado relacionamento `tasks`
- ✅ `backend/app/agents/models.py` - Adicionado relacionamento `tasks`
- ✅ `backend/app/models/__init__.py` - Import de Task
- ✅ `backend/init_db.py` - Import de Task
- ✅ `backend/app/db/versions/189fdabc9260_add_tasks_table.py` - Migração Alembic

### Frontend
- ⏳ `frontend/backoffice/app/backoffice/agenda/page.tsx` - **A CRIAR**
- ⏳ `frontend/backoffice/src/services/backofficeApi.ts` - Adicionar tipos Task**A ATUALIZAR**

## 🎨 Sugestões de UI

### Cores por Prioridade
- 🔴 **URGENT**: Red-500 (#EF4444)
- 🟠 **HIGH**: Orange-500 (#F97316)
- 🟡 **MEDIUM**: Yellow-500 (#EAB308)
- 🟢 **LOW**: Green-500 (#22C55E)

### Cores por Status
- 🔵 **PENDING**: Blue-500 (#3B82F6)
- 🟣 **IN_PROGRESS**: Purple-500 (#A855F7)
- ✅ **COMPLETED**: Green-600 (#16A34A)
- ⭕ **CANCELLED**: Gray-500 (#6B7280)
- 🔴 **OVERDUE**: Red-600 (#DC2626)

### Ícones por Tipo
- 🏠 **VISIT**: Home icon
- 📞 **CALL**: Phone icon
- 👥 **MEETING**: Users icon
- 🔄 **FOLLOWUP**: Repeat icon
- 📝 **OTHER**: File icon

## 📚 Documentação de Referência

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/en/20/orm/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [React Big Calendar](https://jquense.github.io/react-big-calendar/) (sugestão)

---

**Status:** Backend 100% completo ✅ | Frontend 0% 🔧 | Notificações 0% 🔧

**Última atualização:** 2025-12-16
