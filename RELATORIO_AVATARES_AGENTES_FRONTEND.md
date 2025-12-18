# 📸 Relatório: Upload de Avatares de Agentes

**Data**: 17 Dezembro 2024  
**Destinatário**: Dev Team Frontend Site Montra  
**Status**: 🔄 Em progresso

---

## 🎯 Resumo Executivo

**Avatares de agentes** que estavam apenas como ficheiros estáticos em `frontend/web/public/avatars/` foram **uploaded para Cloudinary** e ligados à database do backend. Agora cada agente tem URL dinâmica da sua foto de perfil.

### Impacto no Frontend: ⚠️ **REQUER ATUALIZAÇÃO**

**ANTES**:
```tsx
// Hardcoded paths estáticos
<img src="/avatars/tiago-vindima.png" />
```

**AGORA**:
```tsx
// URLs dinâmicas da API
const agent = await fetch(`/agents/${id}`)
<img src={agent.photo} />  // Cloudinary URL
```

---

## 📊 Estado Atual

### Avatares Uploaded

**Total**: 18 agentes de 19  
**Storage**: Cloudinary CDN  
**Formato**: WebP 500x500 (otimizado)  
**Campo DB**: `agents.photo`

| Agente | Avatar | URL |
|--------|--------|-----|
| Tiago Vindima | ✅ | `https://res.cloudinary.com/.../tiago-vindima.webp` |
| Nuno Faria | ✅ | `https://res.cloudinary.com/.../nuno-faria.webp` |
| Pedro Olaio | ✅ | `https://res.cloudinary.com/.../pedro-olaio.webp` |
| ... | ✅ | ... |

---

## 🔄 Mudanças Necessárias no Frontend

### 1. **Página Individual de Agente** (`/agentes/[slug]`)

**ANTES** (hardcoded):
```tsx
export default function AgentePage({ params }: { params: { slug: string } }) {
  // Hardcoded
  const avatar = `/avatars/${params.slug}.png`
  
  return (
    <img src={avatar} alt="Agente" />
  )
}
```

**DEPOIS** (dinâmico):
```tsx
export default async function AgentePage({ params }: { params: { slug: string } }) {
  // Fetch do backend
  const res = await fetch(`https://crm-plus-production.up.railway.app/agents/`)
  const agents = await res.json()
  const agent = agents.find(a => slugify(a.name) === params.slug)
  
  if (!agent) notFound()
  
  return (
    <img 
      src={agent.photo || '/avatars/placeholder.png'} 
      alt={agent.name} 
    />
  )
}
```

---

### 2. **Listagem de Agentes** (`/agentes`)

**ANTES**:
```tsx
const AGENTS = [
  { name: "Tiago Vindima", avatar: "/avatars/tiago-vindima.png" },
  // ...hardcoded
]
```

**DEPOIS**:
```tsx
async function getAgents() {
  const res = await fetch('https://crm-plus-production.up.railway.app/agents/')
  return res.json()
}

