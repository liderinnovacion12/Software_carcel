import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Card,
  Input,
  PageMotion,
  SkeletonBlock,
  Table,
  type TableColumn,
} from "@/design-system";
import { formatDate } from "@/lib/format";
import { CASE_STATUS_LABELS } from "@/data/constants";
import { fetchCaseStatusDistribution, fetchCases } from "./casesApi";
import type { CaseListItem } from "./casesApi";

const STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "critical" | "success"> = {
  identificado: "info",
  pendiente_revision: "warning",
  en_analisis: "info",
  documentacion_incompleta: "critical",
  documentacion_completa: "success",
  en_espera_decision: "warning",
  cerrado: "neutral",
};

export default function CasesPage() {
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: distribution } = useQuery({
    queryKey: ["cases", "distribution"],
    queryFn: fetchCaseStatusDistribution,
  });
  const { data: cases, isLoading } = useQuery({
    queryKey: ["cases", "list", status, query],
    queryFn: () => fetchCases({ status: status || undefined, query: query || undefined }),
  });

  const columns: TableColumn<CaseListItem>[] = [
    { key: "radicado", header: "Radicado", render: (c) => c.radicado },
    { key: "person", header: "Persona", render: (c) => c.person_name },
    { key: "type", header: "Tipo", render: (c) => c.case_type_label },
    {
      key: "status",
      header: "Estado",
      render: (c) => <Badge tone={STATUS_TONE[c.status] ?? "neutral"}>{c.status_label}</Badge>,
    },
    { key: "establishment", header: "Establecimiento", render: (c) => c.establishment_name ?? "—" },
    { key: "opened", header: "Apertura", render: (c) => formatDate(c.opened_at) },
  ];

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ margin: 0 }}>Casos</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Distribucion y seguimiento de todos los procesos legales registrados en BIALCO.
        </p>
      </header>

      {distribution && (
        <div
          style={{
            display: "flex",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
            marginBottom: "var(--space-lg)",
          }}
        >
          {distribution.map((d) => (
            <button
              key={d.status}
              type="button"
              onClick={() => setStatus(status === d.status ? "" : d.status)}
              style={{
                flex: "1 1 140px",
                textAlign: "left",
                cursor: "pointer",
                border: `1px solid ${status === d.status ? "var(--color-accent)" : "var(--color-border-subtle)"}`,
                background: "var(--color-bg-surface)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-sm) var(--space-md)",
              }}
            >
              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {d.label}
              </p>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-lg)" }}>{d.count}</p>
            </button>
          ))}
        </div>
      )}

      <Card
        title="Listado de procesos"
        actions={
          <div style={{ width: "260px" }}>
            <Input
              placeholder="Buscar por radicado o persona..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      >
        {isLoading ? (
          <SkeletonBlock />
        ) : (
          <Table
            columns={columns}
            rows={(cases ?? []).slice(0, 100)}
            rowKey={(c) => c.id}
            emptyMessage="No hay procesos que coincidan con el filtro."
            onRowClick={(c) => navigate(`/personas/${c.person_id}`)}
          />
        )}
        <p style={{ marginTop: "var(--space-sm)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          Seleccione una fila para abrir el perfil operativo-juridico de la persona.
        </p>
      </Card>
    </PageMotion>
  );
}

export { CASE_STATUS_LABELS };
