# 🔧 Relatório: Correção de Atribuição de Propriedades por Agente
**Data**: 18 Dezembro 2024  
**Destinatário**: Dev Team Backoffice  
**Prioridade**: 🔴 **ALTA** - Dados incorretos no sistema  
**Status**: ⚠️ **AÇÃO NECESSÁRIA**

---

## 🎯 Resumo Executivo

### Problema Identificado
🔴 **Propriedades atribuídas a agentes incorretos**

O sistema possui uma convenção de nomenclatura onde **cada agente deve ter APENAS propriedades cujas referências começam com suas iniciais**:

- **Paulo Rodrigues** → `PRxxxx`
- **Tiago Vindima** → `TVxxxx`
- **Pedro Olaio** → `POxxxx`
- **Nuno Faria** → `NFxxxx`
- etc.

**Problema atual**: Propriedades `PR*` estão atribuídas a João Paiva, Pedro Olaio, etc. ao invés de Paulo Rodrigues.

### Exemplo Concreto
```
Paulo Rodrigues (ID 37) deveria ter 20 propriedades PR*, mas tem apenas 1:
- PR1318 ✅ (correto)
- PR1310 ❌ (atribuído a António Silva - ID 24)
- PR1334 ❌ (atribuído a João Paiva - ID 28)
- PR1336 ❌ (atribuído a Fábio Passos - ID 42)
- ... (mais 16 incorretas)
```

---

## 📊 Mapeamento: Iniciais → Agente

### Agentes Cadastrados

| ID | Nome | Email | Iniciais | Referências |
|----|------|-------|----------|-------------|
| 24 | António Silva | asilva@imoveismais.pt | **AS** | ASxxxx |
| 25 | Hugo Belo | hbelo@imoveismais.pt | **HB** | HBxxxx |
| 26 | Bruno Libânio | blibanio@imoveismais.pt | **BL** | BLxxxx |
| 27 | Nélson Neto | nneto@imoveismais.pt | **NN** | NNxxxx |
| 28 | João Paiva | jpaiva@imoveismais.pt | **JP** | JPxxxx |
| 29 | Marisa Barosa | arrendamentosleiria@imoveismais.pt | **MB** | MBxxxx |
| 30 | Eduardo Coelho | ecoelho@imoveismais.pt | **EC** | ECxxxx |
| 31 | João Silva | jsilva@imoveismais.pt | **JS** | JSxxxx |
| 32 | Hugo Mota | hmota@imoveismais.pt | **HM** | HMxxxx |
| 33 | João Pereira | jpereira@imoveismais.pt | **(JP?)** | JPxxxx |
| 34 | João Carvalho | jcarvalho@imoveismais.pt | **JC** | JCxxxx |
| 35 | Tiago Vindima | tvindima@imoveismais.pt | **TV** | TVxxxx |
| 36 | Mickael Soares | msoares@imoveismais.pt | **MS** | MSxxxx |
| 37 | Paulo Rodrigues | prodrigues@imoveismais.pt | **PR** | PRxxxx |
| 38 | Imóveis Mais Leiria | leiria@imoveismais.pt | **IL** | ILxxxx |
| 39 | Nuno Faria | nfaria@imoveismais.pt | **NF** | NFxxxx |
| 40 | Pedro Olaio | polaio@imoveismais.pt | **PO** | POxxxx |
| 41 | João Olaio | jolaio@imoveismais.pt | **JO** | JOxxxx |
| 42 | Fábio Passos | fpassos@imoveismais.pt | **FP** | FPxxxx |

---

## 🔍 Análise de Atribuições Incorretas

### Prefixos com Múltiplos Agentes (ERRO!)

