# Área de Cliente Registado - Roadmap

## 📋 Visão Geral

Sistema de área privada para clientes compradores/investidores registados no site público, com funcionalidades de qualificação de leads e agilização do processo de angariação.

---

## 🎯 Objetivos de Negócio

1. **Qualificação Automática de Leads**: Clientes auto-qualificam através de ações (watchlists, comparadores, avaliações)
2. **Intelligence para Agentes**: Informação antecipada sobre intenções e requisitos dos clientes
3. **Agilização de Angariação**: Dados estruturados sobre imóveis a avaliar antes do primeiro contacto
4. **Engagement de Clientes**: Ferramentas úteis que mantêm clientes ativos no site

---

## 🔐 Autenticação & Gestão de Conta

### Features Base
- [ ] Registo de conta (email + password)
- [ ] Login / Logout
- [ ] Recuperação de password
- [ ] Perfil de cliente
  - Nome, email, telefone
  - Preferências de contacto
  - Avatar (opcional)
  - Agente atribuído (lead owner)

### Técnico
- **Backend**: Tabela `clients` com FK para `agents.id` (lead owner)
- **Auth**: JWT tokens (similar ao backoffice)
- **Middleware**: Proteção de rotas `/cliente/*`

---

## 🎨 Tema Dark/Light Persistente

### Features
- [ ] Toggle tema claro/escuro
- [ ] Persistência da preferência
  - LocalStorage para guests
  - Database para clientes autenticados
- [ ] Aplicação em todo o site público
- [ ] Transição suave entre temas

### Técnico
- **Frontend**: Context API ou Zustand para state global
- **CSS**: CSS variables para cores + Tailwind dark: classes
- **Database**: Coluna `clients.theme_preference` (enum: 'light', 'dark', 'system')
- **Complexidade**: Moderada (4-6 horas)

### Arquivos Afetados
- ~50 ficheiros com classes Tailwind hardcoded
- Necessário wrapper ThemeProvider
- Migração gradual componente a componente

---

## ⭐ Watchlists / Listas de Favoritos

### Features Principais

#### 1. Favoritos Simples
- [ ] Adicionar/remover imóveis aos favoritos
- [ ] Lista única de favoritos
- [ ] Contador visual de favoritos

#### 2. Listas Personalizadas (MVP)
- [ ] Criar múltiplas listas com nomes customizados
  - Exemplos: "T2 Lisboa Centro", "Moradias com Piscina", "Investimento Algarve"
- [ ] Adicionar imóvel a uma ou mais listas
- [ ] Editar/apagar listas
- [ ] Ver todas as listas na área do cliente

#### 3. Metadados de Lista (Avançado)
- [ ] Descrição opcional da lista
- [ ] Tags/categorias
- [ ] Partilha de lista com agente
- [ ] Notas privadas em cada imóvel da lista

### Valor para Agentes
- **Qualificação de Requisitos**: Nomes e organização das listas revelam prioridades reais do cliente
- **Padrões de Interesse**: Agente vê evolução temporal das preferências
- **Preparação de Contacto**: Antes de ligar, agente já sabe exatamente o que cliente procura

### Técnico
```sql
-- Tabelas necessárias
CREATE TABLE client_watchlists (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE watchlist_items (
  id SERIAL PRIMARY KEY,
  watchlist_id INTEGER REFERENCES client_watchlists(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(watchlist_id, property_id)
);
```

### UI/UX
- Botão "⭐ Adicionar a Lista" em cada card de imóvel
- Modal com seleção de lista(s) existente(s) ou criação de nova
- Página `/cliente/listas` com grid de todas as listas
- Página `/cliente/listas/[id]` com imóveis dessa lista específica

---

## 🔄 Comparador de Imóveis

### Features Principais

#### 1. Comparação Interna
- [ ] Selecionar 2-4 imóveis do site para comparar
- [ ] Tabela lado-a-lado com características
  - Preço, área, tipologia, localização
  - Certificado energético, ano de construção
  - Amenities (piscina, garagem, etc.)
- [ ] Highlight de diferenças

#### 2. Comparação Externa (Inovação 🚀)
- [ ] Input de URL de imóvel externo (Idealista, Casa Sapo, etc.)
- [ ] Scraping básico de dados do anúncio externo
- [ ] Comparação de imóvel interno vs externo
- [ ] **Cliente pode comparar vários externos entre si**

