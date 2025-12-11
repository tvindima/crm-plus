import { notFound } from "next/navigation";
import { getPropertyByTitle } from "../../../src/services/publicApi";
import Link from "next/link";

type Props = { params: { referencia: string } };

export default async function ImovelDetail({ params }: Props) {
  const ref = decodeURIComponent(params.referencia);
  const property = await getPropertyByTitle(ref);

  if (!property) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link href="/imoveis" className="text-sm text-[#E10600] hover:underline">
        ← Voltar a Imóveis
      </Link>
      <div className="rounded-2xl border border-[#2A2A2E] bg-[#151518] p-6 shadow-lg shadow-[#E10600]/10">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#E10600]">Ref. {property.title}</p>
            <h1 className="text-3xl font-semibold text-white">{property.title}</h1>
            <p className="text-[#C5C5C5]">{property.location || "Localização indisponível"}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-white">€ {property.price ?? "—"}</p>
            <p className="text-sm text-[#C5C5C5]">Área {property.area ? `${property.area} m²` : "—"}</p>
            <p className="text-xs uppercase text-[#C5C5C5]">{property.status || "—"}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] p-4">
            <h3 className="text-lg font-semibold text-white">Descrição</h3>
            <p className="mt-2 text-sm text-[#C5C5C5]">
              {(property as any).description || "Descrição não disponível. Integração pronta para ficheiro final."}
            </p>
          </div>
          <div className="rounded-xl border border-[#2A2A2E] bg-[#0B0B0D] p-4">
            <h3 className="text-lg font-semibold text-white">CTA</h3>
            <p className="mt-2 text-sm text-[#C5C5C5]">
              Ativa leads diretas deste imóvel. Integração com /leads para contacto imediato do agente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
