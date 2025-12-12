
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
- `CRMPLUS_AUTH_SECRET` — segredo JWT
- `CRMPLUS_CORS_ORIGINS` — origens permitidas
- `DATABASE_URL` — URL da BD (Postgres/MySQL/SQLite)
- `API_URL` — URL público do backend (para front consumir)
