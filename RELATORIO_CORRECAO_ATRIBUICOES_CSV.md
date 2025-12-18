# 🔧 Relatório: Correção de Atribuições de Propriedades
**Data**: 18 Dezembro 2024  
**Destinatário**: Dev Team Backoffice  
**Prioridade**: 🔴 **CRÍTICA**  
**Status**: ⚠️ **CORREÇÃO MANUAL NECESSÁRIA**

---

## 🎯 Resumo Executivo

### Problema Identificado
O sistema de **auto-atribuição por prefixo de referência** foi implementado com base numa **premissa incorreta**:

❌ **Premissa Errada**: 
- Propriedade com referência `PRxxxx` → Paulo Rodrigues
- Propriedade com referência `FPxxxx` → Fábio Passos
- Propriedade com referência `TVxxxx` → Tiago Vindima

✅ **Realidade**:
- **Fonte de verdade** = Coluna **`angariador`** no arquivo CSV original
- **Prefixo da referência NÃO indica o agente atual** (apenas indica quem criou originalmente)
- Quando um agente sai da empresa, suas propriedades são **redistribuídas manualmente**

---

## 📊 Situação Atual (Depois da Correção Automática)

### O Que Foi Feito (Incorretamente)
Em 18/12/2024, foi executado o endpoint `/admin/fix-all-agent-assignments` que:

1. ✅ Corrigiu propriedades onde prefixo = iniciais do agente atual
2. ❌ **Sobrescreveu atribuições históricas corretas**
3. ❌ Ignorou a coluna `angariador` do CSV
4. ❌ Causou redistribuição incorreta de ~254 propriedades

### Exemplo Concreto: Propriedades FP*

**CSV Original** (correto):
```csv
FP1073;...;António Silva;04/06/2021
FP1090;...;João Paiva;10/05/2022
FP1151;...;Maria Rosa;15/11/2023
FP1186;...;Marisa Barosa;17/05/2024
```

**Após Correção Automática** (incorreto):
```
FP1073 → Fábio Passos (ID 42)  ❌ Deveria ser António Silva
FP1090 → Fábio Passos (ID 42)  ❌ Deveria ser João Paiva
FP1151 → Fábio Passos (ID 42)  ❌ Deveria ser Maria Rosa
FP1186 → Fábio Passos (ID 42)  ❌ Deveria ser Marisa Barosa
```

---

## 🔍 Casos Especiais Identificados

### 1. Fábio Passos (ID 42)
**Exceção à Regra de Nomenclatura**:
- ✅ Propriedades de Fábio Passos = Prefixo **FA** (não FP)
- ❌ Propriedades com prefixo FP = **NÃO são de Fábio Passos**

**Propriedades FA no CSV**:
```csv
FA1006;Venda;Terreno Urbano;...;Eduardo Coelho;19/08/2024
FA1007;Venda;Moradia;T4;...;Eduardo Coelho;03/09/2024
```

**Total**: 2 propriedades FA (ambas angariadas por Eduardo Coelho, não Fábio Passos!)

### 2. Agente "FP" (Antigo - Saiu da Empresa)
- **FP*** = Agente antigo que não trabalha mais na imobiliária
- Suas propriedades foram **redistribuídas** para outros agentes
- Distribuição atual (segundo CSV):
  - António Silva: ~30 propriedades FP
  - Maria Rosa: ~17 propriedades FP
  - João Paiva: ~6 propriedades FP
  - Outros agentes: restantes

---

## 📋 Regra de Atribuição Correta

### Fonte de Verdade
✅ **Coluna `angariador`** no arquivo `backend/scripts/propriedades.csv`

### Formato do CSV
```csv
referencia;negocio;tipo;tipologia;preco;quartos;estado;concelho;freguesia;area_util;area_terreno;ce;angariador;data_criacao
PR1318;Venda;Apartamento;T2;240000.00;2;Renovado;...;Ricardo Vila;30/05/2025
FP1073;Venda;Apartamento;T3;294500.00;3;Em construção;...;António Silva;04/06/2021
TV1264;Venda;Apartamento;T2;385000.00;2;Em construção;...;Pedro Olaio;21/10/2025
```