export default async function AgentsPage() {
  const agents = await getAgents()
  
  return (
    <div className="grid">
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agentes/${slugify(agent.name)}`}>
      <img 
        src={agent.photo || '/avatars/placeholder.png'} 
        alt={agent.name}
        className="w-32 h-32 rounded-full"
      />
      <h3>{agent.name}</h3>
    </Link>
  )
}
```

---

### 3. **SafeImage Component** (se existir)

Adicionar fallback para `agent.photo`:

```tsx
interface SafeImageProps {
  src: string | null
  fallback?: string
  alt: string
}

export function SafeImage({ src, fallback = '/avatars/placeholder.png', alt }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback)
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
    />
  )
}

// Uso:
<SafeImage src={agent.photo} alt={agent.name} />
```

---

## 📋 Estrutura da API

### Endpoint: `GET /agents/`

**Response**:
```json
[
  {
    "id": 35,
    "name": "Tiago Vindima",
    "email": "tiago@imoveismais.pt",
    "phone": "+351 912 345 678",
    "photo": "https://res.cloudinary.com/crm-plus/image/upload/v1734478234/crm-plus/agents/35/tiago-vindima.webp",
    "avatar_url": null,
    "team_id": null,
    "agency_id": null,
    "linkedin_url": null,
    "facebook_url": null,
    "instagram_url": null,
    "video_url": null
  },
  ...
]
```

### Endpoint: `GET /agents/{id}`

**Response**:
```json
{
  "id": 35,
  "name": "Tiago Vindima",
  "photo": "https://res.cloudinary.com/crm-plus/.../tiago-vindima.webp",
  ...
}
```

---

## 🛠️ Implementação Passo a Passo

### **Passo 1: Criar serviço de API** (recomendado)

```tsx
// lib/api/agents.ts
export interface Agent {
  id: number
  name: string
  email: string
  phone: string | null
  photo: string | null
  video_url: string | null
  linkedin_url: string | null
  facebook_url: string | null
  instagram_url: string | null
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://crm-plus-production.up.railway.app'

export async function getAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents/`, {
    next: { revalidate: 3600 } // Cache 1h
  })
  if (!res.ok) throw new Error('Failed to fetch agents')
  return res.json()
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const agents = await getAgents()
  return agents.find(a => slugify(a.name) === slug) || null
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

---

### **Passo 2: Atualizar páginas**

```tsx
// app/agentes/page.tsx
import { getAgents } from '@/lib/api/agents'
import { SafeImage } from '@/components/SafeImage'

export default async function AgentsPage() {
  const agents = await getAgents()
  
  return (
    <div className="container mx-auto">
      <h1>Nossa Equipa</h1>
      <div className="grid grid-cols-3 gap-6">
        {agents.map(agent => (
          <Link key={agent.id} href={`/agentes/${slugify(agent.name)}`}>
            <SafeImage 
              src={agent.photo} 
              alt={agent.name}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <h3>{agent.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

```tsx
// app/agentes/[slug]/page.tsx
import { getAgentBySlug } from '@/lib/api/agents'
import { notFound } from 'next/navigation'

export default async function AgentPage({ params }: { params: { slug: string } }) {
  const agent = await getAgentBySlug(params.slug)
  
  if (!agent) notFound()
  
  return (
    <div>
      <SafeImage 
        src={agent.photo}
        alt={agent.name}
        className="w-64 h-64 rounded-full mx-auto"
      />
      <h1>{agent.name}</h1>
      <p>{agent.email}</p>
      {agent.phone && <p>{agent.phone}</p>}
      
      {/* Redes sociais */}
      {agent.linkedin_url && <a href={agent.linkedin_url}>LinkedIn</a>}
      {agent.facebook_url && <a href={agent.facebook_url}>Facebook</a>}
      {agent.instagram_url && <a href={agent.instagram_url}>Instagram</a>}
      
      {/* Vídeo */}
      {agent.video_url && <VideoEmbed url={agent.video_url} />}
    </div>
  )
}
```

---

### **Passo 3: Environment Variables**

Adicionar ao `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://crm-plus-production.up.railway.app
```

---

## ✅ Checklist de Testes

Após implementar as mudanças:

- [ ] **Listagem de agentes** (`/agentes`) mostra avatares do Cloudinary
- [ ] **Página individual** mostra avatar correto
- [ ] **Fallback funciona** se `photo` for `null`
- [ ] **Performance**: Imagens carregam rápido (CDN)
- [ ] **Mobile**: Avatares responsive
- [ ] **Console limpo**: Sem erros 404 de imagens

---

## 🐛 Troubleshooting

### "Avatares não aparecem"
- Verificar `agent.photo` não é `null` na API
- Verificar CORS permite requests do frontend
- Testar URL do Cloudinary diretamente no browser

### "Erro 404 em /avatars/..."
- Frontend ainda usa paths antigos hardcoded
- Procurar `"/avatars/"` no código e substituir por `agent.photo`

### "Performance lenta"
- Implementar `next/image` para otimização automática:
  ```tsx
  import Image from 'next/image'
  
  <Image 
    src={agent.photo} 
    alt={agent.name}
    width={500}
    height={500}
    className="rounded-full"
  />
  ```

---

## 📦 Ficheiros a Atualizar

1. ✅ `lib/api/agents.ts` (criar)
2. ✅ `app/agentes/page.tsx`
3. ✅ `app/agentes/[slug]/page.tsx`
4. ✅ `components/SafeImage.tsx` (se existir)
5. ⚠️ Qualquer componente que use `/avatars/` hardcoded

---

## 🎯 Resultado Final

**ANTES**:
- 18 ficheiros estáticos em `/public/avatars/`
- Não ligados à database
- Sem fallback dinâmico

**DEPOIS**:
- ✅ 18 avatares no Cloudinary CDN
- ✅ Ligados à database (`agents.photo`)
- ✅ Fallback automático para placeholder
- ✅ URLs dinâmicas via API
- ✅ Otimizado (WebP 500x500)

---

## 📞 Suporte

**Backend/API**: Verificar endpoints em `https://crm-plus-production.up.railway.app/docs`  
**Cloudinary**: Dashboard → Usage  
**Frontend**: Dev Team Site Montra  

---

**Status**: 🟡 Upload concluído, aguardando integração frontend  
**Deadline**: Testar em staging antes de deploy produção  
**Prioridade**: ALTA - Impacta UX do site montra

---

**Última atualização**: 17 Dezembro 2024, 00:15 UTC
