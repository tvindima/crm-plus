# ✅ Sistema de Criação/Edição de Propriedades - Backoffice

## Status: Implementação Completa ✓

### 📦 O que foi implementado:

#### Backend (Python/FastAPI):
- ✅ Modelo `Property` atualizado com 7 novos campos:
  - `is_published` (0=rascunho, 1=publicado)
  - `is_featured` (0=normal, 1=destaque)
  - `latitude` e `longitude` (geolocalização)
  - `bedrooms`, `bathrooms`, `parking_spaces` (características)
- ✅ Schemas `PropertyBase`, `PropertyCreate`, `PropertyUpdate` atualizados
- ✅ Endpoints mantidos: POST `/properties/`, PUT `/properties/{id}`, POST `/properties/{id}/upload`
- ✅ Migração SQL criada: `backend/migrate_add_display_fields.sql`

#### Frontend Backoffice (Next.js):
- ✅ **Proxies API criados** (autenticação via cookie):
  - `/api/properties/create` - criar propriedade
  - `/api/properties/[id]` - obter/atualizar/deletar
  - `/api/properties/[id]/upload` - upload de imagens
- ✅ **Serviço `backofficeApi.ts` atualizado**:
  - `createBackofficeProperty()` usa proxy local
  - `updateBackofficeProperty()` usa proxy local
  - `uploadPropertyImages()` usa proxy local
- ✅ **Formulário `PropertyForm` melhorado**:
  - Nova seção: **Características** (quartos, casas de banho, estacionamento)
  - Nova seção: **Geolocalização** (latitude, longitude com placeholder)
  - Nova seção: **Visibilidade no Site** (publicado ✓, destaque ⭐)
  - Feedback visual em tempo real para visibilidade
  - Validações melhoradas

---

## 🚀 Como Testar (End-to-End):

### 1. Migração Railway (OBRIGATÓRIO):
```bash
# Opção A: Railway Dashboard
# 1. Acesse https://railway.app
# 2. Selecione PostgreSQL > Query
# 3. Execute o conteúdo de: backend/migrate_add_display_fields.sql

# Opção B: Railway CLI
cd backend
railway run psql -c "ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_published INTEGER DEFAULT 1, ADD COLUMN IF NOT EXISTS is_featured INTEGER DEFAULT 0, ADD COLUMN IF NOT EXISTS latitude REAL, ADD COLUMN IF NOT EXISTS longitude REAL, ADD COLUMN IF NOT EXISTS bedrooms INTEGER, ADD COLUMN IF NOT EXISTS bathrooms INTEGER, ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;"
```

### 2. Criar Nova Propriedade via Backoffice:
1. Acesse: https://crm-plus-backoffice.vercel.app
2. Login: `faturacao@imoveismais.pt` / `123456`
3. Navegue para: **Imóveis** → **Novo Imóvel**
4. Preencha o formulário:
   - **Identificação**: Referência (ex: TEST001), Título
   - **Tipo de Negócio**: Venda, Apartamento, T2
   - **Valores e Áreas**: Preço €150000, Área útil 100m²
   - **Características**: 2 quartos, 1 casa de banho, 1 estacionamento
   - **Localização**: Leiria / Leiria, Pousos, Barreira e Cortes
   - **Geolocalização**: Latitude 39.7492, Longitude -8.8076
   - **Visibilidade**: ✓ Publicado, ✓ Destaque
   - **Imagens**: Upload mínimo 1 foto
5. Clique em: **Guardar Imóvel**

### 3. Verificar no Site Montra:
1. Acesse: https://crm-plus-site.vercel.app (ou localhost:3001)
2. Verifique se a propriedade aparece em:
   - ✅ **Home** (se marcada como Destaque)
   - ✅ **Listagem de Imóveis** (`/properties`)
   - ✅ **Página de Detalhes** (`/properties/[reference]`)
   - ✅ **Perfil do Agente** (`/agentes/[slug]`)
   - ✅ **Resultados de Pesquisa**

### 4. Validações Esperadas:
- [ ] Propriedade criada com sucesso (sem erros 401/403)
- [ ] Imagens carregadas corretamente
- [ ] Campos opcionais (quartos, estacionamento) salvos
- [ ] Propriedade aparece no site se `is_published = 1`
- [ ] Propriedade NÃO aparece se `is_published = 0` (rascunho)
- [ ] Propriedade aparece em destaque na home se `is_featured = 1`
- [ ] Geolocalização funciona (mapa exibido se lat/lng definidos)

---

## 📝 Campos do Formulário:

### Obrigatórios (*):
- Referência
- Preço
- Pelo menos 1 imagem

### Opcionais (mas recomendados):
- Título (usa referência se vazio)
- Tipo de negócio (Venda/Arrendamento)
- Tipo de imóvel (Apartamento/Moradia/...)
- Tipologia (T0-T6+)
- Quartos, Casas de Banho, Estacionamento
- Áreas (útil, terreno)
- Localização (concelho, freguesia, morada)
- Geolocalização (latitude, longitude)
- Estado (Novo/Usado/...)
- Certificado Energético (A+ a F)
- Descrição pública
- Observações internas

### Visibilidade:
- **Publicado**: Se desmarcado, imóvel fica em rascunho (não aparece no site)
- **Destaque**: Se marcado, imóvel aparece na home e em posição privilegiada

---

## 🔒 Autenticação:

Todos os endpoints de criação/edição requerem autenticação:
- Cookie `crmplus_staff_session` com JWT válido
- Proxies Next.js extraem cookie e enviam `Authorization: Bearer {token}` para Railway
- Backend verifica JWT via `require_staff` dependency

---

## 🐛 Debug/Troubleshooting:

### Erro 401 Unauthorized:
- Verificar se cookie `crmplus_staff_session` existe
- Re-fazer login no backoffice
- Verificar logs do proxy: `/api/properties/create`

### Erro 500 ao criar:
- Verificar migração executada no Railway
- Verificar logs do backend Railway: `railway logs --service backend`
- Campos obrigatórios: `reference`, `price`, `images`

### Propriedade não aparece no site:
- Verificar se `is_published = 1`
- Verificar se status = `AVAILABLE` (não `SOLD` ou `RESERVED`)
- Limpar cache do site montra
- Verificar query do site: deve filtrar `is_published = 1`

### Upload de imagens falha:
- Tamanho máximo: 5MB por ficheiro
- Tipos permitidos: apenas imagens (image/*)
- Verificar permissões da pasta `media/properties/`

---

## 📊 Próximos Passos (Opcional):

1. **Auto-preencher geolocalização**: Integrar Google Maps API para obter lat/lng automaticamente
2. **Preview de imagens**: Mostrar thumbnails durante upload
3. **Validação de campos**: Email do agente responsável
4. **Histórico de alterações**: Log de quem criou/editou cada propriedade
5. **Duplicação rápida**: Copiar propriedade existente como template
6. **Import em massa**: CSV/Excel upload para múltiplas propriedades

---

## ✅ Checklist de Testes:

- [ ] Migração Railway executada com sucesso
- [ ] Criar propriedade via backoffice (todos os campos)
- [ ] Upload de 3+ imagens
- [ ] Propriedade aparece no site montra
- [ ] Propriedade aparece na listagem do agente correto
- [ ] Editar propriedade existente
- [ ] Marcar/desmarcar "Publicado" e verificar visibilidade
- [ ] Marcar/desmarcar "Destaque" e verificar home
- [ ] Deletar propriedade (se necessário)

---

**Implementado por**: GitHub Copilot + Tiago Vindima  
**Data**: 16 de Dezembro de 2025  
**Versão**: 1.0.0
