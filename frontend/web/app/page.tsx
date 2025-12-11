'use client';

import { useEffect, useMemo, useState } from 'react';

type Property = {
  id: number;
  title: string;
  price: number | null;
  area: number | null;
  location: string | null;
  status: string | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'reserved' | 'sold'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/properties/?limit=100`);
        if (!res.ok) throw new Error(`Erro ao carregar propriedades: ${res.status}`);
        const data = (await res.json()) as Property[];
        setProperties(data);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar propriedades');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        !search ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [properties, search, statusFilter]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-primary-500">CRM PLUS — Portefólio</h1>
        <p className="text-slate-600">
          Dados reais servidos a partir do backend FastAPI em {API_BASE}. Pesquise, filtre e valide os imóveis importados.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Procurar por título ou localização"
          className="w-full max-w-sm rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="all">Todos</option>
          <option value="available">Disponível</option>
          <option value="reserved">Reservado</option>
          <option value="sold">Vendido</option>
        </select>
      </div>

      {loading && <p className="text-slate-500">A carregar propriedades…</p>}
      {error && <p className="text-red-600">Erro: {error}</p>}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <article key={p.id} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
            <header className="flex justify-between">
              <h2 className="text-lg font-semibold text-slate-800">{p.title}</h2>
              <span className="text-xs uppercase tracking-wide text-slate-500">{p.status || '—'}</span>
            </header>
            <p className="mt-2 text-slate-600">{p.location || 'Localização não definida'}</p>
            <div className="mt-3 flex items-center gap-3 text-sm text-slate-700">
              <span className="rounded bg-primary-50 px-2 py-1 font-semibold text-primary-600">
                € {p.price ?? '—'}
              </span>
              <span className="rounded bg-slate-100 px-2 py-1">Área: {p.area ? `${p.area} m²` : '—'}</span>
            </div>
          </article>
        ))}
      </div>

      {!loading && !error && filtered.length === 0 && (
        <p className="text-slate-500">Nenhuma propriedade encontrada com os filtros atuais.</p>
      )}
    </section>
  );
}
