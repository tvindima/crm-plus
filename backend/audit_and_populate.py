#!/usr/bin/env python3
"""
Script para auditar e popular base de dados com conteúdo real.

Gera relatório do estado atual e identifica o que falta:
- Propriedades sem imagens
- Agentes sem avatares
- Propriedades sem vídeos
- Dados incompletos

Usage:
    python audit_and_populate.py --report    # Apenas gerar relatório
    python audit_and_populate.py --populate  # Popular com dados disponíveis
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres.lwkkufsnxykmxnrpxiub:CRMPlus2024Railway!@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
)

def audit_database():
    """Audita estado atual da database"""
    
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("=" * 70)
    print("📊 AUDITORIA DE DADOS - CRM PLUS")
    print("=" * 70)
    print()
    
    # === PROPRIEDADES ===
    print("🏠 PROPRIEDADES")
    print("-" * 70)
    
    total_props = db.execute(text("SELECT COUNT(*) FROM properties")).scalar()
    with_images = db.execute(text("SELECT COUNT(*) FROM properties WHERE images IS NOT NULL AND jsonb_array_length(images) > 0")).scalar()
    without_images = total_props - with_images
    with_video = db.execute(text("SELECT COUNT(*) FROM properties WHERE video_url IS NOT NULL AND video_url != ''")).scalar()
    published = db.execute(text("SELECT COUNT(*) FROM properties WHERE is_published = true")).scalar()
    
    print(f"  Total: {total_props}")
    print(f"  Publicadas: {published} ({published/total_props*100:.1f}%)")
    print(f"  Com imagens: {with_images} ({with_images/total_props*100:.1f}%)")
    print(f"  Sem imagens: {without_images} ({without_images/total_props*100:.1f}%)")
    print(f"  Com vídeo: {with_video} ({with_video/total_props*100:.1f}%)")
    print()
    
    # Breakdown por tipo
    tipos = db.execute(text("""
        SELECT property_type, COUNT(*) as count
        FROM properties
        GROUP BY property_type
        ORDER BY count DESC
    """)).fetchall()
    
    print("  Por tipo:")
    for tipo, count in tipos:
        tipo_name = tipo or "Não definido"
        print(f"    {tipo_name}: {count}")
    print()
    
    # Breakdown por agente (top 10)
    agentes = db.execute(text("""
        SELECT a.name, COUNT(p.id) as count
        FROM properties p
        LEFT JOIN agents a ON p.agent_id = a.id
        GROUP BY a.name
        ORDER BY count DESC
        LIMIT 10
    """)).fetchall()
    
    print("  Top 10 agentes (por propriedades):")
    for name, count in agentes:
        agent_name = name or "Sem agente"
        print(f"    {agent_name}: {count}")
    print()
    
    # === AGENTES ===
    print("👤 AGENTES")
    print("-" * 70)
    
    total_agents = db.execute(text("SELECT COUNT(*) FROM agents")).scalar()
    with_photo = db.execute(text("SELECT COUNT(*) FROM agents WHERE photo IS NOT NULL AND photo != ''")).scalar()
    without_photo = total_agents - with_photo
    with_video = db.execute(text("SELECT COUNT(*) FROM agents WHERE video_url IS NOT NULL AND video_url != ''")).scalar()
    
    print(f"  Total: {total_agents}")
    print(f"  Com foto: {with_photo} ({with_photo/total_agents*100:.1f}%)")
    print(f"  Sem foto: {without_photo} ({without_photo/total_agents*100:.1f}%)")
    print(f"  Com vídeo: {with_video} ({with_video/total_agents*100:.1f}%)")
    print()
    
    # === IMAGENS ===
    print("📸 ANÁLISE DE IMAGENS")
    print("-" * 70)
    
    # Contar total de URLs de imagens
    result = db.execute(text("""
        SELECT 
            SUM(jsonb_array_length(images)) as total_images,
            COUNT(DISTINCT id) as properties_with_images
        FROM properties
        WHERE images IS NOT NULL
    """)).fetchone()
    
    total_images = result[0] or 0
    props_with_images = result[1] or 0
    
    print(f"  Total de URLs de imagens: {total_images}")
    print(f"  Média por propriedade com imagens: {total_images/props_with_images if props_with_images > 0 else 0:.1f}")
    print()
    
    # Tipos de URLs
    unsplash = db.execute(text("""
        SELECT COUNT(DISTINCT id)
        FROM properties, jsonb_array_elements_text(images) as url
        WHERE url LIKE '%unsplash%'
    """)).scalar()
    
    cloudinary = db.execute(text("""
        SELECT COUNT(DISTINCT id)
        FROM properties, jsonb_array_elements_text(images) as url
        WHERE url LIKE '%cloudinary%'
    """)).scalar()
    
    print(f"  Propriedades com URLs Unsplash: {unsplash}")
    print(f"  Propriedades com URLs Cloudinary: {cloudinary}")
    print()
    
    # === VÍDEOS ===
    print("🎥 ANÁLISE DE VÍDEOS")
    print("-" * 70)
    
    youtube_props = db.execute(text("""
        SELECT COUNT(*)
        FROM properties
        WHERE video_url LIKE '%youtube%' OR video_url LIKE '%youtu.be%'
    """)).scalar()
    
    youtube_agents = db.execute(text("""
        SELECT COUNT(*)
        FROM agents
        WHERE video_url LIKE '%youtube%' OR video_url LIKE '%youtu.be%'
    """)).scalar()
    
    print(f"  Propriedades com vídeo YouTube: {youtube_props}")
    print(f"  Agentes com vídeo YouTube: {youtube_agents}")
    print()
    
    # === RESUMO ===
    print("=" * 70)
    print("📋 RESUMO - O QUE FALTA")
    print("=" * 70)
    print()
    
    print(f"⚠️  {without_images} propriedades SEM IMAGENS ({without_images/total_props*100:.1f}%)")
    print(f"⚠️  {total_props - with_video} propriedades SEM VÍDEO ({(total_props - with_video)/total_props*100:.1f}%)")
    print(f"⚠️  {without_photo} agentes SEM FOTO ({without_photo/total_agents*100:.1f}%)")
    print(f"⚠️  {total_agents - with_video} agentes SEM VÍDEO ({(total_agents - with_video)/total_agents*100:.1f}%)")
    print()
    
    # === PRIORIDADES ===
    print("🎯 PRIORIDADES DE AÇÃO")
    print("-" * 70)
    print()
    print("1. 🔴 CRÍTICO - Adicionar imagens reais às propriedades")
    print(f"   → {without_images} propriedades precisam de fotos")
    print(f"   → Começar pelas {published} publicadas")
    print()
    print("2. 🟡 IMPORTANTE - Fotos de agentes")
    print(f"   → {without_photo} agentes precisam de foto de perfil")
    print()
    print("3. 🟢 OPCIONAL - Vídeos")
    print(f"   → {total_props - with_video} propriedades podem ter vídeo tour")
    print(f"   → {total_agents - with_video} agentes podem ter vídeo apresentação")
    print()
    
    db.close()


def show_upload_instructions():
    """Mostra instruções para fazer upload de conteúdo"""
    
    print("=" * 70)
    print("📤 COMO FAZER UPLOAD DE CONTEÚDO")
    print("=" * 70)
    print()
    
    print("### OPÇÃO 1: Via Backoffice (Recomendado)")
    print("-" * 70)
    print()
    print("1. Login no backoffice: https://crm-plus-backoffice.vercel.app")
    print("2. Navegar para 'Propriedades' ou 'Agentes'")
    print("3. Clicar em propriedade/agente específico")
    print("4. Usar botão 'Upload Imagens' ou 'Upload Foto'")
    print("5. Selecionar ficheiros (múltiplos permitidos)")
    print("6. Aguardar upload para Cloudinary")
    print("7. URLs guardadas automaticamente na database")
    print()
    
    print("### OPÇÃO 2: Via API Direta")
    print("-" * 70)
    print()
    print("Para propriedades:")
    print("  curl -X POST \\")
    print("    https://crm-plus-production.up.railway.app/properties/{id}/upload \\")
    print("    -H 'Authorization: Bearer {token}' \\")
    print("    -F 'files=@foto1.jpg' \\")
    print("    -F 'files=@foto2.jpg'")
    print()
    print("Para agentes:")
    print("  curl -X POST \\")
    print("    https://crm-plus-production.up.railway.app/agents/{id}/upload-photo \\")
    print("    -H 'Authorization: Bearer {token}' \\")
    print("    -F 'file=@avatar.jpg'")
    print()
    
    print("### OPÇÃO 3: Upload em Massa (Script)")
    print("-" * 70)
    print()
    print("Se tens pasta com muitas imagens:")
    print()
    print("Estrutura recomendada:")
    print("  media/")
    print("    properties/")
    print("      411/")
    print("        foto1.jpg")
    print("        foto2.jpg")
    print("      577/")
    print("        foto1.jpg")
    print("    agents/")
    print("      20/")
    print("        avatar.jpg")
    print()
    print("Depois rodar:")
    print("  python bulk_upload_media.py --folder media/")
    print()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2 or sys.argv[1] == "--report":
        audit_database()
        print()
        show_upload_instructions()
    
    elif sys.argv[1] == "--populate":
        print("⚠️  Modo populate ainda não implementado")
        print("Use o backoffice ou API direta para fazer upload de conteúdo")
        print()
        show_upload_instructions()
    
    else:
        print("Usage:")
        print("  python audit_and_populate.py --report    # Gerar relatório")
        print("  python audit_and_populate.py --populate  # Popular dados")
