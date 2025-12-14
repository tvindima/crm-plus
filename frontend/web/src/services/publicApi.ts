const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const PUBLIC_MEDIA_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
import { mockProperties } from "../mocks/properties";
import { mockAgents } from "../mocks/agents";

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

    return results;
  } catch (error) {
    console.warn("Fallback para mocks de propriedades", error);
    return mockProperties.map(normalizeProperty);
  }
}

export async function getPropertyByReference(reference: string): Promise<Property | null> {
  const list = await getProperties(500);
  const match = list.find((p) => 
    (p.reference?.toLowerCase() === reference.toLowerCase()) ||
    (p.title?.toLowerCase() === reference.toLowerCase())
  );
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
    return data;
  } catch (error) {
    console.warn(`Agente ${id} não encontrado, usando fallback`, error);
    const agents = await getAgents(50);
    return agents.find(a => a.id === id) || null;
  }
}

export { API_BASE };
