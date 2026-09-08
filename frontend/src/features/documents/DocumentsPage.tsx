import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge, Card, PageMotion, SkeletonBlock, SyntheticDataBadge, Table, type TableColumn } from "@/design-system";
import { fetchDocuments } from "./documentsApi";
import type { DocumentRecord } from "./documentsApi";

const STATUS_LABEL: Record<string, string> = {
  completo: "Completo",
  faltante: "Faltante",
  en_revision: "En revision",
};

const STATUS_TONE: Record<string, "success" | "critical" | "warning"> = {
  completo: "success",
  faltante: "critical",
  en_revision: "warning",
};

export default function DocumentsPage() {
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", status],
    queryFn: () => fetchDocuments(status ? { status } : undefined),
  });

  const columns: TableColumn<DocumentRecord>[] = [
    { key: "person", header: "Persona", render: (d) => d.personName },
    { key: "category", header: "Categoria", render: (d) => d.category },
    {
      key: "status",
      header: "Estado",
      render: (d) => <Badge tone={STATUS_TONE[d.status]}>{STATUS_LABEL[d.status]}</Badge>,
    },
    { key: "uploaded", header: "Cargado", render: (d) => d.uploadedAt ?? "—" },
  ];

  const counts = (documents ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.status] = (acc[d.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Documentos</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Estado documental de los expedientes registrados en BIALCO.
          </p>
        </div>
        <SyntheticDataBadge />
      </header>

      <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-lg)" }}>
        {["", "completo", "faltante", "en_revision"].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatus(s)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              border: `1px solid ${status === s ? "var(--color-accent)" : "var(--color-border)"}`,
              background: status === s ? "var(--color-bg-surface-raised)" : "transparent",
              color: "var(--color-text-secondary)",
              cursor: "pointer",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {s ? `${STATUS_LABEL[s]} (${counts[s] ?? 0})` : "Todos"}
          </button>
        ))}
      </div>

      <Card title="Documentos por expediente">
        {isLoading ? (
          <SkeletonBlock />
        ) : (
          <Table
            columns={columns}
            rows={(documents ?? []).slice(0, 150)}
            rowKey={(d) => d.id}
            emptyMessage="No hay documentos para este filtro."
            onRowClick={(d) => navigate(`/personas/${d.personId}`)}
          />
        )}
      </Card>
    </PageMotion>
  );
}
