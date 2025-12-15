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

// Mapeamento de iniciais de referência → agent_id
const AGENT_INITIALS_MAP: Record<string, number> = {
  "MB": 10, // Marisa Barosa
  "NN": 8,  // Nélson Neto
  "TV": 16, // Tiago Vindima
  "NF": 1,  // Nuno Faria
  "PO": 2,  // Pedro Olaio
  "JO": 3,  // João Olaio
  "FP": 4,  // Fábio Passos
  "AS": 5,  // António Silva
  "HB": 6,  // Hugo Belo
  "BL": 7,  // Bruno Libânio
  "JP": 9,  // João Paiva
  "EC": 11, // Eduardo Coelho
  "JS": 12, // João Silva
  "HM": 13, // Hugo Mota
  "JR": 14, // João Rodrigues
  "JC": 15, // João Carvalho
  "MS": 17, // Mickael Soares
  "PR": 18, // Paulo Rodrigues
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
  return { ...property, images };
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
    
    // Se API retornou vazio, usar mocks como fallback
    if (results.length === 0) {
      console.warn("[API] Backend returned empty array, using extended mocks");
      const extended = [];
      for (let i = 0; i < 25; i++) {
        extended.push(...mockProperties.map((p, idx) => {
          const newId = p.id + i * 100 + idx;
          const suffix = String(newId).padStart(4, '0');
          const initials = p.reference?.match(/^([A-Z]{2})/)?.[1] || 'XX';
          return { 
            ...p, 
            id: newId,
            reference: `${initials}${suffix}` // Generate unique reference like MB0100, MB0101, etc
          };
        }));
      }
      return extended.map(normalizeProperty).map(assignAgentByReference);
    }
    
    return results;
  } catch (error) {
    console.error("[API] Backend failed, using extended mocks:", error);
    // Return mocks repeated to have ~100 items for galleries
    const extended = [];
    for (let i = 0; i < 25; i++) {
      extended.push(...mockProperties.map((p, idx) => {
        const newId = p.id + i * 100 + idx;
        const suffix = String(newId).padStart(4, '0');
        const initials = p.reference?.match(/^([A-Z]{2})/)?.[1] || 'XX';
        return { 
          ...p, 
          id: newId,
          reference: `${initials}${suffix}` // Generate unique reference like MB0100, MB0101, etc
        };
      }));
    }
    return extended.map(normalizeProperty).map(assignAgentByReference);
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
