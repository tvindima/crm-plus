# 📱 PRODUCT BRIEF: APP MOBILE IMÓVEIS MAIS

> **Data:** 18 de dezembro de 2025  
> **Status:** 🔴 **DOCUMENTO CRÍTICO - LEITURA OBRIGATÓRIA**  
> **Tipo:** Aplicação Interna B2E (Business-to-Employee)

---

## ⚠️ IMPORTANTE - LEIA PRIMEIRO

### 🎯 O QUE ESTA APP **É**:
✅ **Ferramenta interna exclusiva para agentes imobiliários Imóveis Mais**  
✅ **App de produtividade e gestão operacional**  
✅ **Interface mobile do backoffice CRM**  
✅ **Acesso restrito com autenticação obrigatória**  
✅ **Dados geridos pelo backoffice, não pelo site montra**

### ❌ O QUE ESTA APP **NÃO É**:
❌ **NÃO é portal público para clientes finais**  
❌ **NÃO é marketplace de pesquisa de imóveis**  
❌ **NÃO é app de consumidor (B2C)**  
❌ **NÃO tem registo público aberto**  
❌ **NÃO replica funcionalidades do site montra**

---

## 👥 USER PERSONA - ÚNICO UTILIZADOR

### Agente Imobiliário Imóveis Mais
**Nome:** João Silva  
**Idade:** 32 anos  
**Cargo:** Agente Imobiliário  
**Experiência:** 5 anos no setor  
**Empresa:** Imóveis Mais (colaborador interno)

**Necessidades:**
- ✅ Gerir angariações em campo
- ✅ Registar visitas a imóveis com clientes
- ✅ Atualizar leads e pipelines
- ✅ Consultar agenda de tarefas
- ✅ Upload de fotos/vídeos de propriedades
- ✅ Acesso rápido a dados CRM
- ✅ Check-in/check-out GPS nas visitas
- ✅ Atualizar status de negociações

**Contexto de Uso:**
- 📍 Em deslocações (visitas, angariações)
- 📱 Necessita de acesso rápido mobile
- 🔒 Dados sensíveis da empresa
- 📊 Integração total com backoffice
- ⏱️ Tempo limitado entre compromissos

**Pain Points Atuais:**
- ❌ Backoffice apenas em desktop
- ❌ Falta de ferramentas mobile
- ❌ Dificuldade em atualizar dados em campo
- ❌ Processos manuais repetitivos

---

## 🎯 OBJETIVOS DO PRODUTO

### Objetivo Principal
**Aumentar a produtividade dos agentes imobiliários através de ferramentas mobile que permitem gestão completa do CRM em qualquer lugar.**

### Objetivos Secundários
1. ✅ Reduzir tempo de atualização de dados no backoffice
2. ✅ Melhorar tracking de visitas e atividades em campo
3. ✅ Centralizar informações de leads e propriedades
4. ✅ Automatizar criação de tasks e follow-ups
5. ✅ Facilitar upload de media (fotos/vídeos) em campo

### KPIs de Sucesso
| Métrica | Target | Como Medir |
|---------|--------|------------|
| Tempo médio de registo de visita | < 2 min | Analytics app |
| Adoção pelos agentes | > 80% | Active users / Total agents |
| Uploads de fotos em campo | +50% | Cloudinary analytics |
| Redução de tarefas atrasadas | -30% | Task completion rate |
| Satisfação dos agentes | > 4.5/5 | Survey trimestral |

---

## 🏗️ ÂMBITO DO PROJETO

### ✅ INCLUÍDO (MVP)

#### 1. Autenticação e Perfil
- Login JWT (email + password)
- Perfil do agente
- Avatar e dados pessoais
- Logout seguro

#### 2. Dashboard
- KPIs pessoais (leads, visitas, propriedades)
- Tarefas de hoje
- Visitas agendadas hoje
- Notificações

#### 3. Propriedades
- Lista de propriedades do agente
- Detalhes de propriedade
- Criar nova angariação
- Upload de fotos/vídeos
- Editar dados básicos
- Gerar QR code da propriedade

#### 4. Leads
- Lista de leads do agente
- Detalhes do lead
- Criar novo lead
- Atualizar status no pipeline
- Adicionar notas
- Agendar follow-up

#### 5. Visitas (✅ IMPLEMENTADO)
- Lista de visitas (filtros: data, status, propriedade)
- Widget "Visitas de Hoje"
- Criar visita agendada
- Check-in com GPS
- Check-out com feedback
- Detalhes e histórico

#### 6. Tarefas/Agenda
- Calendário de tarefas
- Lista de tasks pendentes
- Criar nova task
- Marcar como concluída
- Notificações de lembretes

