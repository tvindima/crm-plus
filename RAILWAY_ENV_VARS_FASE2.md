# 🚀 ENV VARS NECESSÁRIAS - RAILWAY DEPLOY FASE 2

**URGENTE:** Adicionar estas variáveis no Railway Dashboard antes de deployar

---

## ✅ ENV VARS EXISTENTES (já configuradas)

```bash
# Database (PostgreSQL Railway)
DATABASE_URL=postgresql://...  # Railway auto-configura

# Cloudinary (storage existente)
CLOUDINARY_CLOUD_NAME=dtpk4oqoa
CLOUDINARY_API_KEY=seu_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

---

## 🆕 ENV VARS NOVAS (FASE 2 - ADICIONAR AGORA)

```bash
# FASE 2: Cloudinary Upload Preset (para client-side upload)
CLOUDINARY_UPLOAD_PRESET_MOBILE=crm-plus-mobile

# FASE 2: JWT Secret (se ainda não existe)
SECRET_KEY=seu_secret_key_jwt_aqui_minimo_32_caracteres

# FASE 2: CORS Origins (incluir domínios mobile/expo)
CRMPLUS_CORS_ORIGINS=http://localhost:3000,http://localhost:8081,exp://192.168.1.0

# FASE 2: Log Level (opcional - default INFO)
LOG_LEVEL=INFO
```

---

## 📋 PASSOS PARA CONFIGURAR

### 1. Cloudinary Upload Preset

**Ação:** Criar upload preset no Cloudinary Dashboard

1. Login → Settings → Upload
2. Add upload preset
3. Nome: `crm-plus-mobile`
4. **Signing Mode:** Unsigned (crítico!)
5. Folder: `crm-plus/mobile-uploads`
6. Allowed formats: jpg, jpeg, png, heic, webp
7. Max file size: 10MB
8. Save

**Depois:** Adicionar no Railway:
```
CLOUDINARY_UPLOAD_PRESET_MOBILE=crm-plus-mobile
```

### 2. Railway Dashboard

**Caminho:** Project → Settings → Variables

**Adicionar:**
```
CLOUDINARY_UPLOAD_PRESET_MOBILE = crm-plus-mobile
```

---

## ⚠️ TROUBLESHOOTING

### Erro: "Cloudinary não configurado"

**Causa:** Faltam env vars CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY ou CLOUDINARY_API_SECRET

**Solução:** Verificar que as 3 env vars existem no Railway

### Erro: "Upload preset not found"

**Causa:** Upload preset `crm-plus-mobile` não existe no Cloudinary ou é signed (não unsigned)

**Solução:** 
1. Criar preset no Cloudinary Dashboard
2. Verificar que Signing Mode = **Unsigned**
3. Adicionar env var CLOUDINARY_UPLOAD_PRESET_MOBILE no Railway

### Healthcheck falha: "service unavailable"

**Causa:** Backend não arranca porque faltam env vars obrigatórias

**Solução:**
1. Ver logs Railway para erro específico
2. Adicionar env vars em falta
3. Redeploy (Railway auto-redeploy ao mudar env vars)

---

## ✅ VERIFICAR DEPLOY SUCESSO

Após adicionar env vars e redeploy:

```bash
# 1. Verificar healthcheck passa
curl https://SEU_RAILWAY_URL/heath

# 2. Testar endpoint Cloudinary config
curl https://SEU_RAILWAY_URL/mobile/cloudinary/upload-config \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Response esperado:
# {
#   "cloud_name": "dtpk4oqoa",
#   "upload_preset": "crm-plus-mobile",
#   "api_base_url": "https://api.cloudinary.com/v1_1/dtpk4oqoa/image/upload",
#   ...
# }

# 3. Testar WebSocket
wscat -c "wss://SEU_RAILWAY_URL/mobile/ws?token=<JWT_TOKEN>"
# Deve retornar: {"type": "connected", ...}
```

---

## 📝 ENV VARS COMPLETAS (COPY-PASTE)

```bash
# PostgreSQL (Railway auto)
DATABASE_URL=postgresql://...

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=dtpk4oqoa
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
CLOUDINARY_UPLOAD_PRESET_MOBILE=crm-plus-mobile

# JWT Auth
SECRET_KEY=YOUR_SECRET_KEY_MINIMUM_32_CHARS
ALGORITHM=HS256

# CORS (adicionar domínios conforme necessário)
CRMPLUS_CORS_ORIGINS=http://localhost:3000,http://localhost:8081

# Logging (opcional)
LOG_LEVEL=INFO

# Railway Environment (Railway auto)
RAILWAY_ENVIRONMENT=production
```

---

**Status:** ENV vars configuradas = Backend arranca com sucesso ✅
