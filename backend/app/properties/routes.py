import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from PIL import Image
import io
from . import services, schemas
from app.database import get_db
from app.properties.models import PropertyStatus
from app.security import require_staff

router = APIRouter(prefix="/properties", tags=["properties"])

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20MB por imagem
ALLOWED_MIME_PREFIX = "image/"

# Configurações de otimização de imagens
IMAGE_SIZES = {
    "thumbnail": (300, 300),      # Miniaturas para listagens
    "medium": (800, 800),          # Visualização em cards
    "large": (1920, 1920),         # Visualização detalhada
}
IMAGE_QUALITY = 85  # Qualidade JPEG/WebP (0-100)
WATERMARK_OPACITY = 0.6  # Opacidade da marca d'água (60%)
WATERMARK_SCALE = 0.15  # Tamanho da marca d'água (15% da largura da imagem)


def apply_watermark(img: Image.Image, watermark_path: str = "media/logo-watermark.png") -> Image.Image:
    """
    Aplica marca d'água com logo da agência na imagem.
    
    Args:
        img: Imagem PIL
        watermark_path: Caminho para o logo da agência
    
    Returns:
        Imagem com marca d'água aplicada
    """
    try:
        # Tentar carregar logo da agência
        if not os.path.exists(watermark_path):
            # Se não existir, retornar imagem sem watermark
            return img
        
        watermark = Image.open(watermark_path).convert("RGBA")
        
        # Calcular tamanho proporcional do watermark (15% da largura da imagem)
        img_width, img_height = img.size
        wm_width = int(img_width * WATERMARK_SCALE)
        wm_ratio = watermark.size[0] / watermark.size[1]
        wm_height = int(wm_width / wm_ratio)
        
        # Redimensionar watermark
        watermark = watermark.resize((wm_width, wm_height), Image.Resampling.LANCZOS)
        
        # Ajustar opacidade (60%)
        alpha = watermark.split()[3]
        alpha = Image.eval(alpha, lambda a: int(a * WATERMARK_OPACITY))
        watermark.putalpha(alpha)
        
        # Criar camada para watermark
        layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
        
        # Posição: canto inferior direito com margem
        margin = 20
        position = (
            img_width - wm_width - margin,
            img_height - wm_height - margin
        )
        
        layer.paste(watermark, position)
        
        # Converter imagem para RGBA e aplicar watermark
        img_rgba = img.convert('RGBA')
        img_with_wm = Image.alpha_composite(img_rgba, layer)
        
        # Converter de volta para RGB
        final = Image.new('RGB', img_with_wm.size, (255, 255, 255))
        final.paste(img_with_wm, mask=img_with_wm.split()[3])
        
        return final
        
    except Exception as e:
        # Se houver erro, retornar imagem original sem watermark
        print(f"Aviso: Não foi possível aplicar marca d'água: {e}")
        return img


def optimize_image(image_bytes: bytes, filename: str, size_name: str = "large") -> tuple[bytes, str]:
    """
    Redimensiona e otimiza imagem para web com marca d'água automática.
    
    Args:
        image_bytes: Bytes da imagem original
        filename: Nome do arquivo original
        size_name: Tamanho desejado (thumbnail, medium, large)
    
    Returns:
        Tuple com (bytes otimizados, extensão do arquivo)
    """
    # Abrir imagem
    img = Image.open(io.BytesIO(image_bytes))
    
    # Converter RGBA para RGB se necessário (para JPEG)
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background
    
    # Obter dimensões máximas
    max_width, max_height = IMAGE_SIZES.get(size_name, IMAGE_SIZES["large"])
    
    # Redimensionar mantendo proporção
    img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
    
    # Aplicar marca d'água (exceto em thumbnails muito pequenos)
    if size_name in ["medium", "large"]:
        img = apply_watermark(img)
    
    # Salvar otimizado em memória
    output = io.BytesIO()
    
    # Usar WebP para melhor compressão (suportado por todos browsers modernos)
    img.save(output, format='WebP', quality=IMAGE_QUALITY, method=6)
    
    return output.getvalue(), '.webp'


@router.get("/", response_model=list[schemas.PropertyOut])
def list_properties(
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
):
    return services.get_properties(db, skip=skip, limit=limit, search=search, status=status)


