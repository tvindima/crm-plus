import { notFound } from "next/navigation";
import Link from "next/link";
import { getPropertyByTitle, getAgents, Property, Agent } from "../../../src/services/publicApi";
import { PropertyGallery } from "../../../components/PropertyGallery";
import { PropertyMap } from "../../../components/PropertyMap";
import { AgentContactCard } from "../../../components/AgentContactCard";
import { PropertyVideo } from "../../../components/PropertyVideo";
import { FavoriteButton } from "../../../components/FavoriteButton";

type Props = { params: { referencia: string } };

// Get placeholder images for a property
function getPropertyImages(property: Property): string[] {
  if (property.images && property.images.length > 0) {
    return property.images;
  }
  // Fallback to placeholder
  const ref = property.reference || property.title;
  return [`/placeholders/${ref}.jpg`];
}

// Find a random agent (in real app, this would be the property's assigned agent)
async function getPropertyAgent(): Promise<Agent | null> {
  try {
    const agents = await getAgents(50);
    if (agents.length > 0) {
      return agents[Math.floor(Math.random() * agents.length)];
    }
    return null;
  } catch {
    return null;
  }
}

export default async function ImovelDetail({ params }: Props) {
  const ref = decodeURIComponent(params.referencia);
  const property = await getPropertyByTitle(ref);

  if (!property) {
    notFound();
  }

  const images = getPropertyImages(property);
  const agent = await getPropertyAgent();

  const price = property.price
    ? property.price.toLocaleString("pt-PT", { style: "currency", currency: "EUR" })
    : "Preço sob consulta";

  const fullLocation = property.location ||
    [property.municipality, property.parish].filter(Boolean).join(", ") ||
    "Localização reservada";

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[#C5C5C5]">
        <Link href="/" className="hover:text-white">Início</Link>
        <span>/</span>
        <Link href="/imoveis" className="hover:text-white">Imóveis</Link>
        <span>/</span>
        <span className="text-white">{property.title || property.reference}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column - Property Details */}
        <div className="space-y-8">
          {/* Gallery */}
          <PropertyGallery images={images} title={property.title} />

          {/* Title and Price */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#E10600]">
                  {property.business_type || "Venda"}
                </p>
                <h1 className="text-3xl font-semibold text-white md:text-4xl">
                  {property.property_type || "Imóvel"} {property.typology}
                </h1>
                <p className="mt-2 text-lg text-[#C5C5C5]">{fullLocation}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{price}</p>
                {property.usable_area && property.price && (
                  <p className="text-sm text-[#C5C5C5]">
                    {Math.round(property.price / property.usable_area).toLocaleString("pt-PT")} €/m²
                  </p>
                )}
              </div>
            </div>

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-3">
              {property.typology && (
                <span className="rounded-full bg-[#E10600]/20 px-4 py-2 text-sm font-semibold text-[#E10600]">
                  {property.typology}
                </span>
              )}
              {property.usable_area && (
                <span className="rounded-full bg-[#151518] px-4 py-2 text-sm text-[#C5C5C5]">
                  {property.usable_area} m² úteis
                </span>
              )}
              {property.area && property.area !== property.usable_area && (
                <span className="rounded-full bg-[#151518] px-4 py-2 text-sm text-[#C5C5C5]">
                  {property.area} m² brutos
                </span>
              )}
              {property.energy_certificate && (
                <span className="rounded-full bg-[#151518] px-4 py-2 text-sm text-[#C5C5C5]">
                  Cert. Energético: {property.energy_certificate}
                </span>
              )}
              {property.condition && (
                <span className="rounded-full bg-[#151518] px-4 py-2 text-sm text-[#C5C5C5]">
                  {property.condition}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="space-y-3 rounded-2xl bg-[#151518] p-6 ring-1 ring-[#1F1F22]">
              <h2 className="text-lg font-semibold text-white">Descrição</h2>
              <p className="whitespace-pre-line text-[#C5C5C5]">{property.description}</p>
            </div>
          )}

          {/* Observations */}
          {property.observations && (
            <div className="space-y-3 rounded-2xl bg-[#151518] p-6 ring-1 ring-[#1F1F22]">
              <h2 className="text-lg font-semibold text-white">Observações</h2>
              <p className="whitespace-pre-line text-[#C5C5C5]">{property.observations}</p>
            </div>
          )}

          {/* Details Table */}
          <div className="rounded-2xl bg-[#151518] p-6 ring-1 ring-[#1F1F22]">
            <h2 className="mb-4 text-lg font-semibold text-white">Detalhes do Imóvel</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow label="Referência" value={property.reference || property.title} />
              <DetailRow label="Tipo de Imóvel" value={property.property_type} />
              <DetailRow label="Tipologia" value={property.typology} />
              <DetailRow label="Negócio" value={property.business_type} />
              <DetailRow label="Área Útil" value={property.usable_area ? `${property.usable_area} m²` : null} />
              <DetailRow label="Área Bruta" value={property.area ? `${property.area} m²` : null} />
              <DetailRow label="Estado" value={property.condition} />
              <DetailRow label="Cert. Energético" value={property.energy_certificate} />
              <DetailRow label="Concelho" value={property.municipality} />
              <DetailRow label="Freguesia" value={property.parish} />
              <DetailRow label="Status" value={property.status} />
            </div>
          </div>

          {/* Map Section */}
          <div className="rounded-2xl bg-[#151518] p-6 ring-1 ring-[#1F1F22]">
            <PropertyMap
              location={property.location || ""}
              municipality={property.municipality}
              parish={property.parish}
            />
          </div>
        </div>

        {/* Right Column - Agent & Actions */}
        <div className="space-y-6">
          {/* Sticky Container */}
          <div className="lg:sticky lg:top-24">
            {/* Agent Card */}
            <AgentContactCard agent={agent} propertyTitle={property.title} />

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <FavoriteButton propertyId={property.id} propertyTitle={property.title} />
              
              <PropertyVideo
                videoUrl={null} // Would come from property.video_url in real implementation
                propertyTitle={property.title}
              />

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0B0D]/70 px-4 py-3 text-sm font-semibold text-white ring-1 ring-[#1F1F22] transition hover:ring-[#E10600]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Partilhar imóvel
              </button>

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B0B0D]/70 px-4 py-3 text-sm font-semibold text-white ring-1 ring-[#1F1F22] transition hover:ring-[#E10600]">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir ficha
              </button>
            </div>

            {/* Quick Contact */}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-[#E10600]/20 to-[#E10600]/5 p-6 ring-1 ring-[#E10600]/30">
              <p className="text-sm font-semibold text-white">Interessado neste imóvel?</p>
              <p className="mt-1 text-sm text-[#C5C5C5]">
                A nossa equipa está disponível para agendar uma visita personalizada.
              </p>
              <Link
                href="/contactos"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#E10600] hover:underline"
              >
                Contactar agência
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b border-[#1F1F22] pb-2">
      <span className="text-sm text-[#C5C5C5]">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
