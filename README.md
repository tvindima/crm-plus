
# CRM PLUS

CRM PLUS é um CRM imobiliário para Portugal e Espanha, composto por backend FastAPI, frontend Next.js e app React Native. Esta workspace contém também artefactos de infraestrutura e documentação inicial.

## Estrutura

- `backend/` FastAPI + SQLAlchemy + Pytest
- `frontend/web/` Next.js + Tailwind + Zustand
- `mobile/app/` React Native (Expo)
- `infra/` Docker Compose e manifestos Kubernetes
- `docs/` Arquitetura, decisões técnicas

## Requisitos

- Python 3.11+
- Node 20+
- npm 10+
- Docker e Docker Compose (opcional)

## Comandos Rápidos

```bash
# Backend
cd backend && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload

# Frontend
cd frontend/web && npm install && npm run dev

# Mobile
cd mobile/app && npm install && npx expo start
```
