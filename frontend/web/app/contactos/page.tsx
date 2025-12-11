import { LeadForm } from "../../components/LeadForm";
import { SectionHeader } from "../../components/SectionHeader";

export default function ContactosPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SectionHeader
        eyebrow="Contacto"
        title="Fala com a agência"
        subtitle="Formulário ligado ao endpoint /leads. Em caso de falha, guardamos localmente e mostramos sucesso."
      />
      <LeadForm source="contactos" />
    </div>
  );
}
