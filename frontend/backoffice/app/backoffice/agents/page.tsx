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
  team?: string | null;
  status?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
};

// Função para normalizar nome de avatar
function getAvatarPath(agent: AgentItem): string {
  if (agent.avatar_url) return agent.avatar_url;
  if (agent.avatar) return agent.avatar;
  
  // Fallback: gerar path baseado no nome
  const normalized = agent.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
  return `/avatars/${normalized}.png`;
}

function AgentRow({ agent }: { agent: AgentItem }) {
  const avatarPath = getAvatarPath(agent);
  
  return (
    <div className="grid grid-cols-[80px_1.2fr_1.2fr_1fr_0.6fr_0.6fr] items-center border-b border-[#1F1F22] px-3 py-3 text-sm text-white">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#0B0B0D]">
          <Image 
            src={avatarPath} 
            alt={agent.name} 
            width={40} 
            height={40} 
            className="h-10 w-10 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `<span class="text-xs text-[#C5C5C5]">${agent.name.slice(0, 2).toUpperCase()}</span>`;
            }}
          />
        </div>
        <span className="font-medium">{agent.name}</span>
      </div>
      <span className="text-[#C5C5C5]">{agent.email}</span>
      <span className="text-[#C5C5C5]">{agent.phone || "—"}</span>
      <span className="text-[#C5C5C5]">{agent.status || "—"}</span>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://crm-plus-production.up.railway.app'}/agents/?limit=50`);
        
        if (!response.ok) throw new Error('Erro ao carregar agentes');
        
        const data = await response.json();
        
        // Filtrar "Imóveis Mais Leiria" (é agência, não agente)
        const agents = data
          .filter((a: any) => a.name !== "Imóveis Mais Leiria")
          .map((a: any) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            phone: a.phone,
            status: "Ativo",
            avatar_url: a.avatar_url,
            team: a.team
          }))
          .sort((a: AgentItem, b: AgentItem) => a.name.localeCompare(b.name, 'pt-PT'));
        
        setItems(agents);
      } catch (error) {
        console.error("Erro ao carregar agentes:", error);
        toast?.show("Erro ao carregar agentes", "error");
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, [toaston AgentesInner() {
  const toast = useToast();
  const [items, setItems] = useState<AgentItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // TODO: substituir mockAgents pelo endpoint real de agentes quando disponível
    setItems(mockAgents);
  }, []);

        {loading ? (
          <div className="py-12 text-center text-[#C5C5C5]">A carregar agentes...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#C5C5C5]">Nenhum agente encontrado.</div>
        ) : (
          filtered.map((agent) => (
            <AgentRow key={agent.id} agent={agent} />
          ))
        )}
      </div>

      <p className="mt-2 text-xs text-[#C5C5C5]">
        Total: {filtered.length} agente{filtered.length !== 1 ? 's' : ''} {search && `(filtrados de ${items.length})`}
      
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
        </select>
        <select className="rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]">
          <option>Tipo</option>
        </select>
      </div>

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
