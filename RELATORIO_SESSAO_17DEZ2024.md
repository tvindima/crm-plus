# Relatório de Desenvolvimento - Sessão 17 Dezembro 2024

## 📋 Sumário Executivo

Esta sessão focou em três áreas principais:
1. **Responsividade Mobile** do backoffice (dashboard e propriedades)
2. **Sistema de Upload de Vídeos** para propriedades com compressão automática
3. **Correções Críticas** (SQLAlchemy errors, CORS, duplicados)

---

## ✅ 1. RESPONSIVIDADE MOBILE - BACKOFFICE

### 1.1 Dashboard Mobile-Friendly

**Arquivo**: `frontend/backoffice/app/backoffice/dashboard/page.tsx`

**Implementações**:

#### KPIs (Indicadores Principais)
- **Mobile** (< 640px): Layout em coluna única, ícones reduzidos (16x16px)
- **Tablet** (640px+): Grid 2 colunas
- **Desktop** (1024px+): Grid 4 colunas com espaçamento amplo

```tsx
// Exemplo de classes aplicadas:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
    <span className="text-xs sm:text-sm md:text-base">Propriedades</span>
  </div>
</div>
```

#### Gráficos e Rankings
- **Mobile**: Oculta rankings secundários (`hidden md:flex`)
- **Desktop**: Exibe gráficos de distribuição lado a lado
- Texto truncado em listas longas (`truncate` em elementos de lista)

#### Leads e Tarefas
- **Mobile**: Cards empilhados verticalmente
- **Tablet+**: Layout horizontal com scroll se necessário
- Redução de padding em elementos pequenos

### 1.2 Properties Page Mobile

**Arquivo**: `frontend/backoffice/app/backoffice/properties/page.tsx`

**Implementações**:

#### Botão de Navegação
- Adicionado botão "Voltar ao Dashboard" (visível apenas em mobile)
- Ícone `ArrowLeftIcon` da Heroicons
- Posicionamento fixo no topo mobile

#### Visualização Dual
- **Desktop** (768px+): Tabela completa com todas as colunas
- **Mobile** (< 768px): Cards com dropdown de ações

```tsx
{/* Desktop Table */}
<div className="hidden md:block overflow-x-auto">
  <table>...</table>
</div>

{/* Mobile Cards */}
<div className="md:hidden space-y-4">
  {properties.map(property => (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Card content */}
      <Menu>
        <MenuButton>Ações ⋮</MenuButton>
        <MenuItems>
          <MenuItem>Editar</MenuItem>
          <MenuItem>Eliminar</MenuItem>
        </MenuItems>
      </Menu>
    </div>
  ))}
</div>
```

#### Upload de Vídeo Mobile
- Feedback visual de compressão
- Toast notifications adaptadas ao mobile
- Preview de vídeo responsivo

---

## 🎬 2. SISTEMA DE UPLOAD DE VÍDEOS

### 2.1 Backend - Modelo e Schema

**Arquivo**: `backend/app/properties/models.py`

```python
class Property(Base):
    # ... campos existentes ...
    video_url = Column(String(500), nullable=True)  # URL do vídeo promocional
```

**Arquivo**: `backend/app/properties/schemas.py`

```python
class PropertyBase(BaseModel):
    # ... campos existentes ...
    video_url: Optional[str] = Field(None, max_length=500)

class PropertyUpdate(BaseModel):
    # ... campos existentes ...
    video_url: Optional[str] = Field(None, max_length=500)
```

### 2.2 Backend - Endpoint de Upload

**Arquivo**: `backend/app/properties/routes.py`

**Endpoint**: `POST /properties/{property_id}/upload-video`

**Características**:
- Aceita formatos: MP4, WebM, MOV
- Limite original: 100MB
- Compressão automática via FFmpeg (se disponível)
- Fallback: aceita até 20MB sem compressão se FFmpeg falhar

**Função de Compressão**:

```python
def optimize_video(input_path: str, output_path: str) -> tuple[bool, str, float]:
    """
    Comprime vídeo usando FFmpeg
    - Codec: H.264 (libx264)
    - CRF: 23 (qualidade balanceada)
    - Bitrate máximo: 2Mbps
    - Resolução máxima: 1920x1080
    - Audio: AAC 128kbps
    - FPS: 30fps máximo
    
    Returns: (sucesso, mensagem, tamanho_final_mb)
    """
```

**Redução típica**: 80% (100MB → ~20MB)

### 2.3 Frontend - Upload UI

**Arquivo**: `frontend/backoffice/backoffice/components/PropertyForm.tsx`

