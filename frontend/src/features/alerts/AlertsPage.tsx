import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge, Card, EmptyState, PageMotion, SkeletonBlock, StaggerCard, StaggerGrid } from "@/design-system";
import { formatDate } from "@/lib/format";
import { fetchAlertCounts, fetchAlerts } from "./alertsApi";
import type { AlertOut } from "./alertsApi";

const LEVELS: { key: string; label: string; tone: "critical" | "warning" | "info" | "neutral" }[] = [
  { key: "critico", label: "Critico", tone: "critical" },
  { key: "alto", label: "Alto", tone: "warning" },
  { key: "medio", label: "Medio", tone: "info" },
  { key: "bajo", label: "Bajo", tone: "neutral" },
];

const TYPE_LABELS: Record<string, string> = {
  revision_prioritaria: "Revision prioritaria",
  expediente_incompleto: "Expediente incompleto",
  documento_pendiente: "Documento pendiente",
  decision_pendiente: "Decision pendiente de ejecucion",
  caso_sin_movimiento: "Caso sin movimiento",
  calculo_pendiente_validacion: "Calculo pendiente de validacion",
  proximo_vencimiento: "Proximo vencimiento",
  redencion_pendiente: "Redencion pendiente de revisar",
};

export default function AlertsPage() {
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: counts } = useQuery({ queryKey: ["alerts", "counts"], queryFn: fetchAlertCounts });
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts", "list", levelFilter],
    queryFn: () => fetchAlerts(levelFilter ? { level: levelFilter } : undefined),
  });

  const total = useMemo(
    () => (counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0),
    [counts]
  );

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ margin: 0 }}>Alertas operativas</h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "720px" }}>
          BIALCO expone {total} alertas generadas a partir de los datos sinteticos de esta
          demostracion. Cada alerta explica que ocurrio, por que se genero y la accion
          administrativa recomendada. BIALCO no toma decisiones legales.
        </p>
      </header>

      <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
        <FilterChip active={levelFilter === null} onClick={() => setLevelFilter(null)} label={`Todas (${total})`} />
        {LEVELS.map((level) => (
          <FilterChip
            key={level.key}
            active={levelFilter === level.key}
            onClick={() => setLevelFilter(level.key)}
            label={`${level.label} (${counts?.[level.key] ?? 0})`}
            tone={level.tone}
          />
        ))}
      </div>

      {isLoading && <SkeletonBlock />}

      {alerts && alerts.length === 0 && (
        <Card>
          <EmptyState title="Sin alertas para este filtro" description="Ajusta el filtro de prioridad para ver otras alertas." />
        </Card>
      )}

      {alerts && alerts.length > 0 && (
        <StaggerGrid
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          {alerts.slice(0, 60).map((alert) => (
            <StaggerCard key={alert.id}>
              <AlertCard alert={alert} onOpenPerson={() => navigate(`/personas/${alert.personId}`)} />
            </StaggerCard>
          ))}
        </StaggerGrid>
      )}
    </PageMotion>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tone?: "critical" | "warning" | "info" | "neutral";
}) {
  const borderColor = active
    ? tone === "critical"
      ? "var(--color-critical)"
      : tone === "warning"
        ? "var(--color-warning)"
        : tone === "info"
          ? "var(--color-info)"
          : "var(--color-accent)"
    : "var(--color-border)";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: "var(--radius-pill)",
        border: `1px solid ${borderColor}`,
        background: active ? "var(--color-bg-surface-raised)" : "transparent",
        color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
        cursor: "pointer",
        fontSize: "var(--font-size-sm)",
      }}
    >
      {label}
    </button>
  );
}

function AlertCard({ alert, onOpenPerson }: { alert: AlertOut; onOpenPerson: () => void }) {
  const levelMeta = LEVELS.find((l) => l.key === alert.level)!;
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-sm)" }}>
        <Badge tone={levelMeta.tone}>{levelMeta.label}</Badge>
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          {formatDate(alert.date)}
        </span>
      </div>
      <p style={{ fontWeight: 600, margin: "var(--space-sm) 0 4px" }}>{TYPE_LABELS[alert.type] ?? alert.title}</p>
      <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
        {alert.description}
      </p>
      <div
        style={{
          marginTop: "var(--space-sm)",
          padding: "var(--space-sm)",
          borderRadius: "var(--radius-sm)",
          background: "var(--color-bg-subtle)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        <strong style={{ color: "var(--color-text-secondary)" }}>Por que: </strong>
        {alert.reason}
        <br />
        <strong style={{ color: "var(--color-text-secondary)" }}>Accion recomendada: </strong>
        {alert.recommendedAction}
      </div>
      <div
        style={{
          marginTop: "var(--space-sm)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "var(--font-size-xs)",
        }}
      >
        <button
          type="button"
          onClick={onOpenPerson}
          style={{ background: "none", border: "none", color: "var(--color-accent-strong)", cursor: "pointer", padding: 0 }}
        >
          {alert.personName} →
        </button>
        <span style={{ color: "var(--color-text-muted)" }}>{alert.establishmentName}</span>
      </div>
    </Card>
  );
}
