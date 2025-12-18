#!/usr/bin/env python3
"""
Popula todas as propriedades sem imagens com fotos temporárias do Unsplash.
Imagens são escolhidas baseadas no tipo de propriedade para coerência visual.
"""

import requests
import time
import random

API_BASE = "https://crm-plus-production.up.railway.app"

# Coleção de IDs de imagens Unsplash por categoria
# Cada propriedade terá 4-6 imagens diferentes
UNSPLASH_COLLECTIONS = {
    "apartamento_t1": [
        "photo-1522708323590-d24dbb6b0267",  # Modern studio apartment
        "photo-1502672260066-6bc35f0af07e",  # Cozy living room
        "photo-1505691938895-1758d7feb511",  # Kitchen modern
        "photo-1556909212-d5b604d0c90d",  # Bedroom minimalist
        "photo-1484154218962-a197022b5858",  # Small balcony
        "photo-1493809842364-78817add7ffb",  # Living space
    ],
    "apartamento_t2": [
        "photo-1560448204-e02f11c3d0e2",  # 2-bedroom apartment living
        "photo-1560185127-6ed189bf02f4",  # Modern 2BR
        "photo-1556912998-c57cc6b63cd7",  # Kitchen dining
        "photo-1616486338812-3dadae4b4ace",  # Master bedroom
        "photo-1505693416388-ac5ce068fe85",  # Second bedroom
        "photo-1556909212-d5b604d0c90d",  # Bathroom modern
    ],
    "apartamento_t3": [
        "photo-1560518883-ce09059eeffa",  # Spacious living room
        "photo-1560185127-6ed189bf02f4",  # Family apartment
        "photo-1556912172-45b7abe8b7e1",  # Large kitchen
        "photo-1540518614846-7eded433c457",  # Kids bedroom
        "photo-1616486338812-3dadae4b4ace",  # Master suite
        "photo-1552321554-5fefe8c9ef14",  # Dining area
    ],
    "apartamento_t4": [
        "photo-1493809842364-78817add7ffb",  # Luxury living
        "photo-1556909114-f6e7ad7d3136",  # Premium kitchen
        "photo-1616486338812-3dadae4b4ace",  # Master bedroom
        "photo-1540518614846-7eded433c457",  # Bedroom 2
        "photo-1505691938895-1758d7feb511",  # Bedroom 3
        "photo-1556912998-c57cc6b63cd7",  # Office/Bedroom 4
    ],
    "moradia": [
        "photo-1568605114967-8130f3a36994",  # Modern house exterior
        "photo-1600596542815-ffad4c1539a9",  # Luxury villa
        "photo-1600585154340-be6161a56a0c",  # House facade
        "photo-1600607687939-ce8a6c25118c",  # Garden view
        "photo-1600566753190-17f0baa2a6c3",  # Pool area
        "photo-1600047509807-ba8f99d2cdde",  # Interior living
    ],
    "terreno": [
        "photo-1500382017468-9049fed747ef",  # Empty land
        "photo-1464820453369-31d2c0b651af",  # Building plot
        "photo-1472214103451-9374bd1c798e",  # Land with trees
        "photo-1501594907352-04cda38ebc29",  # Mountain land
        "photo-1506905925346-21bda4d32df4",  # Scenic plot
    ],
    "loja": [
        "photo-1441986300917-64674bd600d8",  # Retail space
        "photo-1555529669-e69e7aa0ba9a",  # Commercial interior
        "photo-1567401893414-76b7b1e5a7a5",  # Store front
        "photo-1580587771525-78b9dba3b914",  # Shop interior
        "photo-1542744173-8e7e53415bb0",  # Commercial space
    ],
    "armazem": [
        "photo-1586528116311-ad8dd3c8310d",  # Warehouse interior
        "photo-1565958011703-44f9829ba187",  # Industrial space
        "photo-1577495508326-19a1b3cf65b7",  # Storage facility
        "photo-1590595906931-81f04f0ccebb",  # Logistics space
    ],
    "escritorio": [
        "photo-1497366216548-37526070297c",  # Modern office
        "photo-1497366811353-6870744d04b2",  # Office space
        "photo-1542744173-8e7e53415bb0",  # Professional space
        "photo-1604328698692-f76ea9498e76",  # Coworking area
    ],
    "predio": [
        "photo-1545324418-cc1a3fa10c00",  # Building exterior
        "photo-1486406146926-c627a92ad1ab",  # Modern building
        "photo-1480714378408-67cf0d13bc1b",  # Urban building
        "photo-1582407947304-fd86f028f716",  # Residential building
    ],
    "default": [
        "photo-1560518883-ce09059eeffa",  # Generic modern
        "photo-1560185127-6ed189bf02f4",  # Interior
        "photo-1493809842364-78817add7ffb",  # Living space
        "photo-1522708323590-d24dbb6b0267",  # Property
        "photo-1502672260066-6bc35f0af07e",  # Room
    ]
}

