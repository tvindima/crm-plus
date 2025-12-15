# 📋 RELATÓRIO TÉCNICO - Integração Backend ↔ Frontend Web
## CRM PLUS - Imóveis Mais

**Data**: 15 de dezembro de 2025  
**Autor**: Frontend Web Team  
**Destinatário**: Backoffice Development Team  
**Versão**: 1.0  
**Prioridade**: ALTA

---

## 📊 SUMÁRIO EXECUTIVO

### Status Atual
- ✅ **Backend API**: Operacional (HTTP 200 OK)
- ✅ **Schema PostgreSQL**: Migração completa (21 colunas)
- ✅ **Frontend Web**: Adaptado e compatível
- ⚠️ **Dados**: Apenas 1 property de teste (necessário popular com 381+ properties)
- ⚠️ **Campos Extra**: 3 campos opcionais (bedrooms, bathrooms, parking_spaces)

### Ações Requeridas
1. **URGENTE**: Popular PostgreSQL com base de dados completa (381+ properties, agentes)
2. **DECISÃO**: Adicionar 3 campos extras ao modelo Property (quartos, WC, estacionamento)
3. **SEGURANÇA**: Remover/proteger endpoints de debug em produção
4. **VALIDAÇÃO**: Teste end-to-end após seed de dados

---

## 🔍 PARTE 1: O QUE ENCONTRÁMOS

### 1.1 Estado Inicial do Backend API

**Endpoint Testado**: `GET /properties/`  
**URL**: https://crm-plus-production.up.railway.app/properties/

#### Antes da Migração
```bash
❌ HTTP 500 Internal Server Error
❌ Erro: column properties.business_type does not exist
❌ Schema PostgreSQL: 6 colunas (incompleto)
❌ Tipos errados: price=TEXT, agent_id=TEXT
```

#### Após Migração (Estado Atual)
```bash
✅ HTTP 200 OK
✅ JSON válido retornado
✅ Schema PostgreSQL: 21 colunas (completo)
✅ Tipos corretos: price=FLOAT, agent_id=INTEGER, images=JSONB
```

**Exemplo de resposta atual:**
```json
{
  "id": 1,
  "reference": "PROP1",
  "title": "Beautiful house",
  "business_type": null,
  "property_type": null,
  "typology": null,
  "description": null,
  "observations": null,
  "price": 500000.0,
  "usable_area": null,
  "land_area": null,
  "location": null,
  "municipality": null,
  "parish": null,
  "condition": null,
  "energy_certificate": null,
  "status": "available",
  "agent_id": 1,
  "images": null,
  "created_at": null,
  "updated_at": null
}
```

### 1.2 Schema PostgreSQL Atual

**Tabela**: `properties`  
**Total de Colunas**: 21  
**Status**: ✅ Completo e funcional

| # | Campo | Tipo | Obrigatório | Origem |
|---|-------|------|-------------|--------|
| 1 | id | INTEGER | PRIMARY KEY | ✅ Inicial |
| 2 | reference | VARCHAR | UNIQUE | ✅ Inicial |
| 3 | title | VARCHAR | - | ✅ Inicial |
| 4 | price | FLOAT | - | ⚠️ Corrigido (era TEXT) |
| 5 | agent_id | INTEGER | FK agents.id | ⚠️ Corrigido (era TEXT) |
| 6 | business_type | VARCHAR | - | ✅ Migração |
| 7 | property_type | VARCHAR | - | ✅ Migração |
| 8 | typology | VARCHAR | - | ✅ Migração |
| 9 | description | TEXT | - | ✅ Migração |
| 10 | observations | TEXT | - | ✅ Migração |
| 11 | usable_area | FLOAT | - | ✅ Migração |
| 12 | land_area | FLOAT | - | ✅ Migração |
| 13 | location | VARCHAR | - | ✅ Migração |
| 14 | municipality | VARCHAR | - | ✅ Migração |
| 15 | parish | VARCHAR | - | ✅ Migração |
| 16 | condition | VARCHAR | - | ✅ Migração |
| 17 | energy_certificate | VARCHAR | - | ✅ Migração |
| 18 | status | VARCHAR | DEFAULT 'available' | ✅ Migração |
| 19 | images | JSONB | - | ✅ Migração |
| 20 | created_at | TIMESTAMP | - | ✅ Migração |
| 21 | updated_at | TIMESTAMP | - | ✅ Migração |

