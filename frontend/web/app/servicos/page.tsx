import { SectionHeader } from "../../components/SectionHeader";
import Link from "next/link";

const items = [
  { title: "Captação e Mediação", desc: "Gestão de imóveis, visitas, propostas e faturação." },
  { title: "Automação", desc: "Triggers, bots, notificações, calendar e feed em tempo real." },
  { title: "Marketing Digital", desc: "Landing pages, microsites, campanhas omnicanal." },
];

export default function ServicosPage() {
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Serviços" title="Experiência end-to-end" subtitle="Website público com CRM PLUS por trás." />
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl border border-[#2A2A2E] bg-[#151518] p-4">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-[#C5C5C5]">{item.desc}</p>
          </div>
        ))}
      </div>
      <Link href="/contactos" className="text-sm text-[#E10600] hover:underline">
        Fala connosco →
      </Link>
    </div>
  );
}
'use client';

import Link from "next/link";
import Image from "next/image";

export default function ServicosPage() {
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

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">Serviços</p>
          <h1 className="text-3xl font-semibold">O que fazemos</h1>
          <p className="text-sm text-[#C5C5C5]">TODO: Substituir por layout definitivo quando existirem renders oficiais.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {["Consultoria", "Gestão de Arrendamento", "Promoção", "Avaliação"].map((svc) => (
            <div key={svc} className="rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-4">
              <p className="text-lg font-semibold">{svc}</p>
              <p className="text-sm text-[#C5C5C5]">Descrição breve do serviço.</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
