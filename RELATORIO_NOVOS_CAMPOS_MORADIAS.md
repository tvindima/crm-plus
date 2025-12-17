# 📋 RELATÓRIO: Novos Campos para Moradias - Backend & Backoffice

**Data:** 17 de dezembro de 2025  
**Responsável:** AI Agent  
**Destinatário:** Dev Team Backoffice

---

## 🎯 OBJETIVO

Adicionar campos ao modelo `Property` para diferenciar **Moradias Individuais** de **Moradias Geminadas**, permitindo filtros específicos no site montra.

---

## 📊 CAMPOS A CRIAR

### 1. **Campo: `house_type`** (Tipo de Moradia)

**Tipo:** `ENUM` ou `VARCHAR(50)`  
**Valores possíveis:**
- `individual` (Moradia Individual)
- `geminada` (Moradia Geminada)
- `banda` (Moradia em Banda)
- `null` (Outros tipos de imóveis ou não aplicável)

**Aplicável a:** Apenas propriedades com `property_type = "Moradia"` ou `property_type = "Villa"`

---

## 🗄️ ALTERAÇÕES NO BACKEND

### **1. Modelo SQLAlchemy (`backend/app/models/property.py`)**

```python
class Property(Base):
    __tablename__ = "properties"
    
    # ... campos existentes ...
    
    # ✅ NOVO CAMPO
    house_type = Column(String(50), nullable=True)  # 'individual', 'geminada', 'banda'
```

### **2. Schema Pydantic (`backend/app/schemas/property.py`)**

```python
from typing import Optional, Literal

# ✅ Type hint para validação
HouseType = Literal["individual", "geminada", "banda"]

class PropertyBase(BaseModel):
    # ... campos existentes ...
    
    # ✅ NOVO CAMPO
    house_type: Optional[HouseType] = None

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(PropertyBase):
    pass

class Property(PropertyBase):
    id: int
    # ... outros campos ...
    house_type: Optional[str] = None
```

### **3. Migration Alembic**

```bash
cd backend
alembic revision -m "add_house_type_to_properties"
```

**Arquivo gerado:** `backend/alembic/versions/XXXX_add_house_type_to_properties.py`

```python
def upgrade():
    op.add_column('properties', 
        sa.Column('house_type', sa.String(50), nullable=True)
    )

def downgrade():
    op.drop_column('properties', 'house_type')
```

**Executar migration:**
```bash
alembic upgrade head
```

### **4. API Endpoint de Filtro**

Atualizar `GET /properties/` para aceitar filtro:

```python
# backend/app/api/properties.py

@router.get("/", response_model=List[PropertySchema])
async def get_properties(
    skip: int = 0,
    limit: int = 100,
    is_published: Optional[int] = None,
    house_type: Optional[str] = None,  # ✅ NOVO FILTRO
    db: Session = Depends(get_db)
):
    query = db.query(Property)
    
    if is_published is not None:
        query = query.filter(Property.is_published == is_published)
    
    # ✅ NOVO FILTRO
    if house_type:
        query = query.filter(Property.house_type == house_type)
    
    properties = query.offset(skip).limit(limit).all()
    return properties
```

---

## 🖥️ ALTERAÇÕES NO BACKOFFICE (Frontend)

### **1. Formulário de Criação/Edição de Imóveis**

**Arquivo:** `frontend/backoffice/app/backoffice/properties/[id]/page.tsx` ou similar

**Adicionar campo condicional:**

```tsx
{/* ✅ NOVO CAMPO - Mostrar apenas se property_type = Moradia */}
{formData.property_type?.toLowerCase().includes('moradia') && (
  <div>
    <label className="block text-sm font-medium text-[#C5C5C5] mb-2">
      Tipo de Moradia
    </label>
    <select
      value={formData.house_type || ''}
      onChange={(e) => setFormData({ ...formData, house_type: e.target.value })}
      className="w-full rounded-lg border border-[#2A2A2E] bg-[#0F0F10] px-4 py-2 text-white"
    >
      <option value="">Não especificado</option>
      <option value="individual">Individual</option>
      <option value="geminada">Geminada</option>
      <option value="banda">Em Banda</option>
    </select>
  </div>
)}
```

### **2. Tabela de Listagem**

**Adicionar coluna opcional:**

