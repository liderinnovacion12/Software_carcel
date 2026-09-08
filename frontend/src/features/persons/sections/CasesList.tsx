import { useQuery } from "@tanstack/react-query";
import { Badge, Card, SkeletonBlock, Table, type TableColumn } from "@/design-system";
import { formatDate } from "@/lib/format";
import { fetchPersonCases, type LegalCaseOut } from "../personsApi";

export function CasesList({ personId }: { personId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["persons", personId, "cases"],
    queryFn: () => fetchPersonCases(personId),
  });

  const columns: TableColumn<LegalCaseOut>[] = [
    { key: "radicado", header: "Radicado", render: (c) => c.radicado },
    { key: "type", header: "Tipo de proceso", render: (c) => c.case_type_label },
    { key: "authority", header: "Autoridad", render: (c) => c.authority },
    {
      key: "status",
      header: "Estado",
      render: (c) => <Badge tone={c.status === "cerrado" ? "neutral" : "info"}>{c.status.replace(/_/g, " ")}</Badge>,
    },
    { key: "opened", header: "Apertura", render: (c) => formatDate(c.opened_at) },
  ];

  return (
    <Card title="Procesos legales">
      {isLoading ? (
        <SkeletonBlock />
      ) : (
        <Table
          columns={columns}
          rows={data ?? []}
          rowKey={(c) => c.id}
          emptyMessage="Esta persona no tiene procesos legales registrados."
        />
      )}
    </Card>
  );
}
