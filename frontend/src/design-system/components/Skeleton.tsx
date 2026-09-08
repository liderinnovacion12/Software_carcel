interface SkeletonProps {
  width?: string;
  height?: string;
}

export function Skeleton({ width = "100%", height = "16px" }: SkeletonProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "var(--radius-sm)",
        background:
          "linear-gradient(90deg, var(--color-bg-surface) 25%, var(--color-bg-surface-raised) 50%, var(--color-bg-surface) 75%)",
        backgroundSize: "200% 100%",
        animation: "bialco-skeleton-shimmer 1.4s ease-in-out infinite",
      }}
    />
  );
}

export function SkeletonBlock() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <Skeleton width="40%" height="20px" />
      <Skeleton height="14px" />
      <Skeleton height="14px" />
      <Skeleton width="70%" height="14px" />
    </div>
  );
}
