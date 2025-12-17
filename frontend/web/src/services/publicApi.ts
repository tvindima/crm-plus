const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://crm-plus-production.up.railway.app";
const PUBLIC_MEDIA_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://crm-plus-production.up.railway.app";

// ✅ REMOVER MOCKS - usar apenas dados reais do backend
// import { mockProperties } from "../mocks/properties";
// import { mockAgents } from "../mocks/agents";

export type Property = {
  // ✅ Campos obrigatórios (conforme API backend)
  id: number;
  title: string;
  price: number | null;
  location: string | null;
  status: string | null; // AVAILABLE | RESERVED | SOLD
  agent_id: number | null; // ✅ SEMPRE presente em produção
  
  // Campos principais
  area: number | null;
  reference?: string | null;
  business_type?: string | null; // VENDA | ARRENDAMENTO
  property_type?: string | null; // APARTAMENTO | MORADIA | TERRENO | LOJA | ARMAZÉM | PRÉDIO
  typology?: string | null; // T0, T1, T2, T3, T4+
  usable_area?: number | null;
  condition?: string | null;
  description?: string | null;
  observations?: string | null;
  
  // ✅ Imagens (com watermark automático no backend)
  images?: string[] | null;
  
  // ✅ Vídeo promocional (adicionado pela dev team backoffice)
  video_url?: string | null;
  
  // Localização
  municipality?: string | null;
  parish?: string | null;
  
  // Detalhes adicionais
  energy_certificate?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  
  // ✅ Controle de publicação (já filtrado no endpoint)
  is_published?: boolean;
  is_featured?: boolean;
  
  // ✅ Timestamps (para ordenação por data de criação)
  created_at?: string | null;
  updated_at?: string | null;
};

export type Agent = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  team?: string | null;
  avatar?: string | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Erro ao chamar ${path}: ${res.status}`);
  }
  return (await res.json()) as T;
}

const resolveImageUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media")) {
    const base = PUBLIC_MEDIA_BASE || "";
    return `${base}${url}`;
  }
  return url;
};

// ✅ Converter YouTube Studio URLs para URLs de visualização
const normalizeVideoUrl = (url?: string | null): string | null => {
  if (!url) return null;
  
  // Se for YouTube Studio URL: https://studio.youtube.com/video/VIDEO_ID/edit
  const studioMatch = url.match(/studio\.youtube\.com\/video\/([a-zA-Z0-9_-]+)/);
  if (studioMatch) {
    const videoId = studioMatch[1];
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`[🔄 normalizeVideoUrl] Studio → Watch URL`);
    console.log(`   De: ${url}`);
    console.log(`   Para: ${watchUrl}`);
    return watchUrl;
  }
  
  // Se já for uma URL válida (youtube.com, youtu.be, vimeo, mp4, etc), retornar como está
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com') || url.match(/\.(mp4|webm|ogg)$/i)) {
    console.log(`[✅ normalizeVideoUrl] URL de vídeo válida: ${url}`);
  }
  
  return resolveImageUrl(url);
};

const normalizeProperty = (property: Property): Property => {
  const images = property.images
    ?.map((img) => resolveImageUrl(img))
    .filter((img): img is string => Boolean(img));
  
  // ✅ Normalizar video_url (converter YouTube Studio → YouTube Watch)
  const video_url = normalizeVideoUrl(property.video_url);
  
  // Derive bedrooms from typology if missing (T0=0, T1=1, T2=2, T3=3, etc)
  let bedrooms = property.bedrooms;
  if (bedrooms === undefined && property.typology) {
    const match = property.typology.match(/T(\d+)/);
    if (match) {
      bedrooms = parseInt(match[1], 10);
    }
  }
  
  // Set 'area' to usable_area for backward compatibility
  const area = property.area ?? property.usable_area ?? null;
  
  return { 
    ...property, 
    images,
    video_url,
    bedrooms,
    area,
  };
};

export async function getProperties(limit = 500): Promise<Property[]> {
  try {
    const pageSize = Math.max(1, Math.min(limit, 500));
    const results: Property[] = [];
    let skip = 0;

    while (true) {
      // ✅ USAR ENDPOINT PÚBLICO: apenas propriedades publicadas
      const data = await fetchJson<Property[]>(`/properties/?is_published=1&skip=${skip}&limit=${pageSize}`);
      if (!Array.isArray(data) || data.length === 0) break;
      results.push(...data.map(normalizeProperty));
      if (data.length < pageSize) break;
      skip += pageSize;
    }

    console.log(`[API] Successfully fetched ${results.length} published properties from backend`);
    
    // ✅ SEMPRE retornar apenas dados reais do backend - SEM FALLBACK
    return results;
  } catch (error) {
    console.error("[API] Backend connection failed:", error);
    // ✅ Retornar array vazio em caso de erro - frontend deve tratar
    return [];
  }
}

export async function getPropertyByReference(reference: string): Promise<Property | null> {
  const list = await getProperties(500);
  const match = list.find((p) => 
    (p.reference?.toLowerCase() === reference.toLowerCase()) ||
    (p.title?.toLowerCase() === reference.toLowerCase())
  );
  // assignAgentByReference já foi aplicado em getProperties(), então apenas retornar
  return match || null;
}

export async function getAgents(limit = 50): Promise<Agent[]> {
  try {
    const data = await fetchJson<Agent[]>(`/agents/?limit=${limit}`);
    return data;
  } catch (error) {
    console.error("[API] Failed to fetch agents:", error);
    return []; // ✅ Retornar array vazio - sem fallback
  }
}

export async function getAgentById(id: number): Promise<Agent | null> {
  try {
    const data = await fetchJson<Agent>(`/agents/${id}`);
    console.log(`[getAgentById] Backend returned agent ${id}:`, data.name);
    return data;
  } catch (error) {
    console.error(`[getAgentById] Agent ${id} not found in backend:`, error);
    return null; // ✅ Retornar null - sem fallback
  }
}

export { API_BASE };
