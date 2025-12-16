'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BackofficeLayout } from "@/backoffice/components/BackofficeLayout";
import { ToastProvider, useToast } from "../../../backoffice/components/ToastProvider";

type AgentItem = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  team_id?: number | null;
  agency_id?: number | null;
  avatar_url?: string | null;
};

function AgentRow({ agent }: { agent: AgentItem }) {
  return (
    <div className="grid grid-cols-[80px_1.2fr_1.2fr_1fr_0.6fr_0.6fr] items-center border-b border-[#1F1F22] px-3 py-3 text-sm text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0B0B0D]">
          {agent.avatar_url ? (
            <Image src={agent.avatar_url} alt={agent.name} width={40} height={40} className="h-10 w-10 object-cover" />
          ) : (
            <span className="text-xs text-[#C5C5C5]">{agent.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <span className="font-medium">{agent.name}</span>
      </div>
      <span className="text-[#C5C5C5]">{agent.email}</span>
      <span className="text-[#C5C5C5]">{agent.phone || "—"}</span>
      <span className="text-[#C5C5C5]">{agent.team_id || "—"}</span>
      <span className="text-[#C5C5C5]">—</span>
      <div className="flex gap-4 text-xs">
        <button className="text-white underline">Editar</button>
        <button className="text-[#E10600] underline">Desactivar</button>
      </div>
    </div>
  );
}

export default function AgentesPage() {
  return (
    <ToastProvider>
      <AgentesInner />
    </ToastProvider>
  );
}

function AgentesInner() {
  const toast = useToast();
  const [items, setItems] = useState<AgentItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        const response = await fetch('https://crm-plus-production.up.railway.app/agents/');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error loading agents:', error);
        toast?.showToast('Erro ao carregar agentes', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, [toast]);

  const filtered = useMemo(() => {
    return items.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));
  }, [items, search]);

  return (
    <BackofficeLayout title="Agentes">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar"
          className="w-full max-w-xs rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        />
        <select className="rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]">
          <option>Estado</option>
        </selectEquipa</span>
          <span className="text-right">Opções</span>
        </div>
        {loading ? (
          <div className="py-8 text-center text-[#999]">A carregar agentes...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-[#999]">Nenhum agente encontrado</div>
        ) : (
          filtered.map((agent) => (
            <AgentRow key={agent.id} agent={agent} />
          ))
        
      <div className="overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#0F0F10]">
        <div className="grid grid-cols-[80px_1.2fr_1.2fr_1fr_0.6fr_0.6fr] items-center border-b border-[#1F1F22] px-3 py-3 text-xs uppercase tracking-wide text-[#C5C5C5]">
          <span>Foto</span>
          <span>Nome</span>
          <span>Email</span>
          <span>Contacto</span>
          <span>Tipo</span>
          <span className="text-right">Opções</span>
        </div>
        {filtered.map((agent) => (
          <AgentRow key={agent.id} agent={agent} />
        ))}
      </div>

      <p className="mt-2 text-xs text-[#C5C5C5]">TODO: ligar aos endpoints reais de agentes e fotos quando estiverem disponíveis.</p>
    </BackofficeLayout>
  );
}
