# 📦 GUIA DE MIGRAÇÃO DE STORAGE

## ⚠️ Evitar Vendor Lock-in

Este projeto usa uma **camada de abstração** para storage (`app/core/storage.py`), permitindo trocar de provedor sem reescrever código.

---

## 🔧 Configuração Atual: Cloudinary

### Variáveis de Ambiente (Railway)

```bash
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123xyz
```

### Como obter credenciais:

1. Criar conta em https://cloudinary.com (tier grátis: 25GB)
2. Dashboard → Settings → Account → Cloud name
3. Dashboard → Settings → Access Keys → API Key + Secret

---

## 🚀 MIGRAÇÃO PARA AWS S3

### Quando migrar?

- Ultrapassar 25GB storage no Cloudinary
- Ultrapassar 25GB bandwidth/mês no Cloudinary
- Custo Cloudinary > $50/mês
- Precisar controle total sobre dados

### Custo Estimado S3:

| Métrica | Preço |
|---------|-------|
| Storage 100GB | $2.30/mês |
| Bandwidth 100GB | $8.50/mês |
| **Total** | **~$11/mês** |

vs Cloudinary: ~$89/mês

---

## 📝 Passos para Migração

### 1. Implementar S3Storage

Editar `backend/app/core/storage.py`:

```python
import boto3
from botocore.exceptions import ClientError

class S3Storage(StorageProvider):
    """Implementação AWS S3"""
    
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "eu-west-1")
        )
        self.bucket_name = os.getenv("AWS_S3_BUCKET", "crm-plus-images")
        self.cloudfront_domain = os.getenv("CLOUDFRONT_DOMAIN")  # CDN
    
    async def upload_file(
        self, 
        file: BinaryIO, 
        folder: str, 
        filename: str,
        public: bool = True
    ) -> str:
        """Upload para S3"""
        key = f"{folder}/{filename}"
        
        try:
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs={
                    'ContentType': 'image/webp',  # ou detectar automaticamente
                    'ACL': 'public-read' if public else 'private',
                    'CacheControl': 'max-age=31536000',  # 1 ano
                }
            )
            
            # Retornar URL CloudFront (CDN) se disponível
            if self.cloudfront_domain:
                return f"https://{self.cloudfront_domain}/{key}"
            
            # Fallback: URL direta S3
            return f"https://{self.bucket_name}.s3.{os.getenv('AWS_REGION', 'eu-west-1')}.amazonaws.com/{key}"
        
        except ClientError as e:
            raise Exception(f"Erro ao fazer upload para S3: {e}")
    
    async def delete_file(self, url: str) -> bool:
        """Deletar do S3"""
        try:
            # Extrair key da URL
            if self.cloudfront_domain and self.cloudfront_domain in url:
                key = url.split(self.cloudfront_domain + "/")[1]
            else:
                key = url.split(".amazonaws.com/")[1]
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except ClientError as e:
            print(f"Erro ao deletar do S3: {e}")
            return False
    
    def get_public_url(self, path: str) -> str:
        """Já retorna URL pública no upload"""
        return path
```

### 2. Configurar AWS S3

**Criar bucket**:
```bash
aws s3 mb s3://crm-plus-images --region eu-west-1
```

**Configurar CORS** (`cors.json`):
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": [
      "https://crm-plus-backoffice.vercel.app",
      "https://*.vercel.app"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

```bash
aws s3api put-bucket-cors --bucket crm-plus-images --cors-configuration file://cors.json
```

**Criar CloudFront Distribution** (CDN):
- Origin: `crm-plus-images.s3.eu-west-1.amazonaws.com`
- Cache Policy: CachingOptimized
- OAC (Origin Access Control) para segurança

### 3. Adicionar dependências

`backend/requirements.txt`:
```
boto3>=1.28.0  # AWS SDK
```

### 4. Atualizar ENV no Railway

```bash
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=eu-west-1
AWS_S3_BUCKET=crm-plus-images
CLOUDFRONT_DOMAIN=d123abc.cloudfront.net  # opcional mas recomendado
```

### 5. Migrar Imagens Existentes

**Script de migração** (`migrate_cloudinary_to_s3.py`):

