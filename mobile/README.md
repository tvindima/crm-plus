
# CRM PLUS Mobile

React Native (Expo) client to manage leads, visitas e notificações em campo.

## Getting started

```bash
cd mobile/app
npm install
npx expo start
```

### Endpoints remotos
- Cria `mobile/app/.env` (exemplo em `.env.example`) com `EXPO_PUBLIC_API_BASE_URL=https://teu-backend-publico`.
- Para testes em dispositivo real/simulador, certifica-te de que o backend está acessível via HTTPS ou IP da LAN e que o CORS do backend permite esse domínio (variável `CRMPLUS_CORS_ORIGINS`).
