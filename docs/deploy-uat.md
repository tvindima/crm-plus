# CRM PLUS – Deploy/UAT (frontend + backend)

## Visão geral
- Frontend (site público + backoffice): sugerido em Vercel/Netlify (Next.js 14).
- Backend (FastAPI): sugerido em Railway/Render/ngrok/VPS com HTTPS público.
- CORS: definir `CRMPLUS_CORS_ORIGINS` para os domínios públicos do frontend e localhost.
- Credenciais de teste: criar manualmente um admin e um angariador na base remota.

> **📘 Configuração de Domínio**: Para configurar domínios personalizados, consulte:
> - [`docs/domain-setup.md`](domain-setup.md) - Guia completo de configuração de domínio
> - [`docs/domain-quickstart.md`](domain-quickstart.md) - Guia rápido por cenário
> - [`docs/domain-environments.md`](domain-environments.md) - Configuração por ambiente

## Variáveis de ambiente
- Frontend: `.env.local`
  - `NEXT_PUBLIC_API_BASE_URL=https://<dominio-backend>`
- Backend: `.env` (ver `backend/.env.example`)
  - `CRMPLUS_CORS_ORIGINS=https://<dominio-frontend>,https://<dominio-backoffice>,http://localhost:3000`
  - `DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/crmplus` (ou MySQL/SQLite)

## Deploy frontend (Vercel/Netlify)
1) Definir `NEXT_PUBLIC_API_BASE_URL` no painel de env.
2) `npm install && npm run build` (já configurado).
3) Domínio público HTTPS (ex.: https://crmplus-frontend.vercel.app).

## Deploy backend (Railway/Render/ngrok/VPS)
1) Definir env do backend (`CRMPLUS_CORS_ORIGINS`, `DATABASE_URL`).
2) Executar `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
3) Expor HTTPS público (Railway/Render/ngrok com TLS).
4) Verificar `/docs` e `/properties` remotamente.

## Atualização de Deploy e Estado (12-12-2025)  
- Serviço Railway: `crm-plus`  
- URL de backend em produção: https://crm-plus-production.up.railway.app  
- Base de dados: PostgreSQL (provisionada via serviço Railway).  
- Credenciais dummy validadas: admin@test.com/admin123 e agent@test.com/agent123  
- Variáveis de ambiente recomendadas:  
  - `DATABASE_URL` (URL do Postgres fornecida pela Railway)  
  - `CRMPLUS_CORS_ORIGINS` com os domínios do frontend/backoffice  
  - `NEXT_PUBLIC_API_BASE_URL` apontando para `https://crm-plus-production.up.railway.app`  
  - `EXPO_PUBLIC_API_BASE_URL` apontando para `https://crm-plus-production.up.railway.app`  
- Após o deploy do backend, prossiga com o deploy do frontend e valide login e navegação com os utilizadores dummy.

## CORS
- Ajustar `CRMPLUS_CORS_ORIGINS` para incluir os domínios do frontend/backoffice e, se necessário, localhost (`http://localhost:3000`).

## Credenciais de teste (criar manualmente)
- Admin (dummy): `admin@test.com` / `admin123`
- Angariador (dummy): `agent@test.com` / `agent123`
- TODO: criar no backend remoto e confirmar permissões.

## Checklist UAT
- Frontend acessível em HTTPS, pages públicas e backoffice.
- Backend acessível em HTTPS, `/docs` funcional.
- Listagem/detalhe de imóveis consomem API remota.
- CORS permite chamadas do domínio do frontend.
- Credenciais dummy criadas e testadas (login/perfis).
- TODOs conhecidos: ligar campos de agente/avatar/coords/imagens/visitas/contactos/feeds/leads quando API expuser.