| Prefixo | Total Props | Agentes Atribuídos | Status |
|---------|-------------|-------------------|---------|
| **AS** | 5 | [24, 28, 30, 34] | ❌ 4 agentes diferentes! |
| **BL** | 12 | [24, 26, 27] | ❌ 3 agentes |
| **CB** | 3 | [null, 29] | ⚠️ Sem agente correspondente |
| **EC** | 8 | [28, 30, 34] | ❌ 3 agentes |
| **FA** | 2 | [30] | ⚠️ Sem agente correspondente |
| **FP** | 48 | [null, 24, 28, 29] | ❌ 4 agentes! |
| **HA** | 7 | [null, 28, 29, 34] | ⚠️ Sem agente correspondente |
| **HB** | 3 | [25] | ✅ Correto (Hugo Belo) |
| **HM** | 57 | [25, 28, 32, 33, 34, 40, 42] | ❌ **7 agentes diferentes!** |
| **IL** | 2 | [38] | ✅ Correto (Imóveis Mais Leiria) |
| **JC** | 52 | [26, 28, 29, 30, 34, 40] | ❌ 6 agentes! |
| **JO** | 2 | [40, 42] | ⚠️ João Olaio (41) não tem nenhum! |
| **JP** | 1 | [28] | ⚠️ Conflito: JP28 (João Paiva) vs JP33 (João Pereira) |
| **JR** | 2 | [null, 40] | ⚠️ Sem agente correspondente |
| **JS** | 19 | [30, 31, 35, 39, 40] | ❌ 5 agentes |
| **MB** | 18 | [29, 34, 39] | ⚠️ Marisa correto mas 2 outros |
| **MS** | 23 | [28, 29, 33, 36, 42] | ❌ 5 agentes |
| **NF** | 3 | [25, 28, 39] | ⚠️ Nuno Faria tem apenas 1 de 3! |
| **NN** | 15 | [24, 25, 27, 33, 34, 39, 40, 41] | ❌ **8 agentes diferentes!** |
| **PO** | 10 | [null, 35, 39] | ❌ Pedro Olaio (40) não tem! |
| **PR** | 20 | [24, 28, 34, 37, 40, 42] | ❌ **6 agentes!** Paulo só tem 1 |
| **RC** | 2 | [null] | ⚠️ Sem agente correspondente |
| **SC** | 1 | [null] | ⚠️ Sem agente correspondente |
| **TV** | 21 | [24, 35, 39, 40, 42] | ❌ 5 agentes |

---

## 🚨 Casos Críticos

### 1. **Hugo Mota (HM)** - 57 propriedades dispersas por 7 agentes
```
HM* deveria estar 100% em Hugo Mota (ID 32)
Atualmente: [25, 28, 32, 33, 34, 40, 42]
Apenas ~8 estão corretas (14%)
```

### 2. **João Carvalho (JC)** - 52 propriedades dispersas por 6 agentes
```
JC* deveria estar 100% em João Carvalho (ID 34)
Atualmente: [26, 28, 29, 30, 34, 40]
```

### 3. **Fábio Passos (FP)** - 48 propriedades dispersas
```
FP* deveria estar 100% em Fábio Passos (ID 42)
Atualmente: [null, 24, 28, 29]
Nenhuma está correta!
```

### 4. **Nélson Neto (NN)** - 15 propriedades dispersas por 8 agentes
```
NN* deveria estar 100% em Nélson Neto (ID 27)
Atualmente: [24, 25, 27, 33, 34, 39, 40, 41]
```

---

## 📋 Prefixos SEM Agente Correspondente

Estas propriedades precisam de atribuição manual:

| Prefixo | Quantidade | Exemplos | Sugestão |
|---------|-----------|----------|----------|
| **CB** | 3 | CB1xxx | ⚠️ **Aguardando definição** |
| **FA** | 2 | FA1xxx | ⚠️ **Aguardando definição** |
| **HA** | 7 | HA1xxx | ⚠️ **Aguardando definição** |
| **JR** | 2 | JR1xxx | ⚠️ **Aguardando definição** |
| **RC** | 2 | RC1xxx | ⚠️ **Aguardando definição** |
| **SC** | 1 | SC1xxx | ⚠️ **Aguardando definição** |

**Nota**: João Pereira e João Paiva têm conflito de iniciais (ambos JP). Necessária decisão sobre qual usa JP.

---

## 🔧 Script SQL de Correção

### Passo 1: Backup da Database
```bash
# Executar ANTES de qualquer correção!
pg_dump $DATABASE_URL > backup_before_agent_fix_$(date +%Y%m%d).sql
```

### Passo 2: Script de Correção Automática

