import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, PageMotion, SkeletonBlock, SyntheticDataBadge } from "@/design-system";
import { categorical, chartChrome, sequentialBlue, status } from "@/design-system/chartTheme";
import { fetchAnalytics } from "./analyticsApi";
import { ChartTooltip } from "./ChartTooltip";

const ALERT_LEVEL_META = [
  { key: "critico", label: "Critico", color: status.critical },
  { key: "alto", label: "Alto", color: status.serious },
  { key: "medio", label: "Medio", color: status.warning },
  { key: "bajo", label: "Bajo", color: status.good },
];

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["analytics"], queryFn: fetchAnalytics });

  if (isLoading || !data) {
    return (
      <PageMotion>
        <SkeletonBlock />
      </PageMotion>
    );
  }

  const tiempoActual = 14.6;
  const tiempoBialco = 6.8;

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Analitica</h1>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "640px" }}>
            Tendencias e indicadores calculados a partir de los datos sinteticos de esta
            demostracion.
          </p>
        </div>
        <SyntheticDataBadge />
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <Card title="Poblacion registrada (tendencia semestral)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.populationTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="popGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sequentialBlue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={sequentialBlue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke={chartChrome.grid} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={{ stroke: chartChrome.grid }} tickLine={false} />
              <YAxis
                domain={["dataMin - 30", "dataMax + 20"]}
                stroke={chartChrome.axis}
                tick={{ fill: chartChrome.axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="poblacion" name="Poblacion" stroke={sequentialBlue} strokeWidth={2} fill="url(#popGradient)" dot={{ r: 3, fill: sequentialBlue, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Alertas por prioridad">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ALERT_LEVEL_META.map((m) => ({ label: m.label, count: data.alertsByLevel[m.key] ?? 0, color: m.color }))}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid vertical={false} stroke={chartChrome.grid} strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={{ stroke: chartChrome.grid }} tickLine={false} />
              <YAxis stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" name="Alertas" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {ALERT_LEVEL_META.map((m) => (
                  <Cell key={m.key} fill={m.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-lg)", marginBottom: "var(--space-lg)" }}>
        <Card title="Casos por estado">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={data.caseStatusDistribution}
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid horizontal={false} stroke={chartChrome.grid} strokeDasharray="3 3" />
              <XAxis type="number" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                stroke={chartChrome.axis}
                tick={{ fill: chartChrome.axis, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" name="Casos" radius={[0, 4, 4, 0]} maxBarSize={20}>
                {data.caseStatusDistribution.map((_, i) => (
                  <Cell key={i} fill={categorical[i % categorical.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Ocupacion por establecimiento">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.occupancyByEstablishment} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={chartChrome.grid} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 10 }} axisLine={{ stroke: chartChrome.grid }} tickLine={false} interval={0} />
              <YAxis stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 12, color: chartChrome.textSecondary }} />
              <Bar dataKey="capacidad" name="Capacidad" fill={chartChrome.grid} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Bar dataKey="ocupacion" name="Ocupacion" fill={sequentialBlue} radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card
        title="Simulador de impacto"
        actions={<Badge tone="synthetic">Escenario simulado — Datos sinteticos</Badge>}
      >
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--font-size-sm)", marginTop: 0 }}>
          Comparacion ilustrativa entre un escenario actual simulado y un escenario con BIALCO.
          No representa estadisticas oficiales del sistema penitenciario colombiano.
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={[
              { label: "Tiempo promedio de gestion (dias)", actual: tiempoActual, bialco: tiempoBialco },
            ]}
            layout="vertical"
            margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke={chartChrome.grid} strokeDasharray="3 3" />
            <XAxis type="number" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" stroke={chartChrome.axis} tick={{ fill: chartChrome.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={220} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 12, color: chartChrome.textSecondary }} />
            <Bar dataKey="actual" name="Situacion simulada actual" fill={categorical[1]} radius={[0, 4, 4, 0]} maxBarSize={26} />
            <Bar dataKey="bialco" name="Escenario con BIALCO" fill={categorical[0]} radius={[0, 4, 4, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </PageMotion>
  );
}
