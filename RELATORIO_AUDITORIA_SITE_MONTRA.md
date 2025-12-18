# 🔍 Relatório de Auditoria: Site Montra (Imóveis Mais)
**Data**: 18 Dezembro 2024  
**Escopo**: Validação de integração backend ↔ frontend site público  
**Status**: ✅ **RESOLVIDO** - CORS corrigido

---

## 🎯 Resumo Executivo

### Problema Identificado
🔴 **CORS bloqueando todas as requests do frontend para o backend**

```
Access to fetch at 'https://crm-plus-production.up.railway.app/properties/' 
from origin 'https://imoveismais-site-nu814y1i6-toinos-projects.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header 
is present on the requested resource.
```

**Impacto**:
- ❌ Páginas de agentes retornavam 404
- ❌ Nenhum imóvel carregava
- ❌ Homepage vazia
- ❌ Todas as pages dinâmicas quebradas

### Solução Implementada
✅ **Adicionado suporte CORS para deployments preview do Vercel**

**Commit**: `5cbd453` - "fix: adiciona suporte CORS para deployments preview do site montra"

**Alterações**:
```python
# backend/app/main.py

# ANTES:
allow_origin_regex=r"^https://(crm-plus-backoffice|backoffice|web)-[a-z0-9]+-toinos-projects\.vercel\.app$"

# DEPOIS:
allow_origin_regex=r"^https://(crm-plus-backoffice|backoffice|web|imoveismais-site|crm-plus-site)-[a-z0-9]+-toinos-projects\.vercel\.app$"
```

---

## ✅ Validação Pós-Correção

### Teste CORS
```bash
curl -I "https://crm-plus-production.up.railway.app/properties/?limit=5" \
  -H "Origin: https://imoveismais-site-nu814y1i6-toinos-projects.vercel.app"

# ✅ Resultado:
access-control-allow-credentials: true
access-control-allow-origin: https://imoveismais-site-nu814y1i6-toinos-projects.vercel.app
```

---

## 📊 Auditoria de Dados Backend

### Propriedades por Agente (Top 10)

| Rank | Agent ID | Nome Agente | Propriedades | Obs |
|------|----------|-------------|--------------|-----|
| 1 | 28 | João Paiva | 84 | ✅ Maior carteira |
| 2 | 40 | Pedro Olaio | 40 | ✅ Líder de equipa |
| 3 | — | *Sem agente* | 31 | ⚠️ Imóveis órfãos |
| 4 | 24 | António Silva | 28 | ✅ |
| 5 | 35 | Tiago Vindima | 23 | ✅ |
| 6 | 34 | João Carvalho | 22 | ✅ |
| 7 | 29 | Marisa Barosa | 20 | ✅ Tem vídeo NF1007 |
| 8 | 32 | Hugo Mota | 14 | ✅ |
| 9 | 26 | Bruno Libânio | 14 | ✅ |
| 10 | 30 | Eduardo Coelho | 12 | ✅ |

**Descobertas**:
- ✅ 305/336 propriedades têm agente atribuído (90.8%)
- ⚠️ 31 propriedades sem `agent_id` (órfãs)
- ✅ Distribuição realista (alguns agentes têm muito mais que outros)

### Propriedades com Vídeo
```json
Total: 2 propriedades
- JC1168 (agent_id=29, Marisa Barosa): https://youtu.be/fD3OlCZZHgQ
- NF1007 (agent_id=28, João Paiva): https://youtu.be/eETXUQbOpjg
```

✅ **URLs normalizadas** (Studio → Watch) pelo frontend

### Agentes com Avatares Cloudinary
```
Total: 18/18 agentes ativos
- Todos usando campo `photo` com URLs Cloudinary
- Formato: WebP 500x500, fundo transparente
- CDN: res.cloudinary.com/dtpk4oqoa
```

---

## 📋 Checklist de Validação Site Montra

### Backend API ✅

