# 🎥 RELATÓRIO: Adicionar Vídeos às Angariações

**Data**: 17 de dezembro de 2025  
**Prioridade**: 🟡 MÉDIA  
**Autor**: Tiago Vindima  
**Destinatário**: Dev Team (Backend + Backoffice)

---

## 📋 Resumo Executivo

Adicionar funcionalidade de upload e gestão de **vídeos** às propriedades/angariações, permitindo que cada imóvel possa ter um vídeo promocional associado. O vídeo será exibido no **Hero Carousel** do site montra (https://imoveismais-site.vercel.app) com autoplay automático.

**Estado Atual**:
- ✅ Frontend (site montra) já preparado para receber `video_url`
- ✅ Autoplay implementado no `HeroCarousel.tsx`
- ❌ Backend não tem campo `video_url` no modelo Property
- ❌ Backoffice não tem interface para upload de vídeos

---

## 🎯 Objetivo

Permitir que consultores/backoffice possam:
1. **Fazer upload de vídeos** ao criar/editar propriedades
2. **Visualizar preview** do vídeo antes de publicar
3. **Remover/substituir** vídeos existentes
4. Ter vídeos exibidos automaticamente no Hero Carousel do site montra

---

## 🗄️ Backend - Estrutura de Dados

### 1. Novo Campo no Modelo Property

**Arquivo**: `/backend/app/models/property.py`

```python
class Property(Base):
    __tablename__ = "properties"
    
    # ... campos existentes ...
    
    # ✅ NOVO CAMPO
    video_url = Column(String(500), nullable=True)
    """
    URL do vídeo promocional do imóvel.
    Pode ser:
    - URL de CDN (ex: https://cdn.imoveismais.pt/videos/REF123.mp4)
    - URL de serviço (ex: Cloudinary, AWS S3, Vimeo)
    - Path relativo (ex: /media/videos/REF123.mp4)
    """
```

### 2. Alembic Migration

**Arquivo**: `/backend/alembic/versions/XXXX_add_video_url_to_properties.py`

```python
"""add video_url to properties

Revision ID: XXXX
Revises: YYYY
Create Date: 2025-12-17

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'XXXX'
down_revision = 'YYYY'  # ID da última migration
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('properties', 
        sa.Column('video_url', sa.String(length=500), nullable=True)
    )

def downgrade():
    op.drop_column('properties', 'video_url')
```

**Executar migration**:
```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "add video_url to properties"
alembic upgrade head
```

### 3. Schema Pydantic

**Arquivo**: `/backend/app/schemas/property.py`

```python
class PropertyBase(BaseModel):
    # ... campos existentes ...
    video_url: Optional[str] = None

class PropertyCreate(PropertyBase):
    # ... campos existentes ...
    video_url: Optional[str] = None

class PropertyUpdate(PropertyBase):
    # ... campos existentes ...
    video_url: Optional[str] = None

class Property(PropertyBase):
    id: int
    # ... campos existentes ...
    video_url: Optional[str] = None
    
    class Config:
        from_attributes = True
```

### 4. Endpoint GET /properties/

**Arquivo**: `/backend/app/api/properties.py`

✅ **Nenhuma mudança necessária** - campo `video_url` será automaticamente incluído na resposta JSON se existir no modelo.

Exemplo de resposta:
```json
{
  "id": 123,
  "reference": "AP-001",
  "title": "Apartamento T3 Moderno",
  "price": 450000,
  "video_url": "https://cdn.imoveismais.pt/videos/AP-001.mp4",
  ...
}
```

---

## 🎨 Backoffice - Interface de Upload

### 1. Formulário de Propriedades

**Arquivo**: `/frontend/backoffice/app/backoffice/properties/[id]/edit/page.tsx`  
ou  
**Arquivo**: `/frontend/backoffice/app/backoffice/properties/new/page.tsx`

#### Opção A: Upload Direto (Recomendado)

```tsx
// Adicionar ao formulário de propriedades
<div className="space-y-2">
  <label className="block text-sm font-medium">
    Vídeo Promocional (opcional)
  </label>
  
  {/* Input de Upload */}
  <input
    type="file"
    accept="video/mp4,video/webm,video/ogg"
    onChange={handleVideoUpload}
    className="block w-full text-sm text-gray-500
      file:mr-4 file:py-2 file:px-4
      file:rounded-full file:border-0
      file:text-sm file:font-semibold
      file:bg-blue-50 file:text-blue-700
      hover:file:bg-blue-100"
  />
  
  {/* Preview do Vídeo */}
  {videoUrl && (
    <div className="mt-4">
      <video
        src={videoUrl}
        controls
        className="h-48 w-full rounded-lg object-cover"
      />
      <button
        onClick={() => setVideoUrl(null)}
        className="mt-2 text-sm text-red-600 hover:text-red-800"
      >
        Remover vídeo
      </button>
    </div>
  )}
  
  {/* Informações */}
  <p className="text-xs text-gray-500">
    Formatos aceites: MP4, WebM, OGG • Tamanho máx: 50MB • Recomendado: 1920x1080 (Full HD)
  </p>
</div>
```

#### Handler de Upload

```tsx
const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validações
  if (file.size > 50 * 1024 * 1024) {
    alert("Vídeo muito grande! Tamanho máximo: 50MB");
    return;
  }

  const formData = new FormData();
  formData.append('video', file);
  formData.append('property_id', propertyId);

  try {
    // Upload para backend
    const response = await fetch('/api/upload/video', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    setVideoUrl(data.video_url); // URL retornada pelo backend
    
    alert("Vídeo carregado com sucesso!");
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    alert("Erro ao carregar vídeo. Tente novamente.");
  }
};
```

#### Opção B: URL Externa (Mais Simples)

```tsx
<div className="space-y-2">
  <label className="block text-sm font-medium">
    URL do Vídeo (opcional)
  </label>
  
  <input
    type="url"
    value={formData.video_url || ''}
    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
    placeholder="https://exemplo.com/video.mp4"
    className="w-full rounded-lg border border-gray-300 px-4 py-2"
  />
  
  {/* Preview */}
  {formData.video_url && (
    <video
      src={formData.video_url}
      controls
      className="mt-2 h-48 w-full rounded-lg object-cover"
    />
  )}
  
  <p className="text-xs text-gray-500">
    Cole aqui o link direto do vídeo (MP4, WebM) hospedado em CDN ou serviço de vídeo.
  </p>
</div>
```

### 2. Endpoint de Upload (Backend)

**Arquivo**: `/backend/app/api/upload.py` (criar se não existir)

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
from pathlib import Path

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("/app/media/videos")  # Ajustar conforme estrutura
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/video")
async def upload_video(
    video: UploadFile = File(...),
    property_id: int = None
):
    """
    Upload de vídeo para propriedade.
    Salva em /media/videos/ e retorna URL pública.
    """
    
    # Validações
    if not video.content_type.startswith('video/'):
        raise HTTPException(400, "Ficheiro deve ser um vídeo")
    
    if video.size > 50 * 1024 * 1024:  # 50MB
        raise HTTPException(400, "Vídeo muito grande (máx: 50MB)")
    
    # Gerar nome único
    ext = video.filename.split('.')[-1]
    filename = f"{property_id}_{int(time.time())}.{ext}" if property_id else f"{int(time.time())}.{ext}"
    file_path = UPLOAD_DIR / filename
    
    # Salvar ficheiro
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(video.file, buffer)
    
    # Retornar URL pública
    video_url = f"/media/videos/{filename}"  # Ajustar conforme configuração de CDN/nginx
    
    return JSONResponse({
        "video_url": video_url,
        "filename": filename,
        "size": video.size,
        "content_type": video.content_type
    })
```

**Registar router** em `/backend/app/main.py`:
```python
from app.api import upload

app.include_router(upload.router)
```

---

## 🌐 Site Montra - Integração

### Estado Atual: ✅ Já Implementado!

**Arquivo**: `/frontend/web/components/HeroCarousel.tsx`

O componente já está preparado para receber `video_url`:

```tsx
// ✅ Verifica se propriedade tem vídeo
const hasVideo = currentProperty?.video_url;

// ✅ Autoplay quando muda de slide
useEffect(() => {
  if (hasVideo) {
    const videoElement = document.getElementById(`hero-video-${currentIndex}`) as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = 0; // Reinicia vídeo
      videoElement.play().catch(() => {
        // Ignora erros de autoplay (política do browser)
      });
    }
  }
}, [currentIndex, hasVideo]);

