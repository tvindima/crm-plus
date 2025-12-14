import Image from "next/image";
import { notFound } from "next/navigation";
import { getPropertyByTitle } from "../../../src/services/publicApi";
import Link from "next/link";
import { BrandImage } from "../../../components/BrandImage";

type Props = { params: { referencia: string } };

export default async function ImovelDetail({ params }: Props) {
  const ref = decodeURIComponent(params.referencia);
  const property = await getPropertyByTitle(ref);

  if (!property) {
    notFound();
  }

  const heroImage = property.images?.[0] || `/placeholders/${property.reference || property.title}.jpg`;

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

      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <BrandImage src={heroImage} alt={property.title} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/65 to-black/85" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-6 py-14">
          <Link href="/imoveis" className="text-sm text-[#E10600] hover:underline">
            ← Voltar a Imóveis
          </Link>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold md:text-5xl">
              {property.property_type || "Imóvel"} {property.typology || ""} à venda —{" "}
              {property.price ? property.price.toLocaleString("pt-PT") + "€" : "—"}
            </h1>
            <p className="text-lg text-[#C5C5C5]">
              Localização: {property.location || [property.municipality, property.parish].filter(Boolean).join(", ") || "—"}
            </p>
            <div className="flex flex-wrap gap-6 text-[#C5C5C5]">
              <span>Área: {property.usable_area ? `${property.usable_area} m²` : "—"}</span>
              <span>CCE: {property.energy_certificate || "—"}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl bg-black/30 p-4 ring-1 ring-[#1F1F22]">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#0B0B0D]">
              <span className="text-sm text-[#C5C5C5]">AG</span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold">Agente não disponível</p>
              <p className="text-sm text-[#C5C5C5]">TODO: ligar a informação real de agente quando backend expuser.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CTAButton label="Agendar Visita" />
            <CTAButton label="Falar com Agente" />
            <CTAButton label="Guardar Imóvel" />
          </div>
        </div>
      </main>
    </div>
  );
}

function CTAButton({ label }: { label: string }) {
  return (
    <button className="w-full rounded-xl bg-[#0B0B0D]/70 px-4 py-3 text-center text-sm font-semibold text-white ring-1 ring-[#1F1F22]">
      {label}
    </button>
  );
}