```tsx
// backend/app/backoffice/properties/page.tsx

columns={[
  "Referência", 
  "Negócio", 
  "Tipo", 
  "Tipo Moradia", // ✅ NOVA COLUNA
  "Tipologia", 
  // ...
]}

rows={filtered.map((p) => [
  p.reference || "—",
  p.business_type || "—",
  p.property_type || "—",
  p.house_type ? p.house_type.charAt(0).toUpperCase() + p.house_type.slice(1) : "—", // ✅ NOVA CÉLULA
  p.typology || "—",
  // ...
])}
```

---

## 🔄 MIGRAÇÃO DE DADOS EXISTENTES

### **Script de Migração Automática**

```python
# backend/scripts/migrate_house_types.py

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Property

def migrate_house_types():
    """
    Analisar descrição/observações e inferir house_type
    """
    db: Session = SessionLocal()
    
    try:
        moradias = db.query(Property).filter(
            Property.property_type.ilike('%moradia%')
        ).all()
        
        updated = 0
        for moradia in moradias:
            description_lower = (moradia.description or "").lower()
            observations_lower = (moradia.observations or "").lower()
            combined = f"{description_lower} {observations_lower}"
            
            # Inferir tipo
            if "geminada" in combined:
                moradia.house_type = "geminada"
                updated += 1
            elif "banda" in combined:
                moradia.house_type = "banda"
                updated += 1
            elif "isolada" in combined or "individual" in combined:
                moradia.house_type = "individual"
                updated += 1
            # else: deixar null para preenchimento manual
        
        db.commit()
        print(f"✅ {updated} moradias atualizadas com house_type")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    migrate_house_types()
```

**Executar:**
```bash
cd backend
source .venv/bin/activate
python scripts/migrate_house_types.py
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### **Backend:**
- [ ] Adicionar campo `house_type` ao modelo `Property`
- [ ] Criar migration Alembic
- [ ] Executar migration no Railway PostgreSQL
- [ ] Atualizar schemas Pydantic
- [ ] Adicionar filtro `house_type` ao endpoint `/properties/`
- [ ] Executar script de migração automática (opcional)
- [ ] Testar API com Postman/cURL

### **Backoffice:**
- [ ] Adicionar campo no formulário de criação
- [ ] Adicionar campo no formulário de edição
- [ ] Mostrar campo apenas para `property_type = Moradia`
- [ ] Adicionar coluna na tabela de listagem (opcional)
- [ ] Testar criação/edição de moradias

### **Validação:**
- [ ] Criar moradia individual e verificar no site montra
- [ ] Criar moradia geminada e verificar no site montra
- [ ] Testar filtros nas galerias "Moradias Individuais" e "Moradias Geminadas"

---

## 🎨 FILTROS NO SITE MONTRA (Já Implementados)

### **Galeria: Moradias Individuais**
```typescript
filter: (items) =>
  items.filter(
    (p) =>
      ((p.property_type ?? "").toLowerCase().includes("moradia") ||
       (p.property_type ?? "").toLowerCase().includes("villa")) &&
      // ✅ Quando house_type estiver disponível:
      // p.house_type === "individual"
      // ✅ Temporário (até migration):
      !(p.description ?? "").toLowerCase().includes("geminada")
  )
```

### **Galeria: Moradias Geminadas**
```typescript
filter: (items) =>
  items.filter(
    (p) =>
      ((p.property_type ?? "").toLowerCase().includes("moradia") ||
       (p.property_type ?? "").toLowerCase().includes("villa")) &&
      // ✅ Quando house_type estiver disponível:
      // p.house_type === "geminada"
      // ✅ Temporário (até migration):
      (p.description ?? "").toLowerCase().includes("geminada")
  )
```

---

## 📝 NOTAS IMPORTANTES

1. **Compatibilidade:** Campo `house_type` é `nullable=True`, não quebra imóveis existentes
2. **Filtros temporários:** Site montra usa descrição/observações até migration completar
3. **Prioridade:** Após migration, atualizar filtros do site para usar `p.house_type`
4. **Validação:** Dropdown no backoffice evita valores inválidos

---

## 🚀 PRÓXIMOS PASSOS

1. **Dev Team Backend:** Implementar model + migration + API
2. **Dev Team Backoffice:** Adicionar campo no formulário
3. **QA:** Testar criação/edição de moradias
4. **Migração:** Executar script em produção (Railway)
5. **Atualizar Site Montra:** Trocar filtros temporários por `house_type`

---

**Contacto para dúvidas:** AI Agent  
**Repositório:** `github.com/tvindima/crm-plus`
