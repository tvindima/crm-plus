# CRM PLUS – Backoffice (FASE 2)

## Rotas/backoffice
- `/backoffice/dashboard` – KPIs, tiles e notificações.
- `/backoffice/imoveis` – Tabela (mock/API) com ações rápidas; futura edição/criação.
- `/backoffice/imoveis/[id]/editar` – Placeholder para editor completo.
- `/backoffice/leads` – Placeholder lista de leads.
- `/backoffice/agentes` – Lista de agentes (placeholder, role leader/admin).
- `/backoffice/equipas` – Gestão de equipas (placeholder).
- `/backoffice/relatorios` – Placeholder (role leader/admin).
- `/backoffice/agenda` – Placeholder para calendar/visitas.
- `/backoffice/automacao` – Placeholder para fluxos Trigger → Automation → Action (role leader/admin).
- `/backoffice/config` – Configurações/segurança (role admin).

## Componentes core
- `backoffice/components/BackofficeLayout` – Layout com Sidebar + Topbar.
- `Sidebar` – Menus filtrados por role (agent/leader/admin).
- `Topbar` – Com selector de role (contexto).
- `KPITile`, `DataTable` – UI básica dark premium.
- (Slots para Drawer/Modal/Notification/Upload) a implementar no passo 3.

## Permissões (context/roleContext.tsx)
- Roles: agent, leader, admin.
- Regras:
  - agent: pode editar apenas itens da sua equipa (flag `canEditTeamOnly` true).
  - leader: edita equipa, vê relatórios, automação.
  - admin: total acesso, configurações.
- Contexto expõe `role` e `permissions` para componentes.

## Estratégia de UI/shared
- Tema dark premium alinhado ao site público.
- Serviços em `src/services/backofficeApi.ts` com fallback mocks (`backoffice/mocks`).
- Reutilizar componentes públicos quando fizer sentido (ex.: cards), mas backoffice terá tabela/form UX orientada a produtividade.

## TODOs e gaps (antes da FASE 3)
- Implementar CRUD real (imóveis/leads/agentes) com endpoints reais do backend.
- Adicionar Drawer/Modal/Upload/Notification reutilizáveis.
- Editor de imóvel completo (form, validação, upload de imagens).
- Ações em batch + export CSV.
- i18n para backoffice (chaves base preparadas; falta wiring).
- Autenticação real e enforcement de permissões server-side.

# Atualização FASE 3 (parcial)
- Tabela de imóveis com filtros/status/search e ações rápidas (mock).
- Drawer com formulário de criação/edição (validado: ref, preço, área, 1+ imagem). Upload é mock (regista nomes; TODO upload real/reorder).
- Toasts/snackbars para feedback (mock).
- Permissões continuam client-side via RoleContext (agent/leader/admin).
- Serviços continuam com fallback de mocks; TODO ligar endpoints reais (GET/POST/PUT/DELETE) quando expostos.
- Ações rápidas “Ver/Editar/Duplicar/Eliminar” ainda não persistem em backend (mock state in-memory).
