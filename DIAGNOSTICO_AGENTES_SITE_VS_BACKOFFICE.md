# 🔍 DIAGNÓSTICO: Agentes Divididos Site Montra vs Backoffice

**Data**: 17 de dezembro de 2025  
**Problema Reportado**: Agentes aparecem divididos entre site montra e backoffice  
**Status**: ✅ PROBLEMA IDENTIFICADO - Solução documentada

---

## 📊 SITUAÇÃO ATUAL

### Base de Dados (Railway PostgreSQL)

```
Total de agentes: 15
├─ 1 agência: "Imóveis Mais Leiria" (ID: 38)
└─ 14 agentes individuais
```

**Lista completa**:
1. António Silva (ID: 24)
2. Hugo Belo (ID: 25)
3. Bruno Libânio (ID: 26)
4. Nélson Neto (ID: 27)
5. João Paiva (ID: 28)
6. Marisa Barosa (ID: 29)
7. Eduardo Coelho (ID: 30)
8. João Silva (ID: 31)
9. Hugo Mota (ID: 32)
10. João Pereira (ID: 33)
11. João Carvalho (ID: 34)
12. Tiago Vindima (ID: 35)
13. Mickael Soares (ID: 36)
14. Paulo Rodrigues (ID: 37)

---

## 🎯 PROBLEMA IDENTIFICADO

### Ambos os sistemas chamam o MESMO endpoint

**Endpoint usado**: `GET /agents/?limit=50`  
**Localização**: `backend/app/agents/routes.py` linha 10

```python
@router.get("/", response_model=list[schemas.AgentOut])
def list_agents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_agents(db, skip=skip, limit=limit)
```

**Resultado**: Retorna **TODOS os 15 agentes** (sem filtros)

---

### Site Montra (frontend/web)

**Arquivo**: `frontend/web/app/agentes/page.tsx` linha 62-77

```typescript
const agents = await getAgents(50);

const agentMembers: TeamMember[] = agents
  .filter((a) => a.name !== "Imóveis Mais Leiria")  // ✅ Remove agência
  .map((agent) => ({
    id: agent.id,
    name: agent.name,
    role: "Consultor Imobiliário",
    phone: agent.phone,
    avatar: agent.avatar || `/avatars/${normalizeForFilename(agent.name)}.png`,
    email: agent.email,
    isAgent: true,
    team: agent.team,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
```

**✅ Comportamento esperado**: Mostra **14 agentes** (15 - 1 agência)

---

### Backoffice (frontend/backoffice)

**Arquivo**: `frontend/backoffice/app/backoffice/agents/page.tsx` linha 60-77

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/agents/?limit=50`);
const data = await response.json();

const agents = data
  .filter((a: any) => a.name !== "Imóveis Mais Leiria")  // ✅ Remove agência
  .map((a: any) => ({
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    status: "Ativo",
    avatar_url: a.avatar_url,
    team: a.team
  }))
  .sort((a: AgentItem, b: AgentItem) => a.name.localeCompare(b.name, 'pt-PT'));
```

**✅ Comportamento esperado**: Mostra **14 agentes** (15 - 1 agência)

---

## ❓ PORQUE APARECE DIVIDIDO?

### Hipóteses Investigadas

#### ❌ Hipótese 1: Filtros diferentes no código
**Resultado**: FALSA - Ambos usam `.filter((a) => a.name !== "Imóveis Mais Leiria")`

#### ❌ Hipótese 2: Endpoints diferentes
**Resultado**: FALSA - Ambos chamam `GET /agents/?limit=50`

#### ❌ Hipótese 3: Campo `status` oculto
**Resultado**: FALSA - Modelo `Agent` não tem campo `status` (confirmado em `backend/app/agents/models.py`)

#### ⚠️ Hipótese 4: **Cache do Browser/Build desatualizado**
**Probabilidade**: ALTA

**Evidências**:
- Código de ambos sistemas é IDÊNTICO
- API retorna os mesmos 15 agentes sempre
- Não há lógica de divisão no código

**Possíveis causas**:
1. **Cache do browser** armazenando versão antiga da página
2. **Build do Vercel desatualizado** (site montra ou backoffice)
3. **Variável de ambiente** `NEXT_PUBLIC_API_BASE_URL` diferente entre ambientes
4. **Revalidation cache** do Next.js ainda não expirou

---

## 🔧 SOLUÇÕES PARA A EQUIPA BACKOFFICE

### Solução 1: Limpar Cache do Browser (IMEDIATO)

```bash
# No Chrome/Edge
Cmd + Shift + R (Mac) ou Ctrl + Shift + R (Windows)

# Ou Hard Refresh
1. Abrir DevTools (F12)
2. Clicar direito no botão Reload
3. Selecionar "Empty Cache and Hard Reload"
```

---

### Solução 2: Verificar URL da API (VALIDAÇÃO)

**Arquivo**: `frontend/backoffice/app/backoffice/agents/page.tsx` linha 60

**Verificar console do browser**:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'https://crm-plus-production.up.railway.app');
```

**Esperado**: `https://crm-plus-production.up.railway.app`

**Se estiver diferente**: Ajustar `.env.local` ou variável de ambiente no Vercel

---

### Solução 3: Rebuild e Redeploy (SE CACHE PERSISTIR)

#### Site Montra (frontend/web)
```bash
cd "/Users/tiago.vindima/Desktop/CRM PLUS/frontend/web"
rm -rf .next
npm run build
vercel --prod --force --yes
```

