# 🚀 INTEGRAÇÃO BACKEND/FRONTEND DASHBOARD - GUIA COMPLETO

## ✅ Backend - Endpoints Implementados

### Arquivo: `backend/app/api/dashboard.py`

**Router**: `/api/dashboard`

### 1. KPIs Principais
```
GET /api/dashboard/kpis
```
Retorna:
- Propriedades ativas (com trend)
- Novas leads 7 dias (com trend)
- Propostas em aberto (mock)
- Agentes ativos

### 2. Distribuição
```
GET /api/dashboard/distribution/concelho  # Top 5 concelhos
GET /api/dashboard/distribution/tipologia # T1, T2, T3, Outros (%)
GET /api/dashboard/distribution/status    # Disponível, Reservado, Vendido (%)
```

### 3. Ranking de Agentes
```
GET /api/dashboard/agents/ranking
```
Retorna ranking semanal com:
- Leads atribuídas (últimos 7 dias)
- Propostas geradas (mock: 50% das leads)
- Visitas realizadas (mock: 30% das leads)
- Performance score (0-100)

### 4. Gestão de Leads
```
GET /api/dashboard/leads/recent?limit=10
POST /api/dashboard/leads/{lead_id}/assign?agent_id={agent_id}
POST /api/dashboard/leads/distribute/auto
     Body: { "strategy": "round-robin|performance-based|workload-balanced", "lead_ids": [...] }
```

Estratégias de distribuição automática:
- **round-robin**: Distribuição circular simples
- **performance-based**: Prioriza agentes com melhor performance (70% para top 50%)
- **workload-balanced**: Equilibra workload atual entre agentes

### 5. Tarefas & Atividades
```
GET /api/dashboard/tasks/today              # Mock (implementar tabela Task futura)
GET /api/dashboard/activities/recent?limit=10
```

---

## ✅ Frontend - Serviço de API

### Arquivo: `frontend/backoffice/src/services/dashboardApi.ts`

Funções disponíveis:
```typescript
getDashboardKPIs(): Promise<DashboardKPIs>
getPropertiesByConcelho(): Promise<DistributionItem[]>
getPropertiesByTipologia(): Promise<DistributionItem[]>
getPropertiesByStatus(): Promise<DistributionItem[]>
getAgentsRanking(): Promise<AgentRanking[]>
getRecentLeads(limit: number): Promise<RecentLead[]>
assignLeadToAgent(leadId: number, agentId: number): Promise<any>
distributeLeadsAuto(strategy, leadIds?): Promise<any>
getTodayTasks(): Promise<Task[]>
getRecentActivities(limit: number): Promise<Activity[]>
```

---

## 🔄 PRÓXIMOS PASSOS

### FASE 1: Deploy Backend ✅
1. [ ] Commit e push do arquivo `backend/app/api/dashboard.py`
2. [ ] Railway auto-deploy
3. [ ] Testar endpoints:
   ```bash
   curl https://crm-plus-production.up.railway.app/api/dashboard/kpis
   curl https://crm-plus-production.up.railway.app/api/dashboard/agents/ranking
   ```

### FASE 2: Integração Frontend Dashboard Admin 🔄
1. [ ] Atualizar `frontend/backoffice/app/backoffice/dashboard/page.tsx`
2. [ ] Substituir mock data por chamadas API
3. [ ] Adicionar error handling e loading states
4. [ ] Implementar refresh automático (polling ou SWR)

### FASE 3: Dashboard Agente (Versão Simplificada) ⏳
1. [ ] Criar `frontend/backoffice/app/backoffice/dashboard-agente/page.tsx`
2. [ ] Filtrar KPIs para métricas pessoais
3. [ ] Ocultar ranking de equipa
4. [ ] Mostrar apenas leads próprias
5. [ ] Atividades pessoais

### FASE 4: Features Avançadas ⏳
1. [ ] Modal de atribuição manual de leads
2. [ ] Configuração de estratégia de distribuição automática
3. [ ] Exportação CSV funcional
4. [ ] Notificações real-time (WebSocket)

---

## 📊 ESTRUTURA DE DADOS

### DashboardKPIs
```typescript
{
  propriedades_ativas: number,
  novas_leads_7d: number,
  propostas_abertas: number,
  agentes_ativos: number,
  trends: {
    propriedades: "+12%",
    propriedades_up: true,
    leads: "+8%",
    leads_up: true,
    propostas: "+5%",
    propostas_up: true
  }
}
```

