# 🧪 GUIA DE TESTES - Dashboard Agente v1

## 🎯 Objetivo
Validar que o dashboard agente exibe apenas dados pessoais filtrados e não expõe funcionalidades administrativas.

---

## ✅ CHECKLIST DE TESTES

### 1. Backend - Endpoints Agent-Specific

#### 1.1 GET /api/dashboard/agent/kpis

**Objetivo:** Verificar que retorna apenas KPIs do agente autenticado

```bash
# Test 1: KPIs pessoais (login como agente)
curl -X POST 'https://crm-plus-production.up.railway.app/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"nfaria@imoveismais.pt","password":"password"}' \
  -c /tmp/cookies.txt

curl -b /tmp/cookies.txt 'https://crm-plus-production.up.railway.app/api/dashboard/agent/kpis' | jq
```

**Resultados Esperados:**
```json
{
  "propriedades_ativas": 12,
  "novas_leads_7d": 5,
  "propostas_abertas": 2,
  "visitas_agendadas": 1,
  "trends": {
    "propriedades": "+8%",
    "propriedades_up": true,
    "leads": "+20%",
    "leads_up": true,
    "propostas": "+0%",
    "propostas_up": false
  }
}
```

**Critérios de Aceitação:**
- ✅ Retorna apenas dados do agente autenticado
- ✅ Trends calculados corretamente (7d vs 14d)
- ✅ HTTP 200
- ❌ Não retorna dados de outros agentes

---

#### 1.2 GET /api/dashboard/agent/leads

**Objetivo:** Verificar que retorna apenas leads atribuídas ao agente

```bash
curl -b /tmp/cookies.txt 'https://crm-plus-production.up.railway.app/api/dashboard/agent/leads?limit=5' | jq
```

**Resultados Esperados:**
```json
[
  {
    "id": 23,
    "nome": "João Silva",
    "email": "joao@example.com",
    "phone": "912345678",
    "origem": "Website",
    "status": "nova",
    "responsavel": "Nuno Faria",
    "tempo": "2h",
    "timestamp": "2024-12-16T17:00:00"
  }
]
```

**Critérios de Aceitação:**
- ✅ Todas leads têm `responsavel` == nome do agente autenticado
- ✅ Campo `tempo` formatado corretamente (Xh, Xd, Ontem)
- ✅ Ordenadas por `created_at DESC`
- ❌ Não retorna leads de outros agentes

---

#### 1.3 GET /api/dashboard/agent/tasks

**Objetivo:** Verificar que retorna apenas tarefas do agente

```bash
curl -b /tmp/cookies.txt 'https://crm-plus-production.up.railway.app/api/dashboard/agent/tasks' | jq
```

**Resultados Esperados:**
```json
[
  {
    "id": 1,
    "titulo": "Ligar para leads pendentes",
    "tipo": "call",
    "hora": "09:00",
    "prioridade": "high",
    "concluida": false
  }
]
```

**Critérios de Aceitação:**
- ✅ Retorna array de tarefas
- ✅ Campos `tipo`, `prioridade` válidos
- ⚠️ Mock temporário (aguarda criação da tabela Task)

---

#### 1.4 GET /api/dashboard/agent/activities

**Objetivo:** Verificar que retorna apenas atividades do agente

```bash
curl -b /tmp/cookies.txt 'https://crm-plus-production.up.railway.app/api/dashboard/agent/activities?limit=5' | jq
```

**Resultados Esperados:**
```json
[
  {
    "id": 1,
    "user": "Nuno Faria",
    "avatar": "/avatars/20.png",
    "acao": "Criou propriedade NF1234",
    "tipo": "property",
    "time": "3h",
    "timestamp": "2024-12-16T16:00:00"
  },
  {
    "id": 2,
    "user": "Nuno Faria",
    "avatar": "/avatars/20.png",
    "acao": "Recebeu lead de Maria Costa",
    "tipo": "lead",
    "time": "5h",
    "timestamp": "2024-12-16T14:00:00"
  }
]
```

**Critérios de Aceitação:**
- ✅ Todas atividades têm `user` == nome do agente
- ✅ Combinação de properties + leads
- ✅ Ordenadas por timestamp DESC
- ❌ Não retorna atividades de outros agentes

---

### 2. Frontend - Dashboard Agente

#### 2.1 Acesso à Rota

**URL:** `https://crm-plus-backoffice.vercel.app/backoffice/dashboard-agente`

**Critérios:**
- ✅ Rota acessível após login
- ✅ Redireciona para `/login` se não autenticado
- ✅ Loading state visível durante carregamento

---

#### 2.2 KPIs Pessoais

**Localização:** Grid 4 cards no topo