### Intelligence para Agentes
Quando cliente compara imóvel externo:
1. Sistema regista URL + dados do imóvel externo
2. Agente (lead owner) recebe notificação:
   ```
   🔔 Cliente João Silva está interessado em imóvel externo:
   - URL: idealista.pt/imovel/12345
   - Tipo: T3 em Cascais
   - Preço: 450.000€
   - Comparou com: [Imóvel Interno #FA123]
   
   💡 Oportunidade de networking:
   - Contactar angariador do imóvel externo
   - Oferecer parceria ou permuta
   - Alargar portfolio de opções para o cliente
   ```

### Valor para Agentes
- **Alargamento de Network**: Identificar outros angariadores para parcerias
- **Mapeamento de Concorrência**: Saber o que clientes veem noutros sites
- **Proatividade**: Contactar cliente antes dele contactar a concorrência

### Técnico
```sql
CREATE TABLE property_comparisons (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE comparison_items (
  id SERIAL PRIMARY KEY,
  comparison_id INTEGER REFERENCES property_comparisons(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id) NULL, -- NULL se externo
  external_url TEXT NULL,
  external_data JSONB NULL, -- Scraped data
  CHECK ((property_id IS NOT NULL) OR (external_url IS NOT NULL))
);

CREATE TABLE external_property_alerts (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  agent_id INTEGER REFERENCES agents(id),
  external_url TEXT NOT NULL,
  external_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  viewed_by_agent BOOLEAN DEFAULT FALSE
);
```

### Scraping Externo
- **Bibliotecas**: Puppeteer/Playwright (Node.js) ou BeautifulSoup (Python)
- **Rate Limiting**: Cachear resultados, respeitar robots.txt
- **Fallback**: Se scraping falhar, permitir input manual de dados

---

## 🏠 Avaliação de Imóveis

### Features Principais

#### 1. Formulário de Submissão
- [ ] Upload de documentação
  - Caderneta predial
  - Escritura
  - Certificado energético (opcional)
- [ ] Upload de fotos (mínimo 5, máximo 20)
- [ ] Localização precisa (mapa interativo)
- [ ] Características do imóvel
  - Tipologia, área, ano de construção
  - Estado de conservação
  - Amenities

#### 2. Motor de Avaliação (Método Comparativo)
- [ ] Algoritmo de matching:
  1. Imóveis semelhantes na zona (raio 2km)
  2. Mesma tipologia ±1 (T2 → pode comparar T1, T2, T3)
  3. Área útil ±20%
  4. Publicados nos últimos 6 meses
- [ ] Cálculo de preço médio/m²
- [ ] Ajustes por características diferenciadoras
  - Estado de conservação (+/- 10%)
  - Amenities (piscina +5%, garagem +3%, etc.)
  - Certificado energético (A/B +5%, E/F -5%)
- [ ] Apresentação de estimativa com intervalo de confiança
  ```
  Estimativa de Valor de Mercado
  
  Valor Mínimo: 385.000€
  Valor Médio:   420.000€  ← Mais provável
  Valor Máximo:  455.000€
  
  Baseado em 12 imóveis semelhantes na zona
  Preço médio por m²: 2.800€
  ```

#### 3. Relatório de Avaliação
- [ ] PDF gerado automaticamente
- [ ] Tabela de comparáveis utilizados
- [ ] Mapas de localização
- [ ] Disclaimer legal (não substitui avaliação profissional)

### Valor para Agentes
Quando cliente submete avaliação:
1. Agente (lead owner) recebe notificação com dados completos
2. **Lead super-qualificado**: Cliente quer vender, já tem docs e fotos prontos
3. **Agilização de Angariação**:
   - Primeira reunião já com documentação
   - Estimativa de valor como base de negociação
   - Cliente já "educado" sobre valor de mercado realista

### Técnico
```sql
CREATE TABLE property_valuations (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id),
  agent_id INTEGER REFERENCES agents(id), -- Lead owner
  
  -- Localização
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Características
  typology VARCHAR(10), -- T0, T1, T2, etc.
  area_useful INTEGER,
  year_built INTEGER,
  condition VARCHAR(50), -- 'novo', 'bom', 'para_recuperar'
  
  -- Documentação
  documents JSONB, -- Array de URLs Cloudinary
  photos JSONB, -- Array de URLs Cloudinary
  
  -- Avaliação
  estimated_value_min INTEGER,
  estimated_value_avg INTEGER,
  estimated_value_max INTEGER,
  comparables_used JSONB, -- Array de property_ids usados
  
  -- Estado
  status VARCHAR(20) DEFAULT 'pending', -- pending, reviewed, contacted
  agent_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP
);
```

