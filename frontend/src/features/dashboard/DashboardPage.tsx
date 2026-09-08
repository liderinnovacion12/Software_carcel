import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchDashboardIndicators } from "./dashboardApi";
import { fetchAnalytics } from "@/features/analytics/analyticsApi";
import { ChartTooltip } from "@/features/analytics/ChartTooltip";
import { IndicatorCard } from "./IndicatorCard";
import { Button, PageMotion, SkeletonBlock, StaggerCard, StaggerGrid } from "@/design-system";
import { chartChrome, sequentialBlue } from "@/design-system/chartTheme";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "indicators"],
    queryFn: fetchDashboardIndicators,
  });
  const { data: analytics } = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics });

  return (
    <PageMotion>
      <header
        style={{
          marginBottom: "var(--space-xl)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-md)",
          flexWrap: "wrap",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-60px",
            left: "-40px",
            width: "360px",
            height: "220px",
            background: "radial-gradient(circle, rgba(47,184,198,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: "var(--font-size-xxl)" }}>
            Estado Operativo de la Poblacion Privada de la Libertad
          </h1>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "720px" }}>
            Informacion oportuna para una gestion penitenciaria mas eficiente. Los indicadores a
            continuacion se calculan en tiempo real a partir de la base de datos sintetica de esta
            demostracion.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate("/presentacion")}>
          Modo presentacion ↗
        </Button>
      </header>

      {isLoading && <SkeletonBlock />}
      {isError && (
        <p style={{ color: "var(--color-critical)" }}>
          No fue posible cargar los indicadores del tablero.
        </p>
      )}

      {data && (
        <>
          <StaggerGrid
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-md)",
              marginBottom: "var(--space-lg)",
            }}
          >
            <StaggerCard><IndicatorCard label="Poblacion registrada" value={data.poblacion_registrada} /></StaggerCard>
            <StaggerCard><IndicatorCard label="Casos activos" value={data.casos_activos} /></StaggerCard>
            <StaggerCard>
              <IndicatorCard label="Casos pendientes de revision" value={data.casos_pendientes_revision} />
            </StaggerCard>
            <StaggerCard>
              <IndicatorCard label="Expedientes incompletos" value={data.expedientes_incompletos} tone="critical" />
            </StaggerCard>
            <StaggerCard><IndicatorCard label="Redenciones pendientes" value={data.redenciones_pendientes} /></StaggerCard>
            <StaggerCard><IndicatorCard label="Establecimientos" value={data.establecimientos_count} /></StaggerCard>
            <StaggerCard><IndicatorCard label="Capacidad total" value={data.capacidad_total} suffix="cupos" /></StaggerCard>
            <StaggerCard><IndicatorCard label="Ocupacion actual" value={data.ocupacion_actual} suffix="personas" /></StaggerCard>
            <StaggerCard>
              <IndicatorCard label="Porcentaje de ocupacion" value={data.ocupacion_porcentaje} suffix="%" decimals={1} />
            </StaggerCard>
          </StaggerGrid>

          {analytics && (
            <div
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-lg)",
              }}
            >
              <p style={{ margin: "0 0 var(--space-sm)", fontWeight: 600 }}>
                Tendencia de poblacion registrada
              </p>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={analytics.populationTrend} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashPopGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={sequentialBlue} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={sequentialBlue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={["dataMin - 30", "dataMax + 20"]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="poblacion" name="Poblacion" stroke={sequentialBlue} strokeWidth={2} fill="url(#dashPopGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </PageMotion>
  );
}
