import { Card } from "@/design-system";
import { formatNumber } from "@/lib/format";

interface IndicatorCardProps {
  label: string;
  value: number;
  suffix?: string;
  tone?: "neutral" | "critical";
}

export function IndicatorCard({ label, value, suffix, tone = "neutral" }: IndicatorCardProps) {
  return (
    <Card>
      <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
        {label}
      </p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: "var(--font-size-xxl)",
          fontWeight: 700,
          color: tone === "critical" ? "var(--color-critical)" : "var(--color-text-primary)",
        }}
      >
        {formatNumber(value)}
        {suffix && (
          <span style={{ fontSize: "var(--font-size-md)", color: "var(--color-text-muted)", marginLeft: "4px" }}>
            {suffix}
          </span>
        )}
      </p>
    </Card>
  );
}
