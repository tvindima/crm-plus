'use client';

import { FormEvent, useEffect, useMemo, useState } from "react";
import { UploadArea } from "./UploadArea";
import { BackofficeProperty, BackofficePropertyPayload } from "@/src/services/backofficeApi";

export type PropertyFormSubmit = {
  payload: BackofficePropertyPayload;
  files: File[];
  imagesToKeep: string[];
};

type Props = {
  initial?: Partial<BackofficeProperty>;
  onSubmit: (data: PropertyFormSubmit) => void;
  loading?: boolean;
};

const toNumber = (value: string): number | null => {
  if (!value) return null;
  const normalized = value.replace(",", ".").replace(/\s+/g, "");
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

// Opções para dropdowns
const BUSINESS_TYPES = ["Venda", "Arrendamento", "Trespasse"];
const PROPERTY_TYPES = [
  "Apartamento",
  "Moradia",
  "Terreno",
  "Loja",
  "Armazém",
  "Escritório",
  "Garagem",
  "Prédio",
  "Quinta",
  "Casa Antiga"
];
const TYPOLOGIES = ["T0", "T1", "T2", "T3", "T4", "T5", "T6+"];
const CONDITIONS = ["Novo", "Usado", "Em construção", "Para recuperar", "Renovado"];
const ENERGY_CERTIFICATES = ["A+", "A", "B", "B-", "C", "D", "E", "F", "Isento", "Em curso"];
const STATUSES = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
  { value: "rented", label: "Arrendado" }
];

