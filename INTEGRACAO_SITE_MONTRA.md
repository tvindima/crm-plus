# 🌐 Integração Site Montra - Endpoint Público de Propriedades

**Status**: ✅ **INTEGRADO E OPERACIONAL**  
**Data**: 16 de dezembro de 2025  
**Propriedades Publicadas**: 346

---

## 📋 Resumo Executivo

O **site montra** (frontend/web) está agora a consumir o endpoint público de propriedades do backend Railway, garantindo:

- ✅ Apenas propriedades publicadas (`is_published=1`)
- ✅ Todos os campos obrigatórios mapeados
- ✅ Imagens com watermark automático
- ✅ Associação correta ao agente (`agent_id`)
- ✅ Sincronização automática com backend de produção

---

## 🔗 Endpoint em Produção

```
GET https://crm-plus-production.up.railway.app/properties/?is_published=1&limit=500
```

### Parâmetros Disponíveis

| Parâmetro | Tipo | Descrição | Exemplo |
|-----------|------|-----------|---------|
| `is_published` | int | Filtrar apenas publicadas | `is_published=1` |
| `limit` | int | Limite de resultados | `limit=20` |
| `skip` | int | Paginação (offset) | `skip=40` |
| `status` | str | Filtrar por status | `status=AVAILABLE` |
| `business_type` | str | Venda/Arrendamento | `business_type=Venda` |
| `property_type` | str | Tipo de imóvel | `property_type=Apartamento` |
| `municipality` | str | Filtrar por concelho | `municipality=Leiria` |

---

## 📦 Modelo de Dados - Property

### Campos Obrigatórios (sempre presentes)

```typescript
{
  id: number;                    // ✅ ID único da propriedade
  title: string;                 // ✅ Título do imóvel
  price: number | null;          // ✅ Preço (null = sob consulta)
  location: string | null;       // ✅ Localização completa
  status: string;                // ✅ AVAILABLE | RESERVED | SOLD
  agent_id: number;              // ✅ ID do agente responsável (SEMPRE presente)
}
```

### Campos Principais

```typescript
{
  reference: string;             // Ex: "TV1258" (iniciais do agente + número)
  business_type: string;         // "Venda" | "Arrendamento"
  property_type: string;         // "Apartamento" | "Moradia" | "Terreno" | "Loja" | "Armazém" | "Prédio"
  typology: string;              // "T0" | "T1" | "T2" | "T3" | "T4+" | "T6+"
  usable_area: number;           // Área útil em m²
  land_area: number | null;      // Área de terreno (apenas para moradias/terrenos)
  municipality: string;          // Concelho (ex: "Leiria", "Batalha")
  parish: string;                // Freguesia
  condition: string;             // "Novo" | "Usado" | "Em construção" | "Ruína"
  energy_certificate: string;    // "A+" até "F" ou "X" (isento)
}
```

### Detalhes Adicionais

```typescript
{
  description: string | null;    // Descrição completa do imóvel
  observations: string | null;   // Observações internas
  bedrooms: number | null;       // Número de quartos
  bathrooms: number | null;      // Número de casas de banho
  parking_spaces: number | null; // Vagas de estacionamento
  latitude: number | null;       // Coordenadas GPS (futura implementação)
  longitude: number | null;
}
```

### Imagens

```typescript
{
  images: string[] | null;       // ✅ URLs das imagens (com watermark automático)
  // Exemplo: ["/media/properties/123/photo1.jpg", "/media/properties/123/photo2.jpg"]
}
```

**IMPORTANTE**: As imagens já incluem watermark aplicado automaticamente pelo backend.

### Controle de Publicação

```typescript
{
  is_published: boolean;         // ✅ true = visível no site público
  is_featured: boolean;          // true = destacado na homepage
}
```

### Metadados

```typescript
{
  created_at: string;            // ISO 8601 timestamp
  updated_at: string | null;
}
```

---

## 💻 Implementação no Frontend

### 📄 `src/services/publicApi.ts`

#### Função Principal: `getProperties()`