// ✅ Renderização condicional
{hasVideo ? (
  <video
    id={`hero-video-${currentIndex}`}
    src={currentProperty.video_url}
    className="absolute inset-0 h-full w-full object-cover"
    autoPlay
    muted
    loop
    playsInline
  />
) : (
  <div style={{ backgroundImage: `url(${heroImage})` }} />
)}
```

**Comportamento**:
- Se propriedade tiver `video_url` → mostra vídeo com autoplay
- Se não tiver `video_url` → mostra imagem de capa (fallback atual)
- Ao mudar de slide → vídeo reinicia e começa a rodar automaticamente
- Vídeo em loop contínuo enquanto slide estiver ativo

---

## 📦 Armazenamento de Vídeos

### Opções Recomendadas:

#### Opção 1: CDN Cloudinary (Recomendado) ⭐
- **Vantagens**: Upload automático, otimização, transcoding, streaming adaptativo
- **Custo**: Grátis até 25GB/mês
- **Implementação**: SDK Node.js/Python com upload direto

```python
import cloudinary.uploader

result = cloudinary.uploader.upload(
    video_file,
    resource_type="video",
    folder="imoveis-mais/videos"
)
video_url = result['secure_url']
```

#### Opção 2: AWS S3 + CloudFront
- **Vantagens**: Controlo total, escalável, integração com Lambda
- **Custo**: Pay-as-you-go (~$0.023/GB)
- **Implementação**: Boto3 SDK

#### Opção 3: Armazenamento Local + Nginx
- **Vantagens**: Grátis, sem dependências externas
- **Desvantagens**: Não escalável, sem CDN, sem otimização
- **Implementação**: Pasta `/media/videos/` servida por Nginx

```nginx
location /media/videos/ {
    alias /app/media/videos/;
    add_header Cache-Control "public, max-age=31536000";
}
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Adicionar campo `video_url` ao modelo `Property`
- [ ] Criar migration Alembic
- [ ] Executar `alembic upgrade head` em desenvolvimento
- [ ] Executar migration em Railway (produção)
- [ ] Atualizar schemas Pydantic (`PropertyCreate`, `PropertyUpdate`)
- [ ] Criar endpoint `/upload/video` (se opção de upload direto)
- [ ] Configurar Cloudinary/S3 (se opção de CDN)
- [ ] Testar upload e retrieval de vídeos

