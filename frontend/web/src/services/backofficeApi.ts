// Serviços de backoffice com fallback/mocks
import { mockProperties } from "../../backoffice/mocks/properties";

export type BackofficeProperty = {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  location: string | null;
  status: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function getBackofficeProperties(limit = 100): Promise<BackofficeProperty[]> {
  try {
    const res = await fetch(`${API_BASE}/properties/?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as BackofficeProperty[];
  } catch (error) {
    console.warn("Backoffice API fallback para mocks", error);
    return mockProperties;
  }
}

// TODO: implementar endpoints reais para leads, agentes, equipas, relatorios, agenda, automacao quando expostos pelo backend.