def categorize_property(prop):
    """Categoriza propriedade baseado no título e tipo."""
    title = prop.get('title', '').lower()
    property_type = prop.get('property_type', '').lower()
    
    # Terrenos
    if 'terreno' in title or property_type == 'land':
        return 'terreno'
    
    # Moradias
    if 'moradia' in title or 'vivenda' in title or 'villa' in title or property_type == 'house':
        return 'moradia'
    
    # Lojas
    if 'loja' in title or property_type == 'commercial':
        return 'loja'
    
    # Armazéns
    if 'armazem' in title or 'armazém' in title or 'warehouse' in property_type:
        return 'armazem'
    
    # Escritórios
    if 'escritorio' in title or 'escritório' in title or 'office' in property_type:
        return 'escritorio'
    
    # Prédios
    if 'predio' in title or 'prédio' in title or 'edificio' in title or 'building' in title:
        return 'predio'
    
    # Apartamentos por tipologia
    if 't4' in title or 't-4' in title:
        return 'apartamento_t4'
    if 't3' in title or 't-3' in title:
        return 'apartamento_t3'
    if 't2' in title or 't-2' in title:
        return 'apartamento_t2'
    if 't1' in title or 't-1' in title or 't0' in title:
        return 'apartamento_t1'
    
    # Default para apartamentos genéricos
    if 'apartamento' in title:
        return 'apartamento_t2'
    
    return 'default'

def get_unsplash_urls(category, count=5):
    """Retorna URLs de imagens Unsplash para uma categoria."""
    photos = UNSPLASH_COLLECTIONS.get(category, UNSPLASH_COLLECTIONS['default'])
    
    # Selecionar aleatoriamente sem repetir
    selected = random.sample(photos, min(count, len(photos)))
    
    # Gerar URLs com tamanhos otimizados
    urls = []
    for photo_id in selected:
        url = f"https://images.unsplash.com/{photo_id}?w=1200&h=800&fit=crop"
        urls.append(url)
    
    return urls

def update_property_images(property_id, images):
    """Atualiza imagens de uma propriedade via API."""
    url = f"{API_BASE}/properties/{property_id}"
    
    payload = {"images": images}
    
    try:
        response = requests.put(url, json=payload, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"      ❌ Erro: {e}")
        return False

def main():
    print("=" * 70)
    print("🖼️  POPULAÇÃO DE IMAGENS TEMPORÁRIAS - Unsplash")
    print("=" * 70)
    print()
    
    # Obter todas as propriedades
    print("📥 Buscando propriedades...")
    response = requests.get(f"{API_BASE}/properties/?limit=500")
    properties = response.json()
    
    print(f"   ✅ {len(properties)} propriedades encontradas")
    print()
    
    # Filtrar propriedades sem imagens
    props_without_images = [
        p for p in properties 
        if not p.get('images') or len(p.get('images', [])) == 0
    ]
    
    print(f"🎯 Propriedades sem imagens: {len(props_without_images)}")
    print()
    
    if len(props_without_images) == 0:
        print("✅ Todas as propriedades já têm imagens!")
        return
    
    # Processar cada propriedade
    success_count = 0
    fail_count = 0
    
    categories_used = {}
    
    for i, prop in enumerate(props_without_images, 1):
        prop_id = prop['id']
        title = prop.get('title', 'Sem título')
        
        # Categorizar
        category = categorize_property(prop)
        categories_used[category] = categories_used.get(category, 0) + 1
        
        # Obter imagens
        images = get_unsplash_urls(category, count=random.randint(4, 6))
        
        print(f"[{i}/{len(props_without_images)}] ID {prop_id}: {title[:50]}")
        print(f"   📂 Categoria: {category}")
        print(f"   🖼️  {len(images)} imagens")
        
        # Atualizar
        if update_property_images(prop_id, images):
            print(f"   ✅ Atualizado")
            success_count += 1
        else:
            print(f"   ❌ Falhou")
            fail_count += 1
        
        # Rate limiting
        time.sleep(0.2)
        
        if i % 50 == 0:
            print()
            print(f"   💤 Pausa técnica... ({i}/{len(props_without_images)})")
            print()
            time.sleep(2)
    
    print()
    print("=" * 70)
    print("📊 RESUMO")
    print("=" * 70)
    print(f"  ✅ Sucesso: {success_count}")
    print(f"  ❌ Falhas: {fail_count}")
    print(f"  📁 Total: {len(props_without_images)}")
    print()
    print("📂 CATEGORIAS USADAS:")
    for cat, count in sorted(categories_used.items(), key=lambda x: -x[1]):
        print(f"  • {cat}: {count}")
    print()
    print("⚠️  NOTA: Imagens são TEMPORÁRIAS do Unsplash")
    print("   Substituir por fotos reais via backoffice quando disponíveis")
    print("=" * 70)

if __name__ == "__main__":
    main()
