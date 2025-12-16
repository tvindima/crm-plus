# 🔐 MATRIZ DE PERMISSÕES - Dashboard CRM PLUS

## 📊 Visão Geral

Este documento define as permissões e restrições de acesso para cada role (papel) no sistema de backoffice.

---

## 👥 ROLES DISPONÍVEIS

| Role | Descrição | Nível de Acesso |
|------|-----------|-----------------|
| **Admin** | Administrador do sistema | Total (gestão + configuração) |
| **Coordinator** | Coordenador de agência | Gestão de equipa + propriedades |
| **Agent** | Agente de loja | Apenas dados pessoais |

---

## 🎯 DASHBOARD - COMPARAÇÃO POR ROLE

### 1. KPIs (Indicadores)

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **KPIs Globais da Agência** | ✅ | ✅ | ❌ |
| **KPIs Pessoais** | ✅ | ✅ | ✅ |
| **Trends (Crescimento)** | ✅ | ✅ | ✅ (pessoal) |

**Endpoints:**
- Admin/Coordinator: `GET /api/dashboard/kpis`
- Agent: `GET /api/dashboard/agent/kpis`

---

### 2. Gestão de Leads

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **Ver Todas as Leads** | ✅ | ✅ | ❌ |
| **Ver Apenas Minhas Leads** | ✅ | ✅ | ✅ |
| **Distribuir Leads (Manual)** | ✅ | ✅ | ❌ |
| **Distribuir Leads (Auto)** | ✅ | ✅ | ❌ |
| **Atribuir Lead a Agente** | ✅ | ✅ | ❌ |

**Endpoints:**
- Admin/Coordinator (todas): `GET /api/dashboard/leads/recent`
- Agent (apenas próprias): `GET /api/dashboard/agent/leads`
- Distribuição: `POST /api/dashboard/leads/distribute/auto` (apenas admin/coordinator)

---

### 3. Propriedades

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **Ver Todas as Propriedades** | ✅ | ✅ | ❌ |
| **Ver Apenas Minhas Propriedades** | ✅ | ✅ | ✅ |
| **Criar Nova Propriedade** | ✅ | ✅ | ❌ |
| **Editar Qualquer Propriedade** | ✅ | ✅ | ❌ |
| **Editar Minhas Propriedades** | ✅ | ✅ | ✅ (futuramente) |
| **Ver Distribuições (Concelho, Tipologia, Status)** | ✅ | ✅ | ✅ |

**Endpoints:**
- Distribuições: `GET /api/dashboard/distribution/{concelho|tipologia|status}` (todos)
- Propriedades filtradas por agent_id no backend

---

### 4. Equipa & Agentes

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **Ver Ranking de Equipa** | ✅ | ✅ | ❌ |
| **Ver Performance de Agentes** | ✅ | ✅ | ❌ |
| **Adicionar Agente** | ✅ | ✅ | ❌ |
| **Editar Agente** | ✅ | ✅ | ❌ |
| **Desativar Agente** | ✅ | ❌ | ❌ |
| **Ver Própria Performance** | ✅ | ✅ | ✅ |

**Endpoints:**
- Ranking: `GET /api/dashboard/agents/ranking` (apenas admin/coordinator)
- Performance pessoal: Incluída em `GET /api/dashboard/agent/kpis`

---

### 5. Tarefas

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **Ver Tarefas da Equipa** | ✅ | ✅ | ❌ |
| **Ver Apenas Minhas Tarefas** | ✅ | ✅ | ✅ |
| **Criar Tarefa para Agente** | ✅ | ✅ | ❌ |
| **Criar Tarefa Pessoal** | ✅ | ✅ | ✅ |

**Endpoints:**
- Equipa: `GET /api/dashboard/tasks/today` (admin/coordinator)
- Pessoal: `GET /api/dashboard/agent/tasks` (agent)

---

