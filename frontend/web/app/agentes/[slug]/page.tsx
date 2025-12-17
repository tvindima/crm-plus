import { notFound } from "next/navigation";
import Link from "next/link";
import { getAgents, getProperties, Property } from "../../../src/services/publicApi";
import { HeroCarousel } from "../../../components/HeroCarousel";
import { CarouselHorizontal } from "../../../components/CarouselHorizontal";
import { LeadForm } from "../../../components/LeadForm";
import { SafeImage } from "../../../components/SafeImage";
import { getPropertyCover } from "../../../src/utils/placeholders";
import Image from "next/image";

type Props = { params: { slug: string } };

// Generate static params for all agents at build time
export async function generateStaticParams() {
  try {
    const agents = await getAgents();
    return agents.map((agent) => ({
      slug: normalizeSlug(agent.name),
    }));
  } catch (error) {
    console.error('[generateStaticParams] Error:', error);
    // Return common agent slugs as fallback
    return [
      { slug: 'marisa-barosa' },
      { slug: 'nelson-neto' },
      { slug: 'tiago-vindima' },
      { slug: 'joao-rodrigues' },
    ];
  }
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// Normalize name for URL slug
function normalizeSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-");
}

type RailConfig = {
  title: string;
  filter: (items: Property[]) => Property[];
  showRanking?: boolean;
  filterQuery?: string;
};

const MAX_ITEMS_PER_RAIL = 10;

