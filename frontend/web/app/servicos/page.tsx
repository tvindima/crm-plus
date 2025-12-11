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