### 1.3 Incompatibilidades Frontend vs Backend

#### Campos Presentes no Frontend (Mocks) mas AUSENTES no Backend

| Campo | Tipo | Uso Frontend | Pode Derivar? | Ação Necessária |
|-------|------|--------------|---------------|-----------------|
| **bedrooms** | integer | Filtros, Cards, Detalhes | ✅ SIM (de typology) | Opcional adicionar |
| **bathrooms** | integer | Filtros, Cards, Detalhes | ❌ NÃO | Adicionar ao backend |
| **parking_spaces** | integer | Filtros, Cards, Detalhes | ❌ NÃO | Adicionar ao backend |

**Derivação de bedrooms:**
```typescript
// Frontend pode calcular automaticamente:
"T0" → bedrooms: 0
"T1" → bedrooms: 1
"T2" → bedrooms: 2
"T3" → bedrooms: 3
"T4" → bedrooms: 4
"T5" → bedrooms: 5
```

**Problema**: `bathrooms` e `parking_spaces` NÃO podem ser derivados automaticamente.

### 1.4 Estado dos Dados

**PostgreSQL (Produção)**:
```
✅ Schema completo (21 colunas)
⚠️ Dados: 1 property apenas (PROP1 - teste)
⚠️ Faltam: 381+ properties reais
⚠️ Faltam: Todos os agentes
```

**Frontend Web (Mocks Estáticos)**:
```
✅ 385 properties (do CSV)
✅ 18 agentes (completo)
⚠️ Não sincroniza com backoffice
⚠️ Requer deploy manual para atualizar
```

---

## 🔧 PARTE 2: O QUE FIZEMOS NO FRONTEND WEB

### 2.1 Validação da API Backend

**Testes Realizados**:
```bash
# 1. Health check
curl https://crm-plus-production.up.railway.app/health
# ✅ Resultado: {"status":"ok","service":"CRM PLUS API"}

# 2. Properties endpoint
curl https://crm-plus-production.up.railway.app/properties/?limit=2
# ✅ Resultado: HTTP 200 OK, JSON válido

# 3. Debug endpoint
curl https://crm-plus-production.up.railway.app/debug/properties-test
# ✅ Resultado: {"success":true,"count":1,"first_property":"PROP1"}
```

### 2.2 Atualização do Frontend Web

#### Arquivo: `frontend/web/src/services/publicApi.ts`

**Antes**:
```typescript
const normalizeProperty = (property: Property): Property => {
  const images = property.images
    ?.map((img) => resolveImageUrl(img))
    .filter((img): img is string => Boolean(img));
  return { ...property, images };
};
```

**Depois (Compatível com Backend)**:
```typescript
const normalizeProperty = (property: Property): Property => {
  const images = property.images
    ?.map((img) => resolveImageUrl(img))
    .filter((img): img is string => Boolean(img));
  
  // ✅ NOVO: Deriva bedrooms do typology se ausente
  let bedrooms = property.bedrooms;
  if (bedrooms === undefined && property.typology) {
    const match = property.typology.match(/T(\d+)/);
    if (match) {
      bedrooms = parseInt(match[1], 10);
    }
  }
  
  // ✅ NOVO: Normaliza area = usable_area (compatibilidade)
  const area = property.area ?? property.usable_area;
  
  return { 
    ...property, 
    images,
    bedrooms,
    area,
  };
};
```

**Benefícios**:
1. ✅ Frontend 100% compatível com backend PropertyOut
2. ✅ `bedrooms` derivado automaticamente se backend não fornecer
3. ✅ `area` sincronizado com `usable_area`
4. ✅ Fallback inteligente para dados incompletos
5. ✅ Sem erros se campos opcionais ausentes

### 2.3 Configuração ISR (Incremental Static Regeneration)

**Homepage** (`frontend/web/app/page.tsx`):
```typescript
export const revalidate = 0; // Sempre fresh do backend
```

**Páginas de Agentes** (`frontend/web/app/agentes/[slug]/page.tsx`):
```typescript
export const revalidate = 3600; // Cache de 1 hora
```

**Como funciona**:
```
Backoffice cria/edita property
       ↓
PostgreSQL atualizado
       ↓
Backend API reflete mudança imediatamente
       ↓
Frontend Web:
  - Homepage: Refetch imediato (revalidate=0)
  - Páginas de agentes: Refetch após 1 hora máx (revalidate=3600)
       ↓
Site atualizado automaticamente
```