function RailCard({ property, index, showRanking }: { property: Property; index: number; showRanking?: boolean }) {
  const price = property.price ? property.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" }) : "Preço sob consulta";
  return (
    <Link
      href={`/imovel/${encodeURIComponent(property.reference || property.title || `imovel-${property.id}`)}`}
      className="group relative min-w-[220px] snap-start overflow-hidden rounded-2xl bg-[#101012] transition hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <SafeImage
          src={getPropertyCover(property)}
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

function SpotlightCardVertical({ property }: { property: Property }) {
  const price = property.price ? property.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" }) : "Preço sob consulta";
  return (
    <Link
      href={`/imovel/${encodeURIComponent(property.reference || property.title || `imovel-${property.id}`)}`}
      className="group relative block overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-b from-white/5 to-transparent transition hover:-translate-y-1"
    >
      <div className="relative h-80 w-full overflow-hidden">
        <SafeImage
          src={getPropertyCover(property)}
          alt={property.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="300px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-[#E10600] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          Destaque
        </span>
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <h3 className="text-xl font-semibold text-white line-clamp-2">{property.title || property.reference}</h3>
        <div className="mt-2 space-y-1 text-sm text-[#C5C5C5]">
          <p>{property.typology || property.property_type || "Tipologia —"}</p>
          <p className="font-semibold text-white">{price}</p>
          <p className="text-xs">{property.location || property.municipality || "Localização reservada"}</p>
        </div>
      </div>
    </Link>
  );
}

// ✅ DEFINIÇÃO DE EQUIPAS - partilha de carteira de imóveis
const TEAMS = {
  "Pedro Olaio": {
    teamLeader: 40, // Pedro Olaio
    members: [40, 41, 39], // Pedro Olaio, João Olaio, Nuno Faria
  },
  "João Olaio": {
    teamLeader: 40, // Pedro Olaio (chefe)
    members: [40, 41, 39], // Mesma equipa
  },
  "Nuno Faria": {
    teamLeader: 40, // Pedro Olaio (chefe)
    members: [40, 41, 39], // Mesma equipa
  },
};

export default async function AgentPage({ params }: Props) {
  const agents = await getAgents(50);
  const allProperties = await getProperties(500);

  const normalizedSlug = normalizeSlug(decodeURIComponent(params.slug));
  const agent = agents.find((a) => normalizeSlug(a.name) === normalizedSlug);

  if (!agent) notFound();

  // ✅ Filter properties: se faz parte de equipa, mostra imóveis de TODA a equipa
  const teamConfig = TEAMS[agent.name as keyof typeof TEAMS];
  const properties = teamConfig
    ? allProperties.filter((p) => teamConfig.members.includes(p.agent_id ?? 0))
    : allProperties.filter((p) => p.agent_id === agent.id);

  // Staff members (support team) - matching structure from /agentes page
  const allStaffMembers = [
    { id: 19, name: "Ana Vindima", role: "Assistente de Tiago Vindima", phone: "918 503 014", avatar: "/avatars/19.png", isAgent: false, supportFor: "Tiago Vindima" },
    { id: 20, name: "Maria Olaio", role: "Diretora Financeira", phone: "244 001 003", avatar: "/avatars/20.png", isAgent: false },
    { id: 21, name: "Andreia Borges", role: "Assistente Administrativa", phone: "244 001 004", avatar: "/avatars/21.png", isAgent: false },
    { id: 22, name: "Sara Ferreira", role: "Assistente Administrativa", phone: "244 001 002", avatar: "/avatars/22.png", isAgent: false },
    { id: 23, name: "Cláudia Libânio", role: "Assistente de Bruno Libânio", phone: "912 118 911", avatar: "/avatars/23.png", isAgent: false, supportFor: "Bruno Libânio" },
  ];

  // Build team members list: only staff directly supporting this agent (or generic staff if no specific support)
  const teamMembers = [
    // Staff members that support this specific agent or general staff
    ...allStaffMembers
      .filter(staff => {
        // Include if staff supports this specific agent
        if ('supportFor' in staff && staff.supportFor === agent.name) return true;
        // Include general staff (no supportFor property or supportFor is empty)
        if (!('supportFor' in staff) || !staff.supportFor) return true;
        return false;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'))
  ];

  // Rail configurations (same as homepage but filtered)
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
  ];

  const getRailData = (properties: Property[]) =>
    railConfigs.map((config) => {
      let items = config.filter(properties);
      const totalItems = items.length;
      
      // Limit to MAX_ITEMS_PER_RAIL (10)
      items = items.slice(0, MAX_ITEMS_PER_RAIL);
      
      return {
        title: config.title,
        showRanking: config.showRanking,
        filterQuery: config.filterQuery || "",
        items,
        totalItems, // Total before limiting
      };
    });

  const heroProperties = properties.slice(0, 3);
  const spotlightProperties = properties.slice(0, 4);
  
  // IDs already shown in hero and spotlight
  const usedIds = new Set([...heroProperties, ...spotlightProperties].map(p => p.id));
  
  // Filter out already shown properties before creating rails
  const availableForRails = properties.filter(p => !usedIds.has(p.id));
  
  const rails = getRailData(availableForRails);

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      {/* Agent Header Banner */}
      <div className="relative border-b border-[#111113] bg-gradient-to-br from-[#E10600]/10 via-[#0B0B0D] to-[#050506]">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <Link
            href="/agentes"
            className="mb-4 inline-flex items-center gap-2 text-sm text-[#C5C5C5] transition hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar à equipa
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-[#E10600]/30">
              <Image
                src={agent.avatar || `/avatars/${normalizeSlug(agent.name)}.png`}
                alt={agent.name}
                fill
                className="object-cover"
                sizes="96px"
                priority
              />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">Microsite Pessoal</p>
              <h1 className="text-xl font-semibold md:text-3xl">{agent.name}</h1>
              <p className="mt-1 text-sm text-[#C5C5C5]">
                {properties.length} imóveis • {agent.team && `Equipa ${agent.team}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {agent.phone && (
                  <a
                    href={`tel:${agent.phone.replace(/\s/g, "")}`}
                    className="text-xs font-semibold text-[#E10600] hover:underline"
                  >
                    {agent.phone}
                  </a>
                )}
                <span className="text-[#2A2A2E]">•</span>
                <a
                  href={`mailto:${agent.email}`}
                  className="text-xs text-[#C5C5C5] hover:text-white"
                >
                  {agent.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="space-y-12 pb-16">
        <HeroCarousel properties={heroProperties} />

        {/* ✅ Seção de Membros da Equipa */}
        {teamConfig && (
          <section className="mx-auto max-w-6xl space-y-6 px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">
                Equipa {agents.find(a => a.id === teamConfig.teamLeader)?.name.split(' ')[0]}
              </p>
              <h2 className="text-xl font-semibold md:text-3xl">
                Consultores da Equipa
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents
                .filter(a => teamConfig.members.includes(a.id) && a.id !== agent.id)
                .map((member) => (
                  <Link
                    key={member.id}
                    href={`/agentes/${normalizeSlug(member.name)}`}
                    className="flex items-center gap-4 rounded-xl border border-[#2A2A2E] bg-[#151518] p-4 transition hover:border-[#E10600]/50"
                  >
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-[#E10600]/30">
                      <Image
                        src={member.avatar || `/avatars/${normalizeSlug(member.name)}.png`}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{member.name}</p>
                      {member.id === teamConfig.teamLeader && (
                        <p className="text-xs text-[#E10600]">Chefe de Equipa</p>
                      )}
                      <p className="text-xs text-[#C5C5C5]">{member.phone || member.email}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {spotlightProperties.length > 0 && (
          <section className="space-y-6 px-6">
            <div className="mx-auto max-w-6xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">Destaques de {agent.name.split(" ")[0]}</p>
              <h2 className="text-xl font-semibold md:text-3xl">Em destaque agora</h2>
            </div>
            <CarouselHorizontal>
              {spotlightProperties.map((property) => (
                <div key={property.id} className="min-w-[280px] snap-center pr-4">
                  <SpotlightCardVertical property={property} />
                </div>
              ))}
            </CarouselHorizontal>
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
                      <h3 className="text-lg font-semibold md:text-2xl">
                        {rail.title} <span className="text-sm text-[#666]">({rail.totalItems} imóveis)</span>
                      </h3>
                    </div>
                    {rail.totalItems > MAX_ITEMS_PER_RAIL && (
                      <Link
                        href={`/imoveis${rail.filterQuery}`}
                        className="flex items-center gap-2 text-sm font-semibold text-[#E10600] transition hover:text-white"
                      >
                        Ver Todos
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
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

        {teamMembers.length > 0 && (
          <section className="mx-auto max-w-6xl space-y-6 px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">
                Equipa Imóveis Mais
              </p>
              <h2 className="text-xl font-semibold md:text-3xl">
                Consultores e Equipa de Apoio
              </h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {teamMembers.map((member) => (
                <Link
                  key={member.id}
                  href={member.isAgent ? `/agentes/${normalizeSlug(member.name)}` : '#'}
                  className={`flex items-center gap-4 rounded-xl border border-[#2A2A2E] bg-[#151518] p-4 transition ${
                    member.isAgent ? 'hover:border-[#E10600]/50' : 'cursor-default'
                  }`}
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={member.avatar || "/avatars/placeholder.png"}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{member.name}</h4>
                    <p className="text-sm text-[#E10600]">{member.role}</p>
                    {member.phone && (
                      <p className="text-sm text-[#C5C5C5]">{member.phone}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 rounded-3xl border border-[#2A2A2E] bg-gradient-to-br from-[#0F0F10] to-[#070708] p-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E10600]">Contacto direto</p>
              <h2 className="text-xl font-semibold md:text-3xl">Fale com {agent.name.split(" ")[0]}</h2>
              <p className="text-sm text-[#C5C5C5]">
                Tem questões sobre um imóvel ou pretende agendar uma visita? 
                Preencha o formulário e entrarei em contacto consigo brevemente.
              </p>
            </div>
            <LeadForm source={`agent-${agent.name}`} title="Quero ser contactado" cta="Enviar mensagem" />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#111113] bg-[#050506] px-6 py-8 text-sm text-[#C5C5C5]">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-white">Microsite de {agent.name}</p>
            <p>Imóveis Mais • Powered by CRM PLUS</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/privacidade" className="hover:text-white">Privacidade</Link>
            <Link href="/contactos" className="hover:text-white">Contactos</Link>
            <Link href="/imoveis" className="hover:text-white">Ver todos os imóveis</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
