import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "var(--space-sm)",
        padding: "var(--space-xl) var(--space-md)",
        color: "var(--color-text-muted)",
      }}
    >
      {icon && <div style={{ fontSize: "28px" }}>{icon}</div>}
      <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text-secondary)" }}>{title}</p>
      {description && (
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", maxWidth: "360px" }}>
          {description}
        </p>
      )}
    </div>
  );
}