**Timeline**: 0-3600 segundos para mudanças aparecerem no site.

### 2.4 Mapeamento de Agentes

**Sistema de Fallback Implementado**:
```typescript
// 1. Prioridade: agent_id do backend
// 2. Fallback: Derivar de referência (MB→10, TV→16, NN→8)
// 3. Fallback final: AGENT_LOOKUP (mocks)

const AGENT_INITIALS_MAP = {
  "MB": 10,  // Marisa Barosa
  "NN": 8,   // Nélson Neto
  "TV": 16,  // Tiago Vindima
  "NF": 1,   // Nuno Faria
  "PO": 2,   // Pedro Olaio
  "JO": 3,   // João Olaio
  // ... 18 agentes total
};
```

---

## �� PARTE 3: O QUE BACKOFFICE DEV PRECISA FAZER

### 3.1 ⚠️ URGENTE: Popular PostgreSQL com Dados Completos

#### Problema
Backend tem apenas **1 property de teste** (PROP1).  
Frontend web continua usando **mocks estáticos** até backend ter dados reais.

#### Solução
Executar seed com base de dados completa:

```bash
# Opção A: Seed automático (se existir script)
cd backend
python seed_postgres.py

# Opção B: Import do CSV (recomendado)
python scripts/import_propriedades.py
```

#### Dados Necessários

**Properties**:
- Total: 381+ properties
- Fonte: `backend/scripts/propriedades.csv`
- Campos: reference, title, price, typology, business_type, property_type, etc.

**Agents**:
- Total: 18 agentes
- Fonte: `backend/scripts/agentes.csv` (se existir) ou tabela do backoffice
- Campos: id, name, email, phone, team, avatar

**Validação Pós-Seed**:
```bash
# 1. Verificar total de properties
curl https://crm-plus-production.up.railway.app/properties/?limit=1000 | jq 'length'
# Esperado: ~381

# 2. Verificar properties de um agente específico
curl 'https://crm-plus-production.up.railway.app/properties/?skip=0&limit=100' | \
  jq '[.[] | select(.agent_id == 16)] | length'
# Esperado: 19 (Tiago Vindima)

# 3. Verificar agentes
curl https://crm-plus-production.up.railway.app/agents/ | jq 'length'
# Esperado: 18
```

### 3.2 🔧 DECISÃO: Adicionar 3 Campos Extras (Quartos, WC, Estacionamento)

#### Questão
**O backoffice permite editar estes campos ao criar/editar propriedades?**

1. **bedrooms** (número de quartos)
2. **bathrooms** (número de casas de banho/WC)
3. **parking_spaces** (lugares de estacionamento)

#### Cenário A: SIM, Backoffice TEM Estes Campos

**Executar migração adicional:**

##### SQL Migration
```sql
-- Arquivo: backend/migrate_add_extra_fields.sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;

-- Verificar
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' 
  AND column_name IN ('bedrooms', 'bathrooms', 'parking_spaces');
```

##### Backend Models
```python
# Arquivo: backend/app/properties/models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base

class Property(Base):
    __tablename__ = "properties"
    
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    business_type = Column(String, nullable=True)
    property_type = Column(String, nullable=True)
    typology = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    observations = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    usable_area = Column(Float, nullable=True)
    land_area = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    municipality = Column(String, nullable=True)
    parish = Column(String, nullable=True)
    condition = Column(String, nullable=True)
    energy_certificate = Column(String, nullable=True)
    
    # ✅ ADICIONAR ESTES 3 CAMPOS
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    parking_spaces = Column(Integer, nullable=True)
    
    status = Column(String, default="available")
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    images = Column(JSONB, nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    
    agent = relationship("Agent", back_populates="properties")
```

