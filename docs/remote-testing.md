# CRM PLUS – Testes remotos (web/backoffice/mobile)

---

## 🌐 URLs de Teste Ativos (2025-12-15)

### Frontend (Site Público)
**https://technique-fonts-dod-ranges.trycloudflare.com**

### Backend API
**https://voted-performer-witnesses-buck.trycloudflare.com**

> Refletido também em `frontend/web/.env.local` e `frontend/web/.env.tunnel` através de `NEXT_PUBLIC_API_BASE_URL`.

### Páginas Disponíveis

| Página | URL |
|--------|-----|
| Home | https://technique-fonts-dod-ranges.trycloudflare.com |
| Imóveis | https://technique-fonts-dod-ranges.trycloudflare.com/imoveis |
| Equipa | https://technique-fonts-dod-ranges.trycloudflare.com/agentes |
| Sobre | https://technique-fonts-dod-ranges.trycloudflare.com/sobre |
| Contactos | https://technique-fonts-dod-ranges.trycloudflare.com/contactos |

⚠️ **Nota**: URLs temporários via Cloudflare Tunnel. Mudam se reiniciados.

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
