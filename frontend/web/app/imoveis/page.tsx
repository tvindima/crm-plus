'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getProperties, Property } from "../../src/services/publicApi";
import { SafeImage } from "../../components/SafeImage";
import { getPropertyCover } from "../../src/utils/placeholders";

export default function ImoveisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [filterBusiness, setFilterBusiness] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProperties(500);
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
      const matchesType = !filterType || p.property_type?.toLowerCase().includes(filterType.toLowerCase());
      const matchesBusiness = !filterBusiness || p.business_type?.toLowerCase().includes(filterBusiness.toLowerCase());
      return matchesSearch && matchesType && matchesBusiness;
    });
  }, [properties, search, filterType, filterBusiness]);

  const propertyTypes = Array.from(new Set(properties.map(p => p.property_type).filter(Boolean)));
  const businessTypes = Array.from(new Set(properties.map(p => p.business_type).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">Portefólio</p>
          <h1 className="text-3xl font-semibold">Imóveis em destaque</h1>
          <p className="text-sm text-[#C5C5C5]">Explora a montra visual ao estilo catálogo Netflix.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por referência ou localização"
          className="w-full max-w-sm rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        >
          <option value="">Todos os tipos</option>
          {propertyTypes.map(type => (
            <option key={type} value={type || ''}>{type}</option>
          ))}
        </select>
        <select
          value={filterBusiness}
          onChange={(e) => setFilterBusiness(e.target.value)}
          className="rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        >
          <option value="">Compra / Arrendamento</option>
          {businessTypes.map(type => (
            <option key={type} value={type || ''}>{type}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-[#C5C5C5]">A carregar…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link
              href={`/imovel/${encodeURIComponent(p.reference || p.title || "")}`}
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-[#1F1F22] bg-[#0F0F10] shadow-lg shadow-[#E10600]/10 transition hover:-translate-y-1 hover:shadow-[#E10600]/25"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <SafeImage
                  src={getPropertyCover(p)}
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
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && <p className="text-[#C5C5C5]">Nenhum imóvel encontrado.</p>}
    </div>
  );
}
