# CRM PLUS – Backoffice (FASE 2 → 3 integração properties)

## Rotas/backoffice
- `/backoffice/dashboard` – KPIs, tiles e notificações.
- `/backoffice/imoveis` – Tabela ligada a API real `/properties` (search/status), ações rápidas (ver/editar/duplicar/eliminar), drawer com formulário completo e upload real.
- `/backoffice/imoveis/[id]/editar` – Editor standalone carregando imóvel real e permitindo guardar.
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
- `KPITile`, `DataTable` – UI dark premium; DataTable suporta ações com callback.
- `Drawer`, `ToastProvider`, `UploadArea`, `PropertyForm` – usados no CRUD real de imóveis (upload multi-ficheiro, validação forte).

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

## TODOs e gaps (após integração properties)
- Leads/agentes/equipas continuam em placeholder; ligar endpoints reais quando expostos.
- Ações em batch + export CSV.
- i18n para backoffice (chaves base preparadas; falta wiring).
- Autenticação real e enforcement de permissões server-side.

# Atualização FASE 3 (properties ligadas ao backend)
- CRUD de imóveis agora consome endpoints reais (`GET/POST/PUT/DELETE /properties`, `POST /properties/{id}/upload`).
- Formulário inclui todos os campos backend (referência, negócio, tipo, tipologia, preço, áreas, localização, estado, CE, descrição, observações, agente).
- Upload multi-ficheiro funcional; mantém imagens existentes e envia novas via multipart.
- Toasts/snackbars de sucesso/erro reais.
- Permissões continuam client-side via RoleContext (agent/leader/admin) – enforcement server-side fica em TODO.
- Mock store removido (`usePropertiesStore` e `backoffice/mocks/properties`).
