# 📋 Relatório: Sincronização de Agentes entre Backoffice e Site Montra

**Data**: 17 de dezembro de 2025  
**Problema**: Agentes não sincronizados entre dashboard backoffice e site público  
**Status**: ✅ IDENTIFICADO - Diretrizes para correção documentadas

---

## 🔍 Análise do Problema

### Situação Atual

**Base de Dados Railway**: 15 agentes totais
```
 1. Imóveis Mais Leiria (ID: 38) - Agência (não é agente individual)
 2. António Silva (ID: 24)
 3. Hugo Belo (ID: 25)
 4. Bruno Libânio (ID: 26)
 5. Nélson Neto (ID: 27)
 6. João Paiva (ID: 28)
 7. Marisa Barosa (ID: 29)
 8. Eduardo Coelho (ID: 30)
 9. João Silva (ID: 31)
10. Hugo Mota (ID: 32)
11. João Pereira (ID: 33)
12. João Carvalho (ID: 34)
13. Tiago Vindima (ID: 35)
14. Mickael Soares (ID: 36)
15. Paulo Rodrigues (ID: 37)
```

### Como Cada Sistema Obtém os Agentes

#### 1. **Site Montra (Frontend Web) - `/agentes` página pública**

**Arquivo**: `frontend/web/app/agentes/page.tsx`

**Método**:
```typescript
const agents = await getAgents(50);

const agentMembers = agents
  .filter((a) => a.name !== "Imóveis Mais Leiria") // REMOVE a agência
  .map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: "Consultor Imobiliário",
    phone: agent.phone,
    avatar: agent.avatar || `/avatars/${normalizeForFilename(agent.name)}.png`,
    email: agent.email,
    isAgent: true,
    team: agent.team,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
```

**Endpoint chamado**: `GET /agents/?limit=50` (público, sem autenticação)

**Resultado**: **14 agentes** (todos exceto "Imóveis Mais Leiria")

---

#### 2. **Dashboard Backoffice - Ranking de Agentes**

**Arquivo**: `backend/app/api/dashboard.py`

**Método**:
```python
@router.get("/agents/ranking")
def get_agents_ranking(db: Session, current_user: str = Depends(get_current_user_email)):
    seven_days_ago = datetime.now() - timedelta(days=7)
    agents = db.query(Agent).all()  # TODOS os agentes
    
    ranking = []
    for agent in agents:
        leads_count = db.query(Lead).filter(
            Lead.agent_id == agent.id,
            Lead.created_at >= seven_days_ago
        ).count()
        
        # Calcula performance baseado em leads dos últimos 7 dias
        performance = min(100, (leads_count * 3 + ...) / 2)
        ranking.append({...})
    
    ranking.sort(key=lambda x: x['performance'], reverse=True)
    return ranking
```

**Endpoint chamado**: `GET /api/dashboard/agents/ranking` (autenticado)

**Resultado**: **Variável** - Apenas agentes com atividade nos últimos 7 dias aparecem no top do ranking

**Problema**: Se um agente não teve leads nos últimos 7 dias, aparece com performance 0 no final da lista

---

## 🎯 Diretrizes para Sincronização

### Para o BACKOFFICE (Tu)

#### Opção 1: Mostrar TODOS os agentes (recomendado)

**Mudança**: Exibir todos os agentes mesmo sem atividade recente

**Arquivo**: `backend/app/api/dashboard.py` linha 241

