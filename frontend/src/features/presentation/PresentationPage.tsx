import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedNumber, ProgressBar } from "@/design-system";
import { fetchAnalytics } from "@/features/analytics/analyticsApi";

export default function PresentationPage() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics });

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 15%, #16283d 0%, #0b1420 55%), radial-gradient(circle at 85% 80%, #123246 0%, transparent 60%)",
        color: "var(--color-text-primary)",
        padding: "var(--space-xl)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AmbientGrid />

      <button
        type="button"
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "var(--space-lg)",
          right: "var(--space-lg)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-secondary)",
          borderRadius: "var(--radius-pill)",
          padding: "8px 16px",
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        Salir del modo presentacion ✕
      </button>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1200px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p style={{ color: "var(--color-accent-strong)", letterSpacing: "0.12em", fontWeight: 700, margin: 0 }}>
            BIALCO — MODO PRESENTACION
          </p>
          <h1 style={{ fontSize: "42px", margin: "8px 0 4px" }}>
            Identificar. Priorizar. Gestionar. Trazar.
          </h1>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "720px" }}>
            Informacion oportuna para una gestion penitenciaria mas eficiente. Todos los valores en
            pantalla provienen de datos sinteticos generados para esta demostracion.
          </p>
        </motion.div>

        {data && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "var(--space-lg)",
                margin: "var(--space-xl) 0",
              }}
            >
              <BigStat label="Poblacion registrada" value={data.indicators.poblacion_registrada} delay={0.1} />
              <BigStat label="Casos activos" value={data.indicators.casos_activos} delay={0.2} />
              <BigStat label="Alertas criticas" value={data.alertsByLevel.critico ?? 0} delay={0.3} tone="critical" />
              <BigStat
                label="Ocupacion"
                value={data.indicators.ocupacion_porcentaje}
                decimals={1}
                suffix="%"
                delay={0.4}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
                marginBottom: "var(--space-xl)",
              }}
            >
              <p style={{ margin: "0 0 var(--space-md)", fontWeight: 600 }}>
                Escenario simulado — tiempo promedio de gestion
              </p>
              <ImpactBar label="Situacion simulada actual" value={14.6} max={20} tone="warning" />
              <div style={{ height: "var(--space-md)" }} />
              <ImpactBar label="Escenario con BIALCO" value={6.8} max={20} tone="accent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--space-md)" }}
            >
              {data.occupancyByEstablishment.map((e) => (
                <div
                  key={e.name}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-md)",
                  }}
                >
                  <p style={{ margin: "0 0 8px", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                    {e.name}
                  </p>
                  <ProgressBar value={e.ocupacion} max={e.capacidad} />
                  <p style={{ margin: "6px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    {e.ocupacion} / {e.capacidad} cupos
                  </p>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function BigStat({
  label,
  value,
  delay,
  tone,
  decimals,
  suffix,
}: {
  label: string;
  value: number;
  delay: number;
  tone?: "critical";
  decimals?: number;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
      }}
    >
      <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>{label}</p>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: "48px",
          fontWeight: 700,
          color: tone === "critical" ? "var(--color-critical)" : "var(--color-accent-strong)",
        }}
      >
        <AnimatedNumber value={value} decimals={decimals ?? 0} />
        {suffix}
      </p>
    </motion.div>
  );
}

function ImpactBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: "warning" | "accent" }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "var(--font-size-sm)" }}>
        <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span style={{ fontWeight: 700 }}>{value} dias</span>
      </div>
      <ProgressBar value={value} max={max} tone={tone === "accent" ? "accent" : "warning"} height={14} />
    </div>
  );
}

function AmbientGrid() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.25 }}
      transition={{ duration: 1.2 }}
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(79,216,230,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(79,216,230,0.08) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
      }}
    />
  );
}