##### Backend Schemas
```python
# Arquivo: backend/app/properties/schemas.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime
from .models import PropertyStatus

class PropertyBase(BaseModel):
    reference: str = Field(..., description="Referência única do imóvel")
    title: str = Field(..., description="Título/curto da propriedade")
    business_type: Optional[str] = Field(None, description="Venda/Arrendamento")
    property_type: Optional[str] = None
    typology: Optional[str] = None
    description: Optional[str] = None
    observations: Optional[str] = None
    price: float
    usable_area: Optional[float] = None
    land_area: Optional[float] = None
    location: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    condition: Optional[str] = None
    energy_certificate: Optional[str] = None
    
    # ✅ ADICIONAR ESTES 3 CAMPOS
    bedrooms: Optional[int] = Field(None, description="Número de quartos")
    bathrooms: Optional[int] = Field(None, description="Número de casas de banho")
    parking_spaces: Optional[int] = Field(None, description="Lugares de estacionamento")
    
    images: Optional[List[str]] = None

class PropertyCreate(PropertyBase):
    status: PropertyStatus = PropertyStatus.AVAILABLE
    agent_id: Optional[int] = None

class PropertyUpdate(BaseModel):
    reference: Optional[str] = None
    title: Optional[str] = None
    business_type: Optional[str] = None
    property_type: Optional[str] = None
    typology: Optional[str] = None
    description: Optional[str] = None
    observations: Optional[str] = None
    price: Optional[float] = None
    usable_area: Optional[float] = None
    land_area: Optional[float] = None
    location: Optional[str] = None
    municipality: Optional[str] = None
    parish: Optional[str] = None
    condition: Optional[str] = None
    energy_certificate: Optional[str] = None
    
    # ✅ ADICIONAR ESTES 3 CAMPOS
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    parking_spaces: Optional[int] = None
    
    images: Optional[List[str]] = None
    status: Optional[PropertyStatus] = None
    agent_id: Optional[int] = None

class PropertyOut(PropertyBase):
    id: int
    status: PropertyStatus
    agent_id: Optional[int]
    
    # ✅ ESTES 3 CAMPOS JÁ ESTÃO NO PropertyBase
    # bedrooms, bathrooms, parking_spaces são herdados
    
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)
```

##### Script Python de Migração
```python
# Arquivo: backend/migrate_add_extra_fields.py
"""
Add bedrooms, bathrooms, parking_spaces to properties table.
Run this ONCE on Railway to add extra fields.
"""
import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    print("⚠️  DATABASE_URL not found. Skipping migration.")
    sys.exit(0)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Connecting to PostgreSQL...")

try:
    engine = create_engine(DATABASE_URL)
    
    migrations = [
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms INTEGER;",
        "ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;",
    ]
    
    with engine.connect() as conn:
        print("🔧 Running migrations...")
        
        for i, sql in enumerate(migrations, 1):
            try:
                conn.execute(text(sql))
                field = sql.split("IF NOT EXISTS ")[1].split(" ")[0]
                print(f"  ✅ Migration {i}/{len(migrations)}: {field} added")
            except Exception as e:
                print(f"  ⚠️  Migration {i} warning: {e}")
        
        conn.commit()
        print("\n✅ All migrations completed!")
        
        # Verify
        result = conn.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'properties' 
              AND column_name IN ('bedrooms', 'bathrooms', 'parking_spaces')
            ORDER BY column_name
        """))
        
        columns = list(result)
        print(f"\n📋 Extra fields in properties table:")
        for row in columns:
            print(f"  - {row[0]}: {row[1]}")
        
        if len(columns) == 3:
            print("\n✅ All 3 extra fields confirmed!")
        else:
            print(f"\n⚠️  Expected 3 fields, found {len(columns)}")
            
except Exception as e:
    print(f"❌ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n🎉 Migration script completed successfully!")
```

##### Executar Migração
```bash
# No Railway ou localmente conectado ao PostgreSQL
cd backend
python migrate_add_extra_fields.py

# Ou via endpoint de debug (se ainda existir)
curl -X POST https://crm-plus-production.up.railway.app/debug/run-migration-extra-fields
```

##### Atualizar Seed/Import Scripts
```python
# Arquivo: backend/scripts/import_propriedades.py

# Adicionar mapeamento dos novos campos no CSV import:
def parse_property_row(row):
    # ... existing code ...
    
    # Extrair quartos do typology se disponível
    bedrooms = None
    if row.get('typology'):
        match = re.match(r'T(\d+)', row['typology'])
        if match:
            bedrooms = int(match.group(1))
    
    # Se CSV tem colunas específicas, usar:
    bathrooms = int(row.get('bathrooms', 0)) if row.get('bathrooms') else None
    parking_spaces = int(row.get('parking_spaces', 0)) if row.get('parking_spaces') else None
    
    return {
        # ... existing fields ...
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'parking_spaces': parking_spaces,
    }
```

#### Cenário B: NÃO, Backoffice NÃO TEM Estes Campos

**Nenhuma ação necessária no backend.**

Frontend continuará:
- ✅ Derivando `bedrooms` do `typology` automaticamente
- ⚠️ Deixando `bathrooms` e `parking_spaces` como `null` nos cards

