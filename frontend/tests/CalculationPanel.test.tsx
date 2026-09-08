import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalculationPanel } from "@/features/calculations/CalculationPanel";

const PERSON_ID = "11111111-1111-1111-1111-111111111111";

vi.mock("@/lib/apiClient", () => ({
  apiRequest: vi.fn(async (path: string) => {
    if (path === `/persons/${PERSON_ID}/calculations`) {
      return [
        {
          id: "run-1",
          rule_reference: "demo-redencion-v1",
          calculation_date: "2026-01-01",
          status: "completado",
          result_summary: { tiempo_pendiente_dias: 900 },
          responsible_source: "Generado en datos semilla",
          details: [
            {
              step_order: 1,
              label: "Tiempo total de la condena",
              input_snapshot: {},
              output_value: "2190",
              unit: "dias",
              notes: null,
            },
          ],
        },
      ];
    }
    throw new Error(`Unexpected path in test: ${path}`);
  }),
}));

function renderPanel() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <CalculationPanel personId={PERSON_ID} />
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
