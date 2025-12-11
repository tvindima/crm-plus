import { BackofficeLayout } from "../../../backoffice/components/BackofficeLayout";
import { DataTable } from "../../../backoffice/components/DataTable";
import { getBackofficeProperties } from "../../../src/services/backofficeApi";

export default async function ImoveisBackofficePage() {
  const properties = await getBackofficeProperties(200);

  return (
    <BackofficeLayout title="Imóveis">
      <DataTable
        columns={["Referência", "Localização", "Preço", "Área", "Estado"]}
        rows={properties.map((p) => [
          p.title,
          p.location || "—",
          p.price ? `€ ${p.price}` : "—",
          p.area ? `${p.area} m²` : "—",
          p.status || "—",
        ])}
        actions={["Editar", "Duplicar", "Apagar"]}
      />
    </BackofficeLayout>
  );
}