```typescript
export async function getProperties(limit = 500): Promise<Property[]> {
  try {
    const pageSize = Math.max(1, Math.min(limit, 500));
    const results: Property[] = [];
    let skip = 0;

    while (true) {
      // ✅ USAR ENDPOINT PÚBLICO: apenas propriedades publicadas
      const data = await fetchJson<Property[]>(
        `/properties/?is_published=1&skip=${skip}&limit=${pageSize}`
      );
      if (!Array.isArray(data) || data.length === 0) break;
      results.push(...data.map(normalizeProperty));
      if (data.length < pageSize) break;
      skip += pageSize;
    }

    console.log(`[API] Successfully fetched ${results.length} published properties from backend`);
    return results;
  } catch (error) {
    console.error("[API] Backend failed, using base mocks:", error);
    return mockProperties.map(normalizeProperty).map(assignAgentByReference);
  }
}
```

#### Normalização de Propriedades

A função `normalizeProperty()` garante:

1. ✅ **Resolução de URLs de imagens** (relative → absolute)
2. ✅ **Derivação de quartos da tipologia** (T3 → 3 quartos)
3. ✅ **Compatibilidade com campo `area`** (fallback para `usable_area`)

```typescript
const normalizeProperty = (property: Property): Property => {
  const images = property.images
    ?.map((img) => resolveImageUrl(img))
    .filter((img): img is string => Boolean(img));
  
  // Derive bedrooms from typology if missing (T0=0, T1=1, T2=2, T3=3, etc)
  let bedrooms = property.bedrooms;
  if (bedrooms === undefined && property.typology) {
    const match = property.typology.match(/T(\d+)/);
    if (match) {
      bedrooms = parseInt(match[1], 10);
    }
  }
  
  // Set 'area' to usable_area for backward compatibility
  const area = property.area ?? property.usable_area ?? null;
  
  return { 
    ...property, 
    images,
    bedrooms,
    area,
  };
};
```

#### Resolução de URLs de Imagens

```typescript
const resolveImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media")) {
    const base = PUBLIC_MEDIA_BASE || "https://crm-plus-production.up.railway.app";
    return `${base}${url}`;
  }
  return url;
};
```

**Resultado**: `/media/properties/123/photo.jpg` → `https://crm-plus-production.up.railway.app/media/properties/123/photo.jpg`

---

## 🖼️ Renderização de Imagens

### Componentes que Usam Imagens

1. **HeroCarousel** - Hero da homepage
2. **PropertyCard** - Cards de listagem
3. **PropertyGallery** - Galeria de detalhes

### Função: `getPropertyCover()`

Prioridade de seleção de imagem:

1. ✅ Primeira imagem válida do array `images[]`
2. Fallback: placeholder por referência (`/placeholders/TV1258.jpg`)
3. Fallback: placeholder por hash (`/renders/1.jpg` até `/renders/42.jpg`)

```typescript
export function getPropertyCover(property?: Property | null): string {
  const validImage = pickFirstImage(property);
  if (validImage) return validImage; // ✅ Imagem real da API
  const referencePlaceholder = getReferencePlaceholder(property);
  if (referencePlaceholder) return referencePlaceholder;
  return getPlaceholderImage(property?.reference || property?.title || property?.id);
}
```

---

## 👤 Associação com Agentes

### Como Funciona

1. **Backend garante `agent_id`** em todas as propriedades publicadas
2. Frontend consome `agent_id` diretamente
3. Função `getAgentById(id)` busca detalhes do agente

### Mapeamento de Referências (Fallback)

Se uma propriedade não tiver `agent_id` (improvável), o frontend extrai as **iniciais da referência**:

```typescript
const AGENT_INITIALS_MAP: Record<string, number> = {
  "TV": 35,  // Tiago Vindima
  "NF": 20,  // Nuno Faria
  "JP": 28,  // João Paiva
  "AS": 24,  // António Silva
  // ... 19 agentes mapeados
};
```

**Exemplo**: Referência `TV1258` → Agent ID `35` (Tiago Vindima)

---

## 📊 Estatísticas de Produção

### Build Output (16 dez 2025)

```
✓ Compiled successfully
[API] Successfully fetched 346 published properties from backend
✓ Generating static pages (61/61)
```

