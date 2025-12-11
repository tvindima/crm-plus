'use client';

import { FormEvent, useEffect, useState } from "react";
import { UploadArea } from "./UploadArea";
import { PropertyPayload } from "../hooks/usePropertiesStore";

type Props = {
  initial?: Partial<PropertyPayload>;
  onSubmit: (payload: PropertyPayload) => void;
};

export function PropertyForm({ initial, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title || "");
  const [price, setPrice] = useState<string>(initial?.price?.toString() || "");
  const [area, setArea] = useState<string>(initial?.area?.toString() || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [status, setStatus] = useState(initial?.status || "available");
  const [description, setDescription] = useState(initial?.description || "");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setTitle(initial?.title || "");
    setPrice(initial?.price?.toString() || "");
    setArea(initial?.area?.toString() || "");
    setLocation(initial?.location || "");
    setStatus(initial?.status || "available");
    setDescription(initial?.description || "");
    setImages(initial?.images || []);
  }, [initial]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!title) errs.push("Referência/título é obrigatório");
    if (!price) errs.push("Preço é obrigatório");
    if (!area) errs.push("Área é obrigatória");
    if (images.length === 0) errs.push("Pelo menos uma imagem é obrigatória");
    setErrors(errs);
    if (errs.length) return;

    onSubmit({
      title,
      price: price ? Number(price) : null,
      area: area ? Number(area) : null,
      location: location || null,
      status,
      description,
      agentId: null,
      images,
    });
  };

  const handleAddFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const names = Array.from(fileList).map((f) => f.name);
    setImages((prev) => [...prev, ...names]);
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Referência / Título"
        className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preço (€)"
          className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        />
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Área (m²)"
          className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
        />
      </div>
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Concelho / Freguesia"
        className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
      >
        <option value="available">Disponível</option>
        <option value="reserved">Reservado</option>
        <option value="sold">Vendido</option>
      </select>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descrição"
        rows={3}
        className="w-full rounded border border-[#2A2A2E] bg-[#151518] px-3 py-2 text-sm text-white outline-none focus:border-[#E10600]"
      />
      <UploadArea files={images} onAdd={handleAddFiles} onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))} />
      {errors.length > 0 && (
        <ul className="list-disc space-y-1 pl-4 text-xs text-red-400">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        className="w-full rounded bg-gradient-to-r from-[#E10600] to-[#a10600] px-4 py-2 text-sm font-semibold shadow-[0_0_12px_rgba(225,6,0,0.6)]"
      >
        Guardar
      </button>
    </form>
  );
}
