# CRM PLUS – Site Institucional (B2B)

Landing institucional dedicada à plataforma CRM PLUS (B2B), separada da montra de agências (B2C) e do backoffice/admin.

## Objetivo
- Comunicar funcionalidades, benefícios e pricing da plataforma CRM PLUS para agências imobiliárias.
- Zero listagens de imóveis ou conteúdo B2C – apenas branding e comunicação institucional.

## Estrutura
- `app/` – Next.js App Router (landing B2B).
- `public/` – Assets do site institucional (logos/brand CRM PLUS).
- `styles/` – Estilos globais/Tailwind (opcional).

## Scripts
```bash
npm install
npm run dev
npm run build
npm run start
```

## Deploy
- Preparado para deploy independente (ex.: Vercel) apontando para `crm-plus-site/`.
- Configure `NEXT_PUBLIC_API_BASE_URL` apenas se precisar de chamadas institucionais (ex.: formulário de contacto via backend).

## Separação de contextos
- **Site institucional CRM PLUS (B2B)**: pasta `crm-plus-site/`.
- **Montra(s) B2C da agência**: permanece em `frontend/web/` (Imóveis Mais, etc.).
- **Backoffice/admin**: continua em `frontend/web/backoffice` (área protegida).
