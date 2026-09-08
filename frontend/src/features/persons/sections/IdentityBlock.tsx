import { Badge, Card, SyntheticDataBadge } from "@/design-system";
import { formatDate } from "@/lib/format";
import type { PersonProfile } from "../personsApi";

export function IdentityBlock({ person }: { person: PersonProfile }) {
  return (
    <Card>
      <div style={{ display: "flex", gap: "var(--space-lg)", alignItems: "center", flexWrap: "wrap" }}>
        <div
          aria-hidden="true"
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--color-bg-surface-raised)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            color: "var(--color-text-muted)",
            flexShrink: 0,
          }}
        >
          {person.first_name.charAt(0)}
          {person.last_name.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <h1 style={{ margin: 0, fontSize: "var(--font-size-xl)" }}>{person.full_name}</h1>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-secondary)" }}>
            {person.identification_type} {person.identification_number} · Codigo BIALCO{" "}
            {person.internal_code}
          </p>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
            Nacimiento: {formatDate(person.birth_date)} · Sexo: {person.sex === "M" ? "Masculino" : "Femenino"}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", alignItems: "flex-end" }}>
          <Badge tone={person.status === "activo" ? "success" : "neutral"}>{person.status}</Badge>
          <SyntheticDataBadge />
        </div>
      </div>
    </Card>
  );
}