### ❌ EXCLUÍDO (Fora do Âmbito)

#### Funcionalidades de Cliente Final
❌ Pesquisa pública de imóveis  
❌ Sistema de favoritos para compradores  
❌ Chat entre cliente e agente (app cliente)  
❌ Registo público aberto  
❌ Pedidos de visita por clientes  
❌ Sistema de pagamentos

#### Funcionalidades do Site Montra
❌ SEO e conteúdo público  
❌ Landing pages de marketing  
❌ Blog ou artigos  
❌ Formulários de contacto público  
❌ Integração com redes sociais para divulgação

#### Funcionalidades Administrativas Complexas
❌ Gestão de utilizadores (feita no backoffice)  
❌ Configurações da agência  
❌ Relatórios analíticos complexos  
❌ Gestão de comissões e contratos  
❌ Sistema de faturação

---

## 🔐 ACESSO E SEGURANÇA

### Controlo de Acesso
| Aspeto | Regra |
|--------|-------|
| **Registo** | ❌ **NÃO há registo público** - Agentes são criados pelo Admin no backoffice |
| **Login** | ✅ Apenas emails `@imoveismais.pt` ou aprovados pelo Admin |
| **Autenticação** | ✅ JWT Bearer Token |
| **Permissões** | ✅ Role: `agent` (editor com acesso total aos seus dados) |
| **Multi-device** | ✅ Permitido (refresh token) |
| **Reset Password** | ✅ Via email corporativo |

### Dados Visíveis
**Agente vê apenas:**
- ✅ Suas próprias propriedades angariadas
- ✅ Seus próprios leads atribuídos
- ✅ Suas próprias visitas
- ✅ Suas próprias tarefas
- ✅ Dados gerais da agência (telefone, morada)

**Agente NÃO vê:**
- ❌ Propriedades de outros agentes (exceto se partilhadas)
- ❌ Leads de outros agentes
- ❌ Estatísticas globais da agência
- ❌ Dados financeiros da empresa

---

## 🛠️ INTEGRAÇÃO COM ECOSSISTEMA

### Backend CRM (Fonte de Verdade)
```
Backoffice CRM → API Backend → Mobile App
```

**Dados geridos no Backoffice:**
- ✅ Criação de agentes (Admin)
- ✅ Configuração de permissões
- ✅ Importação massiva de propriedades
- ✅ Relatórios e analytics avançados
- ✅ Gestão de utilizadores

**Dados geridos na Mobile App:**
- ✅ Criação rápida de leads em campo
- ✅ Upload de fotos de propriedades
- ✅ Registo de visitas e check-ins
- ✅ Atualização de status de leads
- ✅ Criação de tarefas pessoais

### Site Montra (Sem Integração Direta)
❌ **A app mobile NÃO consome dados do site montra**  
❌ **A app mobile NÃO publica no site montra**  
✅ **Ambos consomem do mesmo backend CRM**

```
┌──────────────┐
│ Backend CRM  │ ← Única fonte de dados
└──────┬───────┘
       │
       ├────────────┐
       │            │
       ↓            ↓
┌────────────┐ ┌──────────┐
│ Mobile App │ │Site Montra│
│  (Agentes) │ │ (Público) │
└────────────┘ └──────────┘
```

---

## 📋 JIRA/PM - ESTRUTURA DE PROJETO

### Epic 1: 🔐 Autenticação e Segurança (B2E Internal)
**Descrição:**  
Sistema de autenticação JWT exclusivo para agentes imobiliários Imóveis Mais. **NÃO há registo público** - utilizadores são criados pelo Admin no backoffice CRM.

**User Stories:**
- Como **agente imobiliário**, quero fazer login com email corporativo para aceder à app
- Como **agente imobiliário**, quero manter sessão ativa para não ter que fazer login constantemente
- Como **admin do backoffice**, quero criar contas de agentes para controlar acesso à app
- Como **agente imobiliário**, quero recuperar password via email para voltar a aceder

**Acceptance Criteria:**
- ✅ Apenas emails aprovados podem fazer login
- ✅ JWT token com expiração de 24h
- ✅ Refresh token funcional
- ✅ Logout limpa tokens
- ❌ NÃO existe ecrã de registo público

---

### Epic 2: 📊 Dashboard Agente (Produtividade Interna)
**Descrição:**  
Dashboard personalizado mostrando métricas de **produtividade do agente** (não de clientes). Foco em gestão de angariações, leads e visitas.

