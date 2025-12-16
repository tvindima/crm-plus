# Sistema de Gestão de Leads - CRM PLUS

## 📋 Visão Geral

Sistema completo de gestão de leads integrado com o site montra (website público). As leads são capturadas automaticamente quando um cliente preenche o formulário de contacto e são imediatamente atribuídas ao agente responsável pela propriedade.

## ✅ Funcionalidades Implementadas

### 1. Captura Automática de Leads do Site
- **Endpoint Público**: `POST /leads/from-website`
- Não requer autenticação
- Atribuição automática ao agente da propriedade
- Rastreamento de origem (website, phone, email, etc)
- Tipos de ação: info_request, visit_request, contact

### 2. Gestão Manual no Backoffice
- **Criar lead**: `POST /leads/`
- **Listar leads**: `GET /leads/` (com filtros)
- **Atualizar lead**: `PUT /leads/{id}`
- **Eliminar lead**: `DELETE /leads/{id}`
- **Ver detalhes**: `GET /leads/{id}`

### 3. Filtros Disponíveis
- Por status (new, contacted, qualified, etc)
- Por origem (website, phone, email, referral, social, manual)
- Por agente atribuído
- Por propriedade

### 4. Distribuição de Leads
- **Endpoint**: `POST /leads/distribute`
- **Estratégias**:
  - `round_robin`: Distribui igualmente entre agentes ativos
  - `least_busy`: Atribui ao agente com menos leads ativas
  - `manual`: Atribui todas a um agente específico

### 5. Estatísticas
- **Endpoint**: `GET /leads/stats`
- Total de leads
- Contagem por status
- Leads criadas hoje

## 📊 Modelo de Dados

### Lead
```python
{
  "id": int,
  "name": str,                    # Nome do cliente
  "email": str,                   # Email (obrigatório)
  "phone": str,                   # Telefone (opcional)
  "message": str,                 # Mensagem do cliente
  "source": LeadSource,           # website, phone, email, referral, social, manual, other
  "origin": str,                  # Descrição adicional da origem
  "property_id": int,             # Propriedade que gerou a lead
  "action_type": str,             # info_request, visit_request, contact
  "status": LeadStatus,           # Estado do lead
  "assigned_agent_id": int,       # Agente responsável
  "created_at": datetime,
  "updated_at": datetime
}
```

### LeadStatus (Workflow)
1. **NEW** - Nova lead (não contactada)
2. **CONTACTED** - Já foi contactada
3. **QUALIFIED** - Lead qualificada (interesse real)
4. **PROPOSAL_SENT** - Proposta enviada
5. **VISIT_SCHEDULED** - Visita agendada
6. **NEGOTIATION** - Em negociação
7. **CONVERTED** - Convertida em cliente
8. **LOST** - Perdida

### LeadSource
- **WEBSITE** - Site montra (captura automática)
- **PHONE** - Chamada telefónica
- **EMAIL** - Email direto
- **REFERRAL** - Indicação
- **SOCIAL** - Redes sociais
- **MANUAL** - Criada manualmente no backoffice
- **OTHER** - Outra origem

## 🚀 Endpoints da API

### Endpoints Públicos (sem autenticação)

#### Criar Lead do Site Montra
```bash
POST /leads/from-website
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "912345678",
  "message": "Gostaria de mais informações sobre este imóvel",
  "property_id": 1,
  "action_type": "info_request"
}

# Response: Lead criada com assigned_agent_id automático
```

### Endpoints Protegidos (requerem autenticação de staff)

#### Listar Leads
```bash
GET /leads/?status=new&source=website&property_id=1
```

#### Criar Lead Manual
```bash
POST /leads/
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@example.com",
  "phone": "913456789",
  "source": "phone",
  "assigned_agent_id": 5
}
```

#### Atualizar Lead
```bash
PUT /leads/1
Content-Type: application/json

{
  "status": "contacted",
  "assigned_agent_id": 10
}
```

#### Atribuir a Agente Específico
```bash
POST /leads/1/assign
Content-Type: application/json

{
  "agent_id": 5
}
```

#### Distribuir Múltiplas Leads
```bash
POST /leads/distribute
Content-Type: application/json

{
  "lead_ids": [1, 2, 3, 4, 5],
  "strategy": "round_robin"
}

# Ou atribuir todas a um agente:
{
  "lead_ids": [1, 2, 3],
  "strategy": "manual",
  "target_agent_id": 10
}
```

#### Estatísticas
```bash
GET /leads/stats

# Response:
{
  "total": 150,
  "by_status": {
    "new": 45,
    "contacted": 30,
    "qualified": 20,
    "converted": 15,
    "lost": 40
  },
  "new_today": 12
}
```

## 🔄 Fluxo de Trabalho

### 1. Cliente Visita Site Montra
```
Cliente vê propriedade → Preenche formulário → 
Lead criada automaticamente → 
Atribuída ao agente da propriedade →
Agente recebe notificação
```

### 2. Agente Gere Lead no Backoffice
```
Backoffice Lista → Filtrar por status/origem →
Ver detalhes da lead →
Atualizar status (contactada → qualificada → proposta) →
Marcar como convertida ou perdida
```

### 3. Distribuição de Leads
```
Gestor acessa painel → 
Seleciona leads sem agente →
Escolhe estratégia de distribuição →
Sistema atribui automaticamente
```

## 📝 Exemplos de Uso