```python
import os
import requests
from app.core.storage import CloudinaryStorage, S3Storage
from app.database import SessionLocal
from app.properties.models import Property

def migrate_images():
    """Migra todas as imagens do Cloudinary para S3"""
    
    cloudinary = CloudinaryStorage()
    s3 = S3Storage()
    db = SessionLocal()
    
    properties = db.query(Property).filter(Property.images != None).all()
    
    print(f"Migrando imagens de {len(properties)} propriedades...")
    
    for prop in properties:
        new_urls = []
        
        for url in prop.images:
            if "cloudinary.com" not in url:
                # Já migrada ou URL externa (Unsplash)
                new_urls.append(url)
                continue
            
            try:
                # Download da imagem do Cloudinary
                response = requests.get(url, stream=True)
                response.raise_for_status()
                
                # Extrair nome do arquivo da URL
                filename = url.split("/")[-1]
                folder = f"properties/{prop.id}"
                
                # Upload para S3
                from io import BytesIO
                file_obj = BytesIO(response.content)
                
                s3_url = await s3.upload_file(file_obj, folder, filename)
                new_urls.append(s3_url)
                
                print(f"✅ {prop.reference}: {url} → {s3_url}")
                
                # Opcional: deletar do Cloudinary para economizar espaço
                # await cloudinary.delete_file(url)
                
            except Exception as e:
                print(f"❌ Erro em {prop.reference}: {e}")
                new_urls.append(url)  # Manter URL antiga se falhar
        
        # Atualizar no banco
        prop.images = new_urls
        db.commit()
    
    print(f"Migração concluída! {len(properties)} propriedades processadas.")
    db.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(migrate_images())
```

**Executar migração**:
```bash
cd backend
python migrate_cloudinary_to_s3.py
```

### 6. Testar

- Upload nova imagem → deve ir para S3
- Verificar URLs no banco: `s3.amazonaws.com` ou CloudFront
- Testar delete de imagem
- Verificar frontend carrega imagens normalmente

### 7. Cleanup Cloudinary

Após confirmar que tudo funciona:
```bash
# Deletar todas as imagens do Cloudinary (economizar storage)
# CUIDADO: irreversível!
cloudinary destroy crm-plus --all
```

---

## 🔄 Migração Reversa (S3 → Cloudinary)

Se precisar voltar (ex: problema no S3):

1. Mudar ENV: `STORAGE_PROVIDER=cloudinary`
2. Rodar script reverso (baixar de S3, upload para Cloudinary)
3. Atualizar URLs no banco

**Por isso mantemos abstração!** Código não muda, só config.

---

## 📊 Comparação de Custos

### Cenário: 10,000 propriedades × 8 fotos cada = 80,000 imagens

| Item | Cloudinary | S3 + CloudFront |
|------|------------|----------------|
| Storage 200GB | $200/mês | $4.60/mês |
| Bandwidth 500GB | $60/mês | $42.50/mês |
| Processamento | Incluído | - |
| **Total/mês** | **$260** | **$47** |
| **Total/ano** | **$3,120** | **$564** |
| **Economia** | - | **$2,556/ano** |

### Breakeven Point:

- Até **500 propriedades**: Cloudinary (tier grátis)
- **500-5000**: Cloudinary ainda viável
- **5000+**: S3 essencial

---

## 🛡️ Segurança

### Cloudinary:
- HTTPS por padrão ✅
- Signed URLs disponíveis ✅
- CDN automático ✅

### S3:
- HTTPS via CloudFront ✅
- Bucket policies ✅
- OAC (Origin Access Control) ✅
- Versionamento de objetos ✅
- Server-side encryption ✅

---

## 💡 Recomendações

1. **Manter Cloudinary** enquanto:
   - Storage < 20GB
   - Bandwidth < 20GB/mês
   - Faturamento < €50/mês

2. **Migrar para S3** quando:
   - Crescimento rápido (> 1000 props/mês)
   - Custo Cloudinary > €80/mês
   - Precisar integração AWS (Lambda, Rekognition, etc)

3. **Sempre**:
   - Manter backups externos (não só no storage provider)
   - Monitorar custos semanalmente
   - Ter script de migração pronto ANTES de precisar

---

## 📚 Recursos

- **Cloudinary Docs**: https://cloudinary.com/documentation
- **AWS S3 Docs**: https://docs.aws.amazon.com/s3/
- **CloudFront Docs**: https://docs.aws.amazon.com/cloudfront/
- **Boto3 (AWS SDK)**: https://boto3.amazonaws.com/v1/documentation/api/latest/index.html

---

## 🆘 Troubleshooting

### "Cloudinary API error 401"
- Verificar ENV vars: `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`
- Testar credenciais: https://cloudinary.com/console

### "S3 Access Denied"
- Verificar bucket policy permite upload
- Verificar IAM user tem permissões `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- Verificar CORS configurado

### "Imagens não carregam após migração"
- Verificar URLs no banco de dados
- Testar URL diretamente no browser
- Verificar CORS permite domínio do frontend
- Verificar CloudFront distribution ativa (pode levar 15-20 min)

---

**Última atualização**: 17 Dezembro 2024  
**Autor**: Dev Team CRM PLUS  
**Versão**: 1.0
