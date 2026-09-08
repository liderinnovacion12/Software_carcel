import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Button, Card, PageMotion, SyntheticDataBadge } from "@/design-system";

interface VisionEvent {
  id: string;
  camera: string;
  establishment: string;
  type: string;
  confidence: number;
  timestamp: string;
  status: "pendiente" | "confirmada" | "rechazada";
}

const EVENT_TYPES = [
  "Movimiento inusual detectado",
  "Posible aglomeracion en patio",
  "Verificacion de identidad requerida",
  "Posible incidente de agresion fisica",
];

const CAMERAS = ["CAM-01 Patio Norte", "CAM-04 Ingreso Principal", "CAM-07 Patio Sur", "CAM-11 Pasillo B"];

function buildInitialEvents(): VisionEvent[] {
  return EVENT_TYPES.map((type, i) => ({
    id: `evt-${i}`,
    camera: CAMERAS[i % CAMERAS.length],
    establishment: "Establecimiento Penitenciario La Ceiba",
    type,
    confidence: 62 + i * 8,
    timestamp: new Date(Date.now() - i * 45 * 60_000).toISOString(),
    status: "pendiente",
  }));
}

export default function DetectionPage() {
  const [events, setEvents] = useState<VisionEvent[]>(buildInitialEvents);

  const pendingCount = useMemo(() => events.filter((e) => e.status === "pendiente").length, [events]);

  function resolve(id: string, status: "confirmada" | "rechazada") {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  return (
    <PageMotion>
      <header style={{ marginBottom: "var(--space-lg)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ margin: 0 }}>Deteccion</h1>
          <p style={{ color: "var(--color-text-secondary)", maxWidth: "680px" }}>
            Modulo secundario de vision por computador. Las detecciones son simuladas y siempre
            requieren validacion humana antes de convertirse en un registro de incidente. BIALCO
            nunca sanciona ni acusa automaticamente a partir de una deteccion.
          </p>
        </div>
        <SyntheticDataBadge />
      </header>

      <div style={{ display: "flex", gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
        <MiniStat label="Camaras simuladas" value={CAMERAS.length} />
        <MiniStat label="Eventos pendientes" value={pendingCount} tone={pendingCount > 0 ? "warning" : "success"} />
        <MiniStat label="Flujo" value="Camara -> Deteccion -> Alerta -> Revision humana" isText />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "var(--space-md)" }}>
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
            >
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600 }}>{event.type}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {event.camera} · {event.establishment}
                    </p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>

                <div
                  style={{
                    margin: "var(--space-sm) 0",
                    height: "88px",
                    borderRadius: "var(--radius-md)",
                    background:
                      "repeating-linear-gradient(45deg, var(--color-bg-subtle), var(--color-bg-subtle) 10px, var(--color-bg-surface-raised) 10px, var(--color-bg-surface-raised) 20px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-muted)",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Video de camara simulado — sin transmision real
                </div>

                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Confianza del modelo: {event.confidence}% · Requiere validacion humana
                </p>

                {event.status === "pendiente" && (
                  <div style={{ display: "flex", gap: "var(--space-sm)", marginTop: "var(--space-sm)" }}>
                    <Button variant="secondary" style={{ flex: 1 }} onClick={() => resolve(event.id, "rechazada")}>
                      Rechazar
                    </Button>
                    <Button style={{ flex: 1 }} onClick={() => resolve(event.id, "confirmada")}>
                      Confirmar incidente
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PageMotion>
  );
}

function StatusBadge({ status }: { status: VisionEvent["status"] }) {
  if (status === "confirmada") return <Badge tone="critical">Incidente confirmado</Badge>;
  if (status === "rechazada") return <Badge tone="neutral">Descartada</Badge>;
  return <Badge tone="warning">Pendiente de validacion</Badge>;
}

function MiniStat({
  label,
  value,
  tone,
  isText,
}: {
  label: string;
  value: string | number;
  tone?: "warning" | "success";
  isText?: boolean;
}) {
  return (
    <Card style={{ flex: 1, padding: "var(--space-md)" }}>
      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{label}</p>
      <p
        style={{
          margin: "4px 0 0",
          fontWeight: 700,
          fontSize: isText ? "var(--font-size-sm)" : "var(--font-size-xl)",
          color: tone === "warning" ? "var(--color-warning)" : tone === "success" ? "var(--color-success)" : "var(--color-text-primary)",
        }}
      >
        {value}
      </p>
    </Card>
  );
}
