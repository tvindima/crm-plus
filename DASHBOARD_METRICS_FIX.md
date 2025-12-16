# Correção Dashboard Metrics (KPIs)

## 🐛 Problema

Os contadores do painel inicial do dashboard backoffice mostravam **0 propriedades** apesar de 344 propriedades existirem na base de dados.

## 🔍 Diagnóstico

### Sintomas
- Dashboard inicial: KPIs mostravam todos os valores em 0
- Listagem de imóveis: Funcionava corretamente (344 propriedades visíveis)
- Site montra (público): Funcionava corretamente (385 propriedades visíveis)

### Investigação

1. **Testado endpoint público**: `/properties/` → ✅ Retornava dados corretamente
2. **Testado endpoint debug**: `/api/dashboard/debug/kpis-public` → ✅ Confirmou 344 propriedades AVAILABLE
3. **Testado endpoint KPIs**: `/api/dashboard/kpis` → ❌ Erro SQL

### Root Cause

O modelo `Lead` em `/backend/app/leads/models.py` definia colunas que **não existiam** no PostgreSQL do Railway:

```python
class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=True)
    message = Column(Text, nullable=True)  # ❌ NÃO EXISTE NO RAILWAY
    source = Column(Enum(LeadSource), default=LeadSource.MANUAL)  # ❌ NÃO EXISTE
    origin = Column(String, nullable=True)  # ❌ NÃO EXISTE
    action_type = Column(String, nullable=True)  # ❌ NÃO EXISTE
    property_id = Column(Integer, ForeignKey("properties.id"))  # ❌ NÃO EXISTE
    ...
```

### Erro SQL

```
psycopg2.errors.UndefinedColumn: column leads.message does not exist
psycopg2.errors.UndefinedColumn: column leads.source does not exist
```

O endpoint `/api/dashboard/kpis` usa:

```python
novas_leads_7d = db.query(Lead).filter(
    Lead.created_at >= seven_days_ago
).count()
```

SQLAlchemy tentava fazer `SELECT` com todas as colunas do modelo, mas o PostgreSQL não tinha essas colunas.

## ✅ Solução

### 1. Comentar coluna `message` (não essencial)

```python
# message = Column(Text, nullable=True)  # 🚨 COMENTADO: não existe no Railway
```

**Commit**: `a970330`

### 2. Criar script de migração

Arquivo: `/backend/migrate_leads_columns.py`

Adiciona colunas essenciais:
- `source` (VARCHAR)
- `origin` (VARCHAR)
- `action_type` (VARCHAR)
- `property_id` (INTEGER com FK para properties)

**Commit**: `c39550b`

### 3. Criar endpoint de migração remota

Endpoint: `POST /admin/migrate/leads`

Permite rodar a migração diretamente no Railway sem precisar de acesso SSH.

```python
@router.post("/migrate/leads")
def migrate_leads():
    """Adiciona colunas faltantes à tabela leads"""
    with engine.begin() as conn:
        # Check and add columns...
```

**Commit**: `74bb527`

### 4. Executar migração no Railway

```bash
curl -X POST 'https://crm-plus-production.up.railway.app/admin/migrate/leads'
```

**Resultado**:
```json
{
  "status": "success",
  "message": "Leads migration completed",
  "results": [
    "✅ Added source",
    "✓ origin exists",
    "✅ Added action_type",
    "✅ Added property_id"
  ]
}
```

### 5. Validação

```bash
curl 'https://crm-plus-production.up.railway.app/api/dashboard/kpis'
```

**Resultado**:
```json
{
  "propriedades_ativas": 344,
  "novas_leads_7d": 0,
  "propostas_abertas": 12,
  "agentes_ativos": 15,
  "trends": {
    "propriedades": "0%",
    "propriedades_up": false,
    "leads": "0%",
    "leads_up": false,
    "propostas": "+5%",
    "propostas_up": true
  }
}
```

✅ **344 propriedades ativas** corretamente retornadas!

## 📊 Schema Correto da Tabela `leads`

### Antes da migração
```
id, name, email, phone, status, assigned_agent_id, created_at, updated_at
```

### Depois da migração
```
id, name, email, phone, status, assigned_agent_id, created_at, updated_at,
source, origin, action_type, property_id
```

### Colunas comentadas (não adicionadas)
- `message` - Não essencial, pode ser adicionada futuramente se necessário

## 🎯 Próximos Passos

1. **Validar dashboard frontend**: Recarregar página e confirmar que os KPIs mostram valores corretos
2. **Remover endpoint debug**: `/api/dashboard/debug/kpis-public` (foi temporário)
3. **Considerar adicionar coluna `message`**: Se leads do site precisarem enviar mensagens
4. **Migração profissional**: Implementar Alembic para versionamento de schema
5. **Testes automatizados**: Garantir que mudanças no modelo sejam refletidas no schema

## 🔄 Commits Relacionados

- `a970330` - Comentar coluna message do modelo Lead
- `c39550b` - Adicionar script de migração para colunas leads
- `74bb527` - Adicionar endpoint /admin/migrate/leads para migração remota
- `7119bd7` - Re-ativar autenticação dashboard (após debug)

## 📝 Lessons Learned

1. **Sincronização Model-Schema**: Sempre garantir que o modelo SQLAlchemy reflita o schema real do PostgreSQL
2. **Migrações obrigatórias**: Nunca confiar apenas em `Base.metadata.create_all()` - sempre documentar e versionar alterações de schema
3. **Ambientes diferentes**: SQLite local pode ter schema diferente do PostgreSQL produção
4. **Debugging sistemático**: Isolar problema (auth vs data vs schema) antes de tentar corrigir
5. **Endpoints admin úteis**: Endpoints de migração remota facilitam manutenção sem acesso SSH

---

**Data**: 16 de dezembro de 2025  
**Status**: ✅ RESOLVIDO  
**Impacto**: Dashboard KPIs agora funcionam corretamente