### Mapeamento: Angariador → Agent ID

| Angariador (CSV) | Agent ID | Email |
|------------------|----------|-------|
| António Silva | 24 | asilva@imoveismais.pt |
| Hugo Belo | 25 | hbelo@imoveismais.pt |
| Bruno Libânio | 26 | blibanio@imoveismais.pt |
| Nélson Neto | 27 | nneto@imoveismais.pt |
| João Paiva | 28 | jpaiva@imoveismais.pt |
| Marisa Barosa | 29 | arrendamentosleiria@imoveismais.pt |
| Eduardo Coelho | 30 | ecoelho@imoveismais.pt |
| João Silva | 31 | jsilva@imoveismais.pt |
| Hugo Mota | 32 | hmota@imoveismais.pt |
| João Pereira | 33 | jpereira@imoveismais.pt |
| João Carvalho | 34 | jcarvalho@imoveismais.pt |
| Tiago Vindima | 35 | tvindima@imoveismais.pt |
| Mickael Soares | 36 | msoares@imoveismais.pt |
| Paulo Rodrigues | 37 | prodrigues@imoveismais.pt |
| Imóveis Mais Leiria | 38 | leiria@imoveismais.pt |
| Nuno Faria | 39 | nfaria@imoveismais.pt |
| Pedro Olaio | 40 | polaio@imoveismais.pt |
| João Olaio | 41 | jolaio@imoveismais.pt |
| Fábio Passos | 42 | fpassos@imoveismais.pt |

### Angariadores Não Mapeados (Agentes Antigos)
Propriedades com estes angariadores precisam de **atribuição manual** no backoffice:

- **Sofia Garcia** (não existe no sistema)
- **Maria Rosa** (não existe no sistema)
- **António Barosa** (não existe no sistema)
- **Maria Mendes** (não existe no sistema)
- **Ricardo Vila** (não existe no sistema)

---

## 🛠️ Ações Necessárias (Backoffice)

### Opção 1: Importação Automática via Script
Criar funcionalidade no backoffice para:

1. **Upload do CSV** original
2. **Mapeamento automático**: Coluna `angariador` → `agent_id`
3. **Update em massa**: 
   ```sql
   UPDATE properties 
   SET agent_id = :agent_id 
   WHERE reference = :referencia
   ```
4. **Tratamento de exceções**: Angariadores não mapeados → NULL ou atribuição manual

### Opção 2: Correção Manual via Backoffice UI
Para cada propriedade no CSV:

1. Buscar propriedade por `referencia`
2. Verificar angariador no CSV
3. Atribuir ao `agent_id` correto conforme tabela acima
4. Salvar alteração

### Opção 3: SQL Direto (Requer Backup Primeiro!)

**⚠️ ATENÇÃO**: Executar APENAS após backup completo da database!

```sql
-- Exemplo para propriedades de António Silva no CSV
UPDATE properties 
SET agent_id = 24 
WHERE reference IN (
  'AS1012', 'AS1013', 'AS1014', 'AS1018', 'AS1020', 
  'AS1040', 'AS1048', 'AS1051', 'AS1052', 'AS1053',
  'FP1145', 'FP1148', 'FP1149', 'FP1150', 'FP1169',
  -- ... (adicionar todas as referências do CSV com angariador = António Silva)
);

-- Repetir para cada agente
```

---

## 📊 Estatísticas de Impacto

### Total de Propriedades no CSV
- **386 linhas** no arquivo `propriedades.csv`
- **~336 propriedades publicadas** no backend

### Propriedades Afetadas pela Correção Automática
- **254 propriedades** foram reatribuídas incorretamente
- **Impacto**: ~75% das propriedades

