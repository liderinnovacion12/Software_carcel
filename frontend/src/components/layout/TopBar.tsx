import { useAuthContext } from "@/app/AuthContext";
import { Button } from "@/design-system";

interface TopBarProps {
  onOpenSearch: () => void;
}

export function TopBar({ onOpenSearch }: TopBarProps) {
  const { logout } = useAuthContext();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-md) var(--space-lg)",
        borderBottom: "1px solid var(--color-border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: "var(--font-size-lg)",
            color: "var(--color-accent-strong)",
            letterSpacing: "0.04em",
          }}
        >
          BIALCO
        </span>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
          Identificar. Priorizar. Gestionar. Trazar.
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        <button
          type="button"
          onClick={onOpenSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            padding: "8px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-subtle)",
            color: "var(--color-text-secondary)",
            cursor: "pointer",
            fontSize: "var(--font-size-sm)",
          }}
          aria-label="Abrir busqueda global"
        >
          <span aria-hidden="true">⌕</span>
          Buscar personas, casos, radicados...
          <kbd
            style={{
              marginLeft: "var(--space-sm)",
              padding: "1px 6px",
              borderRadius: "4px",
              border: "1px solid var(--color-border)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            Ctrl K
          </kbd>
        </button>

        <Button variant="secondary" onClick={logout}>
          Cerrar sesion
        </Button>
      </div>
    </header>
  );
}
