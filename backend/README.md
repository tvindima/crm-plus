
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