```sql
-- ==========================================
-- SCRIPT DE CORREÇÃO DE ATRIBUIÇÃO DE PROPRIEDADES
-- Data: 18/12/2024
-- Ação: Atribuir propriedades aos agentes corretos baseado em prefixo de referência
-- ==========================================

BEGIN;

-- António Silva (AS)
UPDATE properties SET agent_id = 24 WHERE reference LIKE 'AS%';

-- Hugo Belo (HB)
UPDATE properties SET agent_id = 25 WHERE reference LIKE 'HB%';

-- Bruno Libânio (BL)
UPDATE properties SET agent_id = 26 WHERE reference LIKE 'BL%';

-- Nélson Neto (NN)
UPDATE properties SET agent_id = 27 WHERE reference LIKE 'NN%';

-- João Paiva (JP) - Conflito com João Pereira!
-- DECISÃO NECESSÁRIA: Usar JP para qual João?
-- UPDATE properties SET agent_id = 28 WHERE reference LIKE 'JP%';

-- Marisa Barosa (MB)
UPDATE properties SET agent_id = 29 WHERE reference LIKE 'MB%';

-- Eduardo Coelho (EC)
UPDATE properties SET agent_id = 30 WHERE reference LIKE 'EC%';

-- João Silva (JS)
UPDATE properties SET agent_id = 31 WHERE reference LIKE 'JS%';

-- Hugo Mota (HM)
UPDATE properties SET agent_id = 32 WHERE reference LIKE 'HM%';

-- João Pereira (JP?) - Ver conflito acima
-- Talvez usar JPe ou outro prefixo?

-- João Carvalho (JC)
UPDATE properties SET agent_id = 34 WHERE reference LIKE 'JC%';

-- Tiago Vindima (TV)
UPDATE properties SET agent_id = 35 WHERE reference LIKE 'TV%';

-- Mickael Soares (MS)
UPDATE properties SET agent_id = 36 WHERE reference LIKE 'MS%';

-- Paulo Rodrigues (PR)
UPDATE properties SET agent_id = 37 WHERE reference LIKE 'PR%';

-- Imóveis Mais Leiria (IL)
UPDATE properties SET agent_id = 38 WHERE reference LIKE 'IL%';

-- Nuno Faria (NF)
UPDATE properties SET agent_id = 39 WHERE reference LIKE 'NF%';

-- Pedro Olaio (PO)
UPDATE properties SET agent_id = 40 WHERE reference LIKE 'PO%';

-- João Olaio (JO)
UPDATE properties SET agent_id = 41 WHERE reference LIKE 'JO%';

-- Fábio Passos (FP)
UPDATE properties SET agent_id = 42 WHERE reference LIKE 'FP%';

-- ==========================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- ==========================================

-- Contar propriedades por agente após correção
SELECT 
    a.id,
    a.name,
    COUNT(p.id) as total_properties,
    SUBSTRING(MIN(p.reference), 1, 2) as prefix
FROM agents a
LEFT JOIN properties p ON p.agent_id = a.id
GROUP BY a.id, a.name
ORDER BY a.name;

-- Verificar se ainda há propriedades com prefixos misturados
SELECT 
    SUBSTRING(p.reference, 1, 2) as prefix,
    COUNT(*) as count,
    COUNT(DISTINCT p.agent_id) as num_agents,
    ARRAY_AGG(DISTINCT p.agent_id ORDER BY p.agent_id) as agent_ids
FROM properties p
WHERE p.agent_id IS NOT NULL
GROUP BY SUBSTRING(p.reference, 1, 2)
HAVING COUNT(DISTINCT p.agent_id) > 1
ORDER BY prefix;

COMMIT;
-- Para cancelar: ROLLBACK;
```

---

## 📝 Decisões Necessárias (Dev Team)

### 1. **Conflito de Iniciais: João Paiva vs João Pereira**

Ambos têm iniciais `JP`. Decisão necessária:

**Opção A**: João Paiva fica com JP, João Pereira usa JPe
- `UPDATE properties SET agent_id = 28 WHERE reference LIKE 'JP%';`
- Renomear referências de João Pereira para JPexxxx

**Opção B**: João Pereira fica com JP, João Paiva usa JPa
- `UPDATE properties SET agent_id = 33 WHERE reference LIKE 'JP%';`
- Renomear referências de João Paiva para JPaxxxx

**Opção C**: Ambos usam nome completo
- João Paiva: JPAxxxx
- João Pereira: JPExxxx

### 2. **Propriedades Órfãs (sem agente correspondente)**

| Prefixo | Qty | Ação Recomendada |
|---------|-----|------------------|
| CB | 3 | Atribuir a agente existente ou criar novo? |
| FA | 2 | Atribuir a agente existente ou criar novo? |
| HA | 7 | Atribuir a agente existente ou criar novo? |
| JR | 2 | Atribuir a agente existente ou criar novo? |
| RC | 2 | Atribuir a agente existente ou criar novo? |
| SC | 1 | Atribuir a agente existente ou criar novo? |

**Total órfãs**: 17 propriedades

### 3. **JO (João Olaio) - 2 propriedades atribuídas a outros**
```sql
-- Corrigir:
UPDATE properties SET agent_id = 41 WHERE reference LIKE 'JO%';
-- Atualmente JO* está em: [40-Pedro Olaio, 42-Fábio Passos]
```

---

## 🎯 Impacto da Correção

### Antes da Correção
```
✅ 2 agentes com atribuição correta (HB, IL)
❌ 17 agentes com propriedades misturadas
⚠️ 17 propriedades órfãs
```

