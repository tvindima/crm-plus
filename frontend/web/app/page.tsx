import Link from "next/link";
import Image from "next/image";
import { BrandImage } from "../components/BrandImage";
import { getProperties, Property } from "../src/services/publicApi";
import { LeadForm } from "../components/LeadForm";
import { CarouselHorizontal } from "../components/CarouselHorizontal";

type RailConfig = {
  title: string;
  filter: (items: Property[]) => Property[];
  showRanking?: boolean;
  filterQuery?: string;
};

const MAX_ITEMS_PER_RAIL = 10;

const railConfigs: RailConfig[] = [
  {
    title: "Novidades e Destaques",
    filter: (items) => [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)),
    filterQuery: "",
  },
  {
    title: "Mais Vistos da Semana",
    filter: (items) => [...items].sort((a, b) => (b.usable_area ?? 0) - (a.usable_area ?? 0)),
    showRanking: true,
    filterQuery: "",
  },
  {
    title: "Imóveis com Rendimento",
    filter: (items) =>
      items.filter((p) => {
        const description = `${p.description ?? ""}${p.observations ?? ""}`.toLowerCase();
        return (
          (p.business_type ?? "").toLowerCase().includes("invest") ||
          description.includes("rendimento") ||
          (p.price ?? 0) > 450000
        );
      }),
    filterQuery: "?negocio=investimento",
  },
  {
    title: "Imóveis Comerciais",
    filter: (items) => items.filter((p) => (p.property_type ?? "").toLowerCase().includes("comer")),
    filterQuery: "?tipo=comercial",
  },
  {
    title: "Imóveis Luxury/Premium",
    filter: (items) =>
      items.filter(
        (p) =>
          (p.price ?? 0) >= 600000 ||
          (p.condition ?? "").toLowerCase().includes("lux") ||
          (p.property_type ?? "").toLowerCase().includes("villa")
      ),
    filterQuery: "?tipo=luxo",
  },
  {
    title: "Imóveis para Arrendamento",
    filter: (items) => items.filter((p) => (p.business_type ?? "").toLowerCase().includes("arrend")),
    filterQuery: "?negocio=arrendamento",
  },
  {
    title: "Apartamentos",
    filter: (items) =>
      items.filter(
        (p) =>
          (p.property_type ?? "").toLowerCase().includes("apart") ||
          (p.typology ?? "").toLowerCase().startsWith("t")
      ),
    filterQuery: "?tipo=apartamento",
  },
  {
    title: "Moradias",
    filter: (items) =>
      items.filter(
        (p) =>
          (p.property_type ?? "").toLowerCase().includes("moradia") ||
          (p.property_type ?? "").toLowerCase().includes("villa") ||
          (p.title ?? "").toLowerCase().includes("moradia")
      ),
    filterQuery: "?tipo=moradia",
  },
  {
    title: "Construção Nova",
    filter: (items) =>
      items.filter((p) => (p.condition ?? "").toLowerCase().includes("novo") || (p.description ?? "").toLowerCase().includes("construção")),
    filterQuery: "?condicao=novo",
  },
];

const getRailData = (properties: Property[]) =>
  railConfigs.map((config) => {
    const filtered = config.filter(properties);
    const source = filtered.length > 0 ? filtered : properties;
    return {
      title: config.title,
      showRanking: config.showRanking,
      filterQuery: config.filterQuery || "",
      items: source.slice(0, MAX_ITEMS_PER_RAIL),
    };
  });

const getImage = (property?: Property) => {
  if (property?.images?.[0]) return property.images[0];
  const ref = property?.reference || property?.title;
  if (ref) return `/placeholders/${ref}.jpg`;
  return "/renders/7.png";
};

