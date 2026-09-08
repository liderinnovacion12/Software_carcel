import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalculationPanel } from "@/features/calculations/CalculationPanel";
import { searchPersons } from "@/data/queries";

// The golden case (Andres) always has a seeded "demo-redencion-v1" calculation
// run (see @/data/db.ts), so we can assert against the real data layer
// directly instead of mocking a backend that no longer exists.
const andres = searchPersons("Andres Felipe Mendoza")[0];

function renderPanel() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <CalculationPanel personId={andres.person_id} />
    </QueryClientProvider>
  );
}

describe("CalculationPanel", () => {
  it("shows traceability fields: rule label, date, responsible source", async () => {
    renderPanel();

    expect(
      await screen.findByText("Redencion por trabajo/estudio (regla de demostracion)")
    ).toBeInTheDocument();
    expect(screen.getByText(/Generado en datos semilla/)).toBeInTheDocument();
    expect(screen.getByText("Regla de demostracion")).toBeInTheDocument();
  });

  it("expands to show step-by-step detail on request", async () => {
    const user = userEvent.setup();
    renderPanel();

    const toggle = await screen.findByText(/ver detalle de trazabilidad/i);
    await user.click(toggle);

    expect(screen.getByText("Tiempo total de la condena")).toBeInTheDocument();
  });
});