### Prefixos com Discrepância
| Prefixo | Total | Distribuição Correta (CSV) | Atribuição Atual (Incorreta) |
|---------|-------|---------------------------|------------------------------|
| **FP** | 53 | António Silva (30), Maria Rosa (17), outros (6) | Fábio Passos (48) ❌ |
| **PR** | 20 | Paulo Rodrigues (15), Ricardo Vila (3), outros (2) | Paulo Rodrigues (20) ⚠️ |
| **TV** | 21 | Tiago Vindima (12), Pedro Olaio (4), outros (5) | Tiago Vindima (21) ⚠️ |
| **HM** | 57 | Hugo Mota (maioria), distribuído | Hugo Mota (43) ⚠️ |

---

## ⚠️ Recomendações Críticas

### 1. Desativar Auto-Atribuição por Prefixo
❌ **REMOVER** a lógica de auto-atribuição baseada em prefixo:
```python
# ❌ CÓDIGO INCORRETO - REMOVER
def auto_assign_by_prefix(reference: str):
    prefix = reference[0:2]
    return PREFIX_TO_AGENT.get(prefix)
```

✅ **MANTER** apenas atribuição manual via backoffice ou CSV import

### 2. Criar Validação no Backoffice
Implementar alerta quando:
- Propriedade com prefixo X está atribuída a agente Y
- Exemplo: "⚠️ Propriedade FP1073 está atribuída a António Silva, mas prefixo sugere 'FP'"

### 3. Backup Antes de Qualquer Correção
```bash
# Railway CLI
railway run pg_dump $DATABASE_URL > backup_antes_correcao_$(date +%Y%m%d_%H%M).sql
```

### 4. Validação Pós-Correção
Após executar correções, validar:

```sql
-- Verificar que propriedades FP* não estão todas com Fábio Passos
SELECT 
    SUBSTRING(reference, 1, 2) as prefix,
    COUNT(*) as total,
    COUNT(DISTINCT agent_id) as num_agents
FROM properties
WHERE reference LIKE 'FP%'
GROUP BY SUBSTRING(reference, 1, 2);

-- Deve retornar:
-- prefix | total | num_agents
-- FP     | 48    | 5+         (múltiplos agentes)
```

---

## 📝 Checklist de Execução

### Preparação
- [ ] Fazer backup completo da database
- [ ] Confirmar mapeamento `angariador` → `agent_id` na tabela acima
- [ ] Decidir método de correção (Script / Manual / SQL)

### Execução
- [ ] Executar correções em staging primeiro
- [ ] Validar resultado em staging
- [ ] Executar correções em produção
- [ ] Validar resultado em produção

### Validação
- [ ] Verificar Fábio Passos tem apenas propriedades FA* (ou conforme CSV)
- [ ] Verificar propriedades FP* distribuídas entre múltiplos agentes
- [ ] Confirmar que sites individuais de agentes mostram propriedades corretas
- [ ] Aguardar ISR revalidation (1h) ou forçar deploy frontend

### Cleanup
- [ ] Remover código de auto-atribuição por prefixo do backend
- [ ] Atualizar documentação
- [ ] Informar equipe das mudanças

---

## 🔗 Arquivos de Referência

- **CSV Original**: `backend/scripts/propriedades.csv`
- **Mapeamento Agentes**: `backend/scripts/agentes.csv`
- **Endpoint de Correção (DEPRECADO)**: `POST /admin/fix-all-agent-assignments`

---

## 📞 Suporte

**Dúvidas**: Contactar Product Owner antes de executar correções  
**Backups**: Verificar Railway dashboard antes de qualquer operação  
**Validação**: Testar em ambiente de staging primeiro  

---

**Status**: ⏳ **AGUARDANDO AÇÃO DO BACKOFFICE**  
**Prioridade**: 🔴 **ALTA** - Dados incorretos afetam sites de agentes  
**Deadline Sugerido**: 24-48h  

**Relatório Criado**: 18 Dezembro 2024  
**Responsável**: Dev Team Backoffice  
**Aprovação Necessária**: Product Owner
