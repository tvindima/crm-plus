# CRM PLUS – Testes remotos (web/backoffice/mobile)

---

## 🌐 URLs de Teste Ativos (2025-12-14)

### Frontend (Site Público) - Vercel ✅ Permanente
**https://imoveismais.vercel.app**

### Backend API - Railway ✅ Permanente
**https://crm-plus-production.up.railway.app**

> ✅ **Ambos os serviços estão hospedados permanentemente** - funcionam 24/7 sem necessidade de túneis locais.

### Páginas Disponíveis

| Página | URL |
|--------|-----|
| Home | https://imoveismais.vercel.app |
| Imóveis | https://imoveismais.vercel.app/imoveis |
| Imóveis Venda | https://imoveismais.vercel.app/imoveis/venda |
| Imóveis Arrendamento | https://imoveismais.vercel.app/imoveis/arrendamento |
| Equipa | https://imoveismais.vercel.app/agentes |
| Agente Individual | https://imoveismais.vercel.app/agentes/[slug] |
| Contactos | https://imoveismais.vercel.app/contactos |

### API Endpoints Principais

| Endpoint | URL |
|----------|-----|
| Health Check | https://crm-plus-production.up.railway.app/health |
| Properties | https://crm-plus-production.up.railway.app/properties/ |
| Agents | https://crm-plus-production.up.railway.app/agents/ |
| Swagger Docs | https://crm-plus-production.up.railway.app/docs |

---

## Arquitetura de Produção

### Frontend (Vercel)
- Deploy automático no push para `main`
- Variáveis de ambiente configuradas no dashboard Vercel:
  - `NEXT_PUBLIC_API_BASE_URL=https://crm-plus-production.up.railway.app`

### Backend (Railway)
- Deploy automático no push para `main`
- Database: SQLite (test.db) com 381 propriedades
- CORS configurado para domínios Vercel
- Dockerfile com `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## Desenvolvimento Local

### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Web
```bash
cd frontend/web
# Criar .env.local para desenvolvimento:
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
npm run dev
```

### Mobile (Expo)
```bash
cd mobile/app
# Criar .env para desenvolvimento:
echo "EXPO_PUBLIC_API_BASE_URL=http://localhost:8000" > .env
npx expo start
```

---

## Variáveis de Ambiente

### Backend (.env - NÃO COMITAR)
```bash
REDIS_URL=redis://localhost:6379/0
MONGODB_URI=mongodb+srv://...
CRMPLUS_CORS_ORIGINS=https://imoveismais.vercel.app,http://localhost:3000
```

### Frontend Web (.env.local - NÃO COMITAR)
```bash
NEXT_PUBLIC_API_BASE_URL=https://crm-plus-production.up.railway.app
```

### Mobile (.env - NÃO COMITAR)
```bash
EXPO_PUBLIC_API_BASE_URL=https://crm-plus-production.up.railway.app
```

> ⚠️ **Nunca comitar ficheiros .env com credenciais reais!** Usar .env.example como template.

---

## Deploy e CI/CD

### Vercel (Frontend)
1. Push para `main` → deploy automático
2. Configurar env vars no dashboard: Settings → Environment Variables
3. Redeploy se necessário: `cd frontend/web && vercel --prod`

### Railway (Backend)
1. Push para `main` → build + deploy automático
2. Healthcheck: `/health` (configured in railway.toml)
3. Logs disponíveis no dashboard Railway

---

## CORS

Backend configurado para aceitar requests de:
- `https://imoveismais.vercel.app`
- `https://imoveismais.pt` (quando DNS configurado)
- `http://localhost:3000` (desenvolvimento)
- Outros domínios via `CRMPLUS_CORS_ORIGINS` env var

---

## Validação e Testes

### Testar Backend (Railway)
```bash
# Health check
curl https://crm-plus-production.up.railway.app/health

# Listar propriedades
curl https://crm-plus-production.up.railway.app/properties/ | jq

# Listar agentes
curl https://crm-plus-production.up.railway.app/agents/ | jq

# Swagger UI
open https://crm-plus-production.up.railway.app/docs
```

### Testar Frontend (Vercel)
- Visitar https://imoveismais.vercel.app
- Verificar que propriedades carregam na página de imóveis
- Verificar que agentes aparecem na página de equipa
- Clicar num agente → ver suas propriedades filtradas

---

## Troubleshooting

### Frontend não mostra dados
1. Verificar `NEXT_PUBLIC_API_BASE_URL` no Vercel
2. Testar backend diretamente: `curl https://crm-plus-production.up.railway.app/properties/`
3. Verificar CORS no backend

### Backend retorna 500
1. Ver logs no Railway dashboard
2. Verificar database: `ls -lh backend/test.db`
3. Testar localmente: `cd backend && uvicorn app.main:app`

### Imagens não carregam
1. Verificar que imagens existem em `backend/media/`
2. Railway monta volume persistente ou usa storage externo
3. URLs devem usar domínio Railway: `https://crm-plus-production.up.railway.app/media/...`

---

## TODOs

- [ ] Migrar de SQLite para PostgreSQL (Railway Postgres addon)
- [ ] Storage cloud para imagens (S3/Cloudinary) em vez de `/media` local
- [ ] Autenticação JWT para endpoints protegidos
- [ ] Configurar domínio custom `imoveismais.pt` no Vercel
- [ ] Monitoring e alertas (Sentry, Railway Metrics)
