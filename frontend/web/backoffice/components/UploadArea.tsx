'use client';

import { useRef } from "react";

type Props = {
  files: string[];
  onAdd: (files: FileList | null) => void;
  onRemove: (idx: number) => void;
};

export function UploadArea({ files, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <div className="rounded border border-dashed border-[#2A2A2E] bg-[#151518] p-3">
      <p className="text-sm text-[#C5C5C5]">Upload de imagens (mock). Drag & drop ou clica para selecionar.</p>
      <div
        className="mt-2 flex cursor-pointer items-center justify-center rounded border border-[#2A2A2E] px-3 py-6 text-sm text-[#E10600]"
        onClick={() => inputRef.current?.click()}
      >
        Selecionar ficheiros
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onAdd(e.target.files)}
        />
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {files.map((file, idx) => (
          <div key={idx} className="rounded border border-[#2A2A2E] bg-[#0B0B0D] p-2 text-xs text-white">
            <p className="truncate">{file}</p>
            <button onClick={() => onRemove(idx)} className="text-[#E10600]">
              Remover
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-[#C5C5C5]">
        TODO: integração real de upload/reorder; atualmente só regista nomes localmente.
      </p>
    </div>
  );
}
