# Estado Atual da Integração Backend ↔ Frontend Web

## 🔴 PROBLEMA IDENTIFICADO

O site público **NÃO atualiza automaticamente** quando adiciona/edita propriedades no backoffice.

## 📊 Situação Atual

### Backend API (Railway)
- ✅ Status: Online (https://crm-plus-production.up.railway.app)
- ✅ Health check: OK
- ❌ Endpoint `/properties/`: **Erro 500 (Internal Server Error)**
- 🔧 Base de dados PostgreSQL configurada

### Frontend Web (Vercel)
- ✅ Status: Online (https://imoveismais-site.vercel.app)
- ❌ Usa **MOCKS ESTÁTICOS** (385 propriedades fixas)
- ⚠️ Tenta chamar backend mas falha → cai para mocks
- 📅 Revalidação: Homepage = 0s (sempre fresh), Agentes = 3600s (1 hora)

### Sistema de Dados
```
┌─────────────┐     ❌ Erro 500     ┌──────────────┐
│  Backoffice │ ───────────────────▶│  Backend API │
│  (Next.js)  │                     │  (FastAPI)   │
└─────────────┘                     └──────────────┘
                                           │
                                           │ ❌ Falha
                                           ▼
                                    ┌──────────────┐
                                    │ Frontend Web │
                                    │              │
                                    │ ⚠️ Fallback  │
                                    │ MOCKS (385)  │
                                    └──────────────┘
```

## 🔍 Diagnóstico Detalhado

### 1. Backend API - Erro 500
O endpoint `/properties/` retorna erro interno. Possíveis causas:
- Schema incompatível (SQLAlchemy vs Pydantic)
- Falta de migração de base de dados
- Erro na query SQL
- Missing fields na tabela properties

### 2. Frontend Web - Dados Estáticos
```typescript
// frontend/web/src/services/publicApi.ts
export async function getProperties(limit = 500): Promise<Property[]> {
  try {
    const data = await fetchJson(`/properties/?skip=${skip}&limit=${pageSize}`);
    // ... tenta backend
  } catch (error) {
    console.error("[API] Backend failed, using base mocks:", error);
    return mockProperties; // ❌ Retorna 385 propriedades FIXAS
  }
}
```

### 3. Processo de Atualização Atual (MANUAL)
1. Adiciona propriedade no backoffice → salva no PostgreSQL
2. **MANUAL**: Exporta CSV do backoffice
3. **MANUAL**: Copia CSV para `/backend/scripts/propriedades.csv`
4. **MANUAL**: Roda script `node scripts/import-csv-properties.js`
5. **MANUAL**: Commit + push para GitHub
6. **MANUAL**: Deploy no Vercel
7. ⏰ Tempo total: **10-30 minutos**

## ✅ SOLUÇÃO NECESSÁRIA

### Opção 1: Corrigir Backend API (RECOMENDADO)
```bash
# 1. Verificar logs do Railway
railway logs --tail 100

# 2. Corrigir endpoint /properties/
# - Verificar schema PropertyOut
# - Testar query localmente
# - Fazer migration se necessário

# 3. Remover fallback de mocks no frontend
# - Manter apenas para desenvolvimento local
```

### Opção 2: Webhook de Atualização
```
Backoffice → Cria/Edita Property
     ↓
Trigger webhook POST /api/revalidate
     ↓
Vercel ISR revalidation
     ↓
Nova build com dados atualizados
```

### Opção 3: On-Demand Revalidation
```typescript
// frontend/web/app/api/revalidate/route.ts
export async function POST(request: Request) {
  const { path } = await request.json();
  revalidatePath(path);
  return Response.json({ revalidated: true });
}
```

## 📝 PRÓXIMOS PASSOS

### Prioridade ALTA
1. ✅ Verificar logs do Railway para erro 500
2. ✅ Corrigir endpoint `/properties/` no backend
3. ✅ Testar endpoint funcional: `curl https://crm-plus-production.up.railway.app/properties/?limit=5`
4. ✅ Atualizar frontend para usar backend real
5. ✅ Configurar ISR com revalidate correto

### Prioridade MÉDIA  
6. Adicionar webhook no backoffice para revalidação automática
7. Implementar cache strategy (SWR ou React Query)
8. Monitoramento de erros (Sentry)

### Prioridade BAIXA
9. Remover mocks do production build
10. Otimizar queries com pagination
11. Add GraphQL ou tRPC para type-safety

## 🎯 OBJETIVO FINAL

```
┌─────────────┐                     ┌──────────────┐
│  Backoffice │ ─────────────────▶  │  PostgreSQL  │
│             │   Cria/Edita         │              │
└─────────────┘                     └──────────────┘
                                           │
                                           │ ✅ Query OK
                                           ▼
                                    ┌──────────────┐
                                    │  Backend API │
                                    │  /properties │
                                    └──────────────┘
                                           │
                                           │ ✅ JSON
                                           ▼
                                    ┌──────────────┐
                                    │ Frontend Web │
                                    │ ISR: 60s     │
                                    │ Auto-refresh │
                                    └──────────────┘
```

**Resultado:** Propriedade adicionada no backoffice → visível no site em **máximo 60 segundos** (ISR revalidation).

---
*Data: 15/12/2025*
*Status: 🔴 Backend API com erro 500 - Site usa mocks estáticos*