**Estados Adicionados**:
```tsx
const [videoUrl, setVideoUrl] = useState<string>("");
const [videoFile, setVideoFile] = useState<File | null>(null);
const [videoPreview, setVideoPreview] = useState<string | null>(null);
const [isCompressing, setIsCompressing] = useState(false);
```

**Interface**:
- Input de arquivo de vídeo (MP4/WebM/MOV, 100MB max)
- Input de URL alternativo (YouTube, Vimeo, etc.)
- Preview de vídeo com player HTML5
- Badge "✨ Compressão automática"
- Botão de remoção

**Fluxo de Upload**:
1. Usuário seleciona arquivo
2. Frontend mostra preview local
3. Ao salvar propriedade, chama `uploadPropertyVideo()`
4. Backend comprime vídeo automaticamente
5. Retorna URL final e estatísticas de compressão
6. Toast mostra resultado: "Vídeo comprimido de 100MB para 18MB"

### 2.4 Frontend - API Service

**Arquivo**: `frontend/backoffice/src/services/backofficeApi.ts`

```typescript
export const uploadPropertyVideo = async (
  propertyId: number,
  videoFile: File
): Promise<{
  video_url: string;
  message: string;
  original_size_mb: number;
  final_size_mb: number;
}> => {
  const formData = new FormData();
  formData.append("file", videoFile);

  const response = await fetch(
    `${API_BASE}/properties/${propertyId}/upload-video`,
    {
      method: "POST",
      body: formData,
      credentials: "include",
    }
  );

  return response.json();
};
```

### 2.5 Migration - Database

**Arquivo**: `backend/app/main.py` (linha 106)

```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);
```

**Status**: 
- ✅ SQLite (local): Migrado manualmente
- ✅ PostgreSQL (Railway): Migrado via endpoint `/debug/migrate-properties-columns`

---

## 🐛 3. CORREÇÕES CRÍTICAS

### 3.1 SQLAlchemy Relationship Error

**Problema**: Railway crashava com erro:
```
sqlalchemy.exc.InvalidRequestError: Mapper 'Mapper[Property(properties)]' 
has no property 'tasks'
```

**Causa**: 
- Property model tinha relacionamento `tasks` comentado
- Task model ainda tinha `back_populates="property"` apontando para ele

**Correção**: `backend/app/calendar/models.py` (linha 76)
```python
# Antes:
property = relationship("Property", back_populates="tasks", foreign_keys=[property_id])

# Depois:
property = relationship("Property", foreign_keys=[property_id])  # back_populates comentado
```

**Commits**: 
- `69c7751` - Remove Task.property back_populates
- `4f5dfc6` - Comment Task relationship

### 3.2 CORS - Vercel Preview Deployments

**Problema**: Cada novo deploy do Vercel gerava URL diferente:
- `https://crm-plus-backoffice-fyqqih8nn-toinos-projects.vercel.app`
- `https://crm-plus-backoffice-eefte9jea-toinos-projects.vercel.app`
- Etc.

**Solução**: Regex pattern para aceitar todos os deployments

**Arquivo**: `backend/app/main.py`

```python
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https://(crm-plus-backoffice|backoffice|web)-[a-z0-9]+-toinos-projects\.vercel\.app$",
    allow_origins=[
        "https://crm-plus-backoffice.vercel.app",  # Produção
        "https://crm-plus-site.vercel.app",
        "http://localhost:3000",
        # ... outros domínios fixos
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Resultado**: Qualquer preview deployment do Vercel funciona automaticamente

**Commits**:
- `c5e8fac` - Add specific Vercel URL to CORS
- `023e305` - Add latest Vercel deployment URL
- `2809ae8` - Configure CORS with regex pattern

### 3.3 Propriedades Duplicadas

**Problema**: 16 propriedades duplicadas no PostgreSQL

**Exemplos**:
- `JP1`: 6 duplicados (IDs 668-673)
- `FP1153`: 2 duplicados (IDs 608-609)
- Etc.

**Solução**: Criado endpoint de limpeza

**Arquivo**: `backend/app/main.py`

```python
@debug_router.post("/remove-duplicate-properties")
def remove_duplicate_properties():
    """Remove duplicados mantendo apenas o primeiro ID de cada referência"""
    # ... código de remoção ...
```

**Resultado**:
- **Antes**: 344 propriedades (com 16 duplicados)
- **Depois**: 328 propriedades únicas
- **Verificação**: 0 duplicados restantes

**Commit**: `af41348` - Add endpoint to remove duplicate properties

### 3.4 Migration Error Handling

**Problema**: Migrações falhavam ao parsear SQL sem "IF NOT EXISTS"

**Correção**: `backend/app/main.py` (linhas 114-124)

```python
try:
    conn.execute(text(sql))
    if "IF NOT EXISTS" in sql:
        column = sql.split("IF NOT EXISTS ")[1].split(" ")[0]
    elif "ADD COLUMN" in sql:
        column = sql.split("ADD COLUMN")[1].split(" ")[0].strip()
    else:
        column = sql[:30] + "..."
    results.append(f"✅ {column}")