### 6. Atividades

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **Ver Atividades da Equipa** | ✅ | ✅ | ❌ |
| **Ver Apenas Minhas Atividades** | ✅ | ✅ | ✅ |

**Endpoints:**
- Equipa: `GET /api/dashboard/activities/recent` (admin/coordinator)
- Pessoal: `GET /api/dashboard/agent/activities` (agent)

---

### 7. Ações Rápidas

| Funcionalidade | Admin | Coordinator | Agent |
|----------------|-------|-------------|-------|
| **Nova Lead** | ✅ | ✅ | ✅ |
| **Nova Propriedade** | ✅ | ✅ | ❌ |
| **Gerar Proposta** | ✅ | ✅ | ✅ |
| **Agendar Visita** | ✅ | ✅ | ✅ |
| **Adicionar Agente** | ✅ | ✅ | ❌ |

---

## 🔒 IMPLEMENTAÇÃO TÉCNICA

### Backend Middleware (Futuro)

```python
from fastapi import Depends, HTTPException
from app.api.v1.auth import get_current_user_email

def require_role(allowed_roles: list[str]):
    """Middleware para verificar role do usuário"""
    async def check_role(current_user: str = Depends(get_current_user_email)):
        # TODO: Buscar role do user na base de dados
        # user = db.query(User).filter(User.email == current_user).first()
        # if user.role not in allowed_roles:
        #     raise HTTPException(status_code=403, detail="Permissão negada")
        return current_user
    return check_role

# Uso:
@router.post("/properties/")
def create_property(
    current_user: str = Depends(require_role(["admin", "coordinator"]))
):
    ...
```

### Frontend Condicional

```typescript
// Detectar role (exemplo)
const userRole = session?.role || 'agent';

// Renderização condicional
{userRole !== 'agent' && (
  <button onClick={handleDistributeAuto}>
    Distribuir Auto
  </button>
)}

// Roteamento
useEffect(() => {
  if (userRole === 'agent') {
    router.push('/backoffice/dashboard-agente');
  } else {
    router.push('/backoffice/dashboard');
  }
}, [userRole]);
```

---

## 📝 PÁGINAS DISPONÍVEIS POR ROLE

### Admin/Coordinator

**Rotas:**
- `/backoffice/dashboard` - Dashboard completo
- `/backoffice/agents` - Gestão de agentes
- `/backoffice/properties` - Todas propriedades
- `/backoffice/leads` - Todas leads
- `/backoffice/settings` - Configurações

**Widgets Visíveis:**
- ✅ KPIs globais (4 cards)
- ✅ Gráfico de distribuição por concelho (top 5)
- ✅ Gráfico de tipologia (pie chart)
- ✅ Gráfico de status (pie chart)
- ✅ Ranking de equipa (performance semanal)
- ✅ Leads recentes (todas)
- ✅ Botão "Distribuir Auto"
- ✅ Tarefas da equipa
- ✅ Atividades da equipa
- ✅ Botão "Adicionar Agente"

---

### Agent

**Rotas:**
- `/backoffice/dashboard-agente` - Dashboard pessoal
- `/backoffice/leads` - Apenas minhas leads
- `/backoffice/properties` - Apenas minhas propriedades (view-only)
- `/backoffice/profile` - Meu perfil

**Widgets Visíveis:**
- ✅ KPIs pessoais (4 cards: minhas props, minhas leads, propostas, visitas)
- ✅ Gráfico de tipologia (global, sem filtro)
- ✅ Gráfico de status (global, sem filtro)
- ❌ Ranking de equipa (hidden)
- ✅ Minhas Leads (apenas atribuídas)
- ❌ Botão "Distribuir Auto" (hidden)
- ✅ Minhas Tarefas
- ✅ Minha Atividade
- ❌ Botão "Adicionar Agente" (hidden)

---

## 🚀 ENDPOINTS - RESUMO

### Admin/Coordinator (10 endpoints)

