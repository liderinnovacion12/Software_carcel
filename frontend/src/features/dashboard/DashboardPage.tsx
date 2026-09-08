import { useQuery } from "@tanstack/react-query";
import { fetchDashboardIndicators } from "./dashboardApi";
import { IndicatorCard } from "./IndicatorCard";
import { SkeletonBlock } from "@/design-system";

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard", "indicators"],
    queryFn: fetchDashboardIndicators,
  });

  return (
    <div>
      <header style={{ marginBottom: "var(--space-xl)" }}>
        <h1 style={{ margin: 0, fontSize: "var(--font-size-xxl)" }}>
          Estado Operativo de la Poblacion Privada de la Libertad
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "720px" }}>
          Informacion oportuna para una gestion penitenciaria mas eficiente. Los indicadores a
          continuacion se calculan en tiempo real a partir de la base de datos sintetica de esta
          demostracion.
        </p>
      </header>

      {isLoading && <SkeletonBlock />}
      {isError && (
        <p style={{ color: "var(--color-critical)" }}>
          No fue posible cargar los indicadores del tablero.
        </p>
      )}

      {data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-md)",
          }}
        >
          <IndicatorCard label="Poblacion registrada" value={data.poblacion_registrada} />
          <IndicatorCard label="Casos activos" value={data.casos_activos} />
          <IndicatorCard
            label="Casos pendientes de revision"
            value={data.casos_pendientes_revision}
          />
          <IndicatorCard
            label="Expedientes incompletos"
            value={data.expedientes_incompletos}
            tone="critical"
          />
          <IndicatorCard label="Redenciones pendientes" value={data.redenciones_pendientes} />
          <IndicatorCard label="Establecimientos" value={data.establecimientos_count} />
          <IndicatorCard label="Capacidad total" value={data.capacidad_total} suffix="cupos" />
          <IndicatorCard label="Ocupacion actual" value={data.ocupacion_actual} suffix="personas" />
          <IndicatorCard
            label="Porcentaje de ocupacion"
            value={data.ocupacion_porcentaje}
            suffix="%"
          />
        </div>
      )}
    </div>
  );
}