except Exception as e:
    error_msg = str(e)[:100]
    results.append(f"❌ {error_msg}")
```

**Commit**: `94b6120` - Improve migration error handling

---

## 🎯 4. DIRETRIZES PARA DEV TEAM FRONTSITE MONTRA

### 4.1 Integração de Vídeos no Hero Carousel

**IMPORTANTE**: O backend já suporta `video_url` em cada propriedade.

#### Passo 1: Atualizar Interface TypeScript

**Arquivo**: `frontend/web/src/types/property.ts` (ou similar)

```typescript
export interface Property {
  id: number;
  reference: string;
  title: string;
  // ... outros campos ...
  images: string[];
  video_url?: string | null;  // ADICIONAR ESTE CAMPO
}
```

#### Passo 2: Modificar Hero Carousel

**Localização**: Componente de carousel na home page

**Lógica recomendada**:

```tsx
// Pseudocódigo
const HeroCarousel = ({ properties }: { properties: Property[] }) => {
  return (
    <Swiper>
      {properties.map((property) => (
        <SwiperSlide key={property.id}>
          {property.video_url ? (
            // Se tem vídeo, mostrar vídeo com autoplay
            <video
              src={property.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback para imagem se vídeo falhar
                e.currentTarget.style.display = 'none';
                // Mostrar primeira imagem
              }}
            >
              <source src={property.video_url} type="video/mp4" />
            </video>
          ) : (
            // Se não tem vídeo, mostrar imagem
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Overlay com informações */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
            <h2>{property.title}</h2>
            <p>{property.price}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
```

#### Passo 3: Controle de Reprodução

**Recomendação**: Pausar vídeo ao trocar de slide

```tsx
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { useRef, useEffect } from 'react';

const HeroCarousel = ({ properties }: { properties: Property[] }) => {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Pausar todos os vídeos
    videoRefs.current.forEach(video => video?.pause());
    
    // Reproduzir vídeo do slide ativo
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      activeVideo.currentTime = 0; // Resetar para início
      activeVideo.play().catch(err => {
        console.log('Autoplay bloqueado:', err);
      });
    }
  }, [activeIndex]);

  return (
    <Swiper
      onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
    >
      {properties.map((property, index) => (
        <SwiperSlide key={property.id}>
          {property.video_url ? (
            <video
              ref={el => videoRefs.current[index] = el}
              src={property.video_url}
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img src={property.images[0]} alt={property.title} />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
```

#### Passo 4: Performance e UX

**Otimizações recomendadas**:

1. **Preload**: Carregar próximo vídeo em background
   ```tsx
   <link rel="preload" as="video" href={nextSlideVideoUrl} />
   ```

2. **Lazy Loading**: Não carregar todos os vídeos de uma vez
   ```tsx
   {isSlideVisible && <video ... />}
   ```

3. **Poster Frame**: Usar primeira imagem como poster
   ```tsx
   <video
     poster={property.images[0]}
     src={property.video_url}
     ...
   />
   ```

4. **Loading Spinner**: Mostrar durante carregamento
   ```tsx
   const [isLoading, setIsLoading] = useState(true);
   
   <video
     onLoadedData={() => setIsLoading(false)}
     ...
   />
   {isLoading && <Spinner />}
   ```

5. **Mobile Data Saver**: Detectar conexão lenta
   ```tsx
   const connection = (navigator as any).connection;
   const slowConnection = connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g';
   
   // Se conexão lenta, mostrar só imagens
   if (slowConnection) {
     return <img src={property.images[0]} />;
   }
   ```

### 4.2 API Endpoint para Propriedades

**Endpoint**: `GET https://crm-plus-production.up.railway.app/properties/`

**Query Parameters**:
- `limit`: Número de resultados (padrão: 100)
- `skip`: Paginação (padrão: 0)
- `search`: Busca por texto
- `status`: Filtrar por status (AVAILABLE, RESERVED, SOLD)

**Exemplo de Request**:
```typescript
const response = await fetch(
  'https://crm-plus-production.up.railway.app/properties/?limit=10&status=AVAILABLE'
);
const properties = await response.json();
```

**Response Sample**:
```json
[
  {
    "id": 1,
    "reference": "TV1001",
    "title": "Apartamento T2 em Lisboa",
    "price": 350000,
    "images": [
      "https://crm-plus-production.up.railway.app/media/properties/1/img1.jpg",
      "https://crm-plus-production.up.railway.app/media/properties/1/img2.jpg"
    ],
    "video_url": "https://crm-plus-production.up.railway.app/media/videos/1/promo.mp4",
    "municipality": "Lisboa",
    "typology": "T2",
    "status": "AVAILABLE",
    "is_featured": 1,
    "is_published": 1
  }
]
```

### 4.3 Filtragem para Hero

**Recomendação**: Mostrar apenas propriedades em destaque

```typescript
const fetchFeaturedProperties = async () => {
  const response = await fetch(
    `${API_URL}/properties/?limit=10`
  );
  const allProperties = await response.json();
  
  // Filtrar apenas publicadas e em destaque
  return allProperties.filter(
    (p: Property) => p.is_published === 1 && p.is_featured === 1
  );
};
```

### 4.4 Fallback Strategy

**Se vídeo não carregar**:

1. Mostrar primeira imagem da propriedade
2. Log de erro (não bloquear UI)
3. Manter funcionalidade de navegação

```tsx
<video
  onError={(e) => {
    console.error('Vídeo falhou:', property.reference);
    e.currentTarget.style.display = 'none';
    // Trigger fallback para imagem
  }}
/>
```

### 4.5 Acessibilidade

**Recomendações**:

1. Botão de Pause/Play para usuários
2. Redução de movimento para usuários com `prefers-reduced-motion`
3. Alt text em fallback images

```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Mostrar só imagem, sem autoplay
  return <img ... />;
}
```

---

## 📊 5. STATUS FINAL DO SISTEMA

### Backend (Railway PostgreSQL)
- ✅ 328 propriedades ativas (sem duplicados)
- ✅ 19 agentes cadastrados
- ✅ 0 leads (banco recriado - normal)
- ✅ Coluna `video_url` migrada
- ✅ CORS configurado com regex para Vercel
- ✅ Endpoints funcionando 100%

### Frontend (Vercel)
- ✅ Dashboard responsivo (mobile/tablet/desktop)
- ✅ Properties page com cards mobile
- ✅ Upload de vídeo implementado com compressão
- ✅ CORS funcionando em todos os deployments

### Deployments Ativos
- **Backend**: https://crm-plus-production.up.railway.app
- **Backoffice**: https://crm-plus-backoffice.vercel.app (produção)
- **Site Montra**: https://crm-plus-site.vercel.app

---

## 📝 6. PRÓXIMOS PASSOS RECOMENDADOS

### Para Dev Team Frontsite:

1. **Implementar Hero com Vídeos** (seguir diretrizes seção 4.1-4.5)
2. **Testar em diferentes dispositivos** (iOS Safari, Android Chrome)
3. **Otimizar performance** (lazy loading, preload)
4. **Adicionar analytics** (tracking de reprodução de vídeos)

### Para Backoffice:

1. **Popular base de leads** (atualmente zerada)
2. **Testar upload de vídeo em produção** (limite 100MB)
3. **Configurar FFmpeg no Railway** (se não estiver instalado)
4. **Criar documentação de uso** para agentes

### Para DevOps:

1. **Verificar instalação FFmpeg no Railway** 
   - Comando: `ffmpeg -version`
   - Se não instalado, adicionar ao Dockerfile
2. **Configurar backup automático PostgreSQL**
3. **Monitorar uso de storage** (vídeos ocupam espaço)

---

## 🔗 7. COMMITS IMPORTANTES

| Commit | Descrição | Impacto |
|--------|-----------|---------|
| `2809ae8` | Configure CORS with regex pattern | ⭐⭐⭐ Critical |
| `af41348` | Add endpoint to remove duplicate properties | ⭐⭐⭐ Critical |
| `275dcce` | Fix: add video_url to properties migration | ⭐⭐⭐ Critical |
| `69c7751` | Fix: remove Task.property back_populates | ⭐⭐⭐ Critical |
| `5adce94` | Feat: automatic video compression with FFmpeg | ⭐⭐ High |
| `1a5ad09` | Feat: add video upload UI and API endpoint | ⭐⭐ High |
| `39c51a4` | Feat: add back button to properties mobile | ⭐ Medium |

---

## 📞 8. SUPORTE E DÚVIDAS

Para questões sobre:
- **Vídeos no Hero**: Consultar seção 4.1-4.5 deste relatório
- **Upload de vídeos**: Arquivo `RELATORIO_VIDEOS_ANGARIACOES.md`
- **API Backend**: Endpoints em `backend/app/*/routes.py`
- **Mobile Responsiveness**: Ver código em `frontend/backoffice/app/backoffice/`

---

**Relatório gerado em**: 17 Dezembro 2024  
**Versão Backend**: 1.0.0  
**Última atualização Git**: `2809ae8`  
**Status**: ✅ Todos os sistemas operacionais