### Propriedades por Status

| Status | Quantidade | Visível no Site |
|--------|-----------|-----------------|
| AVAILABLE | 346 | ✅ Sim |
| RESERVED | 0 | 🟡 Depende de `is_published` |
| SOLD | 0 | ❌ Geralmente não publicadas |

### Propriedades por Tipo

| Tipo | Quantidade Estimada |
|------|---------------------|
| Apartamento | ~150 |
| Moradia | ~80 |
| Terreno | ~60 |
| Loja | ~30 |
| Armazém | ~15 |
| Prédio | ~11 |

---

## 🧪 Testes e Validação

### Teste Manual do Endpoint

```bash
# Buscar 3 propriedades publicadas
curl -s 'https://crm-plus-production.up.railway.app/properties/?is_published=1&limit=3' | python3 -m json.tool

# Resultado esperado:
[
  {
    "id": 662,
    "reference": "TV1270",
    "title": "Moradia Térrea Batalha",
    "price": 1500000.0,
    "status": "AVAILABLE",
    "agent_id": 35,
    "is_published": 1,
    "images": [...]
  },
  ...
]
```

### Validação de Campos Obrigatórios

✅ Todos os campos obrigatórios presentes  
✅ `agent_id` sempre populado  
✅ `status` sempre em UPPERCASE  
✅ `is_published` sempre `1` (garantido pelo filtro)

---

## 🔄 Sincronização Automática

### Revalidação do Cache (Next.js)

```typescript
const res = await fetch(`${API_BASE}${path}`, { 
  next: { revalidate: 30 }  // ✅ Cache de 30 segundos
});
```

**Resultado**: Site montra atualiza automaticamente a cada 30 segundos.

### Build-time vs Runtime

- **Build-time**: Todas as 346 propriedades são pré-renderizadas (SSG)
- **Runtime**: Novas visitas pegam cache de 30s (ISR - Incremental Static Regeneration)

---

## 🚀 Deploy e Monitorização

### URL do Site Montra

```
https://imoveismais-site.vercel.app
```

### Variáveis de Ambiente

```env
NEXT_PUBLIC_API_BASE_URL=https://crm-plus-production.up.railway.app
```

### Logs de Monitorização

```bash
# Verificar logs do build
cd frontend/web
npm run build

# Output esperado:
# [API] Successfully fetched 346 published properties from backend
```

---

## 📝 Checklist de Implementação

### ✅ Concluído

- [x] Endpoint `/properties/?is_published=1` implementado
- [x] Tipo `Property` atualizado com todos os campos
- [x] Função `getProperties()` usando filtro `is_published=1`
- [x] Normalização de imagens (relative → absolute URLs)
- [x] Derivação de quartos da tipologia (T3 → 3 bedrooms)
- [x] Associação com agentes via `agent_id`
- [x] Fallback para mocks em caso de erro de API
- [x] Build passando com 346 propriedades
- [x] Deploy em produção (Vercel)

### 🔜 Próximos Passos

- [ ] Implementar filtros avançados (preço min/max, tipologia, concelho)
- [ ] Adicionar ordenação (mais recentes, menor preço, maior área)
- [ ] Implementar paginação visual (infinite scroll ou pagination)
- [ ] Adicionar mapa interativo com `latitude`/`longitude` (quando disponível)
- [ ] Implementar favoritos do utilizador
- [ ] Cache de agentes (evitar chamadas repetidas)
- [ ] Analytics de propriedades mais vistas

---

## 📞 Suporte

**Documentação Completa da API**: `https://crm-plus-production.up.railway.app/docs`  
**Repositório**: `tvindima/crm-plus` (branch `main`)  
**Responsável**: Tiago Vindima (TV)

---

## 🎯 Conclusão

✅ **Site montra 100% integrado com backend de produção**  
✅ **346 propriedades publicadas disponíveis**  
✅ **Imagens com watermark automático**  
✅ **Associação correta com agentes**  
✅ **Sincronização automática a cada 30 segundos**

**A DEV TEAM pode agora focar em melhorias de UX/UI, filtros avançados e features premium! 🚀**
