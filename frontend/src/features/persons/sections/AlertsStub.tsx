import { Card, EmptyState } from "@/design-system";

export function AlertsStub() {
  return (
    <Card title="Alertas activas">
      <EmptyState
        icon="⚠"
        title="No disponible en esta fase de la demostracion"
        description="El motor de alertas operativas se incorporara en una siguiente fase de BIALCO."
      />
    </Card>
  );
}
