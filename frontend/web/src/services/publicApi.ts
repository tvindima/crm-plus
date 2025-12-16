const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://crm-plus-production.up.railway.app";
const PUBLIC_MEDIA_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://crm-plus-production.up.railway.app";
import { mockProperties } from "../mocks/properties";
import { mockAgents } from "../mocks/agents";

// Create a direct lookup map for agents by ID for fast fallback
const AGENT_LOOKUP = mockAgents.reduce((acc, agent) => {
  acc[agent.id] = agent;
  return acc;
}, {} as Record<number, typeof mockAgents[0]>);

console.log('[publicApi] AGENT_LOOKUP created with', Object.keys(AGENT_LOOKUP).length, 'agents:', Object.keys(AGENT_LOOKUP).join(', '));

// Mapeamento de iniciais de referência → agent_id (atualizado com IDs reais do backend)
const AGENT_INITIALS_MAP: Record<string, number> = {
  "MB": 29, // Marisa Barosa
  "NN": 27, // Nélson Neto
  "TV": 35, // Tiago Vindima
  "NF": 20, // Nuno Faria
  "PO": 21, // Pedro Olaio
  "JO": 22, // João Olaio
  "FP": 23, // Fábio Passos
  "AS": 24, // António Silva
  "HB": 25, // Hugo Belo
  "BL": 26, // Bruno Libânio
  "JP": 33, // João Pereira
  "EC": 30, // Eduardo Coelho
  "JS": 31, // João Silva
  "HM": 32, // Hugo Mota
  "JC": 34, // João Carvalho
  "MS": 36, // Mickael Soares
  "PR": 37, // Paulo Rodrigues
  "IL": 38, // Imóveis Mais Leiria
};

// Extrair iniciais da referência e associar agent_id automaticamente
const assignAgentByReference = (property: Property): Property => {
  if (property.agent_id) return property; // Já tem agent_id
  
  const ref = property.reference || property.title || "";
  const initials = ref.match(/^([A-Z]{2})/)?.[1]; // Extrai as 2 primeiras letras maiúsculas
  
  if (initials && AGENT_INITIALS_MAP[initials]) {
    return { ...property, agent_id: AGENT_INITIALS_MAP[initials] };
  }
  
  return property;
};

export type Property = {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  location: string | null;
  status: string | null;
  reference?: string | null;
  business_type?: string | null;
  property_type?: string | null;
  typology?: string | null;
  usable_area?: number | null;
  condition?: string | null;
  description?: string | null;
  observations?: string | null;
  images?: string[] | null;
  municipality?: string | null;
  parish?: string | null;
  energy_certificate?: string | null;
  agent_id?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
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

const normalizeProperty = (property: Property): Property => {
  const images = property.images
    ?.map((img) => resolveImageUrl(img))
    .filter((img): img is string => Boolean(img));
  
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
      const data = await fetchJson<Property[]>(`/properties/?skip=${skip}&limit=${pageSize}`);
      if (!Array.isArray(data) || data.length === 0) break;
      results.push(...data.map(normalizeProperty));
      if (data.length < pageSize) break;
      skip += pageSize;
    }

    console.log(`[API] Successfully fetched ${results.length} properties from backend`);
    
    // Se API retornou vazio, usar mocks como fallback (sem duplicação)
    if (results.length === 0) {
      console.warn("[API] Backend returned empty array, using base mocks");
      return mockProperties.map(normalizeProperty).map(assignAgentByReference);
    }
    
    return results;
  } catch (error) {
    console.error("[API] Backend failed, using base mocks:", error);
    // Return only base mock properties - no artificial duplication
    return mockProperties.map(normalizeProperty).map(assignAgentByReference);
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
    console.warn("Fallback para mocks de agentes", error);
    return mockAgents;
  }
}

export async function getAgentById(id: number): Promise<Agent | null> {
  try {
    const data = await fetchJson<Agent>(`/agents/${id}`);
    console.log(`[getAgentById] Backend returned agent ${id}:`, data.name);
    return data;
  } catch (error) {
    console.warn(`[getAgentById] Agente ${id} não encontrado no backend, usando fallback direto`);
    const agent = AGENT_LOOKUP[id] || null;
    console.log(`[getAgentById] Fallback result for ${id}:`, agent ? agent.name : 'NULL');
    return agent;
  }
}

export { API_BASE };
