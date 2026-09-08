import { chartChrome } from "@/design-system/chartTheme";

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { name: string; value: number | string; color?: string }[];
  formatter?: (value: number | string) => string;
}

export function ChartTooltip({ active, label, payload, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: chartChrome.tooltipBg,
        border: `1px solid ${chartChrome.tooltipBorder}`,
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        fontSize: "var(--font-size-xs)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {label && (
        <p style={{ margin: "0 0 4px", color: chartChrome.textPrimary, fontWeight: 600 }}>{label}</p>
      )}
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: "6px", color: chartChrome.textSecondary }}>
          {entry.color && (
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color, flexShrink: 0 }} />
          )}
          <span>
            {entry.name}: <strong style={{ color: chartChrome.textPrimary }}>{formatter ? formatter(entry.value) : entry.value}</strong>
          </span>
        </div>
      ))}
    </div>
  );
}