**Impacto no Site Web**:
- Cards mostrarão: "3 quartos" (derivado de T3)
- Cards NÃO mostrarão: bathrooms e parking_spaces (sem dados)
- Filtros de bathrooms/parking_spaces: Desativados ou removidos

### 3.3 🔒 SEGURANÇA: Remover/Proteger Endpoints de Debug

#### Endpoints Perigosos em Produção

**Arquivo**: `backend/app/main.py`

```python
# ⚠️ ESTES ENDPOINTS DEVEM SER REMOVIDOS OU PROTEGIDOS:

@debug_router.get("/db-info")  # Expõe DATABASE_URL
@debug_router.get("/properties-test")  # Pode ser OK
@debug_router.post("/run-migration")  # 🚨 MUITO PERIGOSO - Pode alterar schema
```

#### Opção A: Remover Completamente (RECOMENDADO)
```python
# Arquivo: backend/app/main.py

# Comentar ou deletar o debug router:
# debug_router = APIRouter(prefix="/debug", tags=["debug"])
# app.include_router(debug_router)
```

#### Opção B: Proteger com Autenticação Admin
```python
# Arquivo: backend/app/main.py
from app.security import require_admin  # Criar esta função

@debug_router.get("/db-info", dependencies=[Depends(require_admin)])
def get_db_info():
    # ... código existente ...

@debug_router.post("/run-migration", dependencies=[Depends(require_admin)])
def run_migration():
    # ... código existente ...
```

#### Opção C: Apenas em Desenvolvimento
```python
# Arquivo: backend/app/main.py
import os

# Só registrar debug router em dev
if os.environ.get("ENVIRONMENT") != "production":
    debug_router = APIRouter(prefix="/debug", tags=["debug"])
    # ... endpoints ...
    app.include_router(debug_router)
```

### 3.4 ✅ VALIDAÇÃO: Teste End-to-End

#### Após Seed de Dados, Testar:

**1. Backend API**:
```bash
# Listar properties
curl https://crm-plus-production.up.railway.app/properties/?limit=10

# Buscar property específica
curl https://crm-plus-production.up.railway.app/properties/123

# Filtrar por agente
curl 'https://crm-plus-production.up.railway.app/properties/?agent_id=16'

# Verificar agentes
curl https://crm-plus-production.up.railway.app/agents/
```

**2. Frontend Web**:
```bash
# Homepage deve mostrar properties reais
open https://imoveismais-site.vercel.app/

# Página de agente específico
open https://imoveismais-site.vercel.app/agentes/tiago-vindima

# Property detail page
open https://imoveismais-site.vercel.app/imoveis/TV1001
```

**3. Integração Backoffice → Site Web**:
```bash
# 1. Criar nova property no backoffice
#    - Título: "Apartamento Teste T2"
#    - Referência: "TEST001"
#    - Agente: Tiago Vindima (ID: 16)
#    - Preço: 150000
#    - Typology: T2

# 2. Verificar aparece na API (imediato)
curl https://crm-plus-production.up.railway.app/properties/ | grep "TEST001"

# 3. Verificar aparece no site web
# Homepage: 0-5 segundos (revalidate=0)
# Página do agente: 0-3600 segundos (revalidate=3600)

# 4. Editar property no backoffice
#    - Alterar preço: 150000 → 145000

# 5. Verificar atualização no site (aguardar ISR)
```

---

## 📋 PARTE 4: CHECKLIST DE IMPLEMENTAÇÃO

### Para Backoffice Development Team

#### Fase 1: Seed de Dados (URGENTE) ⚠️
- [ ] Executar `python seed_postgres.py` ou `python scripts/import_propriedades.py`
- [ ] Verificar **381+ properties** no PostgreSQL
- [ ] Verificar **18 agentes** no PostgreSQL
- [ ] Validar endpoint: `curl .../properties/?limit=1000 | jq 'length'`
- [ ] Validar endpoint: `curl .../agents/ | jq 'length'`

#### Fase 2: Campos Extras (DECISÃO REQUERIDA) ❓
- [ ] **DECIDIR**: Backoffice tem campos bedrooms/bathrooms/parking_spaces?
  - [ ] **SIM**: Executar migração `migrate_add_extra_fields.py`
  - [ ] **SIM**: Atualizar `models.py` com 3 campos
  - [ ] **SIM**: Atualizar `schemas.py` com 3 campos
  - [ ] **SIM**: Atualizar seed/import scripts
  - [ ] **NÃO**: Nenhuma ação (frontend deriva automaticamente)