### Backoffice
- [ ] Adicionar input de vídeo ao formulário de propriedades
- [ ] Implementar upload handler (opção A) ou input URL (opção B)
- [ ] Adicionar preview de vídeo no formulário
- [ ] Adicionar botão "Remover vídeo"
- [ ] Adicionar validações (formato, tamanho)
- [ ] Adicionar feedback visual (loading, sucesso, erro)
- [ ] Testar criação de propriedade com vídeo
- [ ] Testar edição de vídeo existente

### Site Montra
- [x] ✅ Componente `HeroCarousel` já preparado
- [x] ✅ Autoplay implementado
- [x] ✅ Loop contínuo
- [x] ✅ Fallback para imagem (se sem vídeo)
- [ ] Testar com vídeo real de propriedade
- [ ] Validar performance em mobile

### Testes
- [ ] Upload de vídeo MP4 (formato mais comum)
- [ ] Upload de vídeo > 50MB (deve rejeitar)
- [ ] Upload de ficheiro não-vídeo (deve rejeitar)
- [ ] Preview de vídeo no backoffice
- [ ] Vídeo aparece no Hero Carousel (site montra)
- [ ] Autoplay funciona em desktop
- [ ] Autoplay funciona em mobile (muted + playsInline)
- [ ] Fallback para imagem se sem vídeo

### Deploy
- [ ] Migration em Railway PostgreSQL
- [ ] Configurar CDN/storage em produção
- [ ] Atualizar variáveis de ambiente (API keys)
- [ ] Deploy backend Railway
- [ ] Deploy backoffice Vercel
- [ ] Deploy site montra Vercel
- [ ] Smoke test em produção

---

## 📊 Especificações Técnicas

### Formatos de Vídeo Aceites
- **MP4** (H.264 + AAC) - Recomendado ⭐
- **WebM** (VP8/VP9 + Vorbis/Opus)
- **OGG** (Theora + Vorbis)

### Resolução Recomendada
- **1920x1080** (Full HD) - Ideal para Hero Carousel
- **1280x720** (HD) - Mínimo aceitável
- Aspect Ratio: **16:9** (padrão)