### Após Correção
```
✅ 19 agentes com propriedades corretas
⚠️ 17 propriedades órfãs (aguardam decisão manual)
🔍 1 conflito de iniciais (JP) para resolver
```

### Estatísticas Esperadas

| Agente | Antes | Depois | Mudança |
|--------|-------|--------|---------|
| Paulo Rodrigues (PR) | 1 | 20 | +19 ✅ |
| Fábio Passos (FP) | 0 | 48 | +48 ✅ |
| Hugo Mota (HM) | ~8 | 57 | +49 ✅ |
| João Carvalho (JC) | ~17 | 52 | +35 ✅ |
| Tiago Vindima (TV) | ~8 | 21 | +13 ✅ |
| ... | ... | ... | ... |

---

## 📦 Execução Passo a Passo

### 1. **Backup** (OBRIGATÓRIO)
```bash
# Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Ou via conexão direta
pg_dump "postgresql://user:pass@host:port/db" > backup.sql
```

### 2. **Resolver Decisões**
- [ ] Decidir: João Paiva vs João Pereira (JP)
- [ ] Atribuir propriedades órfãs (CB, FA, HA, JR, RC, SC)

### 3. **Executar Script SQL**
```bash
# Via Railway CLI
railway run psql $DATABASE_URL < fix_agents.sql

# Ou copiar/colar no Railway Dashboard → Query
```

### 4. **Validação**
```sql
-- Verificar distribuição final
SELECT 
    SUBSTRING(p.reference, 1, 2) as prefix,
    COUNT(*) as total,
    COUNT(DISTINCT p.agent_id) as agents,
    MIN(a.name) as agent_name
FROM properties p
LEFT JOIN agents a ON a.id = p.agent_id
GROUP BY SUBSTRING(p.reference, 1, 2)
ORDER BY prefix;

-- Deve retornar: agents=1 para cada prefixo (exceto órfãs)
```

### 5. **Testar Frontend**
- [ ] Verificar `/agentes/paulo-rodrigues` mostra 20 propriedades PR*
- [ ] Verificar `/agentes/hugo-mota` mostra 57 propriedades HM*
- [ ] Confirmar que propriedades aparecem apenas na página do agente correto

---

## 🐛 Troubleshooting

### Erro: "Duplicate key violates constraint"
```
Causa: Propriedade já está atribuída corretamente
Solução: Normal, script é idempotente
```

### Propriedades ainda aparecem no agente errado
```
Causa: Cache do frontend
Solução: Force refresh (Ctrl+Shift+R) ou aguardar revalidação (1h)
```

### Contagem não bate
```
Causa: is_published=false ou propriedades deletadas
Solução: Verificar query com:
SELECT COUNT(*) FROM properties WHERE reference LIKE 'PR%' AND is_published = true;
```

---

## 📞 Suporte

**Backend API**: https://crm-plus-production.up.railway.app/docs  
**Railway Dashboard**: https://railway.app  
**GitHub Issues**: https://github.com/tvindima/crm-plus/issues  

**Contato Dev Team**:
- Backend: verificar logs Railway após execução
- Frontend: ISR revalidation em 1h (ou force deploy)

---

## ✅ Checklist de Execução

- [ ] **Backup completo** da database executado
- [ ] **Decisão tomada**: João Paiva vs João Pereira (JP)
- [ ] **Atribuição manual** de propriedades órfãs (CB, FA, HA, JR, RC, SC)
- [ ] **Script SQL** revisado e ajustado conforme decisões
- [ ] **BEGIN/COMMIT** usado para permitir ROLLBACK se necessário
- [ ] **Execução** do script em produção
- [ ] **Validação** via queries de verificação
- [ ] **Teste frontend** confirmando propriedades corretas
- [ ] **Documentação** atualizada com mudanças realizadas

---

## 📊 Resumo Estatístico

**Total de Propriedades**: 336  
**Propriedades Afetadas**: ~300 (89%)  
**Agentes Afetados**: 17/19 (89%)  
**Propriedades Órfãs**: 17 (5%)  

**Tempo Estimado de Correção**: 15-30 minutos  
**Impacto no Sistema**: Baixo (apenas atualização de `agent_id`)  
**Requer Downtime**: Não  

---

**Status**: ⏳ **AGUARDANDO EXECUÇÃO**  
**Prioridade**: 🔴 **ALTA**  
**Deadline Sugerido**: 48h  

**Relatório Criado**: 18 Dezembro 2024  
**Responsável**: Dev Team Backoffice  
**Aprovação Necessária**: Product Owner / Tech Lead
