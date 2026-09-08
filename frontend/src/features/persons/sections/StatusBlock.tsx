import { Card, EmptyState } from "@/design-system";
import { formatDate } from "@/lib/format";
import type { PersonProfile } from "../personsApi";

export function StatusBlock({ person }: { person: PersonProfile }) {
  const location = person.current_location;

  return (
    <Card title="Ubicacion actual">
      {!location && (
        <EmptyState
          title="Sin ubicacion registrada"
          description="Esta persona no tiene una ubicacion actual asignada en el sistema."
        />
      )}
      {location && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-md)" }}>
          <Field label="Establecimiento" value={location.establishment_name} />
          <Field label="Patio / Pabellon" value={location.area_name ?? "No asignado"} />
          <Field label="Celda" value={location.cell_code ?? "No asignada"} />
          <Field label="Desde" value={formatDate(location.effective_from)} />
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 600 }}>{value}</p>
    </div>
  );
}