**Critérios:**
- ✅ 4 KPIs visíveis:
  - Minhas Propriedades (azul)
  - Minhas Leads (7d) (roxo)
  - Propostas Abertas (amarelo)
  - Visitas Agendadas (verde)
- ✅ Trends exibidos com setas (↑ verde / ↓ vermelho)
- ✅ Animação ao carregar (fade-in com delay)
- ✅ Valores numéricos corretos

---

#### 2.3 Minhas Leads

**Localização:** Card principal esquerda

**Critérios:**
- ✅ Título: "Minhas Leads"
- ✅ Subtítulo: "Últimas leads atribuídas a mim"
- ✅ Lista de leads com:
  - Avatar (inicial do nome)
  - Nome do cliente
  - Badge de status (nova/qualificada/contacto/pendente)
  - Origem (Website/Telefone/Referência)
  - Tempo decorrido
  - Botões de ação (Telefone/Email)
- ❌ Não exibe leads de outros agentes
- ❌ Não exibe botão "Distribuir Auto"

---

#### 2.4 Gráficos de Distribuição

**Localização:** Grid 2 colunas (Tipologia + Status)

**Critérios:**
- ✅ Gráfico Tipologia:
  - T1, T2, T3, Outros
  - Percentagens corretas
  - Cores distintas
- ✅ Gráfico Status:
  - Disponível, Reservado, Vendido
  - Percentagens corretas
  - Cores distintas
- ℹ️ Nota: Dados globais (não filtrados por agente) - conforme especificação

---

#### 2.5 Minhas Tarefas

**Localização:** Coluna direita, card superior

**Critérios:**
- ✅ Título: "Minhas Tarefas"
- ✅ Subtítulo: "Hoje"
- ✅ Lista de tarefas com:
  - Checkbox para marcar concluída
  - Título da tarefa
  - Hora agendada
  - Badge "Urgente" (se aplicável)
- ❌ Não exibe tarefas de outros agentes

---

#### 2.6 Minha Atividade

**Localização:** Coluna direita, card inferior

**Critérios:**
- ✅ Título: "Minha Atividade"
- ✅ Subtítulo: "Histórico recente"
- ✅ Lista de atividades com:
  - Avatar do agente
  - Nome do agente
  - Descrição da ação
  - Tempo decorrido
- ❌ Não exibe atividades de outros agentes

---

### 3. Segurança - Validações de Permissão

#### 3.1 Bloqueios de UI

**Critérios:**
- ❌ Botão "Distribuir Auto" não visível
- ❌ Botão "Adicionar Agente" não visível
- ❌ Ranking de Equipa não visível
- ❌ Dropdown "Atribuir Lead" não visível
- ✅ Apenas ações pessoais disponíveis

---

#### 3.2 Validação Backend

**Teste:** Tentar acessar endpoints admin como agente

```bash
# Login como agente
curl -X POST 'https://crm-plus-production.up.railway.app/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"agente@imoveismais.pt","password":"password"}' \
  -c /tmp/cookies.txt

# Tentar distribuir auto (deve falhar quando implementado middleware)
curl -X POST -b /tmp/cookies.txt \
  'https://crm-plus-production.up.railway.app/api/dashboard/leads/distribute/auto' \
  -H 'Content-Type: application/json' \
  -d '{"strategy":"workload-balanced"}'
```

**Resultado Esperado (futuro):**
```json
{
  "detail": "Permissão negada: apenas admin/coordinator"
}
```

**Status Atual:** ⚠️ Middleware de permissões pendente

---

### 4. Performance & UX

#### 4.1 Tempos de Carregamento

**Critérios:**
- ✅ Dashboard carrega em < 2s
- ✅ Loading skeleton visível durante carregamento
- ✅ Animações suaves (60fps)
- ✅ Sem "layout shift" após carregamento

---

#### 4.2 Error Handling

**Teste:** Simular falha de API

**Critérios:**
- ✅ Dashboard continua funcional se 1 endpoint falhar
- ✅ Console.error mostra mensagem descritiva
- ✅ Seção com erro mostra mensagem "Sem dados" ou fallback
- ❌ Não exibe stack trace no UI

---

#### 4.3 Responsividade

**Breakpoints a testar:**
- Desktop XL (1920px+): Grid 4 KPIs + layout 3 colunas
- Desktop (1280px): Grid 4 KPIs + layout 2 colunas
- Tablet (768px): Grid 2 KPIs + layout 1 coluna
- Mobile (375px): Grid 1 KPI + layout stacked

**Critérios:**
- ✅ Sem overflow horizontal
- ✅ Texto legível em todos os tamanhos
- ✅ Botões clicáveis (min 44x44px)

---

## 🔄 PRÓXIMOS PASSOS (QA Avançado)

### Testes Automáticos

#### Backend (pytest)