@router.get("/{property_id}", response_model=schemas.PropertyOut)
def get_property(property_id: int, db: Session = Depends(get_db)):
    property = services.get_property(db, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/", response_model=schemas.PropertyOut, status_code=201)
def create_property(property: schemas.PropertyCreate, db: Session = Depends(get_db)):
    return services.create_property(db, property)


@router.put("/{property_id}", response_model=schemas.PropertyOut)
def update_property(property_id: int, property_update: schemas.PropertyUpdate, db: Session = Depends(get_db)):
    property = services.update_property(db, property_id, property_update)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.delete("/{property_id}", response_model=schemas.PropertyOut)
def delete_property(property_id: int, db: Session = Depends(get_db)):
    property = services.delete_property(db, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property


@router.post("/{property_id}/upload")
async def upload_property_images(
    property_id: int,
    files: List[UploadFile] = File(...),
    user=Depends(require_staff),
    db: Session = Depends(get_db),
):
    property_obj = services.get_property(db, property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    media_root = os.path.join("media", "properties", str(property_id))
    os.makedirs(media_root, exist_ok=True)

    urls = property_obj.images or []
    for upload in files:
        if not upload.content_type or not upload.content_type.startswith(ALLOWED_MIME_PREFIX):
            raise HTTPException(status_code=415, detail="Tipo de ficheiro não suportado (apenas imagens)")

        content = await upload.read()
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail=f"Ficheiro excede o limite de {MAX_UPLOAD_BYTES // (1024*1024)}MB")

        try:
            # Otimizar e redimensionar imagem automaticamente
            # Criar 3 versões: thumbnail, medium, large
            base_name = os.path.splitext(upload.filename)[0]
            
            saved_urls = []
            for size_name in ["thumbnail", "medium", "large"]:
                optimized_bytes, ext = optimize_image(content, upload.filename, size_name)
                
                # Nome do arquivo: original_thumbnail.webp, original_medium.webp, etc.
                filename = f"{base_name}_{size_name}{ext}"
                file_location = os.path.join(media_root, filename)
                
                with open(file_location, "wb") as buffer:
                    buffer.write(optimized_bytes)
                
                saved_urls.append(f"/media/properties/{property_id}/{filename}")
            
            # Adicionar apenas a versão 'large' ao array principal (compatibilidade)
            # As outras versões ficam disponíveis mudando o sufixo (_thumbnail, _medium)
            urls.append(saved_urls[2])  # large
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")

    services.update_property(
        db,
        property_id,
        schemas.PropertyUpdate(images=urls),
    )
    return JSONResponse({
        "uploaded": len(files), 
        "urls": urls,
        "message": f"{len(files)} imagem(ns) otimizada(s) e salva(s) em 3 tamanhos (thumbnail, medium, large)"
    })


@router.post("/{property_id}/upload-video")
async def upload_property_video(
    property_id: int,
    file: UploadFile = File(...),
    user=Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Upload de vídeo promocional para uma propriedade"""
    property_obj = services.get_property(db, property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Validar tipo de arquivo
    ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]
    if not file.content_type or file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=415, 
            detail=f"Tipo de vídeo não suportado. Use: MP4, WebM ou MOV"
        )

    # Validar tamanho (50MB max)
    MAX_VIDEO_SIZE = 50 * 1024 * 1024  # 50MB
    content = await file.read()
    if len(content) > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"Vídeo muito grande. Máximo: {MAX_VIDEO_SIZE // (1024*1024)}MB"
        )

    # Criar pasta para vídeos
    video_root = os.path.join("media", "videos")
    os.makedirs(video_root, exist_ok=True)

    # Gerar nome único: propertyID_timestamp.ext
    import time
    ext = os.path.splitext(file.filename)[1] or ".mp4"
    filename = f"property_{property_id}_{int(time.time())}{ext}"
    file_location = os.path.join(video_root, filename)

    # Salvar vídeo
    try:
        with open(file_location, "wb") as buffer:
            buffer.write(content)
        
        video_url = f"/media/videos/{filename}"
        
        # Atualizar propriedade com video_url
        services.update_property(
            db,
            property_id,
            schemas.PropertyUpdate(video_url=video_url),
        )
        
        return JSONResponse({
            "video_url": video_url,
            "message": f"Vídeo enviado com sucesso ({len(content) / (1024*1024):.2f} MB)"
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar vídeo: {str(e)}")


@router.get("/utils/next-reference/{agent_id}")
def get_next_reference(agent_id: int, db: Session = Depends(get_db)):
    """Retorna a próxima referência disponível para um agente específico"""
    from app.agents.models import Agent
    from app.properties.models import Property
    import re
    
    # Buscar agente
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agente não encontrado")
    
    # Obter iniciais do agente (primeiras letras de cada nome)
    name_parts = agent.name.strip().split()
    if len(name_parts) >= 2:
        initials = (name_parts[0][0] + name_parts[-1][0]).upper()
    else:
        initials = name_parts[0][:2].upper()
    
    # Buscar todas as propriedades deste agente com esse padrão
    pattern = f"{initials}%"
    properties = db.query(Property).filter(
        Property.agent_id == agent_id,
        Property.reference.like(pattern)
    ).all()
    
    # Extrair números das referências
    max_number = 0
    for prop in properties:
        match = re.search(r'(\d+)$', prop.reference)
        if match:
            num = int(match.group(1))
            if num > max_number:
                max_number = num
    
    next_number = max_number + 1
    next_reference = f"{initials}{next_number}"
    
    return {
        "agent_id": agent_id,
        "agent_name": agent.name,
        "initials": initials,
        "last_number": max_number,
        "next_reference": next_reference
    }