**User Stories:**
- Como **agente imobiliário**, quero ver minhas propriedades angariadas para gerir meu portfólio
- Como **agente imobiliário**, quero ver meus leads para priorizar follow-ups
- Como **agente imobiliário**, quero ver visitas de hoje para planear o dia
- Como **agente imobiliário**, quero ver tarefas pendentes para não esquecer compromissos

**Acceptance Criteria:**
- ✅ Mostra apenas dados do agente autenticado
- ✅ KPIs: nº propriedades, leads ativos, visitas hoje, tasks pendentes
- ✅ Widget "Visitas de Hoje" com check-in rápido
- ❌ NÃO mostra pesquisa pública de imóveis
- ❌ NÃO mostra dados de outros agentes

---

### Epic 3: 🏠 Gestão de Propriedades (Angariações do Agente)
**Descrição:**  
Ferramenta para **agentes gerirem suas próprias angariações** em campo. Upload de fotos, atualização de dados, geração de QR codes para marketing.

**User Stories:**
- Como **agente imobiliário**, quero criar nova angariação em campo para não perder tempo
- Como **agente imobiliário**, quero fazer upload de fotos no local para ter registo imediato
- Como **agente imobiliário**, quero gerar QR code da propriedade para partilhar com clientes
- Como **agente imobiliário**, quero editar detalhes da propriedade para manter dados atualizados

**Acceptance Criteria:**
- ✅ Criação de propriedade atribui automaticamente ao agente
- ✅ Upload de fotos vai direto para Cloudinary
- ✅ Apenas agente proprietário ou Admin pode editar
- ❌ NÃO é pesquisa pública de imóveis
- ❌ NÃO mostra propriedades de outros agentes (exceto partilhadas)

---

### Epic 4: 👥 Gestão de Leads (CRM do Agente)
**Descrição:**  
Pipeline de leads para **agentes gerirem seus clientes** e oportunidades de negócio. Foco em produtividade e conversão.

**User Stories:**
- Como **agente imobiliário**, quero criar lead em campo após conhecer potencial cliente
- Como **agente imobiliário**, quero atualizar status do lead conforme avança no pipeline
- Como **agente imobiliário**, quero adicionar notas ao lead para lembrar detalhes importantes
- Como **agente imobiliário**, quero agendar follow-up para não perder oportunidades

**Acceptance Criteria:**
- ✅ Criação de lead atribui automaticamente ao agente
- ✅ Pipeline: novo → contactado → visitou → proposta → fechado/perdido
- ✅ Notas privadas do agente
- ❌ NÃO é formulário público de contacto
- ❌ NÃO permite leads de outros agentes

---

### Epic 5: 📍 Sistema de Visitas (✅ IMPLEMENTADO)
**Descrição:**  
Sistema completo de **registo de visitas a imóveis** com check-in/check-out GPS, feedback e auto-criação de tasks.

**User Stories:**
- Como **agente imobiliário**, quero criar visita agendada para organizar minha agenda
- Como **agente imobiliário**, quero fazer check-in GPS para comprovar presença no local
- Como **agente imobiliário**, quero registar feedback após visita para avaliar interesse do cliente
- Como **agente imobiliário**, quero ver histórico de visitas da propriedade

**Acceptance Criteria:**
- ✅ Check-in valida GPS (distância < 500m da propriedade)
- ✅ Check-out obriga registo de feedback
- ✅ Auto-criação de task de follow-up
- ✅ Auto-update de status do lead baseado em feedback
- ❌ NÃO permite clientes finais marcarem visitas
- ❌ NÃO é calendário público

**Status:** 🟢 Backend 100% completo, Frontend pendente

---

### Epic 6: 📅 Agenda e Tarefas (Produtividade Agente)
**Descrição:**  
Calendário pessoal e gestão de **tarefas do agente** para organização diária.

**User Stories:**
- Como **agente imobiliário**, quero ver calendário de tasks para planear o dia
- Como **agente imobiliário**, quero criar task rápida em campo
- Como **agente imobiliário**, quero marcar task como concluída
- Como **agente imobiliário**, quero receber notificações de lembretes

**Acceptance Criteria:**
- ✅ Tasks pessoais do agente
- ✅ Notificações push para lembretes
- ✅ Integração com sistema de visitas
- ❌ NÃO é agenda partilhada com clientes
- ❌ NÃO permite agendamento por terceiros

---

## 🎨 DESIGN E UX

### Princípios de Design

#### 1. **Mobile-First para Produtividade**
- ⚡ Ações rápidas (check-in em 2 taps)
- 📱 Otimizado para uso com uma mão
- 🎯 Foco em tarefas do dia-a-dia do agente

