import { Card, EmptyState } from "@/design-system";

interface ComingSoonPageProps {
  moduleName: string;
}

export default function ComingSoonPage({ moduleName }: ComingSoonPageProps) {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>{moduleName}</h1>
      <Card>
        <EmptyState
          title="Este modulo no esta disponible en esta fase de la demostracion"
          description="BIALCO se esta construyendo por fases. Este modulo se incorporara en una siguiente etapa del desarrollo."
        />
      </Card>
    </div>
  );
}