export function PropertyForm({ initial, onSubmit, loading }: Props) {
  const [reference, setReference] = useState(initial?.reference || "");
  const [title, setTitle] = useState(initial?.title || "");
  const [businessType, setBusinessType] = useState(initial?.business_type || "");
  const [propertyType, setPropertyType] = useState(initial?.property_type || "");
  const [typology, setTypology] = useState(initial?.typology || "");
  const [price, setPrice] = useState<string>(initial?.price?.toString() || "");
  const [usableArea, setUsableArea] = useState<string>(initial?.usable_area?.toString() || "");
  const [landArea, setLandArea] = useState<string>(initial?.land_area?.toString() || "");
  const [municipality, setMunicipality] = useState(initial?.municipality || "");
  const [parish, setParish] = useState(initial?.parish || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [condition, setCondition] = useState(initial?.condition || "");
  const [energyCertificate, setEnergyCertificate] = useState(initial?.energy_certificate || "");
  const [status, setStatus] = useState(initial?.status || "available");
  const [agentId, setAgentId] = useState(initial?.agent_id?.toString() || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [observations, setObservations] = useState(initial?.observations || "");
  const [existingImages, setExistingImages] = useState<string[]>(initial?.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setReference(initial?.reference || "");
    setTitle(initial?.title || "");
    setBusinessType(initial?.business_type || "");
    setPropertyType(initial?.property_type || "");
    setTypology(initial?.typology || "");
    setPrice(initial?.price?.toString() || "");
    setUsableArea(initial?.usable_area?.toString() || "");
    setLandArea(initial?.land_area?.toString() || "");
    setMunicipality(initial?.municipality || "");
    setParish(initial?.parish || "");
    setLocation(initial?.location || "");
    setCondition(initial?.condition || "");
    setEnergyCertificate(initial?.energy_certificate || "");
    setStatus(initial?.status || "available");
    setAgentId(initial?.agent_id?.toString() || "");
    setDescription(initial?.description || "");
    setObservations(initial?.observations || "");
    setExistingImages(initial?.images || []);
    setNewFiles([]);
    setErrors([]);
  }, [initial]);

  const derivedLocation = useMemo(() => {
    if (location) return location;
    if (municipality || parish) return [municipality, parish].filter(Boolean).join(" / ");
    return "";
  }, [location, municipality, parish]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!reference) errs.push("Referência é obrigatória");
    if (!title && !reference) errs.push("Título é obrigatório");
    const priceNumber = toNumber(price);
    if (priceNumber === null) errs.push("Preço é obrigatório e deve ser numérico");
    const usableAreaNumber = toNumber(usableArea);
    const landAreaNumber = toNumber(landArea);
    const agentIdNumber = agentId ? Number(agentId) : null;
    if (agentId && Number.isNaN(agentIdNumber)) errs.push("ID de agente inválido");
    if (existingImages.length === 0 && newFiles.length === 0) errs.push("Pelo menos uma imagem é obrigatória");
    setErrors(errs);
    if (errs.length) return;

    const payload: BackofficePropertyPayload = {
      reference,
      title: title || reference,
      business_type: businessType || null,
      property_type: propertyType || null,
      typology: typology || null,
      description: description || null,
      observations: observations || null,
      price: priceNumber,
      usable_area: usableAreaNumber,
      land_area: landAreaNumber,
      location: derivedLocation || null,
      municipality: municipality || null,
      parish: parish || null,
      condition: condition || null,
      energy_certificate: energyCertificate || null,
      status: status || "available",
      agent_id: agentIdNumber,
      images: existingImages,
    };

    onSubmit({
      payload,
      files: newFiles,
      imagesToKeep: existingImages,
    });
  };

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setNewFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Secção: Identificação */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Identificação</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[#999]">Referência *</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: TV1234"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apartamento T2 em Leiria"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
        </div>
      </div>

      {/* Secção: Tipo de negócio */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Tipo de Negócio</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-[#999]">Negócio *</label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            >
              <option value="">Selecione...</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Tipo de Imóvel *</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            >
              <option value="">Selecione...</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Tipologia</label>
            <select
              value={typology}
              onChange={(e) => setTypology(e.target.value)}
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            >
              <option value="">Selecione...</option>
              {TYPOLOGIES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Secção: Valores e Áreas */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Valores e Áreas</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-[#999]">Preço (€) *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="150000"
              type="text"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Área útil (m²)</label>
            <input
              value={usableArea}
              onChange={(e) => setUsableArea(e.target.value)}
              placeholder="120"
              type="text"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Área terreno (m²)</label>
            <input
              value={landArea}
              onChange={(e) => setLandArea(e.target.value)}
              placeholder="500"
              type="text"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
        </div>
      </div>

      {/* Secção: Localização */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Localização</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-[#999]">Concelho</label>
            <input
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder="Leiria"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Freguesia</label>
            <input
              value={parish}
              onChange={(e) => setParish(e.target.value)}
              placeholder="Leiria, Pousos, Barreira e Cortes"
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Localização específica</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Rua..."
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            />
          </div>
        </div>
      </div>

      {/* Secção: Estado e Certificação */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Estado e Certificação</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-[#999]">Estado</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            >
              <option value="">Selecione...</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Certificado Energético</label>
            <select
              value={energyCertificate}
              onChange={(e) => setEnergyCertificate(e.target.value)}
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            >
              <option value="">Selecione...</option>
              {ENERGY_CERTIFICATES.map((cert) => (
                <option key={cert} value={cert}>{cert}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#999]">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Secção: Agente */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Agente Responsável</h3>
        <div>
          <label className="mb-1 block text-xs text-[#999]">ID do Agente</label>
          <input
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="35"
            type="number"
            className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600] md:w-1/3"
          />
        </div>
      </div>

      {/* Secção: Descrição */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Descrição</h3>
        <div>
          <label className="mb-1 block text-xs text-[#999]">Descrição Pública</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição detalhada do imóvel para o site..."
            rows={4}
            className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[#999]">Observações Internas</label>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Notas internas, não visíveis no site..."
            rows={3}
            className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
          />
        </div>
      </div>

      {/* Secção: Imagens */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#888]">Imagens *</h3>
        <UploadArea
          existingUrls={existingImages}
          files={newFiles}
          onAddFiles={handleAddFiles}
          onRemoveFile={(idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
          onRemoveExisting={(idx) => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
        />
      </div>

      {errors.length > 0 && (
        <div className="rounded border border-red-500/30 bg-red-500/10 p-3">
          <p className="mb-2 text-xs font-semibold text-red-400">Erros de validação:</p>
          <ul className="list-disc space-y-1 pl-4 text-xs text-red-400">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-[#E10600] to-[#a10600] px-4 py-3 text-sm font-semibold uppercase tracking-wide shadow-[0_0_12px_rgba(225,6,0,0.6)] transition hover:shadow-[0_0_20px_rgba(225,6,0,0.8)] disabled:opacity-60"
      >
        {loading ? "A guardar..." : "Guardar Imóvel"}
      </button>
    </form>
  );
}

export default PropertyForm;
