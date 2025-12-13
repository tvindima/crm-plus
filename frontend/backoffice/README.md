# Backoffice CRM PLUS (admin/staff)

Projeto Next.js dedicado ao backoffice/admin do CRM PLUS. Não inclui montra B2C nem conteúdos de agência; todas as rotas são internas e protegidas.

## Scripts
```bash
npm install
npm run dev
npm run build
npm run start
```

## Público-alvo e branding
- Apenas staff/admin de agências (B2B). Nenhuma rota ou copy B2C.
- Rotas privadas `/backoffice/*` exigem autenticação (cookie/JWT).
- Manter branding institucional CRM PLUS ou white-label interno conforme necessidade, nunca misturar com montra da agência.

## Domínio / Deploy
- Deploy dedicado na Vercel (root: `frontend/backoffice`), em subdomínio interno (ex.: `app.crmplus.com` ou `admin.crmplus.com`).
- Não partilhar domínio com montra B2C (frontend/web) nem com site institucional B2B (crm-plus-site).

## Estrutura
- `app/` rotas privadas Next.js (mantém apenas `/backoffice/*`).
- `backoffice/` componentes, contextos e mocks usados pelo admin.
- `components/` componentes reutilizáveis internos.
- `public/` assets internos (logos/avatares) — sem assets de montra pública.
- `src/` mocks/serviços auxiliares.

## Partilha de libs/assets
- Não partilhar assets B2C aqui. Se usar design system comum, documentar versão e import seguro.
