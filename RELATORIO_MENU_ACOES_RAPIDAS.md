# 📋 RELATÓRIO: Menu de Ações Rápidas - Backoffice CRM PLUS

**Data**: 16 de dezembro de 2025  
**Commit**: `24e208f`  
**Deploy**: Vercel (crm-plus-backoffice.vercel.app)

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. Menu Dropdown de Ações Rápidas (+)

**Localização**: Dashboard Header (próximo ao avatar do utilizador)

**Funcionalidades**:
- Botão circular vermelho com ícone "+"
- Dropdown elegante que abre ao clicar
- Fecha automaticamente ao clicar fora
- 11 opções de ações rápidas com ícones
- Navegação direta para formulários de criação

**Ações Disponíveis**:
1. 🏠 **Imóvel** → `/backoffice/properties/new`
2. 👤 **Cliente** → `/backoffice/clients/new`
3. ⚡ **Oportunidade** → `/backoffice/opportunities/new`
4. ✨ **Leads de negócio** → `/backoffice/leads/business`
5. ✨ **Leads de angariação** → `/backoffice/leads/acquisition`
6. ✅ **Atividades** → `/backoffice/activities/new`
7. 📅 **Visita** → `/backoffice/visits/new`
8. ✅ **Proposta** → `/backoffice/proposals/new`
9. 📢 **Ações de marketing** → `/backoffice/marketing/new`
10. 🧮 **Calc. de despesas** → `/backoffice/calculator/expenses`
11. 💰 **Simulador de crédito** → `/backoffice/simulator/credit`

---

## 📁 PÁGINAS CRIADAS (15 ficheiros novos)

### Módulo: PROPRIEDADES
✅ `/backoffice/properties/new/page.tsx`
- Formulário completo com PropertyForm component
- 8 secções organizadas
- Dropdowns inteligentes (tipo negócio, tipo imóvel, tipologia, etc.)
- Upload de imagens
- Integração com API createBackofficeProperty

### Módulo: CLIENTES
✅ `/backoffice/clients/page.tsx` (listagem)
✅ `/backoffice/clients/new/page.tsx` (criação)
- Formulário com identificação, contacto e tipo de cliente
- Campos: nome, email, telefone, tipo (comprador/vendedor/ambos), notas
- Design consistente com resto do backoffice

### Módulo: OPORTUNIDADES
✅ `/backoffice/opportunities/page.tsx` (listagem)
✅ `/backoffice/opportunities/new/page.tsx` (criação)
- Registo de interesse de cliente em imóvel
- Campos: cliente, ref imóvel, fase, valor estimado, notas
- Fases: Contacto Inicial, Visita, Proposta, Negociação, Fechado

### Módulo: VISITAS
✅ `/backoffice/visits/page.tsx` (listagem)
✅ `/backoffice/visits/new/page.tsx` (criação)
- Agendar visitas a imóveis
- Campos: cliente, ref imóvel, data, hora, notas
- Date/time pickers nativos

### Módulo: PROPOSTAS
✅ `/backoffice/proposals/page.tsx` (listagem)
✅ `/backoffice/proposals/new/page.tsx` (criação)
- Documentar propostas de compra/arrendamento
- Campos: cliente, ref imóvel, valor proposto, validade, condições, notas

### Módulo: ATIVIDADES
✅ `/backoffice/activities/new/page.tsx`
- Registar interações com clientes
- Tipos: Chamada, Email, Reunião, Nota
- Campos: tipo, assunto, data, relacionado com, descrição

### Módulo: LEADS
✅ `/backoffice/leads/business/page.tsx` (leads de negócio - compradores)
- Registar potenciais compradores/arrendatários
- Campos: nome, contacto, interesse (tipo imóvel), orçamento, notas

✅ `/backoffice/leads/acquisition/page.tsx` (leads de angariação - vendedores)
- Registar potenciais vendedores/arrendadores
- Campos: proprietário, contacto, tipo imóvel, localização, valor estimado, notas

### Módulo: MARKETING
✅ `/backoffice/marketing/new/page.tsx`
- Planear campanhas de divulgação
- Tipos: Redes Sociais, Email, SMS, Material Impresso
- Campos: nome campanha, tipo, público-alvo, orçamento, datas, descrição

