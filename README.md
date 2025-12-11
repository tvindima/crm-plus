
# CRM PLUS

**CRM PLUS** é uma plataforma inteligente, multicanal e modular para a gestão avançada de imobiliárias, construída em Python/FastAPI, React, Mobile e IA.

## Módulos do Backend
- Leads
- Properties (Imóveis)
- Agents
- Teams
- Agencies
- Calendar (Agenda)
- Feed (Atividades/Notificações)
- Match Plus (Inteligência de correspondência)
- Assistant (Copiloto/Intent Parser)
- Notifications
- Billing (Faturação)
- Reports/Dashboards (Sumários analíticos)

## Instalação (Desenvolvimento)

```bash
git clone https://github.com/tvindima/crm-plus.git
cd crm-plus/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Configuração de endpoints remotos (front/web/mobile)
- Backend: defina `CRMPLUS_CORS_ORIGINS` (lista separada por vírgulas) para permitir domínios remotos, ex. `https://crmplus-web.vercel.app,https://backoffice.example.com`.
- Frontend web (Next): crie `.env.local` com `NEXT_PUBLIC_API_BASE_URL=https://teu-backend-publico`.
- Mobile (Expo): crie `mobile/app/.env` com `EXPO_PUBLIC_API_BASE_URL=https://teu-backend-publico`.
- Por omissão os frontends apontam para `http://127.0.0.1:8000`; ajuste para staging/prod conforme o host exposto.

## Estrutura
- `backend/app/` → API principal FastAPI com módulos acima
- Cada módulo segue repositórios separados, para escalabilidade e automação
- Documentação inicial nos próprios ficheiros
- Suporte a SQLite para dev; produção pode usar PostgreSQL/MySQL facilmente

## Principais Features
- Gestão, automação e inteligência de leads/propriedades
- Agentes, filas, equipas, agenda, faturação e notificações centralizadas
- API REST, fácil integração com frontend, mobile e automações
- Painel analítico e dashboards embutidos

## Contribuição
Pull requests, issues, forks e automações são bem-vindos.

## UAT / Deploy remoto
- Frontend (site público + backoffice) sugerido em Vercel/Netlify. Definir `NEXT_PUBLIC_API_BASE_URL` para o backend público (ver `frontend/web/.env.example`).
- Backend (FastAPI) sugerido em Railway/Render/ngrok/VPS com TLS. Ver `backend/.env.example` para `CRMPLUS_CORS_ORIGINS` e `DATABASE_URL`.
- CORS: incluir domínios do frontend/backoffice e localhost em `CRMPLUS_CORS_ORIGINS`.
- Credenciais dummy a criar no ambiente remoto para testes:
  - Admin: `admin@test.com` / `admin123`
  - Angariador: `agent@test.com` / `agent123`
- Checklist UAT e passos de deploy em `docs/deploy-uat.md`.
