'use client';

import { useMemo, useState } from "react";
import { BackofficeLayout } from "../../../backoffice/components/BackofficeLayout";
import { DataTable } from "../../../backoffice/components/DataTable";
import { Drawer } from "../../../backoffice/components/Drawer";
import { PropertyForm } from "../../../backoffice/components/PropertyForm";
import { usePropertiesStore } from "../../../backoffice/hooks/usePropertiesStore";
import { ToastProvider } from "../../../backoffice/components/ToastProvider";

export default function ImoveisBackofficePage() {
  return (
    <ToastProvider>
      <ImoveisInner />
    </ToastProvider>
  );
}

function ImoveisInner() {
  const { items, create, update, remove } = usePropertiesStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "reserved" | "sold">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.location || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const current = editingId ? items.find((i) => i.id === editingId) : undefined;

  const handleSubmit = (payload: any) => {
    if (mode === "create") {
      create(payload);
    } else if (editingId) {
      update(editingId, payload);
    }
    setDrawerOpen(false);
    setEditingId(null);
  };

  return (
    <BackofficeLayout title="Imóveis">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar"
          className="w-full max-w-xs rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
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
        <button
          onClick={() => {
            setMode("create");
            setEditingId(null);
            setDrawerOpen(true);
          }}
          className="rounded bg-gradient-to-r from-[#E10600] to-[#a10600] px-4 py-2 text-sm font-semibold shadow-[0_0_12px_rgba(225,6,0,0.6)]"
        >
          Novo Imóvel
        </button>
      </div>

      <DataTable
        columns={["Ref", "Localização", "Preço", "Área", "Estado"]}
        rows={filtered.map((p) => [
          p.title,
          p.location || "—",
          p.price ? `€ ${p.price}` : "—",
          p.area ? `${p.area} m²` : "—",
          p.status || "—",
        ])}
        actions={["Ver", "Editar", "Duplicar", "Eliminar"]}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingId(null);
        }}
        title={mode === "create" ? "Novo Imóvel" : `Editar imóvel ${current?.title || ""}`}
      >
        <PropertyForm initial={mode === "edit" ? current : undefined} onSubmit={handleSubmit} />
      </Drawer>
    </BackofficeLayout>
  );
}
