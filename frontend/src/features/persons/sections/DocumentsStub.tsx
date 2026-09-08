import { Card, EmptyState } from "@/design-system";

export function DocumentsStub() {
  return (
    <Card title="Documentos">
      <EmptyState
        icon="☷"
        title="No disponible en esta fase de la demostracion"
        description="La gestion documental (cargue, versiones y deteccion de documentos faltantes) se incorporara en una siguiente fase de BIALCO."
      />
    </Card>
  );
}
