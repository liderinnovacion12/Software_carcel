import { useQuery } from "@tanstack/react-query";
import { Card, EmptyState, SkeletonBlock } from "@/design-system";
import { formatDate } from "@/lib/format";
import { fetchPersonTimeline } from "../personsApi";

const TYPE_LABELS: Record<string, string> = {
  ubicacion: "Ubicacion",
  caso: "Caso",
  sentencia: "Sentencia",
  periodo: "Periodo",
  redencion: "Redencion",
  calculo: "Calculo",
};

export function Timeline({ personId }: { personId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["persons", personId, "timeline"],
    queryFn: () => fetchPersonTimeline(personId),
  });

  return (
    <Card title="Linea de tiempo">
      {isLoading && <SkeletonBlock />}
      {data && data.length === 0 && (
        <EmptyState
          title="Sin eventos registrados"
          description="Aun no hay eventos en la linea de tiempo de esta persona."
        />
      )}
      {data && data.length > 0 && (
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {[...data].reverse().map((event, index) => (
            <li
              key={`${event.date}-${index}`}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 16px 1fr",
                gap: "var(--space-md)",
                paddingBottom: "var(--space-lg)",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", paddingTop: "2px" }}>
                {formatDate(event.date)}
              </span>
              <span style={{ display: "flex", justifyContent: "center" }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--color-accent)",
                    marginTop: "4px",
                  }}
                />
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>{event.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-text-secondary)" }}>
                  {event.description}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  {TYPE_LABELS[event.type] ?? event.type}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
