'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { getProperties, Property } from "../../src/services/publicApi";
import { DataTable } from "../../backoffice/components/DataTable";

export default function ImoveisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
        p.location?.toLowerCase().includes(search.toLowerCase()) ||
        p.reference?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [properties, search]);

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <header className="flex items-center justify-between border-b border-[#111113] bg-[#050506]/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <Image src="/brand/logoCRMPLUSS.png" alt="Imóveis Mais" width={32} height={32} />
          <span className="text-lg font-semibold">Imóveis Mais</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-[#C5C5C5]">
          <Link href="/imoveis?f=compra">Comprar</Link>
          <Link href="/imoveis?f=arrendar">Arrendar</Link>
          <Link href="/imoveis">Imóveis</Link>
          <Link href="/agentes">Agentes</Link>
          <Link href="/contactos">Contactos</Link>
          <span className="h-9 w-9 rounded-full border border-[#1F1F22] bg-[#0B0B0D]" />
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <h1 className="text-3xl font-semibold">Imóveis</h1>
        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por referência ou localização"
            className="w-full max-w-sm rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
          />
        </div>

        {loading && <p className="text-[#C5C5C5]">A carregar…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <DataTable
            dense
            columns={["Referência", "Negócio", "Tipo", "Tipologia", "Preço", "Quartos", "Estado", "Área útil", "Ações"]}
            rows={filtered.map((p) => [
              p.reference || "—",
              p.business_type || "—",
              p.property_type || "—",
              p.typology || "—",
              p.price ? `${p.price.toLocaleString("pt-PT")} €` : "—",
              p.typology?.replace(/\D/g, "") || "—",
              p.condition || "—",
              p.usable_area ? `${p.usable_area} m²` : "—",
              <Link key={p.id} href={`/imovel/${encodeURIComponent(p.reference || p.title || "")}`} className="text-[#E10600] underline">
                Ver
              </Link>,
            ])}
          />
        )}

        {!loading && !error && filtered.length === 0 && <p className="text-[#C5C5C5]">Nenhum imóvel encontrado.</p>}
      </main>
    </div>
  );
}
