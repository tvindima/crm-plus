# 🖼️ Sistema de Storage de Imagens

## Arquitetura

O sistema usa uma **camada de abstração** (`app/core/storage.py`) que permite trocar de provider sem reescrever código.

### Providers Suportados:

1. **Cloudinary** (atual) - Storage persistente com CDN
2. **AWS S3** (migração futura) - Storage escalável e econômico
3. **Local** (dev only) - Filesystem local (NÃO usar em produção)

---

## ⚙️ Setup Inicial (Cloudinary)

### 1. Criar conta Cloudinary

1. Acessar https://cloudinary.com/users/register/free
2. Criar conta (tier grátis: 25GB storage + 25GB bandwidth/mês)
3. Anotar credenciais do Dashboard

### 2. Configurar Railway

Adicionar ENV vars no Railway:

```bash
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz
```

**Como obter**:
- Dashboard → Settings → Account
- Cloud name: visível no topo
- API Key + Secret: Settings → Access Keys

### 3. Deploy

```bash
git push  # Railway auto-deploy
```

### 4. Testar

1. Fazer login no backoffice
2. Editar propriedade
3. Fazer upload de imagem
4. Verificar que URL é `https://res.cloudinary.com/...`
5. Verificar imagem aparece no site montra

---

## 📁 Estrutura de Pastas no Cloudinary

```
crm-plus/
  ├── properties/
  │   ├── 411/
  │   │   ├── foto1_thumbnail.webp
  │   │   ├── foto1_medium.webp
  │   │   └── foto1_large.webp
  │   ├── 577/
  │   │   └── ...
  │   └── ...
  └── videos/
      └── ...
```

### Otimizações Automáticas:

Cada upload cria **3 versões**:
- `_thumbnail` (200x150px) - Para listagens
- `_medium` (800x600px) - Para galerias
- `_large` (1600x1200px) - Para lightbox/zoom

Formato: **WebP** (80% menor que JPG, mesma qualidade)

---

## 🔄 Migração Futura para S3

Quando ultrapassar tier grátis ou custo Cloudinary > €50/mês:

1. Ler **MIGRATION_GUIDE.md** (guia completo)
2. Configurar AWS S3 + CloudFront
3. Atualizar ENV: `STORAGE_PROVIDER=s3`
4. Rodar script de migração
5. Testar
6. Limpar Cloudinary

**Tempo estimado**: 2-3 horas  
**Economia**: ~80% nos custos de storage

---

## 💡 Desenvolvimento Local

### Opção 1: Usar Cloudinary (recomendado)

Mesmo setup que produção. Vantagens:
- Testa integração real
- Não polui filesystem local
- URLs consistentes

### Opção 2: Local Storage (apenas dev)

`.env`:
```bash
STORAGE_PROVIDER=local
API_BASE_URL=http://localhost:8000
```

⚠️ **Atenção**: Imagens ficam em `media/` e são perdidas ao limpar container!

---

## 🛠️ API de Upload

### Endpoint

```http
POST /properties/{property_id}/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

files: [File, File, ...]  # Até 10 imagens por request
```

### Exemplo cURL

```bash
curl -X POST \
  https://crm-plus-production.up.railway.app/properties/411/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg"
```

### Response

```json
{
  "id": 411,
  "reference": "TV1255",
  "images": [
    "https://res.cloudinary.com/crm-plus/image/upload/v123/crm-plus/properties/411/foto1_large.webp",
    "https://res.cloudinary.com/crm-plus/image/upload/v123/crm-plus/properties/411/foto2_large.webp"
  ]
}
```

---

## 🔍 Monitoramento

### Cloudinary Dashboard

- Storage usado: Dashboard → Usage
- Bandwidth: Dashboard → Usage → Bandwidth
- Transformations: Dashboard → Usage → Transformations

### Alertas

Configurar em Dashboard → Settings → Notifications:
- 80% storage tier grátis
- 80% bandwidth tier grátis
- Upgrade necessário

---

## ❓ FAQ

**P: Posso usar URLs externas (Unsplash, etc)?**  
R: Sim! O campo `images` aceita qualquer URL. Storage abstraction só é usado para uploads do backoffice.

**P: E se Cloudinary cair?**  
R: Frontend tem fallback para placeholders. Sistema continua funcional, só sem fotos reais temporariamente.

**P: Quantas imagens por propriedade?**  
R: Sem limite hard-coded. Recomendado: 5-10 para performance.

**P: Posso deletar imagens?**  
R: Sim, via API `DELETE /properties/{id}/images/{index}` (a implementar).

**P: Formato de vídeo?**  
R: Vídeos também podem usar Cloudinary. Ver `video_url` field.

---

## 📚 Referências

- **Storage Abstraction**: `backend/app/core/storage.py`
- **Upload Endpoint**: `backend/app/properties/routes.py`
- **Guia de Migração**: `MIGRATION_GUIDE.md`
- **Cloudinary Docs**: https://cloudinary.com/documentation
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/

---

**Última atualização**: 17 Dezembro 2024  
**Versão**: 1.0.0