#### Fase 3: Segurança (ALTA PRIORIDADE) 🔒
- [ ] Remover endpoint `/debug/run-migration` (perigoso)
- [ ] Remover ou proteger `/debug/db-info`
- [ ] Manter `/debug/properties-test` apenas em dev (opcional)
- [ ] Verificar nenhum endpoint expõe credenciais

#### Fase 4: Validação End-to-End ✅
- [ ] Testar API com Postman/curl (200+ properties retornadas)
- [ ] Criar property no backoffice
- [ ] Verificar aparece em `/properties/` imediatamente
- [ ] Verificar aparece no site web (0-3600 segundos)
- [ ] Editar property no backoffice
- [ ] Verificar atualização no site web

#### Fase 5: Monitoramento 📊
- [ ] Configurar logs de erro no Railway
- [ ] Monitorar performance de queries
- [ ] Alertas para endpoint errors (500, 404)
- [ ] Backup automático do PostgreSQL

---

## 📖 PARTE 5: DOCUMENTAÇÃO TÉCNICA

### 5.1 Estrutura de Dados

#### Property (Schema Completo)
```typescript
interface Property {
  // Identificação
  id: number;
  reference: string;           // Único (e.g., "TV1001", "MB1018")
  title: string;               // Título do imóvel
  
  // Classificação
  business_type?: string;      // "Venda" | "Arrendamento"
  property_type?: string;      // "Apartamento" | "Moradia" | "Terreno" | ...
  typology?: string;           // "T0" | "T1" | "T2" | "T3" | ...
  condition?: string;          // "Novo" | "Usado" | "Para Restaurar"
  
  // Localização
  location?: string;           // Endereço completo
  municipality?: string;       // Município (e.g., "Leiria")
  parish?: string;             // Freguesia
  
  // Características
  usable_area?: number;        // m² área útil
  land_area?: number;          // m² área de terreno
  bedrooms?: number;           // Número de quartos (⚠️ OPCIONAL)
  bathrooms?: number;          // Número de WC (⚠️ OPCIONAL)
  parking_spaces?: number;     // Lugares de estacionamento (⚠️ OPCIONAL)
  energy_certificate?: string; // "A+", "A", "B", "C", "D", "E", "F", "G", "Isento"
  
  // Comercial
  price: number;               // Preço em EUR
  status: string;              // "available" | "sold" | "rented" | "reserved" | "inactive"
  
  // Descrição
  description?: string;        // Descrição completa
  observations?: string;       // Observações internas
  
  // Relacionamentos
  agent_id?: number;           // FK para agents.id
  images?: string[];           // Array de URLs (JSONB)
  
  // Metadata
  created_at?: string;         // ISO 8601
  updated_at?: string;         // ISO 8601
}
```

#### Agent (Schema Completo)
```typescript
interface Agent {
  id: number;
  name: string;
  email: string;
  phone?: string;
  team?: string;
  avatar?: string;             // URL da foto
}
```

### 5.2 Endpoints Disponíveis

#### Properties

| Método | Endpoint | Params | Resposta |
|--------|----------|--------|----------|
| GET | `/properties/` | skip, limit, search, status | `Property[]` |
| GET | `/properties/{id}` | - | `Property` |
| POST | `/properties/` | PropertyCreate | `Property` |
| PUT | `/properties/{id}` | PropertyUpdate | `Property` |
| DELETE | `/properties/{id}` | - | `Property` |

**Exemplo de Uso**:
```bash
# Listar com paginação
GET /properties/?skip=0&limit=20

# Buscar por texto
GET /properties/?search=leiria

# Filtrar por status
GET /properties/?status=available

# Combinar filtros
GET /properties/?skip=0&limit=20&search=apartamento&status=available
```

#### Agents

| Método | Endpoint | Params | Resposta |
|--------|----------|--------|----------|
| GET | `/agents/` | limit | `Agent[]` |
| GET | `/agents/{id}` | - | `Agent` |

### 5.3 Valores Enum

**PropertyStatus** (backend usa string, não Enum):
```python
"available"   # Disponível
"sold"        # Vendido
"rented"      # Arrendado
"reserved"    # Reservado
"inactive"    # Inativo
```

**Business Type**:
```
"Venda"
"Arrendamento"
```