### Algoritmo Exemplo (Python)
```python
def calculate_valuation(property_data):
    # 1. Find comparables
    comparables = db.query("""
        SELECT * FROM properties
        WHERE status = 'published'
        AND ST_DWithin(
            location::geography,
            ST_SetSRID(ST_Point(%s, %s), 4326)::geography,
            2000  -- 2km radius
        )
        AND typology IN (%s)  -- Same or ±1
        AND area_useful BETWEEN %s AND %s  -- ±20%
        AND created_at > NOW() - INTERVAL '6 months'
        ORDER BY created_at DESC
        LIMIT 15
    """, (lng, lat, typology_range, min_area, max_area))
    
    # 2. Calculate base price per m²
    price_per_sqm = median([c.price / c.area_useful for c in comparables])
    
    # 3. Apply adjustments
    adjustment = 1.0
    if condition == 'novo':
        adjustment *= 1.10
    elif condition == 'para_recuperar':
        adjustment *= 0.85
    
    if has_pool:
        adjustment *= 1.05
    if has_garage:
        adjustment *= 1.03
    
    # 4. Calculate range
    base_value = price_per_sqm * area_useful * adjustment
    return {
        'min': base_value * 0.92,
        'avg': base_value,
        'max': base_value * 1.08,
        'comparables': [c.id for c in comparables]
    }
```

---

## 📊 Dashboard de Agente (Intelligence)

### Nova Seção no Backoffice
Página `/backoffice/leads/[client_id]/intelligence`

#### Widgets
1. **Watchlists do Cliente**
   - Lista de todas as listas criadas
   - Nomes revelam requisitos ("T3 Luxo Cascais", "Investimento até 300k")
   - Timeline de adições (ver evolução de interesse)

2. **Comparações Realizadas**
   - Histórico de comparações
   - **Alerta especial para imóveis externos**
   - Botão "Contactar Angariador" (se tiver dados)

3. **Avaliações Submetidas**
   - Lista de imóveis avaliados pelo cliente
   - Status: Pendente / Contactado / Angariado
   - Acesso rápido a documentação e fotos

4. **Score de Qualificação**
   - Automático baseado em atividade
   - 🔥 Hot Lead: Múltiplas watchlists + avaliação submetida
   - 🌡️ Warm Lead: 1-2 watchlists ativas
   - 🧊 Cold Lead: Apenas registo, sem atividade

---

## 🗂️ Estrutura de Implementação

### Fase 1: Fundação (Dia 1 - Manhã) ⏱️ 3-4h
- [ ] Tabela `clients` e autenticação
- [ ] Rotas de registo/login (backend + frontend)
- [ ] Página `/cliente/dashboard` base
- [ ] Middleware de proteção de rotas

### Fase 2: Watchlists (Dia 1 - Tarde) ⏱️ 4-5h
- [ ] Tabelas `client_watchlists` e `watchlist_items`
- [ ] API endpoints CRUD
- [ ] UI de criação/gestão de listas
- [ ] Botão "Adicionar a Lista" em property cards
- [ ] Página de visualização de listas

### Fase 3: Comparador (Dia 2 - Manhã) ⏱️ 4-5h
- [ ] Tabelas de comparações
- [ ] UI de seleção de imóveis para comparar
- [ ] Tabela de comparação lado-a-lado
- [ ] **Scraping de imóveis externos** (MVP: URL + input manual)
- [ ] Notificações para agentes (externos)

### Fase 4: Avaliação de Imóveis (Dia 2 - Tarde + Dia 3) ⏱️ 6-8h
- [ ] Tabela `property_valuations`
- [ ] Formulário multi-step de submissão
- [ ] Upload de docs/fotos para Cloudinary
- [ ] Algoritmo de método comparativo
- [ ] Geração de relatório PDF
- [ ] Dashboard de agente com avaliações

### Fase 5: Tema Dark/Light (Dia 3 - Final) ⏱️ 4-6h
- [ ] Setup de CSS variables
- [ ] ThemeProvider context
- [ ] Toggle UI component
- [ ] Persistência (localStorage + DB)
- [ ] Migração gradual de componentes

