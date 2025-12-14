'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProperties, Property } from "../../src/services/publicApi";
import { BrandImage } from "../../components/BrandImage";
import Image from "next/image";

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
          <BrandImage src="/brand/logoCRMPLUSS.png" alt="Imóveis Mais" width={32} height={32} />
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
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">Portefólio</p>
            <h1 className="text-3xl font-semibold">Imóveis em destaque</h1>
            <p className="text-sm text-[#C5C5C5]">Explora a montra visual ao estilo “catálogo Netflix”.</p>
          </div>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <article
                key={p.id}
                className="group overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#0F0F10] shadow-lg shadow-[#E10600]/10 transition hover:-translate-y-1 hover:shadow-[#E10600]/25"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={p.images?.[0] || `/placeholders/${p.reference || p.title}.jpg`}
                    alt={p.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 flex gap-2">
                    {p.typology && (
                      <span className="rounded-full bg-[#E10600]/90 px-3 py-1 text-xs font-semibold text-white">{p.typology}</span>
                    )}
                    <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white">{p.business_type || "—"}</span>
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#E10600] transition">{p.title || p.reference || "Imóvel"}</h3>
                  <p className="text-sm text-[#C5C5C5]">
                    {p.location || [p.municipality, p.parish].filter(Boolean).join(", ") || "Localização não disponível"}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white">
                    <span className="font-semibold">
                      {p.price ? `${p.price.toLocaleString("pt-PT")} €` : "Preço sob consulta"}
                    </span>
                    {p.usable_area && <span className="text-[#C5C5C5]">{p.usable_area} m²</span>}
                    {p.energy_certificate && <span className="text-[#C5C5C5]">CCE {p.energy_certificate}</span>}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/imovel/${encodeURIComponent(p.reference || p.title || "")}`}
                      className="rounded-full bg-gradient-to-r from-[#E10600] to-[#a10600] px-4 py-2 text-xs font-semibold text-white shadow-[0_0_12px_rgba(225,6,0,0.6)]"
                    >
                      Ver mais
                    </Link>
                    <Link
                      href="/contactos"
                      className="rounded-full border border-[#2A2A2E] px-4 py-2 text-xs font-semibold text-white transition hover:border-[#E10600]"
                    >
                      Contactar
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && <p className="text-[#C5C5C5]">Nenhum imóvel encontrado.</p>}
      </main>
    </div>
  );
}