### AgentRanking
```typescript
{
  id: number,
  name: string,
  avatar: "/avatars/1.png",
  role: "Coordenador" | "Agente Sénior" | "Agente",
  leads: number,
  propostas: number,
  visitas: number,
  performance: number, // 0-100
  rank: number
}
```

### RecentLead
```typescript
{
  id: number,
  cliente: string,
  tipo: "T2 - Lisboa",
  status: "nova" | "qualificada" | "contacto" | "pendente",
  responsavel: string | null,
  responsavel_id: number | null,
  tempo: "2h" | "5h" | "Ontem",
  timestamp: "2024-12-16T10:00:00Z"
}
```

---

## 🔧 IMPLEMENTAÇÃO DASHBOARD AGENTE

### Diferenças vs Dashboard Admin

| Feature | Admin | Agente |
|---------|-------|--------|
| KPIs Gerais | ✅ Todos | ❌ Só pessoais |
| Ranking Equipa | ✅ Visível | ❌ Oculto |
| Distribuir Leads | ✅ Sim | ❌ Não |
| Leads Recentes | ✅ Todas | ✅ Só atribuídas |
| Atividades | ✅ Equipa | ✅ Só pessoais |
| Adicionar Agente | ✅ Sim | ❌ Não |
| Nova Propriedade | ✅ Sim | ❌ Não |

### Endpoints Específicos para Agente

Criar novos endpoints filtrados:
```python
@router.get("/agent/{agent_id}/kpis")
def get_agent_personal_kpis(agent_id: int, db: Session = Depends(get_db)):
    """KPIs pessoais do agente"""
    ...

@router.get("/agent/{agent_id}/leads")
def get_agent_leads(agent_id: int, db: Session = Depends(get_db)):
    """Leads atribuídas ao agente"""
    ...

@router.get("/agent/{agent_id}/activities")
def get_agent_activities(agent_id: int, db: Session = Depends(get_db)):
    """Atividades pessoais do agente"""
    ...
```

---

## ⚠️ NOTAS IMPORTANTES

### Mock Data (Temporário)
- **Propostas**: Calculadas como 50% das leads (falta tabela `Proposal`)
- **Visitas**: Calculadas como 30% das leads (falta tabela `Visit`)
- **Tarefas**: Mock hardcoded (falta tabela `Task`)
- **User em Activities**: "Sistema" (falta campo `user_id` nas tabelas)

### TO-DO Backend:
1. [ ] Criar tabela `Proposal` (propostas)
2. [ ] Criar tabela `Visit` (visitas)
3. [ ] Criar tabela `Task` (tarefas)
4. [ ] Adicionar campo `user_id` em `Property` e `Lead`
5. [ ] Adicionar campo `role` em `SessionInfo` (auth)

### TO-DO Frontend:
1. [ ] Criar sistema de permissões baseado em `session.role`
2. [ ] Modais de atribuição de leads
3. [ ] Toast notifications para ações (sucesso/erro)
4. [ ] Loading skeletons
5. [ ] Error boundaries

---

## 🧪 TESTES

### Backend
```bash
# Testar KPIs
curl -X GET "https://crm-plus-production.up.railway.app/api/dashboard/kpis" \
  -H "Cookie: session=..."

# Testar ranking
curl -X GET "https://crm-plus-production.up.railway.app/api/dashboard/agents/ranking" \
  -H "Cookie: session=..."

# Testar atribuição de lead
curl -X POST "https://crm-plus-production.up.railway.app/api/dashboard/leads/1/assign?agent_id=24" \
  -H "Cookie: session=..."

# Testar distribuição automática
curl -X POST "https://crm-plus-production.up.railway.app/api/dashboard/leads/distribute/auto" \
  -H "Content-Type: application/json" \
  -d '{"strategy": "round-robin"}' \
  -H "Cookie: session=..."
```

### Frontend
```typescript
// Testar no dashboard
const kpis = await getDashboardKPIs();
console.log("KPIs:", kpis);

const ranking = await getAgentsRanking();
console.log("Ranking:", ranking);

const leads = await getRecentLeads(5);
console.log("Leads:", leads);
```

---

**Status**: 🟢 **Backend completo** | 🔄 **Frontend em integração** | ⏳ **Dashboard agente pendente**

*Última atualização: 16 Dezembro 2024*