#### 2. **Dados do Agente em Destaque**
- ✅ "Minhas Propriedades"
- ✅ "Meus Leads"
- ✅ "Minhas Visitas"
- ❌ Nunca "Pesquisar Imóveis"
- ❌ Nunca "Explorar Catálogo"

#### 3. **Terminologia Interna**
- ✅ "Angariações" (não "Imóveis Disponíveis")
- ✅ "Pipeline de Leads" (não "Pedidos de Contacto")
- ✅ "Check-in na Visita" (não "Marcar Visita")
- ✅ "Upload de Fotos" (não "Galeria de Imóveis")

### Wireframes - User Persona Correto

#### ❌ ERRADO (Persona de Cliente)
```
┌─────────────────┐
│ Pesquisar       │ ← NUNCA usar isto
│ Imóveis         │
├─────────────────┤
│ 🏠 T3 em Lisboa │
│ 💰 €250.000     │
│ [Ver Detalhes]  │
└─────────────────┘
```

#### ✅ CORRETO (Persona de Agente)
```
┌─────────────────┐
│ Minhas          │ ← Sempre "Minhas/Meus"
│ Angariações     │
├─────────────────┤
│ 🏠 T3 Avenidas  │
│ 📊 3 leads      │
│ 📅 2 visitas    │
│ [Gerir]         │
└─────────────────┘
```

---

## 📞 COMUNICAÇÃO DO PROJETO

### Kickoff Meeting - Script Obrigatório

**Abertura (3 min):**
> "Esta app mobile é uma **ferramenta interna exclusiva para agentes imobiliários Imóveis Mais**. É uma extensão mobile do nosso backoffice CRM, permitindo que os agentes trabalhem em campo com a mesma eficiência do escritório."

**Reforço (2 min):**
> "⚠️ **Importante:** Não estamos a criar um portal público para clientes finais. Os utilizadores desta app são **apenas colaboradores da Imóveis Mais** (agentes e eventualmente gestores). Não haverá registo público, pesquisa aberta de imóveis ou funcionalidades do site montra."

**Objetivos (3 min):**
> "O objetivo é **aumentar a produtividade dos agentes** em campo: registar visitas, atualizar leads, criar angariações, fazer upload de fotos, tudo sem precisar de voltar ao escritório para usar o backoffice."

**User Persona (2 min):**
> "Quando criarem wireframes, mockups, user stories ou flows, **pensem sempre no João, o agente imobiliário**, nunca no Maria, a cliente que quer comprar casa. João precisa de ferramentas de gestão, não de um marketplace."

### Daily Standups - Checklist
- [ ] Funcionalidade é para agente ou para cliente? (se for cliente, está fora do âmbito)
- [ ] Dados vêm do backoffice CRM ou do site montra? (sempre backoffice)
- [ ] User story usa persona de agente? (ex: "Como agente, quero...")
- [ ] Terminologia é interna? (angariações, pipeline, check-in)

### Sprint Reviews - Validação
Antes de apresentar demo:
- [ ] Mostrar ecrã de login (não há registo público)
- [ ] Mostrar dashboard do agente (não pesquisa pública)
- [ ] Explicar: "Isto é o que o João vê quando faz check-in numa visita"
- [ ] Nunca dizer: "O cliente pode pesquisar imóveis aqui"

---

## 🚫 RED FLAGS - SINAIS DE ALERTA

### Se ouvir/ver isto, PARAR e corrigir:

| ❌ RED FLAG | ✅ CORREÇÃO |
|-------------|-------------|
| "Portal de imóveis" | "App de gestão para agentes" |
| "Clientes podem registar-se" | "Apenas agentes criados pelo Admin" |
| "Pesquisa pública" | "Lista de angariações do agente" |
| "Marketplace" | "CRM mobile" |
| "Catálogo de imóveis" | "Portfólio do agente" |
| "Pedidos de visita" | "Agendamento de visitas pelo agente" |
| "Chat com agente" | "Notas internas do agente" |
| "Favoritos do utilizador" | "Propriedades destacadas pelo agente" |
| "Dados do site montra" | "Dados do backoffice CRM" |
| "User story: Como cliente..." | "User story: Como agente imobiliário..." |

---

## 📊 MÉTRICAS E ANALYTICS

### KPIs de Utilização (Agentes)
| Métrica | Definição | Target |
|---------|-----------|--------|
| **DAU** | Daily Active Users (agentes) | > 80% da equipe |
| **Visitas Registadas** | Nº visitas com check-in/out | > 90% das visitas |
| **Uploads em Campo** | Fotos enviadas via mobile | > 50% das fotos |
| **Tempo de Registo** | Tempo médio para criar lead/visita | < 2 minutos |
| **Adoption Rate** | % agentes que usam a app semanalmente | > 85% |

