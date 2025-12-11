import { SectionHeader } from "../../components/SectionHeader";

export default function SobrePage() {
  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Sobre"
        title="Agência CRM PLUS"
        subtitle="Website público totalmente integrado com o CRM: leads, automação, notificações."
      />
      <div className="rounded-xl border border-[#2A2A2E] bg-[#151518] p-6 text-sm text-[#C5C5C5]">
        <p>
          Este site usa tema dark premium com acento #E10600, carrosséis estilo Netflix e navegação Agency → Team →
          Agent → Property. Totalmente responsivo e preparado para i18n.
        </p>
      </div>
    </div>
  );
}
