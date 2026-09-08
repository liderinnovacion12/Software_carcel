import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  tone?: "accent" | "warning" | "critical";
  height?: number;
}

const toneColor: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  accent: "var(--color-accent)",
  warning: "var(--color-warning)",
  critical: "var(--color-critical)",
};

export function ProgressBar({ value, max, tone, height = 8 }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const resolvedTone = tone ?? (pct >= 95 ? "critical" : pct >= 80 ? "warning" : "accent");

  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: "var(--radius-pill)",
        background: "var(--color-bg-surface-raised)",
        overflow: "hidden",
      }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ height: "100%", background: toneColor[resolvedTone], borderRadius: "var(--radius-pill)" }}
      />
    </div>
  );
}