**Alteração**:
```python
@router.get("/agents/ranking")
def get_agents_ranking(db: Session, current_user: str = Depends(get_current_user_email)):
    seven_days_ago = datetime.now() - timedelta(days=7)
    
    # Query todos os agentes EXCETO a agência
    agents = db.query(Agent).filter(Agent.name != "Imóveis Mais Leiria").all()
    
    ranking = []
    for agent in agents:
        # Contar leads (últimos 7 dias)
        leads_count = db.query(Lead).filter(
            Lead.assigned_agent_id == agent.id,  # ⚠️ CORRIGIR: usar assigned_agent_id
            Lead.created_at >= seven_days_ago
        ).count()
        
        # Propostas e visitas (mock)
        propostas_count = int(leads_count * 0.5)
        visitas_count = int(leads_count * 0.3)
        
        # Performance
        performance = min(100, (leads_count * 3 + propostas_count * 5 + visitas_count * 2) / 2)
        
        ranking.append({
            "id": agent.id,
            "name": agent.name,
            "avatar": agent.avatar_url or f"/avatars/{agent.id}.png",
            "role": "Consultor Imobiliário",
            "leads": leads_count,
            "propostas": propostas_count,
            "visitas": visitas_count,
            "performance": round(performance, 0)
        })
    
    # Ordenar por nome alfabeticamente (ou por performance)
    ranking.sort(key=lambda x: x['name'])  # Alfabético
    # OU
    # ranking.sort(key=lambda x: x['performance'], reverse=True)  # Por performance
    
    # Adicionar rank
    for idx, agent_data in enumerate(ranking, start=1):
        agent_data['rank'] = idx
    
    return ranking
```

**Correção Crítica**: Linha 261 tem `Lead.agent_id` mas o modelo Lead usa `assigned_agent_id`

---

#### Opção 2: Adicionar filtro no frontend

**Arquivo**: `frontend/backoffice/app/backoffice/dashboard/page.tsx`

**Mudança**: Filtrar agentes com performance > 0 OU mostrar todos

```typescript
const ranking = await getAgentsRanking();

// Opção A: Mostrar todos (mesmo com performance 0)
setAgents(ranking);

// Opção B: Mostrar apenas com atividade
// const activeAgents = ranking.filter(a => a.performance > 0);
// setAgents(activeAgents);
```

---

### Para a EQUIPA DO SITE MONTRA

#### 1. Garantir que `getAgents()` sempre funciona

**Arquivo**: `frontend/web/src/services/publicApi.ts` linha 181

**Verificar**:
```typescript
export async function getAgents(limit = 50): Promise<Agent[]> {
  try {
    const data = await fetchJson<Agent[]>(`/agents/?limit=${limit}`);
    return data;
  } catch (error) {
    console.warn("Fallback para mocks de agentes", error);
    return mockAgents;  // ⚠️ Se API falhar, usa mocks hardcoded
  }
}
```

**Ação**: Garantir que `mockAgents` está atualizado com todos os 15 agentes

---

#### 2. Sincronizar avatares

**Problema**: Alguns agentes podem não ter `avatar_url` na base de dados

**Solução no site montra** (já implementada):
```typescript
avatar: agent.avatar || `/avatars/${normalizeForFilename(agent.name)}.png`
```

**Ação**: Garantir que existem ficheiros em `/public/avatars/` para todos:
- `antonio-silva.png`
- `hugo-belo.png`
- `bruno-libanio.png`
- `nelson-neto.png`
- `joao-paiva.png`
- `marisa-barosa.png`
- `eduardo-coelho.png`
- `joao-silva.png`
- `hugo-mota.png`
- `joao-pereira.png`
- `joao-carvalho.png`
- `tiago-vindima.png`
- `mickael-soares.png`
- `paulo-rodrigues.png`

**Ou atualizar `avatar_url` na base de dados** para todos os agentes.

---

## 🔄 Plano de Ação

### Passo 1: Corrigir Backend (TU)

1. **Corrigir coluna de referência em `Lead`**:
   - Linha 261: `Lead.agent_id` → `Lead.assigned_agent_id`
   
2. **Excluir agência do ranking**:
   - Adicionar filtro: `Agent.name != "Imóveis Mais Leiria"`
   
3. **Decidir ordenação**:
   - Alfabética: melhor para visualização completa
   - Por performance: melhor para competição entre agentes

**Commit sugerido**:
```bash
git commit -m "fix: corrigir ranking agentes dashboard

- Usar assigned_agent_id em vez de agent_id
- Excluir 'Imóveis Mais Leiria' do ranking
- Ordenar alfabeticamente para mostrar todos os agentes
- Garantir que agentes sem atividade aparecem (performance=0)"
```

---

### Passo 2: Validar Avatares (EQUIPA SITE)

1. Verificar pasta `/public/avatars/` no projeto `frontend/web`
2. Confirmar que existem PNGs para todos os 14 agentes
3. Se faltarem, criar placeholders ou pedir ao designer

---

