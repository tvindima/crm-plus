import Link from "next/link";
import { Carousel } from "../components/Carousel";
import { PropertyCard } from "../components/PropertyCard";
import { SectionHeader } from "../components/SectionHeader";
import { getProperties, API_BASE } from "../src/services/publicApi";
import { LeadForm } from "../components/LeadForm";

export default async function Home() {
  const properties = await getProperties(12);

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-[#2A2A2E] bg-[#151518] p-8 shadow-[0_0_24px_rgba(225,6,0,0.15)]">
        <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">Tudo começa na tua agência</p>
        <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">
          Integração total entre website ↔ CRM PLUS
        </h1>
        <p className="mt-4 max-w-2xl text-[#C5C5C5]">
          Dados reais servidos pelo backend FastAPI em {API_BASE}. Carrosséis tipo Netflix para apresentar portefólio
          premium, pronto para leads e automação.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
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
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Destaques"
          title="Portefólio em movimento"
          subtitle="Cards escuros, glow vermelho, experiência responsiva estilo Netflix."
        />
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
              <span className="text-[#E10600] font-semibold">Automation:</span> Qualificação automática + routing por
              equipa.
            </li>
            <li>
              <span className="text-[#E10600] font-semibold">Action:</span> Notifica agente, agenda visita, abre tarefas
              no CRM.
            </li>
          </ol>
        </div>
        <LeadForm source="homepage" title="Quero falar com um consultor" cta="Pedir contacto" />
      </section>
    </div>
  );
}
