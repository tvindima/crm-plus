
# CRM PLUS Backend

FastAPI-based API-first backend that powers CRM PLUS. The service exposes modular routers under `/api/v1` and integrates with PostgreSQL, Redis, and external providers.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

Run tests with `pytest` from the backend directory.

## Público-alvo e separação
- API para servir site institucional (B2B), montras B2C das agências e backoffice/admin. Não serve UI.
- Autenticação JWT HS256 (`CRMPLUS_AUTH_SECRET`), CORS configurável via env.
- Uploads/media controlados (ex.: propriedades) sob `/media`.

## Domínio / Deploy
- Serviço/API independente (Railway/Render/VPS). Não misturar domínios com frontends.
- Configurar `CRMPLUS_CORS_ORIGINS` com domínios autorizados (institucional + montras/backoffice).

## Env vars (ver `.env.example`)
- `CRMPLUS_AUTH_SECRET` — segredo JWT (obrigatório)
- `CRMPLUS_CORS_ORIGINS` — origens permitidas (lista separada por vírgulas, usar domínios finais abaixo)
- `DATABASE_URL` — URL da BD (Postgres/MySQL/SQLite)
- `API_URL` — URL público do backend (para front consumir)

### Domínios CORS recomendados (produção)
- https://crm-plus-site.vercel.app, https://institucional.crmplus.com
- https://imoveismais-site.vercel.app, https://imoveismais.pt
- https://crm-plus-backoffice.vercel.app, https://app.crmplus.com
- Adiciona domínios de preview `.vercel.app` se usados em QA.

Adiciona domínios de preview da Vercel se necessário e remove qualquer wildcard antes de produção.
