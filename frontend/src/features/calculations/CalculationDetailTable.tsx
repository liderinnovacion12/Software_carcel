import { Table, type TableColumn } from "@/design-system";
import type { CalculationDetailOut } from "./calculationsApi";

interface Props {
  details: CalculationDetailOut[];
}

export function CalculationDetailTable({ details }: Props) {
  const columns: TableColumn<CalculationDetailOut>[] = [
    { key: "step", header: "Paso", render: (d) => d.step_order, width: "48px" },
    { key: "label", header: "Descripcion", render: (d) => d.label },
    {
      key: "output",
      header: "Resultado",
      render: (d) => `${d.output_value} ${d.unit}`,
      width: "140px",
    },
    { key: "notes", header: "Notas", render: (d) => d.notes ?? "—" },
  ];

  return (
    <Table
      columns={columns}
      rows={details}
      rowKey={(d) => String(d.step_order)}
      emptyMessage="Este calculo no registro pasos detallados."
    />
  );
}
