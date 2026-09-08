import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Card, EmptyState, SkeletonBlock } from "@/design-system";
import { formatDate } from "@/lib/format";
import { fetchPersonCalculations, ruleLabel } from "./calculationsApi";
import { CalculationDetailTable } from "./CalculationDetailTable";

interface Props {
  personId: string;
}

export function CalculationPanel({ personId }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["calculations", personId],
    queryFn: () => fetchPersonCalculations(personId),
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card title="Calculo de tiempo y condena">
      {isLoading && <SkeletonBlock />}
      {isError && (
        <p style={{ color: "var(--color-critical)" }}>No fue posible cargar los calculos.</p>
      )}
      {data && data.length === 0 && (
        <EmptyState
          title="Sin calculos registrados"
          description="Esta persona aun no tiene un calculo de tiempo/condena ejecutado."
        />
      )}

      {data && data.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          {data.map((run) => {
            const isExpanded = expandedId === run.id;
            return (
              <div
                key={run.id}
                style={{
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-md)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-sm)" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{ruleLabel(run.rule_reference)}</p>
                    <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      Calculado el {formatDate(run.calculation_date)} · Responsable: {run.responsible_source}
                    </p>
                  </div>
                  <Badge tone="synthetic">Regla de demostracion</Badge>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "var(--space-sm)",
                    marginTop: "var(--space-md)",
                  }}
                >
                  {Object.entries(run.result_summary).map(([key, value]) => (
                    <div key={key}>
                      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        {key.replace(/_/g, " ")}
                      </p>
                      <p style={{ margin: 0, fontWeight: 600 }}>{String(value)}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : run.id)}
                  style={{
                    marginTop: "var(--space-md)",
                    background: "transparent",
                    border: "none",
                    color: "var(--color-accent-strong)",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                    padding: 0,
                  }}
                >
                  {isExpanded ? "Ocultar detalle de trazabilidad" : "Ver detalle de trazabilidad"}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: "var(--space-sm)" }}>
                    <CalculationDetailTable details={run.details} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