### Analytics NÃO Relevantes (Cliente)
❌ Taxa de conversão de visitantes → compradores (não aplicável)  
❌ Bounce rate do site (não é website)  
❌ Nº de pesquisas (não há pesquisa pública)  
❌ Cliques em anúncios (não há publicidade)  
❌ Regra de consentimento GDPR para visitantes (todos são colaboradores)

---

## 🎓 FORMAÇÃO DA EQUIPA

### Onboarding - Dia 1
1. ✅ Ler este documento completo
2. ✅ Ver demo do backoffice CRM (não do site montra)
3. ✅ Entender fluxo de trabalho de um agente
4. ✅ Review de user personas (apenas agente)
5. ✅ Clarificar dúvidas sobre âmbito

### Checklist de Conhecimento
- [ ] Consigo explicar a diferença entre esta app e o site montra?
- [ ] Sei quem são os utilizadores (agentes, não clientes)?
- [ ] Entendo que não há registo público?
- [ ] Sei que dados vêm do backoffice, não do site?
- [ ] Conheço a user persona do João (agente)?

---

## 📞 CONTACTOS E ESCALAÇÃO

### Dúvidas sobre Âmbito
**Perguntar antes de implementar:**
- "Isto é funcionalidade para agente ou para cliente?"
- "Os dados vêm do backoffice ou do site montra?"
- "Esta feature aumenta produtividade do agente?"

**Se a resposta não for clara:**
- 📧 Email: product@imoveismais.pt
- 💬 Slack: #mobile-dev → mencionar @product-owner
- 📞 Escalação: Marcar reunião de alinhamento

---

## 🎯 RESUMO EXECUTIVO (TL;DR)

### O QUE É (30 segundos)
**App mobile B2E (Business-to-Employee) exclusiva para agentes imobiliários Imóveis Mais gerirem seu trabalho em campo: angariações, leads, visitas, tarefas. Interface mobile do backoffice CRM com autenticação restrita.**

### O QUE NÃO É (30 segundos)
**NÃO é portal público para clientes finais comprarem casa. NÃO tem registo público. NÃO replica site montra. NÃO é marketplace. NÃO mostra dados de outros agentes.**

### User Persona (10 segundos)
**João, agente imobiliário de 32 anos, precisa gerir seu portfólio e leads enquanto está em campo.**

### Próxima Ação (5 segundos)
**✅ Ler BACKEND_STATUS_VISITS.md e começar implementação frontend do sistema de visitas.**

---

**Documento Aprovado por:** Product Owner  
**Data de Aprovação:** 18 de dezembro de 2025  
**Versão:** 1.0  
**Status:** 🔴 **OBRIGATÓRIO - Leitura antes de qualquer desenvolvimento**

---

## 📎 ANEXOS

### A. Glossário de Termos

| Termo | Definição | Uso Correto |
|-------|-----------|-------------|
| **Agente** | Colaborador Imóveis Mais | Utilizador da app |
| **Cliente** | Comprador/arrendatário | NÃO usa a app |
| **Angariação** | Propriedade captada pelo agente | "Minhas angariações" |
| **Lead** | Potencial cliente no pipeline | "Meus leads" |
| **Visita** | Agente leva cliente a ver imóvel | "Check-in na visita" |
| **Backoffice** | CRM desktop interno | Fonte de dados |
| **Site Montra** | Website público | Sem integração direta |

### B. Fluxo de Trabalho do Agente (Dia Típico)

```
08:00 - Abre app → Dashboard com visitas de hoje
08:30 - Check-in GPS na primeira visita
09:15 - Check-out e registo de feedback
09:30 - Cria lead do cliente que visitou
10:00 - Upload de fotos de nova angariação
11:00 - Atualiza status de lead no pipeline
12:00 - Cria task para follow-up amanhã
...
18:00 - Review de tarefas concluídas
```

### C. Comparação de Funcionalidades

| Funcionalidade | Site Montra (B2C) | App Mobile (B2E) |
|----------------|-------------------|------------------|
| **Público** | Qualquer pessoa | Apenas agentes |
| **Registo** | Aberto | Fechado (Admin) |
| **Objetivo** | Marketing | Produtividade |
| **Dados** | Imóveis publicados | Todas as angariações |
| **Pesquisa** | Sim, pública | Não, só do agente |
| **Visitas** | Pedido pelo cliente | Agendamento pelo agente |
| **Fotos** | Galeria pública | Upload pelo agente |

---

**FIM DO DOCUMENTO**

**⚠️ Este documento deve ser referenciado em todos os tickets Jira, PRs, design reviews e sprint plannings relacionados com a app mobile.**
