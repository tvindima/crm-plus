#!/usr/bin/env python3
"""
Corrige fundos brancos dos avatares no Cloudinary aplicando
transformação e:bgremoval (AI Background Removal).

Este script re-upload os avatares com fundo removido.
"""

import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Lista de avatares dos agentes ativos
AGENT_AVATARS = [
    (32, "hugo-mota"),
    (33, "joão-pereira"),
    (34, "joão-carvalho"),
    (35, "tiago-vindima"),
    (36, "mickael-soares"),
    (37, "paulo-rodrigues"),
    (39, "nuno-faria"),
    (40, "pedro-olaio"),
    (41, "joão-olaio"),
    (42, "fábio-passos"),
    (24, "antonio-silva"),
    (25, "hugo-belo"),
    (26, "bruno-libanio"),
    (27, "nelson-neto"),
    (28, "joão-paiva"),
    (29, "marisa-barosa"),
    (30, "eduardo-coelho"),
    (31, "joão-silva"),
]

def apply_background_removal(agent_id: int, slug: str):
    """
    Aplica remoção de fundo no avatar do agente no Cloudinary.
    
    Estratégia:
    1. Download da imagem original
    2. Upload com transformação e:bgremoval
    3. Substituir a imagem antiga
    """
    public_id = f"crm-plus/agents/{agent_id}/{slug}"
    
    print(f"\n🔄 Processando: {slug} (ID: {agent_id})")
    print(f"   Public ID: {public_id}")
    
    try:
        # URL original
        original_url = cloudinary.CloudinaryImage(f"{public_id}.webp").build_url()
        print(f"   📥 URL Original: {original_url}")
        
        # Aplicar transformação de remoção de fundo
        # Estratégia: usar e:bgremoval (AI Background Removal do Cloudinary)
        result = cloudinary.uploader.explicit(
            public_id,
            type="upload",
            eager=[
                {"effect": "bgremoval", "format": "webp", "quality": "auto:best"}
            ],
            eager_async=False,  # Processar imediatamente
            overwrite=True,
            invalidate=True,  # Invalidar CDN cache
        )
        
        if result.get("eager"):
            new_url = result["eager"][0]["secure_url"]
            print(f"   ✅ Avatar processado: {new_url}")
        else:
            print(f"   ⚠️ Nenhuma transformação aplicada")
            
    except Exception as e:
        print(f"   ❌ Erro: {str(e)}")

def main():
    print("🎨 CORREÇÃO DE FUNDOS BRANCOS - AVATARES CLOUDINARY")
    print("=" * 60)
    print(f"☁️ Cloud Name: {os.getenv('CLOUDINARY_CLOUD_NAME')}")
    print(f"📊 Total de avatares: {len(AGENT_AVATARS)}")
    print("=" * 60)
    
    for agent_id, slug in AGENT_AVATARS:
        apply_background_removal(agent_id, slug)
    
    print("\n" + "=" * 60)
    print("✅ Processamento concluído!")
    print("\nNOTA: Aguarde 5-10 minutos para propagação no CDN")
    print("=" * 60)

if __name__ == "__main__":
    main()