**Property Type** (exemplos do CSV):
```
"Apartamento"
"Moradia"
"Terreno"
"Loja"
"Armazém"
"Prédio"
"Estúdio"
```

**Energy Certificate**:
```
"A+", "A", "B", "B-", "C", "D", "E", "F", "G", "Isento", "Em curso"
```

### 5.4 Mapeamento de Agentes (Referências)

```
Iniciais → Agent ID:
MB → 10 (Marisa Barosa)
NN → 8  (Nélson Neto)
TV → 16 (Tiago Vindima)
NF → 1  (Nuno Faria)
PO → 2  (Pedro Olaio)
JO → 3  (João Olaio)
FP → 4  (Fábio Passos)
AS → 5  (António Silva)
HB → 6  (Hugo Belo)
BL → 7  (Bruno Libânio)
JP → 9  (João Paiva)
EC → 11 (Eduardo Coelho)
JS → 12 (João Silva)
HM → 13 (Hugo Mota)
JR → 14 (João Rodrigues)
JC → 15 (João Carvalho)
MS → 17 (Mickael Soares)
PR → 18 (Paulo Rodrigues)
```

**Uso**: Referência "TV1001" → agent_id = 16 (Tiago Vindima)

---

## 🎯 PARTE 6: RESULTADOS ESPERADOS

### Após Completar Todas as Fases

#### ✅ Backend API
- Endpoint `/properties/` retorna 381+ properties
- Endpoint `/agents/` retorna 18 agentes
- Campos opcionais (bedrooms, bathrooms, parking_spaces) presentes se adicionados
- Performance: < 500ms para queries de 100 properties
- Sem erros 500 em produção

#### ✅ Frontend Web
- Homepage mostra properties reais do PostgreSQL
- Páginas de agentes filtram corretamente (e.g., TV → 19 properties)
- Property detail pages com dados completos
- ISR funcional: Mudanças no backoffice refletem em 0-3600s
- Sem fallback para mocks estáticos

#### ✅ Integração End-to-End
```
Fluxo Completo:
1. Utilizador cria property no backoffice → PostgreSQL
2. Backend API reflete mudança imediatamente
3. Frontend web refetch via ISR (0-3600s)
4. Property visível no site público
5. Utilizador edita property no backoffice → Ciclo repete
```

**Timeline**: Backoffice → Site Web = **0-3600 segundos**

### Métricas de Sucesso

| Métrica | Valor Atual | Valor Esperado | Status |
|---------|-------------|----------------|--------|
| Properties no PostgreSQL | 1 | 381+ | ⚠️ Pendente |
| Agents no PostgreSQL | ? | 18 | ⚠️ Pendente |
| Backend API Status | 200 OK | 200 OK | ✅ OK |
| Frontend usando API real | ❌ Não (mocks) | ✅ Sim | ⚠️ Aguarda seed |
| ISR Funcional | ✅ Configurado | ✅ Ativo | ⚠️ Aguarda seed |
| Campos extras (bedrooms, bathrooms, parking_spaces) | ❌ Não | ✅ Sim (opcional) | ⏳ Decisão pendente |
| Tempo de sincronização Backoffice → Site | N/A | 0-3600s | ⏳ Aguarda seed |

---

## 📞 PARTE 7: CONTATOS E PRÓXIMOS PASSOS

### Próxima Reunião Sugerida
**Objetivo**: Validar decisões técnicas e alinhar timeline

**Agenda**:
1. ✅ Confirmação: Seed de dados executado com sucesso?
2. ❓ Decisão: Adicionar bedrooms/bathrooms/parking_spaces?
3. 🔒 Segurança: Endpoints de debug removidos/protegidos?
4. ✅ Teste: Integração end-to-end validada?
5. 📅 Timeline: Data de go-live do site web público

### Questões para Backoffice Dev Team

1. **Seed de Dados**: 
   - Existe script `seed_postgres.py` funcional?
   - Preferem usar CSV import ou seed automático?
   - Quanto tempo estimam para popular PostgreSQL?

2. **Campos Extras**:
   - Backoffice permite editar bedrooms/bathrooms/parking_spaces?
   - Se não, estão OK com frontend derivar apenas bedrooms?
   - Filtros no site devem incluir bathrooms/parking_spaces?

3. **Segurança**:
   - Preferem remover ou proteger endpoints de debug?
   - Existe autenticação admin no backend?
   - Precisam manter algum endpoint de debug em produção?