### Criar Lead do Website (Frontend)
```javascript
async function submitContactForm(propertyId, formData) {
  const response = await fetch(`${API_URL}/leads/from-website`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      property_id: propertyId,
      action_type: 'info_request'  // ou 'visit_request'
    })
  });
  
  if (response.ok) {
    // Lead criada! Mostrar mensagem de sucesso
    alert('Obrigado! Entraremos em contacto em breve.');
  }
}
```

### Listar Leads no Backoffice
```javascript
async function fetchLeads(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.source) params.append('source', filters.source);
  if (filters.agent_id) params.append('assigned_agent_id', filters.agent_id);
  
  const response = await fetch(`${API_URL}/leads/?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return response.json();
}
```

### Distribuir Leads Automaticamente
```javascript
async function distributeLeads(leadIds, strategy) {
  const response = await fetch(`${API_URL}/leads/distribute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      lead_ids: leadIds,
      strategy: strategy  // 'round_robin', 'least_busy', ou 'manual'
    })
  });
  
  const result = await response.json();
  console.log(`${result.distributed} leads distribuídas`);
}
```

## 🗄️ Migração de Base de Dados

A tabela `leads` foi criada via Alembic migration:

```bash
# Versão da migração
ac7ce239a904_add_lead_website_integration_fields.py

# Aplicar migração
alembic upgrade head

# Reverter migração
alembic downgrade 20251214_draft_ingestion
```

### Estrutura da Tabela
```sql
CREATE TABLE leads (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    origin VARCHAR(255),
    source VARCHAR(50),
    property_id INTEGER,
    action_type VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    assigned_agent_id INTEGER,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY(property_id) REFERENCES properties(id),
    FOREIGN KEY(assigned_agent_id) REFERENCES agents(id)
);

-- Índices para performance
CREATE INDEX ix_leads_property_id ON leads(property_id);
CREATE INDEX ix_leads_source ON leads(source);
CREATE INDEX ix_leads_status ON leads(status);
CREATE INDEX ix_leads_assigned_agent_id ON leads(assigned_agent_id);
CREATE INDEX ix_leads_email ON leads(email);
```

## 🧪 Testes

### Teste de Criação Automática
```bash
curl -X POST "http://localhost:8000/leads/from-website" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "phone": "912345678",
    "message": "Gostaria de mais informações",
    "property_id": 1,
    "action_type": "info_request"
  }'

# Verifica se a lead foi atribuída ao agente da propriedade 1
```

### Teste de Estatísticas
```bash
curl "http://localhost:8000/leads/stats"

# Deve retornar:
# {
#   "total": 3,
#   "by_status": {"new": 3},
#   "new_today": 3
# }
```

### Teste de Distribuição
```bash
curl -X POST "http://localhost:8000/leads/distribute" \
  -H "Content-Type: application/json" \
  -d '{
    "lead_ids": [1, 2, 3],
    "strategy": "round_robin"
  }'

# Distribui 3 leads igualmente entre agentes ativos
```

## 📊 Resultados dos Testes

### ✅ Teste 1: Criação de Lead do Website
- Lead ID: 1
- Nome: João Silva
- Propriedade: MB1018 (ID: 1)
- Agente atribuído: 29 (responsável pela propriedade)
- Status: NEW
- Origem: WEBSITE

### ✅ Teste 2: Criação de Segunda Lead
- Lead ID: 2
- Nome: Maria Santos
- Propriedade: JS1044 (ID: 2)
- Agente atribuído: 12 (responsável pela propriedade)
- Status: NEW
- Action type: visit_request

### ✅ Teste 3: Criação de Terceira Lead
- Lead ID: 3
- Nome: Pedro Costa
- Propriedade: NN1115 (ID: 3)
- Agente atribuído: 27 (responsável pela propriedade)
- Status: NEW

### ✅ Teste 4: Estatísticas
```json
{
  "total": 3,
  "by_status": {
    "new": 3
  },
  "new_today": 3
}
```

## 🎯 Próximos Passos

### Frontend Backoffice
1. [ ] Página de listagem de leads com filtros
2. [ ] Card de detalhes de lead
3. [ ] Formulário de edição de status
4. [ ] Dashboard de estatísticas
5. [ ] Interface de distribuição de leads
6. [ ] Notificações de novas leads

### Site Montra (Website Público)
1. [ ] Formulário de contacto em cada propriedade
2. [ ] Formulário de agendamento de visita
3. [ ] Integração com endpoint `/leads/from-website`
4. [ ] Mensagem de confirmação após submissão

### Notificações
1. [ ] Email ao agente quando lead é atribuída
2. [ ] Notificação push no backoffice
3. [ ] Alertas de leads não contactadas (>24h)

### Relatórios
1. [ ] Taxa de conversão por agente
2. [ ] Tempo médio de resposta
3. [ ] Origem das leads (qual canal converte mais)
4. [ ] Funil de vendas (NEW → CONVERTED)

## 🚀 Deploy para Produção

### Railway
```bash
# A migração será aplicada automaticamente no próximo deploy
# Devido ao init_db.py que roda no startup

# Verificar logs após deploy:
railway logs --tail 100
```

### Variáveis de Ambiente
Não são necessárias novas variáveis para o sistema de leads.

## 📚 Documentação da API

A documentação interativa está disponível em:
- **Swagger UI**: https://crm-plus-production.up.railway.app/docs
- **ReDoc**: https://crm-plus-production.up.railway.app/redoc

---

**Sistema implementado em**: 16 de Dezembro de 2025
**Status**: ✅ Totalmente Funcional
**Versão**: 1.0.0
