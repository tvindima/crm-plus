import { BackofficeLayout } from "../../../../../backoffice/components/BackofficeLayout";

type Props = { params: { id: string } };

export default function EditarImovelPage({ params }: Props) {
  return (
    <BackofficeLayout title={`Editar imóvel ${params.id}`}>
      <p className="text-sm text-[#C5C5C5]">
        Placeholder do editor de imóvel. TODO: adicionar formulário completo, upload de imagens e validação.
      </p>
    </BackofficeLayout>
  );
}
