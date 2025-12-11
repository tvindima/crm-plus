export default function CookiesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold text-white">Cookies</h1>
      <p className="text-sm text-[#C5C5C5]">
        Aviso de cookies placeholder. Atualiza com política real e integra banner de consentimento se necessário.
      </p>
    </div>
  );
}
'use client';

import Link from "next/link";
import Image from "next/image";

export default function CookiesPage() {
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

      <main className="mx-auto max-w-4xl space-y-4 px-6 py-10">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">Cookies</p>
          <h1 className="text-3xl font-semibold">Política de Cookies</h1>
          <p className="text-sm text-[#C5C5C5]">TODO: Substituir por layout definitivo quando existirem renders oficiais.</p>
        </div>
        <div className="space-y-3 rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6 text-sm text-[#C5C5C5]">
          <p>1. O que são cookies</p>
          <p>2. Como usamos cookies</p>
          <p>3. Gestão de cookies</p>
        </div>
      </main>
    </div>
  );
}
