import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { SkeletonBlock } from "@/design-system";
import { fetchPersonProfile } from "./personsApi";
import { IdentityBlock } from "./sections/IdentityBlock";
import { StatusBlock } from "./sections/StatusBlock";
import { CasesList } from "./sections/CasesList";
import { Timeline } from "./sections/Timeline";
import { DocumentsStub } from "./sections/DocumentsStub";
import { AlertsStub } from "./sections/AlertsStub";
import { CalculationPanel } from "@/features/calculations/CalculationPanel";

export default function PersonProfilePage() {
  const { personId } = useParams<{ personId: string }>();

  const { data: person, isLoading, isError } = useQuery({
    queryKey: ["persons", personId, "profile"],
    queryFn: () => fetchPersonProfile(personId as string),
    enabled: Boolean(personId),
  });

  if (!personId) return null;

  if (isLoading) {
    return <SkeletonBlock />;
  }

  if (isError || !person) {
    return (
      <p style={{ color: "var(--color-critical)" }}>
        No fue posible cargar el perfil operativo-juridico de esta persona.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <IdentityBlock person={person} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "var(--space-lg)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <StatusBlock person={person} />
          <CasesList personId={personId} />
          <CalculationPanel personId={personId} />
          <Timeline personId={personId} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          <AlertsStub />
          <DocumentsStub />
        </div>
      </div>
    </div>
  );
}
