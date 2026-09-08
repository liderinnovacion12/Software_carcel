import type { CSSProperties, HTMLAttributes } from "react";

type Tone = "neutral" | "success" | "warning" | "critical" | "info" | "synthetic";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneStyles: Record<Tone, CSSProperties> = {
  neutral: { background: "var(--color-bg-surface-raised)", color: "var(--color-text-secondary)" },
  success: { background: "#123024", color: "var(--color-success)" },
  warning: { background: "#332708", color: "var(--color-warning)" },
  critical: { background: "#331314", color: "var(--color-critical)" },
  info: { background: "#0f2436", color: "var(--color-info)" },
  synthetic: { background: "var(--color-synthetic-bg)", color: "var(--color-synthetic-text)" },
};

export function Badge({ tone = "neutral", style, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        fontSize: "var(--font-size-xs)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        ...toneStyles[tone],
        ...style,
      }}
    />
  );
}

export function SyntheticDataBadge() {
  return <Badge tone="synthetic">Datos sinteticos para demostracion</Badge>;
}
