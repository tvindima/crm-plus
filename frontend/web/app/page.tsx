import Link from "next/link";
import Image from "next/image";
import { BrandImage } from "../components/BrandImage";
import { PropertyCard } from "../components/PropertyCard";
import { SectionHeader } from "../components/SectionHeader";
import { getProperties } from "../src/services/publicApi";
import { LeadForm } from "../components/LeadForm";
import { CarouselHorizontal } from "../components/CarouselHorizontal";

export default async function Home() {
  const properties = await getProperties(12);

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <header className="flex items-center justify-between border-b border-[#111113] bg-[#050506]/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandImage src="/brand/agency-logo.svg" alt="Imóveis Mais" width={32} height={32} />
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
        {/* Hero minimalista, imagem em destaque */}
        <section className="relative isolate overflow-hidden">
          <Image src="/renders/7.png" alt="Hero" width={1920} height={1080} className="h-[480px] w-full object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/40 to-transparent" />
          <div className="absolute bottom-8 left-6 md:left-12">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/imoveis"
                className="rounded-full bg-gradient-to-r from-[#4b9dff] via-[#7c3aed] to-[#ff4d7a] px-5 py-3 text-sm font-semibold shadow-[0_0_22px_rgba(75,157,255,0.6)]"
              >
                Ver imóveis
              </Link>
              <Link
                href="/imoveis?f=compra"
                className="rounded-full border border-white/20 bg-black/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#4b9dff]"
              >
                Comprar agora
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-12 px-6">
          <section className="space-y-4">
            <SectionHeader eyebrow="Imóveis" title="Novidades e Destaques" subtitle="" />
            <CarouselHorizontal>
              {properties.map((p) => (
                <div className="min-w-[260px] snap-center transition [transform-style:preserve-3d]" key={p.id}>
                  <PropertyCard property={p} />
                </div>
              ))}
            </CarouselHorizontal>
          </section>

          <section className="grid gap-6 md:grid-cols-2">
            <LeadForm source="homepage" title="Fala connosco" cta="Pedir contacto" />
            <div className="rounded-2xl border border-[#2A2A2E] bg-[#0B0B0D] p-6">
              <SectionHeader eyebrow="Equipa" title="Agentes em destaque" subtitle="Contacta diretamente." />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {properties.slice(0, 4).map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-[#1F1F22] bg-[#0F0F10] p-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-[#101012]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">Agente {idx + 1}</p>
                      <p className="truncate text-xs text-[#C5C5C5]">{p.location || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
