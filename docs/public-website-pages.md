# CRM PLUS – Website Público (Next.js)

## Sitemap implementado
- `/` – Home com hero, carrossel de propriedades, timeline de automação e CTA lead.
- `/imoveis` – Lista completa com filtros de texto/status.
- `/imoveis/venda` – Filtra por venda (heurística em descrição).
- `/imoveis/arrendamento` – Filtra por arrendamento (heurística em descrição).
- `/imovel/[referencia]` – Detalhe por referência (usa título como chave).
- `/empreendimentos` e `/empreendimentos/[slug]` – Microsites de empreendimentos (placeholder).
- `/equipas` e `/equipas/[slug]` – Microsites de equipa.
- `/agentes` e `/agentes/[slug]` – Lista e detalhe de agentes (API com fallback).
- `/sobre` – Identidade e narrativa.
- `/servicos` – Serviços e CTA.
- `/contactos` – Form lead integrado em `/leads`.
- `/avaliacao-imovel`, `/quero-vender-casa`, `/quero-comprar-casa`, `/investimento-imobiliario` – Formulários de lead com source específico.
- `/blog` e `/blog/[slug]` – Placeholder para artigos.
- `/privacidade`, `/cookies`, `/termos` – Páginas legais placeholder.

## Design system
- Tema dark premium (#0B0B0D), cards #151518, bordas #2A2A2E, texto #FFF/#C5C5C5, acento #E10600.
- Padrão de grid/hex no fundo (`bg-grid` em `globals.css`).
- Tipografia Poppins via `next/font/google`.
- Componentes: `PropertyCard`, `Carousel`, `SectionHeader`, `LeadForm` (POST /leads, fallback otimista).

## Integração de dados
- Serviço em `src/services/publicApi.ts` com `getProperties`, `getPropertyByTitle`, `getAgents` e fallback mocks (`src/mocks`).
- Base URL controlada por `NEXT_PUBLIC_API_BASE_URL` (default `http://127.0.0.1:8000`).
- CORS configurado no backend para `http://localhost:3000`.

## Como levantar
```bash
cd frontend/web
npm install
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 npm run dev
# abrir http://localhost:3000
```

## Notas
- Páginas de empreendimentos/blog/agentes/equipas usam placeholders até a API pública ser exposta; mocks documentados.
- Forms de lead usam `/leads/` com fallback local em caso de erro.
- Mobile Expo aponta para `EXPO_PUBLIC_API_BASE_URL` (ajustar IP LAN).***