```bash
GET /api/dashboard/kpis
GET /api/dashboard/distribution/concelho
GET /api/dashboard/distribution/tipologia
GET /api/dashboard/distribution/status
GET /api/dashboard/agents/ranking
GET /api/dashboard/leads/recent?limit=10
POST /api/dashboard/leads/{lead_id}/assign?agent_id=X
POST /api/dashboard/leads/distribute/auto
GET /api/dashboard/tasks/today
GET /api/dashboard/activities/recent?limit=10
```

### Agent (4 endpoints)

```bash
GET /api/dashboard/agent/kpis
GET /api/dashboard/agent/leads?limit=10
GET /api/dashboard/agent/tasks
GET /api/dashboard/agent/activities?limit=10
```

### Compartilhados (todos os roles)

```bash
GET /api/dashboard/distribution/tipologia
GET /api/dashboard/distribution/status
```

---

## 🔄 PRÓXIMOS PASSOS

### Backend
- [ ] Adicionar campo `role` na tabela `users` ou `agents`
- [ ] Implementar middleware `require_role()`
- [ ] Atualizar JWT para incluir `role` no token
- [ ] Proteger endpoints com decorador `@require_role`

### Frontend
- [ ] Adicionar `role` ao `SessionInfo` type
- [ ] Implementar roteamento automático por role (login → dashboard correto)
- [ ] Criar componente `<ProtectedRoute roles={['admin']}>` para proteção

### Database
```sql
-- Adicionar role à tabela agents
ALTER TABLE agents ADD COLUMN role VARCHAR(20) DEFAULT 'agent';
-- Valores: 'admin', 'coordinator', 'agent'

-- Atualizar coordenadores
UPDATE agents SET role = 'coordinator' WHERE email IN ('coord1@example.com', 'coord2@example.com');

-- Atualizar admin
UPDATE agents SET role = 'admin' WHERE email = 'admin@imoveismais.pt';
```

---

## 📊 MATRIZ COMPLETA - TABELA DE REFERÊNCIA

| Feature | Endpoint | Admin | Coordinator | Agent |
|---------|----------|-------|-------------|-------|
| KPIs Globais | `/api/dashboard/kpis` | ✅ | ✅ | ❌ |
| KPIs Pessoais | `/api/dashboard/agent/kpis` | ✅ | ✅ | ✅ |
| Ranking Equipa | `/api/dashboard/agents/ranking` | ✅ | ✅ | ❌ |
| Todas as Leads | `/api/dashboard/leads/recent` | ✅ | ✅ | ❌ |
| Minhas Leads | `/api/dashboard/agent/leads` | ✅ | ✅ | ✅ |
| Distribuir Auto | `POST /leads/distribute/auto` | ✅ | ✅ | ❌ |
| Atribuir Lead | `POST /leads/{id}/assign` | ✅ | ✅ | ❌ |
| Tarefas Equipa | `/api/dashboard/tasks/today` | ✅ | ✅ | ❌ |
| Minhas Tarefas | `/api/dashboard/agent/tasks` | ✅ | ✅ | ✅ |
| Atividades Equipa | `/api/dashboard/activities/recent` | ✅ | ✅ | ❌ |
| Minhas Atividades | `/api/dashboard/agent/activities` | ✅ | ✅ | ✅ |
| Distribuições (Concelho) | `/distribution/concelho` | ✅ | ✅ | 🟡 (view) |
| Distribuições (Tipologia) | `/distribution/tipologia` | ✅ | ✅ | ✅ (view) |
| Distribuições (Status) | `/distribution/status` | ✅ | ✅ | ✅ (view) |

**Legenda:**
- ✅ = Acesso total
- 🟡 = View-only (sem ações)
- ❌ = Sem acesso

---

**Status:** ✅ **Implementado** (Backend + Frontend)  
**Pendente:** Role-based routing automático, middleware de permissões  
**Última Atualização:** 16 Dezembro 2024 - 19:15
