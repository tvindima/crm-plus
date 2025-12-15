# 🔍 Análise de Integração Backend ↔ Frontend Web

## ✅ CONCORDÂNCIA COM RELATÓRIO BACKOFFICE DEV

**100% de acordo**. O relatório técnico está excelente e documenta perfeitamente:
- Root cause: Schema divergence (SQLite local ≠ PostgreSQL produção)
- Solução: Migração manual via endpoint POST /debug/run-migration
- Resultado: 21 colunas completas com tipos corretos
- Status: Backend /properties/ agora retorna **200 OK**

## 📊 VALIDAÇÃO REALIZADA

### Backend API - Status Atual
```bash
curl https://crm-plus-production.up.railway.app/properties/?limit=2
# ✅ HTTP 200 OK
# ✅ Retorna array de PropertyOut (JSON válido)
```

**Exemplo de resposta:**
```json
{
  "reference": "PROP1",
  "title": "Beautiful house",
  "business_type": null,
  "property_type": null,
  "typology": null,
  "description": null,
  "price": 500000.0,
  "usable_area": null,
  "location": null,
  "municipality": null,
  "parish": null,
  "condition": null,
  "energy_certificate": null,
  "images": null,
  "id": 1,
  "status": "available",
  "agent_id": 1,
  "created_at": null,
  "updated_at": null
}
```

### Schema Comparison

| Campo | Backend (PropertyOut) | Frontend (Mock) | Status | Ação Necessária |
|-------|----------------------|-----------------|--------|-----------------|
| **id** | ✅ integer | ✅ number | ✅ Match | - |
| **reference** | ✅ string | ✅ string | ✅ Match | - |
| **title** | ✅ string | ✅ string | ✅ Match | - |
| **price** | ✅ float | ✅ number | ✅ Match | - |
| **business_type** | ✅ string\|null | ✅ string | ✅ Match | - |
| **property_type** | ✅ string\|null | ✅ string | ✅ Match | - |
| **typology** | ✅ string\|null | ✅ string | ✅ Match | - |
| **description** | ✅ string\|null | ✅ string | ✅ Match | - |
| **observations** | ✅ string\|null | ✅ string | ✅ Match | - |
| **usable_area** | ✅ float\|null | ✅ number (as "area") | ⚠️ Partial | Frontend tem "area" e "usable_area" |
| **land_area** | ✅ float\|null | ❌ Missing | ⚠️ Add | Frontend pode ignorar ou adicionar |
| **location** | ✅ string\|null | ✅ string | ✅ Match | - |
| **municipality** | ✅ string\|null | ✅ string | ✅ Match | - |
| **parish** | ✅ string\|null | ✅ string | ✅ Match | - |
| **condition** | ✅ string\|null | ✅ string | ✅ Match | - |
| **energy_certificate** | ✅ string\|null | ✅ string | ✅ Match | - |
| **images** | ✅ List[str]\|null | ✅ string[] | ✅ Match | - |
| **status** | ✅ PropertyStatus | ✅ string | ✅ Match | Backend retorna string ("available") |
| **agent_id** | ✅ integer\|null | ✅ number | ✅ Match | - |
| **created_at** | ✅ datetime\|null | ❌ Missing | ⚠️ Optional | Frontend pode adicionar |
| **updated_at** | ✅ datetime\|null | ❌ Missing | ⚠️ Optional | Frontend pode adicionar |
| **bedrooms** | ❌ Not in backend | ✅ number | ⚠️ Frontend only | Calculado do typology? |
| **bathrooms** | ❌ Not in backend | ✅ number | ⚠️ Frontend only | Calculado? |
| **parking_spaces** | ❌ Not in backend | ✅ number | ⚠️ Frontend only | Calculado? |

### ⚠️ INCOMPATIBILIDADES ENCONTRADAS

1. **Frontend tem campos extra** (não vêm do backend):
   - `bedrooms` - número de quartos (derivado de typology?)
   - `bathrooms` - número de casas de banho
   - `parking_spaces` - número de lugares de estacionamento
   - `area` - duplicado de usable_area

