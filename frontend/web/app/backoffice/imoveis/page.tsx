'use client';

import { useEffect, useMemo, useState } from "react";
import { BackofficeLayout } from "../../../backoffice/components/BackofficeLayout";
import { DataTable } from "../../../backoffice/components/DataTable";
import { Drawer } from "../../../backoffice/components/Drawer";
import { PropertyForm, PropertyFormSubmit } from "../../../backoffice/components/PropertyForm";
import { ToastProvider, useToast } from "../../../backoffice/components/ToastProvider";
import {
  BackofficeProperty,
  BackofficePropertyPayload,
  createBackofficeProperty,
  deleteBackofficeProperty,
  getBackofficeProperties,
  updateBackofficeProperty,
} from "../../../src/services/backofficeApi";

export default function ImoveisBackofficePage() {
  return (
    <ToastProvider>
      <ImoveisInner />
    </ToastProvider>
  );
}

function ImoveisInner() {
  const toast = useToast();
  const [items, setItems] = useState<BackofficeProperty[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "reserved" | "sold">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await getBackofficeProperties({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setItems(data);
    } catch (err: any) {
      toast.push(err?.message || "Erro ao carregar imóveis", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchesSearch =
        !search ||
        (p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.location || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const current = editingId ? items.find((i) => i.id === editingId) : undefined;

  const handleSubmit = async ({ payload, files, imagesToKeep }: PropertyFormSubmit) => {
    setSaving(true);
    try {
      if (mode === "create") {
        await createBackofficeProperty(payload, files);
        toast.push("Imóvel criado", "success");
      } else if (editingId) {
        await updateBackofficeProperty(editingId, payload, files, imagesToKeep);
        toast.push("Imóvel atualizado", "success");
      }
      await loadProperties();
      setDrawerOpen(false);
      setEditingId(null);
    } catch (err: any) {
      toast.push(err?.message || "Erro ao guardar imóvel", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Eliminar imóvel?")) return;
    try {
      await deleteBackofficeProperty(id);
      toast.push("Imóvel eliminado", "success");
      await loadProperties();
    } catch (err: any) {
      toast.push(err?.message || "Erro ao eliminar", "error");
    }
  };

  const handleDuplicate = async (property: BackofficeProperty) => {
    const newReference = `${property.reference}-copy-${Date.now()}`;
    const payload: BackofficePropertyPayload = {
      reference: newReference,
      title: property.title || newReference,
      business_type: property.business_type,
      property_type: property.property_type,
      typology: property.typology,
      description: property.description,
      observations: property.observations,
      price: property.price ?? 0,
      usable_area: property.usable_area,
      land_area: property.land_area,
      location: property.location,
      municipality: property.municipality,
      parish: property.parish,
      condition: property.condition,
      energy_certificate: property.energy_certificate,
      status: property.status || "available",
      agent_id: property.agent_id,
      images: property.images || [],
    };
    try {
      await createBackofficeProperty(payload);
      toast.push("Imóvel duplicado", "success");
      await loadProperties();
    } catch (err: any) {
      toast.push(err?.message || "Erro ao duplicar", "error");
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
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

      {loading && <p className="text-sm text-[#C5C5C5]">A carregar imóveis...</p>}

      <DataTable
        columns={["Ref", "Localização", "Preço", "Área útil", "Estado"]}
        rows={filtered.map((p) => [
          p.reference || p.title,
          p.location || [p.municipality, p.parish].filter(Boolean).join(" / ") || "—",
          formatCurrency(p.price),
          p.usable_area ? `${p.usable_area} m²` : "—",
          p.status || "—",
        ])}
        actions={["Ver", "Editar", "Duplicar", "Eliminar"]}
        onAction={(action, idx) => {
          const property = filtered[idx];
          if (!property) return;
          if (action === "Ver" || action === "Editar") {
            setMode("edit");
            setEditingId(property.id);
            setDrawerOpen(true);
          }
          if (action === "Duplicar") {
            handleDuplicate(property);
          }
          if (action === "Eliminar") {
            handleDelete(property.id);
          }
        }}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingId(null);
        }}
        title={mode === "create" ? "Novo Imóvel" : `Editar imóvel ${current?.reference || current?.title || ""}`}
      >
        <PropertyForm initial={mode === "edit" ? current : undefined} onSubmit={handleSubmit} loading={saving} />
      </Drawer>
    </BackofficeLayout>
  );
}
