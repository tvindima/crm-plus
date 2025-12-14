# CRM PLUS – Testes remotos (web/backoffice/mobile)

---

## 🌐 URLs de Teste Ativos (2025-12-14)

### Frontend (Site Público) - Vercel (Permanente)
**https://web-steel-gamma-66.vercel.app**

### Backend API - Cloudflare Tunnel (Temporário)
**https://college-partially-dogs-perceived.trycloudflare.com**

> Refletido também em `frontend/web/.env.local` e nas variáveis de ambiente do Vercel (`NEXT_PUBLIC_API_BASE_URL`).

### Páginas Disponíveis

| Página | URL |
|--------|-----|
| Home | https://web-steel-gamma-66.vercel.app |
| Imóveis | https://web-steel-gamma-66.vercel.app/imoveis |
| Imóveis Venda | https://web-steel-gamma-66.vercel.app/imoveis/venda |
| Imóveis Arrendamento | https://web-steel-gamma-66.vercel.app/imoveis/arrendamento |
| Equipa | https://web-steel-gamma-66.vercel.app/agentes |
| Contactos | https://web-steel-gamma-66.vercel.app/contactos |

⚠️ **Nota**: O URL do frontend (Vercel) é permanente. O URL do backend (Cloudflare Tunnel) é temporário e muda quando reiniciado.

---

## Como reiniciar o backend tunnel

```bash
# 1. Iniciar o backend FastAPI
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Em outro terminal, iniciar o tunnel
cloudflared tunnel --url http://localhost:8000

# 3. Copiar o novo URL (ex: https://xxx.trycloudflare.com)

# 4. Atualizar no Vercel
cd frontend/web
vercel env rm NEXT_PUBLIC_API_BASE_URL production --yes
echo "https://NOVO-URL.trycloudflare.com" | vercel env add NEXT_PUBLIC_API_BASE_URL production
vercel --prod --yes
```

---

## Variáveis de ambiente
- Backend: `CRMPLUS_CORS_ORIGINS` — lista separada por vírgulas (ex.: `https://crmplus-web.vercel.app,https://backoffice.example.com,http://localhost:3000`). Se vazio, cai para `*`.
- Frontend web (Next): `.env.local` com `NEXT_PUBLIC_API_BASE_URL=https://backend-publico`.
- Mobile (Expo): `mobile/app/.env` com `EXPO_PUBLIC_API_BASE_URL=https://backend-publico`.

## Arranque/local vs remoto
- Local backend: `uvicorn app.main:app --reload` em `backend/`.
- Web/backoffice: `cd frontend/web && NEXT_PUBLIC_API_BASE_URL=https://backend-publico npm run dev` ou definir em `.env.local`.
- Mobile: `cd mobile/app && EXPO_PUBLIC_API_BASE_URL=https://backend-publico npx expo start` (ou def. em `.env`).

## CORS
- Backend lê `CRMPLUS_CORS_ORIGINS`; ajusta para domínios do web/backoffice/mobile (Vercel, Expo, ngrok).
- Por omissão inclui localhost/127.0.0.1 e porta Expo 19006.

## Deploy (staging/prod)
- Site público/backoffice podem ser deployados em Vercel/Netlify ajustando `NEXT_PUBLIC_API_BASE_URL`.
- Backend pode ser deployado em Railway/AWS/Azure/etc.; garantir CORS e storage para `/media` (upload de imagens).
- Expo: para produção, apontar `EXPO_PUBLIC_API_BASE_URL` para HTTPS público e compilar app (APK/IPA).

## Validação remota
- Swagger em `/docs` para verificar endpoints.
- Testar uploads via `/properties/{id}/upload`.
- No backoffice, confirmar que CRUD de imóveis e uploads funcionam contra o host público.

## TODOs
- Se for usar storage cloud para imagens, substituir `/media` local por bucket (S3/Blob) e expor URLs públicas.
- Autenticação/roles server-side ainda em TODO; não bloqueia QA de endpoints públicos.