4. **Timeline**:
   - Quando pretendem completar o seed de dados?
   - Quando podemos testar integração end-to-end?
   - Data prevista para go-live do site público?

### Entregáveis do Frontend Web Team

✅ **Completos**:
- Frontend web 100% compatível com backend API
- ISR configurado e funcional
- Normalização inteligente de dados (bedrooms derivado de typology)
- Fallback para dados incompletos
- Documentação técnica completa

⏳ **Aguardando**:
- Seed de dados no PostgreSQL (bloqueador)
- Decisão sobre campos extras (opcional)
- Teste end-to-end (após seed)

---

## 📄 ANEXOS

### Anexo A: Exemplo de Property Completo (JSON)

```json
{
  "id": 123,
  "reference": "TV1001",
  "title": "Apartamento T3 Leiria Centro",
  "business_type": "Venda",
  "property_type": "Apartamento",
  "typology": "T3",
  "condition": "Usado",
  "location": "Rua Principal, Leiria",
  "municipality": "Leiria",
  "parish": "Leiria, Pousos, Barreira e Cortes",
  "usable_area": 120.5,
  "land_area": null,
  "bedrooms": 3,
  "bathrooms": 2,
  "parking_spaces": 1,
  "energy_certificate": "B",
  "price": 250000.0,
  "status": "available",
  "description": "Excelente apartamento T3 no centro de Leiria...",
  "observations": "Property em bom estado geral",
  "agent_id": 16,
  "images": [
    "https://crm-plus-production.up.railway.app/media/properties/TV1001/sala.jpg",
    "https://crm-plus-production.up.railway.app/media/properties/TV1001/cozinha.jpg",
    "https://crm-plus-production.up.railway.app/media/properties/TV1001/quarto1.jpg"
  ],
  "created_at": "2025-12-01T10:30:00Z",
  "updated_at": "2025-12-15T14:20:00Z"
}
```

### Anexo B: Scripts de Migração

Ver ficheiros criados no projeto:
- `backend/migrate_add_columns.py` (migração principal - JÁ EXECUTADA ✅)
- `backend/migrate_add_extra_fields.py` (campos opcionais - OPCIONAL)
- `backend/migrate_add_columns.sql` (SQL manual - JÁ EXECUTADA ✅)

### Anexo C: Comandos Úteis

```bash
# Verificar schema PostgreSQL
psql $DATABASE_URL -c "\d properties"

# Contar properties
psql $DATABASE_URL -c "SELECT COUNT(*) FROM properties;"

# Listar por agente
psql $DATABASE_URL -c "SELECT reference, title FROM properties WHERE agent_id = 16 LIMIT 10;"

# Verificar campos extras
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'properties' AND column_name IN ('bedrooms', 'bathrooms', 'parking_spaces');"
```

---

## 📌 SUMÁRIO FINAL

### O que Frontend Web Encontrou
1. ✅ Backend API funcional (HTTP 200 OK)
2. ✅ Schema PostgreSQL completo (21 colunas)
3. ⚠️ Apenas 1 property de teste (faltam 381+)
4. ⚠️ 3 campos opcionais ausentes (bedrooms, bathrooms, parking_spaces)

### O que Frontend Web Fez
1. ✅ Validou backend API
2. ✅ Adaptou normalização de dados
3. ✅ Configurou ISR (auto-refresh)
4. ✅ Implementou derivação inteligente (bedrooms do typology)
5. ✅ Documentou tudo neste relatório

### O que Backoffice Dev Precisa Fazer
1. ⚠️ **URGENTE**: Popular PostgreSQL com 381+ properties e 18 agentes
2. ❓ **DECIDIR**: Adicionar bedrooms/bathrooms/parking_spaces ao modelo?
3. 🔒 **SEGURANÇA**: Remover/proteger endpoints de debug
4. ✅ **VALIDAR**: Teste end-to-end após seed

### Bloqueadores Atuais
- ❌ **Seed de dados** (site usa mocks até PostgreSQL ter dados reais)

### Timeline Esperada
- Seed de dados: 1-2 dias
- Campos extras (se necessário): 1 dia
- Teste end-to-end: 1 dia
- **Go-Live**: 3-5 dias após seed

---

**Fim do Relatório**

**Preparado por**: Frontend Web Development Team  
**Data**: 15 de dezembro de 2025  
**Versão**: 1.0  
**Status**: Aguardando ações do Backoffice Dev Team