- [x] **CORS configurado** para production (`imoveismais-site.vercel.app`)
- [x] **CORS configurado** para preview deployments (`imoveismais-site-*-toinos-projects.vercel.app`)
- [x] **Endpoint `/properties/`** retorna 336 propriedades publicadas
- [x] **Endpoint `/agents/`** retorna 41 agentes
- [x] **Normalização de vídeos** YouTube Studio → Watch ativa
- [x] **Avatares Cloudinary** em `agents.photo`

### Frontend ✅

- [x] **Tipo `Agent`** inclui campo `photo`
- [x] **Prioridade de avatares**: `photo → avatar → /avatars/{name}.png`
- [x] **SafeImage** com fallback automático para placeholders
- [x] **HeroCarousel** suporta YouTube/Vimeo/MP4
- [x] **Normalização de slugs** baseada em `agent.name`
- [x] **generateStaticParams** gera páginas de ~50 agentes
- [x] **ISR** com revalidação de 1h

### Funcionalidades a Validar (Pós-CORS) ⏳

Aguardando novo deploy frontend para validar:

- [ ] **Homepage** carrega propriedades em destaque
- [ ] **Hero Carousel** mostra vídeos (se propriedades com vídeo)
- [ ] **Listagem `/agentes`** mostra todos os agentes
- [ ] **Página `/agentes/tiago-vindima`** carrega corretamente
- [ ] **Página `/agentes/joao-paiva`** mostra 84 propriedades
- [ ] **Avatares** carregam do Cloudinary
- [ ] **Propriedades órfãs** (sem agent_id) aparecem em algum lugar
- [ ] **Rails de propriedades** filtram corretamente
- [ ] **Mobile responsive** funciona

---

## 🐛 Problemas Descobertos e Resolvidos

### 1. ✅ CORS Bloqueando Frontend (RESOLVIDO)
**Sintoma**: `ERR_FAILED` em todas as requests  
**Causa**: Regex CORS não incluía `imoveismais-site`  
**Solução**: Adicionado ao `allow_origin_regex`  
**Commit**: `5cbd453`

### 2. ⚠️ 31 Propriedades Órfãs
**Sintoma**: Propriedades com `agent_id=null`  
**Causa**: Dados importados sem agente ou agentes deletados  
**Impacto**: Propriedades não aparecem em páginas de agentes  
**Solução**: Atribuir agente via backoffice ou SQL:
```sql
-- Exemplo: atribuir a João Paiva (tem maior carteira)
UPDATE properties SET agent_id = 28 WHERE agent_id IS NULL;
```

### 3. ⚠️ Apenas 2 Vídeos no Sistema
**Sintoma**: Hero carousel vazio na maioria das páginas  
**Causa**: Falta de conteúdo (apenas 2/336 propriedades têm vídeo)  
**Solução**: Educação de agentes para upload via backoffice  
**Status**: Não bloqueador (sistema funciona sem vídeos)

### 4. ✅ Placeholders Inexistentes (RESOLVIDO)
**Sintoma**: Erros 404 em console para `TV1270.jpg`, etc  
**Causa**: Nem todas as referências têm placeholder específico  
**Solução**: SafeImage faz fallback automático para renders genéricos  
**Commit**: `603af97`

---

## 📊 Estatísticas do Sistema

### Propriedades
- **Total**: 336 publicadas
- **COM imagens**: ~18 (Unsplash placeholders)
- **SEM imagens**: ~318 (usam placeholders/renders)
- **COM vídeo**: 2 (0.6%)
- **Órfãs** (sem agente): 31 (9.2%)

### Agentes
- **Total**: 41 cadastrados
- **Ativos** (com propriedades): ~18
- **COM avatar Cloudinary**: 18 (100%)
- **COM slug**: 0 (páginas geradas via nome normalizado)

### Equipas
- **Total**: 0 cadastradas
- **Configuradas no frontend**: 1 (Pedro Olaio + João Olaio + Nuno Faria)

---

## 🔧 Melhorias Recomendadas

### Curto Prazo (1-2 semanas)

1. **Atribuir Agente às 31 Propriedades Órfãs**
   ```sql
   UPDATE properties SET agent_id = 28 WHERE agent_id IS NULL;
   ```