### Fase 6: Intelligence Dashboard (Dia 4 - Polimento) ⏱️ 3-4h
- [ ] Página `/backoffice/leads/[id]/intelligence`
- [ ] Widgets de watchlists
- [ ] Widgets de comparações
- [ ] Widgets de avaliações
- [ ] Score de qualificação automático

---

## 🎯 Priorização (MoSCoW)

### Must Have (MVP)
- ✅ Autenticação de clientes
- ✅ Watchlists personalizadas
- ✅ Comparador interno
- ✅ Avaliação de imóveis (método comparativo)
- ✅ Notificações para agentes (avaliações + externos)

### Should Have
- ⚠️ Comparador de imóveis externos (scraping)
- ⚠️ Tema dark/light
- ⚠️ Dashboard de intelligence completo

### Could Have
- 💡 Partilha de watchlists com agente
- 💡 Relatório PDF de avaliação
- 💡 Notas privadas em favoritos
- 💡 Score de qualificação automático

### Won't Have (Futuro)
- ❌ Agendamento de visitas (já existe noutro módulo?)
- ❌ Chat direto com agente
- ❌ Subscrição de alertas automáticos

---

## 🔧 Stack Técnico

### Frontend
- **Framework**: Next.js 14.2.4 (App Router)
- **Auth**: React Context + JWT
- **Theme**: CSS Variables + Tailwind dark: classes + Context API
- **Forms**: React Hook Form + Zod validation
- **Upload**: Cloudinary widget
- **PDF**: jsPDF ou react-pdf

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Railway)
- **Auth**: JWT tokens (bcrypt para passwords)
- **Storage**: Cloudinary (docs, fotos)
- **Scraping**: BeautifulSoup4 + requests (ou Playwright para SPA)
- **Notificações**: Endpoint `/notifications` existente

### DevOps
- **Deploy**: Vercel (frontend) + Railway (backend)
- **Database Migrations**: Alembic
- **CI/CD**: Git push → auto-deploy

---

## 📈 Métricas de Sucesso

### Engagement
- % de clientes registados vs visitantes
- Nº médio de watchlists por cliente
- Nº de comparações/dia
- Nº de avaliações submetidas/semana

### Qualificação de Leads
- Tempo médio de primeira resposta de agente
- Taxa de conversão avaliação → angariação
- Taxa de conversão comparação externa → parceria

### Técnicas
- Tempo de carregamento página de cliente
- Taxa de erro em scraping externo
- Precisão de avaliações (vs valor real de venda)

---

## 🚀 Go-Live Checklist

### Antes de Lançar
- [ ] Testes de autenticação (registo, login, logout, reset password)
- [ ] Testes de watchlists (CRUD completo)
- [ ] Testes de comparador (interno + externo)
- [ ] Testes de avaliação (upload, cálculo, notificação)
- [ ] Validação de segurança (SQL injection, XSS, CSRF)
- [ ] Validação de privacidade (RGPD: consentimento, dados pessoais)
- [ ] Performance testing (500 clientes simultâneos)
- [ ] Backup de database antes de migrations

### Pós-Lançamento
- [ ] Monitorar logs de erro
- [ ] A/B test de tema dark vs light (engagement)
- [ ] Feedback de primeiros 10 clientes
- [ ] Ajustar algoritmo de avaliação com dados reais

---

## 📞 Notas da Sessão

### Contexto de Negócio
- Objetivo principal: **Qualificar leads automaticamente** através de comportamento do cliente
- Diferenciador: **Intelligence sobre imóveis externos** → oportunidades de networking
- Agentes recebem informação estruturada **antes** do primeiro contacto

### Decisões Técnicas
- Scraping externo em MVP pode ser simplificado (URL + input manual)
- Algoritmo de avaliação pode evoluir com machine learning no futuro
- Tema dark/light é "nice to have" mas não bloqueante

### Próximos Passos
1. **Amanhã (Dia 1)**: Começar por autenticação + watchlists
2. **Validar** algoritmo de avaliação com dados reais antes de implementar
3. **Iterar** com feedback de agentes sobre dashboard de intelligence

---

**Última atualização**: 18 de dezembro de 2025  
**Status**: 📝 Planeamento - Pronto para implementação  
**Estimativa Total**: 4-5 dias de desenvolvimento