```python
# tests/test_dashboard_agent.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_agent_kpis_requires_auth():
    response = client.get("/api/dashboard/agent/kpis")
    assert response.status_code == 401

def test_agent_kpis_returns_personal_data():
    # Login como agente
    login_response = client.post("/login", json={
        "email": "test@agent.com",
        "password": "test"
    })
    cookies = login_response.cookies
    
    # Buscar KPIs
    response = client.get("/api/dashboard/agent/kpis", cookies=cookies)
    assert response.status_code == 200
    data = response.json()
    assert "propriedades_ativas" in data
    assert "novas_leads_7d" in data
    assert data["propriedades_ativas"] >= 0

def test_agent_leads_filtered_by_agent():
    # ... similar ao anterior
    response = client.get("/api/dashboard/agent/leads", cookies=cookies)
    data = response.json()
    # Verificar que todas leads têm assigned_agent_id == agent.id
    assert all(lead["responsavel"] == "Test Agent" for lead in data)
```

#### Frontend (Jest + React Testing Library)

```typescript
// __tests__/dashboard-agente.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import DashboardAgentePage from '@/app/backoffice/dashboard-agente/page';

jest.mock('@/src/services/dashboardApi', () => ({
  getAgentKPIs: jest.fn(() => Promise.resolve({
    propriedades_ativas: 10,
    novas_leads_7d: 5,
    propostas_abertas: 2,
    visitas_agendadas: 1,
    trends: { propriedades: "+10%", propriedades_up: true }
  })),
  getAgentLeads: jest.fn(() => Promise.resolve([])),
  getAgentTasks: jest.fn(() => Promise.resolve([])),
  getAgentActivities: jest.fn(() => Promise.resolve([]))
}));

describe('Dashboard Agente', () => {
  it('renders 4 KPI cards', async () => {
    render(<DashboardAgentePage />);
    await waitFor(() => {
      expect(screen.getByText('Minhas Propriedades')).toBeInTheDocument();
      expect(screen.getByText('Minhas Leads (7d)')).toBeInTheDocument();
      expect(screen.getByText('Propostas Abertas')).toBeInTheDocument();
      expect(screen.getByText('Visitas Agendadas')).toBeInTheDocument();
    });
  });

  it('does not render admin features', () => {
    render(<DashboardAgentePage />);
    expect(screen.queryByText('Distribuir Auto')).not.toBeInTheDocument();
    expect(screen.queryByText('Ranking de Equipa')).not.toBeInTheDocument();
  });
});
```

---

## 📊 MATRIZ DE TESTES - RESUMO

| Componente | Testes | Status | Prioridade |
|------------|--------|--------|------------|
| Backend `/agent/kpis` | Manual | ⏳ | 🔴 Alta |
| Backend `/agent/leads` | Manual | ⏳ | 🔴 Alta |
| Backend `/agent/tasks` | Manual | ⏳ | 🟡 Média |
| Backend `/agent/activities` | Manual | ⏳ | 🟡 Média |
| Frontend KPIs | Manual | ⏳ | 🔴 Alta |
| Frontend Leads | Manual | ⏳ | 🔴 Alta |
| Frontend Tarefas | Manual | ⏳ | 🟡 Média |
| Frontend Atividades | Manual | ⏳ | 🟡 Média |
| Segurança (Bloqueios UI) | Manual | ⏳ | 🔴 Alta |
| Responsividade | Manual | ⏳ | 🟢 Baixa |
| Testes Automáticos Backend | Pytest | ❌ | 🟡 Média |
| Testes Automáticos Frontend | Jest | ❌ | 🟡 Média |

**Legenda:**
- ✅ = Completo
- ⏳ = Pendente
- ❌ = Não implementado

---

## 🎯 MILESTONE v1 - Critérios de Aceitação

### Backend
- ✅ 4 endpoints agent-specific implementados
- ✅ Filtros por `agent_id` funcionais
- ✅ Documentação de API atualizada
- ⏳ Testes manuais validados
- ❌ Middleware de permissões (v2)

### Frontend
- ✅ Página `/dashboard-agente` criada
- ✅ 4 KPIs pessoais exibidos
- ✅ Minhas Leads listadas
- ✅ Gráficos de distribuição
- ✅ Tarefas + Atividades pessoais
- ❌ Sem blocos admin visíveis
- ⏳ Testes manuais validados

### Documentação
- ✅ Matriz de permissões criada
- ✅ Guia de testes criado
- ⏳ Testes executados e documentados
- ❌ Changelog atualizado

---

**Próxima Ação:** Executar testes manuais assim que backend estiver deployed (aguardando Railway)

**Status:** ⏳ **Aguardando Deploy Backend** | 🟢 **Frontend Pronto**  
**Última Atualização:** 16 Dezembro 2024 - 19:25
