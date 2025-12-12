import Link from "next/link";
import { BrandImage } from "../components/BrandImage";
import { Carousel } from "../components/Carousel";
import { PropertyCard } from "../components/PropertyCard";
import { SectionHeader } from "../components/SectionHeader";
import { getProperties } from "../src/services/publicApi";
import { LeadForm } from "../components/LeadForm";

export default async function Home() {
  const properties = await getProperties(12);

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

      <main className="space-y-12 pb-12">
        <section className="relative isolate overflow-hidden">
          <Image src="/renders/7.png" alt="Hero" width={1920} height={1080} className="h-[520px] w-full object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/40" />
          <div className="absolute inset-0 flex items-center px-8 py-12 md:px-16">
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold md:text-5xl">Imóveis Mais – plataforma ligada ao CRM PLUS</h1>
              <p className="text-lg text-[#C5C5C5]">Website público conectado a dados reais do backend.</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/imoveis"
                  className="rounded-full bg-gradient-to-r from-[#E10600] to-[#a10600] px-5 py-3 text-sm font-semibold shadow-[0_0_16px_rgba(225,6,0,0.6)]"
                >
                  Ver imóveis
                </Link>
                <Link
                  href="/contactos"
                  className="rounded-full border border-[#2A2A2E] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#E10600]"
                >
                  Falar com a agência
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-12 px-6">
          <section className="space-y-4">
            <SectionHeader eyebrow="Imóveis" title="Portefólio completo" subtitle="Dados reais do backend FastAPI." />
            <Carousel>
              {properties.map((p) => (
                <div className="min-w-[260px]" key={p.id}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </Carousel>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#2A2A2E] bg-[#151518] p-6">
              <SectionHeader
                eyebrow="Automação"
                title="Trigger → Automation → Action"
                subtitle="Integrações com portals, scoring inteligente, notificações e bots."
              />
              <ol className="mt-4 space-y-3 border-l border-[#2A2A2E] pl-4 text-sm text-[#C5C5C5]">
                <li>
                  <span className="text-[#E10600] font-semibold">Trigger:</span> Novo lead do website ou portal.
                </li>
                <li>
                  <span className="text-[#E10600] font-semibold">Automation:</span> Qualificação automática + routing por equipa.
                </li>
                <li>
                  <span className="text-[#E10600] font-semibold">Action:</span> Notifica agente, agenda visita, abre tarefas no CRM.
                </li>
              </ol>
            </div>
            <LeadForm source="homepage" title="Quero falar com um consultor" cta="Pedir contacto" />
          </section>
        </div>
      </main>
    </div>
  );
}
