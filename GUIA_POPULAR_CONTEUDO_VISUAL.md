# 📸 GUIA: Popular Imagens e Vídeos - CRM PLUS

**Data**: 17 Dezembro 2024  
**Status**: ✅ Backend pronto | 🔄 Aguardando upload de conteúdo

---

## 📊 Estado Atual

### Dados Estruturais (✅ Completo)
- **335 propriedades** cadastradas
- **19 agentes** ativos
- Todos os dados (preços, descrições, localizações, etc) ✅

### Conteúdo Visual (❌ Faltando)
- **~330 propriedades SEM FOTOS** (98%)
- **19 agentes SEM FOTO DE PERFIL** (100%)
- **335 propriedades SEM VÍDEO** (100%)
- **19 agentes SEM VÍDEO** (100%)

---

## 🚀 OPÇÃO 1: Via Backoffice (Recomendado)

### **A. Upload de Fotos de Propriedades**

1. Login: https://crm-plus-backoffice.vercel.app
2. Menu lateral → **"Propriedades"**
3. Clicar na propriedade desejada (ex: TV1255)
4. Scroll até secção **"Imagens"**
5. Botão **"Adicionar Imagens"** ou **"Upload"**
6. Selecionar múltiplas fotos (Ctrl/Cmd + Click)
7. Aguardar upload para Cloudinary
8. ✅ URLs guardadas automaticamente

**Formato suportado**: JPG, PNG, WebP  
**Limite**: 10 imagens por upload  
**Tamanho máximo**: 10MB por imagem  
**Otimização**: Automática (3 versões: thumbnail, medium, large)

---

### **B. Upload de Fotos de Agentes**

1. Login backoffice
2. Menu → **"Agentes"**
3. Clicar no agente (ex: Tiago Vindima)
4. Secção **"Foto de Perfil"**
5. **"Upload Foto"** ou **"Alterar Foto"**
6. Selecionar imagem
7. ✅ URL guardada automaticamente

**Recomendações**:
- Foto profissional com fundo neutro
- Formato quadrado (500x500 ideal)
- Boa iluminação
- Sorriso profissional

---

### **C. Adicionar Vídeos (YouTube)**

#### Propriedades:
1. Fazer upload do vídeo no YouTube
2. Copiar URL (ex: `https://youtu.be/abc123` ou `https://youtube.com/watch?v=abc123`)
3. No backoffice, editar propriedade
4. Campo **"URL do Vídeo"**
5. Colar URL do YouTube
6. Salvar

#### Agentes:
1. Vídeo de apresentação no YouTube
2. No backoffice, editar agente  
3. Campo **"URL do Vídeo"**
4. Colar URL
5. Salvar

**Formato aceite**: YouTube, Vimeo, ou URL direto (.mp4)

---

## ⚡ OPÇÃO 2: Upload Massivo via Script

Se tens **pasta com muitas imagens organizadas**, posso criar script automático.

### Estrutura necessária:

```
media_upload/
├── properties/
│   ├── TV1255/
│   │   ├── foto1.jpg
│   │   ├── foto2.jpg
│   │   └── foto3.jpg
│   ├── HM1205/
│   │   ├── foto1.jpg
│   │   └── foto2.jpg
│   └── ...
└── agents/
    ├── tiago-vindima.jpg
    ├── nuno-faria.jpg
    └── ...
```

### Como funciona:
1. Organizas imagens nas pastas
2. Rodas script: `python bulk_upload.py --folder media_upload/`
3. Script lê pastas e faz upload automático para Cloudinary
4. URLs guardadas na database

**Quando usar**: Se tens > 50 propriedades com fotos prontas

---

## 🎯 OPÇÃO 3: Upload via API Direta

Para integrações ou automação.

### Exemplo: Upload imagem propriedade

```bash
# 1. Fazer login e obter token
TOKEN=$(curl -X POST https://crm-plus-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha"}' \
  | jq -r '.access_token')

# 2. Upload de imagens
curl -X POST \
  "https://crm-plus-production.up.railway.app/properties/411/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@foto1.jpg" \
  -F "files=@foto2.jpg" \
  -F "files=@foto3.jpg"
```

### Exemplo: Upload foto agente

```bash
curl -X POST \
  "https://crm-plus-production.up.railway.app/agents/35/upload-photo" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@avatar.jpg"
```

---

## 📋 PLANO DE TRABALHO RECOMENDADO

### **Fase 1: Propriedades Principais (1-2 dias)**
- [ ] Upload fotos das **50 propriedades mais importantes**
- [ ] Priorizar: publicadas, preço alto, localizações premium
- [ ] Mínimo: 3-5 fotos por propriedade

### **Fase 2: Agentes (1 dia)**
- [ ] Upload foto profissional dos **19 agentes**
- [ ] Garantir qualidade e consistência
- [ ] Verificar no frontsite montra

### **Fase 3: Vídeos Principais (1 semana)**
- [ ] Vídeos das **10-20 propriedades TOP**
- [ ] Vídeos de apresentação dos **5 agentes principais**

### **Fase 4: Completar Restantes (ongoing)**
- [ ] Restantes 285 propriedades
- [ ] Vídeos secundários
- [ ] Atualizar conforme novas propriedades

---

## ✅ CHECKLIST PÓS-UPLOAD

Após fazer upload de conteúdo:

- [ ] **Verificar Cloudinary Dashboard**
  - Storage usado (limite: 25GB grátis)
  - Bandwidth mensal
  
- [ ] **Testar Frontsite Montra**
  - https://imoveismais-site.vercel.app
  - Imagens aparecem corretamente
  - Sem erros 404 no console
  
- [ ] **Testar Backoffice**
  - Listagens mostram thumbnails
  - Detalhes mostram galerias
  
- [ ] **Performance**
  - Loading rápido (CDN Cloudinary)
  - WebP funcionando
  - Responsive images ok

---

## 🐛 Troubleshooting

### "Upload falhou"
- Verificar tamanho do ficheiro (< 10MB)
- Verificar formato (JPG, PNG, WebP)
- Verificar conexão internet
- Verificar credenciais Cloudinary no Railway

### "Imagem não aparece no site"
- F5 no browser (cache)
- Verificar URL no campo `images` da propriedade
- Verificar console browser (erros?)
- Confirmar `is_published = true` se for frontsite

### "Vídeo não reproduz"
- Verificar URL do YouTube está correta
- Verificar vídeo é público (não privado/unlisted)
- Testar URL diretamente no browser

---

## 📞 Suporte

**Backend/API**: Tiago Vindima  
**Cloudinary**: Dashboard → Usage → Support  
**Backoffice**: Dev Team Frontend  

---

## 🎯 META: Site Montra 100% Funcional

**Objetivo**: Todas as propriedades com fotos reais até fim de Dezembro 2024

**Progresso Atual**:
- ✅ Infrastructure (Cloudinary, API, Frontend)
- 🔄 Content (5/335 props com fotos = **1.5%**)
- ❌ Videos (0%)

**Target**:
- 🎯 Semana 1: 50 propriedades TOP (15%)
- 🎯 Semana 2-3: 150 propriedades (45%)
- 🎯 Mês 1: 335 propriedades (100%)

---

**Última atualização**: 17 Dezembro 2024
