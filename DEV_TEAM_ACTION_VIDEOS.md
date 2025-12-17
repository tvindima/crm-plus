# 🎬 AÇÃO URGENTE: Implementar Upload de Vídeos nas Angariações

**Para**: Dev Team (Backend + Backoffice Frontend)  
**De**: Tiago Vindima  
**Data**: 17 de dezembro de 2025  
**Prioridade**: 🔴 ALTA  
**Prazo**: Próximos 3-5 dias úteis

---

## ⚡ RESUMO EXECUTIVO

O **site montra** (https://imoveismais-site.vercel.app) já está **100% preparado** para exibir vídeos das propriedades no Hero Carousel com autoplay automático. **Falta apenas**:

1. ✅ Backend adicionar campo `video_url` ao modelo Property
2. ✅ Backoffice adicionar interface de upload de vídeos

**Consultar documentação técnica completa**: [`RELATORIO_VIDEOS_ANGARIACOES.md`](./RELATORIO_VIDEOS_ANGARIACOES.md)

---

## 🎯 O QUE PRECISA SER FEITO

### **BACKEND** (Python/FastAPI)

#### 1. Adicionar Campo ao Modelo
```python
# backend/app/models/property.py
class Property(Base):
    # ... campos existentes ...
    video_url = Column(String(500), nullable=True)
```

#### 2. Criar Migration Alembic
```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "add video_url to properties"
alembic upgrade head
```

#### 3. Atualizar Schema Pydantic
```python
# backend/app/schemas/property.py
class PropertyBase(BaseModel):
    # ... campos existentes ...
    video_url: Optional[str] = None
```

#### 4. Endpoint de Upload de Vídeo
```python
# backend/app/api/properties.py
@router.post("/properties/{property_id}/upload-video")
async def upload_property_video(
    property_id: int,
    file: UploadFile = File(...)
):
    # Validar formato (mp4, webm, mov)
    # Salvar em /backend/media/videos/
    # Retornar URL: /media/videos/{filename}
```

**Formatos aceites**: `.mp4`, `.webm`, `.mov`  
**Tamanho máximo**: 50MB  
**Pasta destino**: `/backend/media/videos/`

---

### **BACKOFFICE** (Next.js/React)

#### 1. Adicionar Campo ao PropertyForm
```tsx
// frontend/backoffice/components/PropertyForm.tsx

// Adicionar state
const [videoFile, setVideoFile] = useState<File | null>(null);
const [videoPreview, setVideoPreview] = useState<string | null>(null);

// Adicionar campo no formulário
<div className="space-y-2">
  <label className="text-sm font-medium text-white">
    Vídeo Promocional
  </label>
  
  <input
    type="file"
    accept="video/mp4,video/webm,video/quicktime"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
      }
    }}
    className="..."
  />
  
  {/* Preview */}
  {videoPreview && (
    <div className="mt-2">
      <video 
        src={videoPreview} 
        controls 
        className="w-full max-w-md rounded-lg"
      />
      <button onClick={() => {
        setVideoFile(null);
        setVideoPreview(null);
      }}>
        Remover vídeo
      </button>
    </div>
  )}
  
  {/* Vídeo existente */}
  {initial?.video_url && !videoPreview && (
    <div className="mt-2">
      <video 
        src={initial.video_url} 
        controls 
        className="w-full max-w-md rounded-lg"
      />
    </div>
  )}
</div>
```

#### 2. Lógica de Upload no Submit
```tsx
const handleSubmit = async () => {
  // 1. Criar/atualizar propriedade
  const property = await createBackofficeProperty(payload);
  
  // 2. Se há vídeo, fazer upload
  if (videoFile) {
    const formData = new FormData();
    formData.append('file', videoFile);
    
    await fetch(`${API_URL}/properties/${property.id}/upload-video`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  }
};
```

---

## 📦 ESTRUTURA DE PASTAS

```
backend/
├── media/
│   └── videos/          # ✅ CRIAR ESTA PASTA
│       └── .gitkeep
├── app/
│   ├── models/
│   │   └── property.py  # ✅ ADICIONAR video_url
│   ├── schemas/
│   │   └── property.py  # ✅ ADICIONAR video_url
│   └── api/
│       └── properties.py # ✅ ENDPOINT upload-video
└── alembic/
    └── versions/
        └── XXX_add_video_url.py # ✅ MIGRATION

frontend/backoffice/
└── components/
    └── PropertyForm.tsx  # ✅ ADICIONAR upload + preview
```

---

## 🧪 TESTES NECESSÁRIOS

### Backend
- [ ] Migration executa sem erros
- [ ] Campo `video_url` aparece no GET `/properties/{id}`
- [ ] Upload aceita `.mp4`, `.webm`, `.mov`
- [ ] Upload rejeita formatos inválidos
- [ ] Limite de 50MB funciona
- [ ] Vídeo é servido corretamente em `/media/videos/`

### Backoffice
- [ ] Input de vídeo aparece no form
- [ ] Preview funciona ao selecionar ficheiro
- [ ] Botão remover limpa preview
- [ ] Vídeo existente é exibido ao editar
- [ ] Upload funciona ao criar nova propriedade
- [ ] Upload funciona ao editar propriedade existente

### Site Montra (Já Funcional ✅)
- [ ] Vídeo aparece no Hero Carousel
- [ ] Autoplay funciona automaticamente
- [ ] Controls (play/pause) funcionam
- [ ] Responsive em mobile

---

## 📸 REFERÊNCIAS VISUAIS

### Preview esperado no Backoffice:
```
┌────────────────────────────────┐
│ Vídeo Promocional              │
├────────────────────────────────┤
│ [Escolher ficheiro]            │
│                                │
│ ┌──────────────────────────┐  │
│ │                          │  │
│ │    🎬 Video Preview      │  │
│ │    [====] 0:15 / 1:30   │  │
│ │                          │  │
│ └──────────────────────────┘  │
│                                │
│ [🗑️ Remover vídeo]            │
└────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT

### Railway (Backend)
```bash
git add .
git commit -m "feat: add video upload for properties"
git push origin main
# Railway auto-deploy
```

### Vercel (Backoffice)
```bash
git add .
git commit -m "feat: add video upload UI to PropertyForm"
git push origin main
# Vercel auto-deploy
```

---

## 📞 CONTACTOS

**Dúvidas técnicas**: Consultar [`RELATORIO_VIDEOS_ANGARIACOES.md`](./RELATORIO_VIDEOS_ANGARIACOES.md) (593 linhas com todos os detalhes)

**Aprovação final**: Tiago Vindima

---

## ✅ CHECKLIST DE CONCLUSÃO

- [ ] Backend: Campo `video_url` adicionado ao modelo
- [ ] Backend: Migration executada com sucesso
- [ ] Backend: Endpoint `/upload-video` criado e testado
- [ ] Backoffice: Campo de upload adicionado ao form
- [ ] Backoffice: Preview de vídeo funciona
- [ ] Backoffice: Upload funciona em criar/editar
- [ ] Testes realizados em DEV
- [ ] Deploy para PRODUCTION
- [ ] Validação final no site montra com vídeo real

---

**⏱️ TEMPO ESTIMADO**: 4-6 horas desenvolvimento + 2 horas testes = **1 dia útil**

🎬 **Vamos dar vida às nossas angariações com vídeos profissionais!**