### Passo 3: Atualizar Base de Dados (OPCIONAL)

**Se preferires usar `avatar_url` da base de dados**:

```sql
UPDATE agents SET avatar_url = '/avatars/antonio-silva.png' WHERE id = 24;
UPDATE agents SET avatar_url = '/avatars/hugo-belo.png' WHERE id = 25;
UPDATE agents SET avatar_url = '/avatars/bruno-libanio.png' WHERE id = 26;
UPDATE agents SET avatar_url = '/avatars/nelson-neto.png' WHERE id = 27;
UPDATE agents SET avatar_url = '/avatars/joao-paiva.png' WHERE id = 28;
UPDATE agents SET avatar_url = '/avatars/marisa-barosa.png' WHERE id = 29;
UPDATE agents SET avatar_url = '/avatars/eduardo-coelho.png' WHERE id = 30;
UPDATE agents SET avatar_url = '/avatars/joao-silva.png' WHERE id = 31;
UPDATE agents SET avatar_url = '/avatars/hugo-mota.png' WHERE id = 32;
UPDATE agents SET avatar_url = '/avatars/joao-pereira.png' WHERE id = 33;
UPDATE agents SET avatar_url = '/avatars/joao-carvalho.png' WHERE id = 34;
UPDATE agents SET avatar_url = '/avatars/tiago-vindima.png' WHERE id = 35;
UPDATE agents SET avatar_url = '/avatars/mickael-soares.png' WHERE id = 36;
UPDATE agents SET avatar_url = '/avatars/paulo-rodrigues.png' WHERE id = 37;
```

---

## ✅ Checklist de Sincronização

- [ ] Backend: Corrigir `Lead.agent_id` → `Lead.assigned_agent_id`
- [ ] Backend: Excluir "Imóveis Mais Leiria" do ranking
- [ ] Backend: Ordenar agentes alfabeticamente
- [ ] Backend: Deploy e testar endpoint `/api/dashboard/agents/ranking`
- [ ] Frontend Site: Verificar avatares em `/public/avatars/`
- [ ] Frontend Site: Testar página `/agentes`
- [ ] Backoffice: Recarregar dashboard e validar que todos os 14 agentes aparecem
- [ ] Validação final: Comparar lista backoffice vs site montra

---

## 📊 Resultado Esperado

### Dashboard Backoffice
```
Ranking de Agentes (14 total):
1. António Silva - 0 leads - Performance: 0%
2. Bruno Libânio - 0 leads - Performance: 0%
3. Eduardo Coelho - 0 leads - Performance: 0%
... (todos os 14 agentes em ordem alfabética)
```

### Site Montra `/agentes`
```
Consultores Imobiliários (14 total):
- António Silva
- Bruno Libânio
- Eduardo Coelho
... (mesmos 14 agentes em ordem alfabética)
```

---

## 🐛 Bug Crítico Identificado

**Arquivo**: `backend/app/api/dashboard.py` linha 261

**Código atual**:
```python
leads_count = db.query(Lead).filter(
    Lead.agent_id == agent.id,  # ❌ ERRO: coluna não existe
    Lead.created_at >= seven_days_ago
).count()
```

**Código correto**:
```python
leads_count = db.query(Lead).filter(
    Lead.assigned_agent_id == agent.id,  # ✅ CORRETO
    Lead.created_at >= seven_days_ago
).count()
```

**Erro causado**: `AttributeError: type object 'Lead' has no attribute 'agent_id'`

---

## 📝 Notas Técnicas

1. **Model Lead** (`backend/app/leads/models.py`):
   - Coluna correta: `assigned_agent_id` (FK para `agents.id`)
   - Relationship: `assigned_agent`

2. **Endpoint público** `/agents/`:
   - Sem autenticação
   - Retorna TODOS os agentes
   - Usado pelo site montra

3. **Endpoint dashboard** `/api/dashboard/agents/ranking`:
   - Requer autenticação
   - Calcula métricas baseadas em atividade
   - Usado pelo backoffice

4. **Filtro "Imóveis Mais Leiria"**:
   - Site montra: filtra no frontend
   - Backoffice: deve filtrar no backend

---

**Prioridade**: 🔴 ALTA - Impacta visibilidade dos agentes no site público
