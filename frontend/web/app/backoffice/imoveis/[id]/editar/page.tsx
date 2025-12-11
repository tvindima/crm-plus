'use client';

import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../../../../backoffice/components/BackofficeLayout";
import { PropertyForm, PropertyFormSubmit } from "../../../../../backoffice/components/PropertyForm";
import { ToastProvider, useToast } from "../../../../../backoffice/components/ToastProvider";
import {
  BackofficeProperty,
  getBackofficeProperty,
  updateBackofficeProperty,
} from "../../../../../src/services/backofficeApi";

type Props = { params: { id: string } };

export default function EditarImovelPage({ params }: Props) {
  return (
    <ToastProvider>
      <EditarImovelInner id={Number(params.id)} />
    </ToastProvider>
  );
}

function EditarImovelInner({ id }: { id: number }) {
  const toast = useToast();
  const [property, setProperty] = useState<BackofficeProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getBackofficeProperty(id);
        setProperty(data);
      } catch (err: any) {
        toast.push(err?.message || "Erro ao carregar imóvel", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, toast]);

  const handleSubmit = async ({ payload, files, imagesToKeep }: PropertyFormSubmit) => {
    setSaving(true);
    try {
      await updateBackofficeProperty(id, payload, files, imagesToKeep);
      toast.push("Imóvel atualizado", "success");
    } catch (err: any) {
      toast.push(err?.message || "Erro ao atualizar", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BackofficeLayout title={`Editar imóvel ${property?.reference || id}`}>
      {loading && <p className="text-sm text-[#C5C5C5]">A carregar imóvel...</p>}
      {!loading && !property && <p className="text-sm text-red-400">Imóvel não encontrado.</p>}
      {property && <PropertyForm initial={property} onSubmit={handleSubmit} loading={saving} />}
    </BackofficeLayout>
  );
}
