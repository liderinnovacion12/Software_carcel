import { Card, EmptyState } from "@/design-system";

export default function PersonListPage() {
  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Personas</h1>
      <Card>
        <EmptyState
          icon="⌕"
          title="Use la busqueda global para encontrar una persona"
          description='Presione Ctrl+K (o Cmd+K) o el buscador en la parte superior e ingrese un nombre, numero de identificacion, codigo interno o radicado.'
        />
      </Card>
    </div>
  );
}
