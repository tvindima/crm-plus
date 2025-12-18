# 🐛 Problema: Coluna `photo` não existia na tabela `agents`

## Contexto
Durante upload bulk de 18 avatares para Cloudinary, descobrimos que a tabela `agents` no PostgreSQL Railway não tinha a coluna `photo`.

## Erro Detectado
```
psycopg2.errors.UndefinedColumn: column "photo" of relation "agents" does not exist
```

## Esquema Atual
```sql
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    phone VARCHAR,
    team_id INTEGER,
    agency_id INTEGER
    -- ❌ Faltava: photo VARCHAR(500)
);
```

## Solução Aplicada

### 1. Criado endpoint de migração
**Arquivo:** `backend/app/main.py`

```python
@debug_router.post("/add-agent-photo-column")
def add_agent_photo_column():
    """Add photo column to agents table"""
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE agents ADD COLUMN IF NOT EXISTS photo VARCHAR(500);"))
        conn.commit()
    return {"success": True, "columns": [...]}
```

### 2. Deploy da correção
```bash
git add -A
git commit -m "fix: add photo column migration endpoint"
git push
# Railway deploy automático ~90s
```

### 3. Executar migração
```bash
curl -X POST https://crm-plus-production.up.railway.app/debug/add-agent-photo-column
```

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Photo column added to agents table!",
  "columns": [
    "id:integer",
    "name:character varying",
    "email:character varying",
    "phone:character varying",
    "photo:character varying",
    "team_id:integer",
    "agency_id:integer"
  ]
}
```

## Próximos Passos

1. ✅ Deploy da migração (aguardando Railway)
2. ⏳ Executar endpoint `/debug/add-agent-photo-column`
3. ⏳ Retry upload de 18 avatares
4. ⏳ Verificar todos avatares com URLs Cloudinary
5. ⏳ Frontend implementar loading dinâmico

## Outros Campos Ausentes?

**VERIFICAR:** Tabela `agents` pode precisar de mais colunas:
- `avatar_url` (deprecated, usar `photo`)
- `linkedin_url`
- `facebook_url`
- `instagram_url`
- `video_url`
- `created_at`, `updated_at`

**Sugestão:** Rodar `AgentOut` schema contra colunas reais e adicionar missing fields.

## Aprendizados

1. **Railway não executa migrações Alembic automaticamente** - precisa endpoints manuais
2. **Models SQLAlchemy != Schema PostgreSQL** - discrepância entre código e DB
3. **Sempre verificar `information_schema.columns`** antes de assumir estrutura
4. **DEBUG endpoints são essenciais** para modificações diretas em produção

---

**Status:** 🔄 Migração em deploy (Railway build ~60s restantes)

**Próxima ação:** Chamar endpoint migration, depois retry upload avatares.