### Módulo: FERRAMENTAS
✅ `/backoffice/calculator/expenses/page.tsx` (Calculadora de Despesas)
- Estimar custos de aquisição de imóvel
- Calcula: IMT, Imposto Selo, Registo Predial, Notário
- Interface interativa com resultado visual
- Fórmulas simplificadas (IMT progressivo)

✅ `/backoffice/simulator/credit/page.tsx` (Simulador de Crédito)
- Estimar prestação mensal e custo total
- Inputs: valor a financiar, prazo (anos), taxa de juro
- Calcula: prestação mensal, total a pagar, total de juros
- Sistema de Tabela Price (prestações constantes)

---

## 🎨 DESIGN PATTERN UTILIZADO

Todas as páginas seguem o mesmo padrão de design:

```tsx
<BackofficeLayout title="...">
  <div className="mx-auto max-w-2xl">
    {/* Header com título e descrição */}
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-white">...</h1>
      <p className="text-sm text-[#999]">...</p>
    </div>

    {/* Formulário com secções organizadas */}
    <form className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">
          SECÇÃO
        </h3>
        {/* Campos do formulário */}
      </div>

      {/* Botões Cancelar + Submeter */}
      <div className="flex gap-3">
        <button type="button">Cancelar</button>
        <button type="submit">Criar/Guardar</button>
      </div>
    </form>
  </div>
</BackofficeLayout>
```

**Cores e Estilos**:
- Background: `#0F0F12`
- Borders: `#23232B`
- Texto primário: `white`
- Texto secundário: `#999`, `#888`, `#666`
- Accent: `#E10600` (vermelho CRM PLUS)
- Inputs: `border-[#23232B] bg-[#0F0F12]` com focus `border-[#E10600]/50`

---

## ⚠️ O QUE ESTÁ PENDENTE (TODO)

### 1. Integração com Backend API

**NENHUMA** destas páginas está conectada ao backend ainda. Todas têm:
- `console.log()` a simular criação
- `await new Promise()` a simular delay de API
- Redirecionamento após "sucesso" simulado

**Necessário criar endpoints no backend**:

```python
# backend/app/api/v1/...

POST /clients/          # Criar cliente
GET  /clients/          # Listar clientes
POST /opportunities/    # Criar oportunidade
GET  /opportunities/    # Listar oportunidades
POST /visits/           # Criar visita
GET  /visits/           # Listar visitas
POST /proposals/        # Criar proposta
GET  /proposals/        # Listar propostas
POST /activities/       # Criar atividade
GET  /activities/       # Listar atividades
POST /leads/business/   # Criar lead de negócio
POST /leads/acquisition/# Criar lead de angariação
GET  /leads/            # Listar todas as leads
POST /marketing/        # Criar campanha marketing
GET  /marketing/        # Listar campanhas
```

### 2. Modelos de Base de Dados

**Necessário criar tabelas PostgreSQL**:

```sql
-- Clientes
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'buyer', 'seller', 'both'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Oportunidades
CREATE TABLE opportunities (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  property_id INT REFERENCES properties(id),
  stage VARCHAR(50) NOT NULL, -- 'contact', 'visit', 'proposal', 'negotiation', 'closed'
  value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Visitas
CREATE TABLE visits (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  property_ref VARCHAR(50) NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Propostas
CREATE TABLE proposals (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  property_ref VARCHAR(50) NOT NULL,
  proposed_value DECIMAL(10,2) NOT NULL,
  conditions TEXT,
  expiry_date DATE,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'negotiating'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Atividades
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- 'call', 'email', 'meeting', 'note'
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  activity_date DATE NOT NULL,
  related_to VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Leads de Negócio
CREATE TABLE business_leads (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  interest VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Leads de Angariação
CREATE TABLE acquisition_leads (
  id SERIAL PRIMARY KEY,
  owner_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  property_type VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  estimated_value DECIMAL(10,2),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'evaluated', 'converted', 'lost'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);

-- Campanhas de Marketing
CREATE TABLE marketing_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'social', 'email', 'sms', 'print'
  target_audience VARCHAR(255),
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'active', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INT REFERENCES agents(id)
);
```

### 3. Schemas Pydantic (backend)