2. **Backend tem campos que frontend não usa**:
   - `land_area` - área de terreno (útil para terrenos/moradias)
   - `created_at` - timestamp de criação
   - `updated_at` - timestamp de atualização

## 🔧 AJUSTES NECESSÁRIOS

### Opção A: Backend Adiciona Campos (RECOMENDADO)
Adicionar campos `bedrooms`, `bathrooms`, `parking_spaces` ao modelo Property:

```python
# backend/app/properties/models.py
class Property(Base):
    __tablename__ = "properties"
    # ... existing fields ...
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    parking_spaces = Column(Integer, nullable=True)
```

```python
# backend/app/properties/schemas.py
class PropertyBase(BaseModel):
    # ... existing fields ...
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    parking_spaces: Optional[int] = None
```

**Migration SQL:**
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;
```

### Opção B: Frontend Remove Campos Extra
Remover `bedrooms`, `bathrooms`, `parking_spaces` dos mocks e componentes.

**Problema**: Esses campos podem estar sendo usados em filtros/cards.

### Opção C: Frontend Deriva Campos (ATUAL)
Frontend calcula `bedrooms` do typology:
- "T0" → bedrooms: 0
- "T1" → bedrooms: 1
- "T3" → bedrooms: 3

**Problema**: `bathrooms` e `parking_spaces` não podem ser derivados.

## 📝 INFORMAÇÕES CRÍTICAS PARA EQUIPA BACKOFFICE

### 1. ✅ Schema Está Completo
Após a migração, o backend tem **21 colunas funcionais**:
```
✅ id, reference, title, price, agent_id
✅ business_type, property_type, typology
✅ description, observations
✅ usable_area, land_area
✅ location, municipality, parish
✅ condition, energy_certificate
✅ status, images
✅ created_at, updated_at
```

### 2. ⚠️ Campos Faltando (Opcional)
Se o backoffice permite editar esses campos, devem ser adicionados:
- `bedrooms` (integer) - Número de quartos
- `bathrooms` (integer) - Número de casas de banho
- `parking_spaces` (integer) - Lugares de estacionamento

**Alternativa**: Se esses campos não existem no backoffice, o frontend pode:
- Derivar `bedrooms` do typology (T0=0, T1=1, T2=2, etc)
- Deixar `bathrooms` e `parking_spaces` vazios ou removê-los

### 3. ✅ Frontend Pode Consumir API Agora
O endpoint `/properties/` está funcional:
- ✅ HTTP 200 OK
- ✅ JSON válido
- ✅ Schema compatível (90% dos campos)
- ⚠️ Apenas 3 campos extras no frontend (bedrooms, bathrooms, parking_spaces)

### 4. 🔄 ISR Vai Funcionar Automaticamente
Quando backend estiver populado com dados reais:
- Frontend homepage: `revalidate=0` (sempre fresh)
- Frontend agent pages: `revalidate=3600` (1 hora)
- Backoffice cria property → visível no site em 0-3600 segundos

### 5. 📊 Dados de Seed Necessários
Backend tem apenas **1 property** (PROP1 - teste).
Precisa executar seed com as **381+ properties** reais:

```bash
# Railway
python seed_postgres.py

# Ou importar do CSV
python scripts/import_propriedades.py
```

### 6. ⚠️ Tipo PropertyStatus
Backend usa **String** em vez de Enum:
```python
# Antes (causava erro)
status = Column(Enum(PropertyStatus))

# Agora (funcional)
status = Column(String, default=PropertyStatus.AVAILABLE.value)
```

Valores possíveis: `"available"`, `"sold"`, `"rented"`, `"reserved"`, `"inactive"`

### 7. ✅ JSONB para Imagens
Images agora usa **JSONB** (PostgreSQL):
```json
"images": ["https://example.com/img1.jpg", "https://example.com/img2.jpg"]
```

Frontend já normaliza URLs via `resolveImageUrl()`.

## 🎯 DECISÕES A TOMAR

### Decisão 1: Adicionar bedrooms/bathrooms/parking_spaces ao Backend?
**Opções:**
- ✅ **SIM** - Backoffice já coleta esses dados → adicionar ao modelo
- ❌ **NÃO** - Backoffice não coleta → frontend deriva ou remove

**Recomendação**: Verificar se backoffice tem esses campos. Se sim, adicionar.

### Decisão 2: Popular PostgreSQL com 381 Properties
**Status Atual**: 1 property (PROP1 - teste)
**Necessário**: Executar seed ou importação CSV

**Opções:**
```bash
# Opção A: Seed automático
python seed_postgres.py