### Tamanho Máximo
- **50MB** por vídeo (ajustável)
- Duração recomendada: **15-30 segundos**
- Bitrate: 5-8 Mbps

### Browsers Suportados
- Chrome/Edge: MP4, WebM
- Firefox: MP4, WebM, OGG
- Safari: MP4
- Mobile (iOS/Android): MP4 (H.264)

---

## 🔒 Segurança

### Validações Obrigatórias
1. **Tipo de ficheiro**: Apenas `video/*` MIME types
2. **Tamanho máximo**: 50MB
3. **Extensão**: .mp4, .webm, .ogg
4. **Autenticação**: Apenas utilizadores autenticados podem fazer upload
5. **Sanitização**: Renomear ficheiros para evitar path traversal

### Exemplo de Validação (Backend)
```python
ALLOWED_EXTENSIONS = {'.mp4', '.webm', '.ogg'}
ALLOWED_MIMES = {'video/mp4', 'video/webm', 'video/ogg'}
MAX_SIZE = 50 * 1024 * 1024  # 50MB

def validate_video(file: UploadFile):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Extensão não permitida: {ext}")
    
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(400, f"MIME type não permitido: {file.content_type}")
    
    if file.size > MAX_SIZE:
        raise HTTPException(400, f"Ficheiro muito grande: {file.size/1024/1024:.1f}MB")
```

---

## 🎬 Exemplo de Fluxo Completo

### 1. Backoffice: Criar Propriedade com Vídeo
```
Consultor → Criar Nova Propriedade
         → Preencher formulário (título, preço, localização, etc.)
         → Upload vídeo promocional (AP-123-tour.mp4)
         → Preview do vídeo aparece
         → Guardar propriedade
         
Backend  → Recebe vídeo via /upload/video
         → Salva em Cloudinary/S3
         → Retorna URL: https://cdn.imoveismais.pt/videos/AP-123.mp4
         → Propriedade criada com video_url preenchido
```

### 2. Site Montra: Exibir Vídeo no Hero
```
User     → Abre https://imoveismais-site.vercel.app
         
Frontend → Carrega propriedades via GET /properties/?is_published=1
         → Hero Carousel recebe propriedades
         → Primeira propriedade tem video_url
         → <video autoPlay muted loop> renderizado
         → Vídeo começa a rodar automaticamente
         
User     → Clica seta "Próximo" ou thumbnail
         → Vídeo do próximo imóvel começa automaticamente
```

---

## 🚀 Timeline Estimado

| Tarefa | Responsável | Estimativa | Prioridade |
|--------|-------------|------------|------------|
| Backend: Modelo + Migration | Backend Dev | 1h | Alta |
| Backend: Endpoint Upload | Backend Dev | 2h | Alta |
| Backoffice: UI Upload | Frontend Dev | 3h | Alta |
| Testes Integração | QA | 2h | Média |
| Deploy + Configuração CDN | DevOps | 1h | Alta |
| **TOTAL** | - | **9h** | - |

**Estimativa total**: 1-2 dias úteis (com testes)

---

## 📝 Notas Adicionais

### Otimizações Futuras
1. **Transcoding automático**: Converter vídeos para múltiplas resoluções (480p, 720p, 1080p)
2. **Streaming adaptativo**: HLS/DASH para ajustar qualidade conforme conexão
3. **Thumbnails automáticos**: Gerar thumbnail do vídeo para preview
4. **Compressão**: Reduzir tamanho dos vídeos sem perder qualidade
5. **Analytics**: Tracking de views, completion rate

### Alternativas ao Upload Direto
- **Integração com YouTube/Vimeo**: Usar embed de vídeos externos
- **Geração de QR Code**: Link para vídeo tour virtual
- **360° Video**: Suporte para vídeos imersivos

### Considerações de Performance
- Vídeos grandes podem afetar tempo de carregamento
- Usar `loading="lazy"` para vídeos fora do Hero
- Implementar progressive loading (poster image → vídeo)
- Comprimir vídeos antes de upload (FFmpeg)

---

## 📞 Contacto

**Dúvidas ou sugestões**: Tiago Vindima  
**Revisão**: Dev Team  
**Aprovação**: Product Owner

---

**Documento criado em**: 17 de dezembro de 2025  
**Última atualização**: 17 de dezembro de 2025  
**Versão**: 1.0
