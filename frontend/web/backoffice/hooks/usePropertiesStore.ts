'use client';

import { useMemo, useState } from "react";
import { mockProperties } from "../mocks/properties";
import { useToast } from "../components/ToastProvider";
import { useRole } from "../context/roleContext";

export type PropertyPayload = {
  title: string;
  price: number | null;
  area: number | null;
  location: string | null;
  status: string | null;
  description?: string | null;
  agentId?: number | null;
  images?: string[];
};

export function usePropertiesStore() {
  const [items, setItems] = useState(mockProperties);
  const { permissions } = useRole();
  const toast = useToast();

  const create = (payload: PropertyPayload) => {
    const newItem = {
      ...payload,
      id: Math.max(...items.map((i) => i.id)) + 1,
      title: payload.title || "SEM REF",
    };
    setItems((prev) => [...prev, newItem]);
    toast.push("Imóvel criado (mock)", "success");
  };

  const update = (id: number, payload: PropertyPayload) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...payload } : i)));
    toast.push("Imóvel atualizado (mock)", "success");
  };

  const remove = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.push("Imóvel removido (mock)", "success");
  };

  const filtered = useMemo(() => {
    // permissões futuras: filtrar por equipa/agente se necessário
    if (permissions.canEditAllProperties) return items;
    return items; // TODO: ligar equipa/agente quando backend expuser campos
  }, [items, permissions]);

  return { items: filtered, create, update, remove };
}