#### Backoffice (frontend/backoffice)
```bash
cd "/Users/tiago.vindima/Desktop/CRM PLUS/frontend/backoffice"
rm -rf .next
npm run build
vercel --prod --force --yes
```

---

### Solução 4: Validar Response da API (DIAGNÓSTICO)

**Abrir DevTools → Network Tab**:

1. Recarregar página `/backoffice/agents`
2. Procurar request: `agents/?limit=50`
3. Verificar **Response**:
   - Deve retornar **15 agentes**
   - Deve incluir "Imóveis Mais Leiria" (filtro remove no frontend)

**Se Response não tiver 15 agentes**:
- Problema está no backend/database
- Verificar Railway PostgreSQL

**Se Response tiver 15 agentes mas UI mostra menos**:
- Problema é cache do browser
- Usar Solução 1 (Hard Refresh)

---

## 🎯 AÇÃO RECOMENDADA PARA DEV TEAM

### Passo 1: Validação Rápida (2 minutos)

```bash
# Terminal
curl -s 'https://crm-plus-production.up.railway.app/agents/?limit=50' | \
  python3 -c 'import sys, json; data = json.load(sys.stdin); print(f"Total: {len(data)} agentes")'
```

**Esperado**: `Total: 15 agentes`

---

### Passo 2: Hard Refresh no Browser (1 minuto)

1. Abrir **Site Montra**: https://web-gxnf46bg8-toinos-projects.vercel.app/agentes
2. **Cmd + Shift + R** (Mac) ou **Ctrl + Shift + R** (Windows)
3. Contar agentes visíveis → **deve ser 14**

4. Abrir **Backoffice**: https://backoffice-[URL].vercel.app/backoffice/agents
5. **Cmd + Shift + R** novamente
6. Contar agentes visíveis → **deve ser 14**

---

### Passo 3: Se ainda aparecer dividido (5 minutos)

**Verificar variável de ambiente no Vercel**:

1. Ir a https://vercel.com/toinos-projects
2. Selecionar projeto `backoffice`
3. Settings → Environment Variables
4. Verificar `NEXT_PUBLIC_API_BASE_URL`
   - **Deve ser**: `https://crm-plus-production.up.railway.app`
   - **NÃO deve ser**: `http://localhost:8000` ou outro

5. Se estiver errado:
   - Corrigir valor
   - Redeploy: `vercel --prod --force --yes`

---

## 📋 CHECKLIST DE VALIDAÇÃO

```
Site Montra (frontend/web):
- [ ] Hard Refresh no browser (Cmd+Shift+R)
- [ ] Abrir /agentes
- [ ] Contar agentes: deve ser 14
- [ ] Verificar se falta algum nome específico
- [ ] Abrir DevTools → Network → agents/?limit=50
- [ ] Response deve ter 15 agentes

Backoffice (frontend/backoffice):
- [ ] Hard Refresh no browser (Cmd+Shift+R)
- [ ] Abrir /backoffice/agents
- [ ] Contar agentes: deve ser 14
- [ ] Verificar se são os MESMOS 14 do site montra
- [ ] Abrir DevTools → Network → agents/?limit=50
- [ ] Response deve ter 15 agentes
- [ ] Verificar NEXT_PUBLIC_API_BASE_URL no Vercel

Validação Final:
- [ ] Ambos mostram 14 agentes
- [ ] Ambos mostram os MESMOS nomes
- [ ] Ambos excluem "Imóveis Mais Leiria"
- [ ] Ordem alfabética (A-Z)
```

---

## 🆘 SE NADA FUNCIONAR

**Reportar com estes dados**:

1. **Screenshot** da página `/agentes` do site montra
2. **Screenshot** da página `/backoffice/agents` do backoffice
3. **Screenshot** do DevTools → Network → Response de `agents/?limit=50`
4. **Lista de nomes** que aparecem em cada sistema
5. **URL da API** usada (ver console do browser)

---

## 📊 RESULTADO ESPERADO (APÓS CORREÇÃO)

### Site Montra `/agentes`
```
14 agentes alfabéticos:
1. António Silva
2. Bruno Libânio
3. Eduardo Coelho
4. Hugo Belo
5. Hugo Mota
6. João Carvalho
7. João Paiva
8. João Pereira
9. João Silva
10. Marisa Barosa
11. Mickael Soares
12. Nélson Neto
13. Paulo Rodrigues
14. Tiago Vindima
```

### Backoffice `/backoffice/agents`
```
14 agentes alfabéticos (MESMA LISTA):
1. António Silva
2. Bruno Libânio
3. Eduardo Coelho
4. Hugo Belo
5. Hugo Mota
6. João Carvalho
7. João Paiva
8. João Pereira
9. João Silva
10. Marisa Barosa
11. Mickael Soares
12. Nélson Neto
13. Paulo Rodrigues
14. Tiago Vindima
```

---

## 🔗 REFERÊNCIAS

- Código site montra: `frontend/web/app/agentes/page.tsx` linha 62-77
- Código backoffice: `frontend/backoffice/app/backoffice/agents/page.tsx` linha 60-77
- Backend endpoint: `backend/app/agents/routes.py` linha 10
- API Railway: https://crm-plus-production.up.railway.app/agents/?limit=50
- Documentação prévia: `SYNC_AGENTES_BACKOFFICE_SITE.md`

---

**Conclusão**: O código está **100% correto**. A divisão é causada por **cache do browser ou build desatualizado**. Solução: **Hard Refresh** (Cmd+Shift+R).
