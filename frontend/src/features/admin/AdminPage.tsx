import { useState } from "react";
import { Badge, Card, PageMotion } from "@/design-system";

const PERMISSIONS = [
  "persons:read",
  "search:read",
  "calculations:read",
  "calculations:run",
  "dashboard:read",
  "establishments:read",
  "cases:read",
  "alerts:read",
  "documents:read",
];

const FEATURE_FLAGS = [
  { key: "vision", label: "Modulo de deteccion (vision por computador)", defaultOn: true },
  { key: "presentation", label: "Modo presentacion", defaultOn: true },
  { key: "multiInstitution", label: "Multi-institucion (fase futura)", defaultOn: false },
  { key: "integrations", label: "Integraciones simuladas con sistemas externos", defaultOn: false },
];

export default function AdminPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(FEATURE_FLAGS.map((f) => [f.key, f.defaultOn]))
  );

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ margin: 0 }}>Administracion</h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "680px" }}>
          Panel de administracion de solo lectura para esta demostracion. La version completa
          incluira gestion de usuarios, roles, instituciones, integraciones y auditoria (spec §28).
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)" }}>
        <Card title="Usuario activo">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <Field label="Nombre" value="Administrador BIALCO" />
            <Field label="Usuario" value="admin" />
            <Field label="Rol" value="Administrador General" />
            <Field label="Alcance" value="Institucion Nacional Demostrativa (BIALCO Demo)" />
          </div>
        </Card>

        <Card title="Permisos del rol">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {PERMISSIONS.map((p) => (
              <Badge key={p} tone="info">
                {p}
              </Badge>
            ))}
          </div>
        </Card>

        <Card title="Funcionalidades (demo)">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            {FEATURE_FLAGS.map((flag) => (
              <label
                key={flag.key}
                style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontSize: "var(--font-size-sm)", cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={flags[flag.key]}
                  onChange={(e) => setFlags((prev) => ({ ...prev, [flag.key]: e.target.checked }))}
                />
                {flag.label}
              </label>
            ))}
          </div>
          <p style={{ marginTop: "var(--space-sm)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Cambios locales solo para esta sesion — no se persisten.
          </p>
        </Card>

        <Card title="Institucion">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <Field label="Nombre" value="Instituto Nacional Demostrativo (BIALCO Demo)" />
            <Field label="Codigo" value="INST-DEMO-01" />
            <Field label="Establecimientos" value="3" />
          </div>
        </Card>
      </div>
    </PageMotion>
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