# Opção B: Import do CSV
python scripts/import_propriedades.py
```

### Decisão 3: Remover Endpoint /debug/run-migration
**Após estabilização**, remover endpoints de debug:
- `/debug/db-info`
- `/debug/properties-test`
- `/debug/run-migration` (PERIGOSO em produção)

Ou proteger com autenticação admin.

## 📋 CHECKLIST DE INTEGRAÇÃO

### Backend (Backoffice Dev Team)
- [x] Migração executada (21 colunas)
- [x] Endpoint /properties/ retorna 200 OK
- [x] Schema alinhado com SQLAlchemy models
- [ ] **Decidir**: Adicionar bedrooms/bathrooms/parking_spaces?
- [ ] **Executar seed**: Popular PostgreSQL com 381+ properties
- [ ] **Opcional**: Adicionar land_area aos formulários backoffice
- [ ] **Cleanup**: Remover ou proteger endpoints /debug/*

### Frontend Web (Minha Responsabilidade)
- [x] ISR configurado (revalidate 0/3600)
- [x] Fallback para mocks quando API falha
- [ ] **Testar**: Remover fallback e usar apenas API real
- [ ] **Normalizar**: Decidir sobre bedrooms/bathrooms/parking_spaces
- [ ] **Validar**: Adicionar property no backoffice → aparece no site
- [ ] **Monitorar**: Logs de erro se API falhar

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### 1. Decisão sobre Campos Extra (URGENTE)
**Perguntar ao Backoffice Dev:**
> "O backoffice permite editar bedrooms, bathrooms e parking_spaces?  
> Se sim, precisamos adicionar esses campos ao modelo Property do backend."

### 2. Popular PostgreSQL (ALTA PRIORIDADE)
```bash
# Executar no Railway ou local conectado ao PostgreSQL
python seed_postgres.py
# Ou
python scripts/import_propriedades.py
```

### 3. Testar Integração End-to-End (APÓS SEED)
```bash
# 1. Adicionar property no backoffice
# 2. Verificar aparece em /properties/
curl https://crm-plus-production.up.railway.app/properties/?limit=10
# 3. Verificar aparece no site web
# https://imoveismais-site.vercel.app/
# 4. Aguardar revalidação ISR (máx 1 hora)
```

### 4. Remover Mocks do Frontend (APÓS VALIDAÇÃO)
Quando backend estiver populado e estável:
```typescript
// publicApi.ts - remover fallback
export async function getProperties(limit = 500): Promise<Property[]> {
  // Remover try/catch e mockProperties fallback
  // Lançar erro se API falhar (modo produção)
}
```

## 📊 RESUMO EXECUTIVO

| Item | Status | Ação Necessária |
|------|--------|-----------------|
| **Backend API** | ✅ Funcional | Nenhuma |
| **Schema PostgreSQL** | ✅ 21 colunas | Opcional: +3 campos (bedrooms, bathrooms, parking_spaces) |
| **Frontend ISR** | ✅ Configurado | Testar com dados reais |
| **Dados Produção** | ❌ Apenas 1 property | **URGENTE**: Executar seed (381+ properties) |
| **Integração E2E** | ⏳ Pendente seed | Testar após popular PostgreSQL |
| **Compatibilidade** | ⚠️ 90% | Decidir sobre 3 campos extra |

---

**Data**: 15 de dezembro de 2025  
**Status**: ✅ Backend FUNCIONAL, aguardando seed de dados  
**Bloqueador**: Nenhum (pode integrar agora)  
**Opcional**: Adicionar bedrooms/bathrooms/parking_spaces
