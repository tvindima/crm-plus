'use client';

import { useEffect, useMemo, useState } from "react";
import { getProperties, Property, API_BASE } from "../../src/services/publicApi";
import { PropertyCard } from "../../components/PropertyCard";
import { SectionHeader } from "../../components/SectionHeader";

export default function ImoveisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "reserved" | "sold">("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProperties(200);
        setProperties(data);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar imóveis");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Imóveis"
        title="Portefólio completo"
        subtitle={`Dados reais do backend em ${API_BASE}. Filtra por status e pesquisa por título/localização.`}
      />
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar por referência ou localidade"
          className="w-full max-w-sm rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        >
          <option value="all">Todos</option>
          <option value="available">Disponível</option>
          <option value="reserved">Reservado</option>
          <option value="sold">Vendido</option>
        </select>
      </div>

      {loading && <p className="text-[#C5C5C5]">A carregar…</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <p className="text-[#C5C5C5]">Nenhum imóvel encontrado para os filtros atuais.</p>
      )}
    </div>
  );
}
