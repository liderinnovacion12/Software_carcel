import { useQuery } from "@tanstack/react-query";
import { Badge, Card, PageMotion, ProgressBar, SkeletonBlock, StaggerCard, StaggerGrid } from "@/design-system";
import { fetchEstablishments } from "./establishmentsApi";
import type { EstablishmentOut } from "./establishmentsApi";

export default function EstablishmentsPage() {
  const { data: establishments, isLoading } = useQuery({
    queryKey: ["establishments"],
    queryFn: fetchEstablishments,
  });

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)" }}>
        <h1 style={{ margin: 0 }}>Establecimientos</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Ocupacion y capacidad por establecimiento, patio y pabellon.
        </p>
      </header>

      {isLoading && <SkeletonBlock />}

      {establishments && (
        <StaggerGrid
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-md)" }}
        >
          {establishments.map((establishment) => (
            <StaggerCard key={establishment.id}>
              <EstablishmentCard establishment={establishment} />
            </StaggerCard>
          ))}
        </StaggerGrid>
      )}
    </PageMotion>
  );
}

function EstablishmentCard({ establishment }: { establishment: EstablishmentOut }) {
  const pct = establishment.capacity ? (establishment.occupancy / establishment.capacity) * 100 : 0;
  const overCapacity = pct >= 100;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-lg)" }}>{establishment.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {establishment.code} · {establishment.city}
          </p>
        </div>
        {overCapacity && <Badge tone="critical">Sobrecupo simulado</Badge>}
      </div>

      <div style={{ margin: "var(--space-md) 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-sm)", marginBottom: "4px" }}>
          <span style={{ color: "var(--color-text-secondary)" }}>
            {establishment.occupancy} / {establishment.capacity} cupos
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>{Math.round(pct)}%</span>
        </div>
        <ProgressBar value={establishment.occupancy} max={establishment.capacity} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {establishment.areas.map((area) => {
          const areaPct = area.capacity ? (area.occupancy / area.capacity) * 100 : 0;
          return (
            <div key={area.id} style={{ display: "grid", gridTemplateColumns: "110px 1fr 50px", gap: "var(--space-sm)", alignItems: "center" }}>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-secondary)" }}>{area.name}</span>
              <ProgressBar value={area.occupancy} max={area.capacity} height={6} />
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", textAlign: "right" }}>
                {Math.round(areaPct)}%
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