2. **Adicionar Mais Vídeos**
   - Meta: Pelo menos 1 vídeo por agente ativo
   - Educar agentes sobre formato de URL correto (Watch, não Studio)

3. **Popular Campo `slug` nos Agentes**
   ```sql
   UPDATE agents 
   SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
   WHERE slug IS NULL;
   ```
   **Benefício**: SEO melhorado, URLs mais consistentes

4. **Validar Páginas Individuais**
   - Testar `/agentes/tiago-vindima`, `/agentes/joao-paiva`, etc
   - Verificar contagem de propriedades
   - Confirmar avatares Cloudinary carregando

### Médio Prazo (1 mês)

5. **Migrar Imagens para Cloudinary**
   - ~318 propriedades precisam de imagens reais
   - Substituir placeholders Unsplash por fotos reais

6. **Criar Equipas no Backend**
   - Atualmente hardcoded no frontend
   - Migrar para tabela `teams` e associar agentes

7. **Monitoramento de CORS**
   - Alertas se requests forem bloqueadas
   - Log de origins não permitidas

8. **Cache Strategy**
   - Implementar Redis para cache de `/properties/` e `/agents/`
   - Reduzir load no banco de dados

---

## 🎯 Próximos Passos

### Imediato (Hoje)
1. ✅ Deploy backend com CORS corrigido (feito)
2. ⏳ Aguardar Vercel redeploy frontend
3. ⏳ Testar páginas de agentes funcionando
4. ⏳ Validar hero carousel com vídeos

### Esta Semana
1. Atribuir agente às 31 propriedades órfãs
2. Popular campo `slug` nos agentes
3. Adicionar vídeos para mais 5 propriedades

### Este Mês
1. Migrar 100 propriedades para Cloudinary
2. Criar sistema de equipas no backend
3. Implementar analytics para tracking

---

## 📞 Suporte Técnico

**Backend API**: https://crm-plus-production.up.railway.app/docs  
**Frontend Preview**: https://imoveismais-site.vercel.app  
**GitHub**: https://github.com/tvindima/crm-plus  

**CORS Configurado para**:
- ✅ `https://imoveismais-site.vercel.app` (production)
- ✅ `https://imoveismais-site-*-toinos-projects.vercel.app` (preview)
- ✅ `https://crm-plus-site.vercel.app` (alternativo)
- ✅ `https://crm-plus-backoffice.vercel.app` (backoffice)

---

## 📝 Notas de Implementação

### Arquitetura de Dados

**Fluxo de Propriedades**:
```
Database (PostgreSQL Railway)
    ↓
Backend FastAPI (/properties/?is_published=1)
    ↓ (CORS permitido)
Frontend Next.js (getProperties())
    ↓
Componentes React (HeroCarousel, PropertyCard, etc)
```

**Prioridade de Imagens**:
```
1. property.images[0] (backend real - Unsplash temporário)
2. /placeholders/{REF}.jpg (específico - 364 refs)
3. /renders/{HASH}.jpg (genérico - 42 renders)
```

**Prioridade de Avatares**:
```
1. agent.photo (Cloudinary - 18 agentes)
2. agent.avatar (deprecated - 0 agentes)
3. /avatars/{slug}.png (fallback estático - staff)
```

### Configuração CORS Completa

```python
# backend/app/main.py

DEFAULT_ALLOWED_ORIGINS = [
    "https://crm-plus-site.vercel.app",
    "https://imoveismais-site.vercel.app",
    "https://imoveismais.pt",
    "https://crm-plus-backoffice.vercel.app",
    "http://localhost:3000",
    # ... outros
]

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https://(crm-plus-backoffice|backoffice|web|imoveismais-site|crm-plus-site)-[a-z0-9]+-toinos-projects\.vercel\.app$",
    allow_origins=DEFAULT_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

**Status**: ✅ **AUDITORIA CONCLUÍDA**  
**Próxima Revisão**: Após deploy frontend  
**Responsável**: Dev Team  
**Prioridade**: 🔴 ALTA - Sistema bloqueado sem CORS

**Última atualização**: 18 Dezembro 2024, 01:45 UTC