function RailCard({ property, index, showRanking }: { property: Property; index: number; showRanking?: boolean }) {
  const price = property.price ? property.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" }) : "Preço sob consulta";
  return (
    <Link
      href={`/imovel/${encodeURIComponent(property.reference || property.title || `imovel-${property.id}`)}`}
      className="group relative min-w-[220px] snap-start overflow-hidden rounded-2xl bg-[#101012] transition hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={getImage(property)}
          alt={property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 80vw, 240px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        {showRanking && (
          <span className="absolute left-3 top-3 text-5xl font-extrabold text-white/30 drop-shadow-lg">{index + 1}</span>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-1">
          <p className="text-sm font-semibold text-white">{property.title || property.reference}</p>
          <p className="text-xs text-[#C5C5C5]">{property.location || property.municipality || "Localização reservada"}</p>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-xs text-[#C5C5C5]">
        <span className="font-semibold text-white">{price}</span>
        {property.typology && <span>{property.typology}</span>}
      </div>
    </Link>
  );
}

function SpotlightCard({ property }: { property: Property }) {
  const price = property.price ? property.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" }) : "Preço sob consulta";
  return (
    <Link
      href={`/imovel/${encodeURIComponent(property.reference || property.title || `imovel-${property.id}`)}`}
      className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-b from-white/5 to-transparent"
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={getImage(property)}
          alt={property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 90vw, 320px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-[#E10600]">Destaque</p>
        <h3 className="text-2xl font-semibold text-white">{property.title || property.reference}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#C5C5C5]">
          <span>{property.typology || property.property_type || "Tipologia —"}</span>
          <span>{price}</span>
          <span>{property.location || property.municipality || "Localização reservada"}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const properties = await getProperties(60);
  const heroProperties = properties.slice(0, 4);
  const rails = getRailData(properties);
  const heroBackground = getImage(heroProperties[0]);

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      {/* header removido: menu e branding únicos no layout global */}

      <main className="space-y-12 pb-16">
        <section className="relative isolate overflow-hidden">
          <Image
            src={heroBackground}
            alt="Imóveis em destaque"
            width={1920}
            height={1080}
            className="h-[520px] w-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <div className="absolute bottom-10 left-6 max-w-xl space-y-4 md:left-16">
            <p className="text-sm uppercase tracking-[0.3em] text-[#E10600]">Experiência Cinematográfica</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Descobre imóveis que valem o prime time</h1>
            <p className="text-sm text-[#C5C5C5]">
              Seleção semanal com curadoria de especialistas, disponível em catálogo imersivo ao estilo Netflix.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/imoveis"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[#E10600]/40"
              >
                Ver catálogo completo
              </Link>
              <Link
                href="/imoveis?f=arrendar"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
              >
                Imóveis para arrendamento
              </Link>
            </div>
          </div>
        </section>

        {heroProperties.length > 0 && (
          <section className="mx-auto max-w-6xl space-y-6 px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">Top 4 da Semana</p>
              <h2 className="text-3xl font-semibold">Em destaque agora</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {heroProperties.map((property) => (
                <SpotlightCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-12">
          {rails.map(
            (rail) =>
              rail.items.length > 0 && (
                <div key={rail.title} className="space-y-4 px-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">{rail.title.includes("Top") ? "Top 10" : "Coleção"}</p>
                      <h3 className="text-2xl font-semibold">{rail.title}</h3>
                    </div>
                    <Link href={`/imoveis${rail.filterQuery}`} className="rounded-full border border-[#E10600]/50 bg-[#E10600]/10 px-4 py-1.5 text-xs font-semibold text-[#E10600] transition hover:bg-[#E10600] hover:text-white">
                      Ver todos →
                    </Link>
                  </div>
                  <CarouselHorizontal>
                    {rail.items.map((property, idx) => (
                      <div key={`${rail.title}-${property.id}`} className="min-w-[230px] snap-center pr-3">
                        <RailCard property={property} index={idx} showRanking={rail.showRanking} />
                      </div>
                    ))}
                  </CarouselHorizontal>
                </div>
              )
          )}
        </section>

        <section className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 rounded-3xl border border-[#2A2A2E] bg-gradient-to-br from-[#0F0F10] to-[#070708] p-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">Curadoria pessoal</p>
              <h2 className="text-3xl font-semibold">Fala com o nosso studio e recebe sugestões privadas</h2>
              <p className="text-sm text-[#C5C5C5]">
                Mantemos o espírito “para si” com uma seleção privada enviada via e-mail ou chamada. Sem listas de agentes nesta zona—
                apenas experiências imersivas focadas em si.
              </p>
            </div>
            <LeadForm source="homepage" title="Quero ser contactado" cta="Pedir contacto" />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#111113] bg-[#050506] px-6 py-8 text-sm text-[#C5C5C5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-white">Imóveis Mais</p>
            <p>Experiência alimentada por CRM PLUS.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/privacidade" className="hover:text-white">
              Privacidade
            </Link>
            <Link href="/contactos" className="hover:text-white">
              Contactos
            </Link>
            <Link href="/imoveis" className="hover:text-white">
              Ver catálogo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
