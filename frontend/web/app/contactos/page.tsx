import Link from "next/link";
import { BrandImage } from "../../components/BrandImage";
import { LeadForm } from "../../components/LeadForm";
import { SectionHeader } from "../../components/SectionHeader";

export default function ContactosPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <header className="flex items-center justify-between border-b border-[#111113] bg-[#050506]/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandImage src="/brand/logoCRMPLUSS.png" alt="Imóveis Mais" width={32} height={32} />
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

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <SectionHeader
          eyebrow="Contacto"
          title="Fala com a agência"
          subtitle="Formulário ligado ao endpoint /leads (ou fallback local)."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-[#1F1F22] bg-[#0F0F10] p-6">
            <p className="text-lg font-semibold">Contactos diretos</p>
            <p className="text-sm text-[#C5C5C5]">Telefone: —</p>
            <p className="text-sm text-[#C5C5C5]">Email: —</p>
            <p className="text-sm text-[#C5C5C5]">Morada: —</p>
            <p className="text-xs text-[#C5C5C5]">TODO: Substituir por layout definitivo quando existirem renders oficiais.</p>
          </div>
          <LeadForm source="contactos" />
        </div>
      </main>
    </div>
  );
}