```python
# backend/app/schemas/clients.py
class ClientCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: str
    type: Literal['buyer', 'seller', 'both']
    notes: Optional[str] = None

class ClientResponse(ClientCreate):
    id: int
    created_at: datetime
    created_by: int

# ... similar para Opportunity, Visit, Proposal, Activity, etc.
```

### 4. Services Frontend (backofficeApi.ts)

```typescript
// frontend/backoffice/src/services/backofficeApi.ts

export async function createClient(data: ClientCreate): Promise<Client> {
  const response = await fetchWithAuth(`${API_URL}/clients/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getClients(): Promise<Client[]> {
  const response = await fetchWithAuth(`${API_URL}/clients/`);
  return response.json();
}

// ... similar para Opportunities, Visits, Proposals, etc.
```

---

## 🔄 RECOMENDAÇÕES PARA SITE MONTRA (frontend/web)

### Alterações Necessárias:

Atualmente o site montra **NÃO precisa de alterações** para estas funcionalidades, pois:
- São funcionalidades internas do backoffice
- Clientes visitam o site apenas para ver imóveis disponíveis
- Formulários de contacto já existem (leads form)

### Possíveis Melhorias Futuras:

1. **Formulário de Avaliação** (para leads de angariação):
   ```
   /imoveis/avaliar
   - Nome, Contacto
   - Tipo de Imóvel, Localização
   - Envia para /leads/acquisition via API
   ```

2. **Formulário de Interesse** (para leads de negócio):
   ```
   Já existe em /contacto
   - Melhorar com campos: orçamento, tipologia desejada
   ```

3. **Calculadora Pública** (marketing):
   ```
   /ferramentas/simulador-credito
   - Versão pública do simulador
   - Gera leads (pede contacto antes de mostrar resultado)
   ```

---

## 📊 ESTATÍSTICAS

- **15 ficheiros criados**
- **1756 linhas de código adicionadas**
- **11 rotas funcionais**
- **9 formulários completos**
- **2 ferramentas de cálculo**
- **Tempo estimado backend**: 2-3 dias (criar APIs + tabelas)
- **Tempo estimado testes**: 1 dia

---

## 🚀 PRÓXIMOS PASSOS

### Prioridade 1 - Backend (URGENTE)
1. Criar tabelas PostgreSQL (migrations Alembic)
2. Criar modelos SQLAlchemy
3. Criar schemas Pydantic
4. Criar endpoints API (CRUD básico)
5. Testar endpoints com Postman/Thunder Client

### Prioridade 2 - Frontend (DEPENDENTE)
1. Criar services em `backofficeApi.ts`
2. Substituir `console.log()` por chamadas reais à API
3. Adicionar loading states
4. Adicionar error handling
5. Testar fluxo completo (criar → listar → editar)

### Prioridade 3 - Integrações
1. Ligar leads de negócio → oportunidades → visitas → propostas
2. Ligar leads de angariação → propriedades
3. Dashboard mostrar contadores reais (em vez de "0")
4. Notificações para visitas agendadas
5. Histórico de atividades por cliente/imóvel

### Prioridade 4 - Otimizações
1. Validação de campos (email, telefone, NIFs, etc.)
2. Autocomplete para clientes existentes
3. Autocomplete para referências de imóveis
4. Upload de documentos (contratos, propostas)
5. Exportação de dados (Excel, PDF)

---

## ✅ CHECKLIST PARA EQUIPA FRONTEND

- [ ] Confirmar que todas as 15 páginas carregam sem erros
- [ ] Testar navegação desde menu dropdown
- [ ] Testar botões "Cancelar" (voltam à página anterior)
- [ ] Verificar design responsivo (mobile/tablet)
- [ ] Aguardar endpoints backend ficarem prontos
- [ ] Implementar services em `backofficeApi.ts`
- [ ] Conectar formulários à API real
- [ ] Atualizar páginas de listagem com dados reais
- [ ] Adicionar paginação nas listagens
- [ ] Adicionar filtros e pesquisa

---

## 📞 CONTACTO

Para dúvidas sobre implementação backend ou ajustes frontend:
- **Desenvolvedor**: Tiago Vindima
- **Email**: tvindima@imoveismais.pt
- **Commit**: 24e208f
- **Branch**: main

---

**FIM DO RELATÓRIO** | Gerado automaticamente em 16/12/2025
