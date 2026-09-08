import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PersonProfilePage from "@/features/persons/PersonProfilePage";

const PERSON_ID = "11111111-1111-1111-1111-111111111111";

vi.mock("@/lib/apiClient", () => ({
  apiRequest: vi.fn(async (path: string) => {
    if (path === `/persons/${PERSON_ID}`) {
      return {
        id: PERSON_ID,
        internal_code: "BIALCO-000001",
        first_name: "Andres Felipe",
        last_name: "Mendoza Rios",
        full_name: "Andres Felipe Mendoza Rios",
        identification_type: "CC",
        identification_number: "1000999888",
        birth_date: "1990-04-12",
        sex: "M",
        status: "activo",
        current_location: {
          establishment_name: "Establecimiento Demo",
          area_name: "Patio 1",
          cell_code: "PAT-001",
          effective_from: "2024-01-01",
          effective_to: null,
        },
      };
    }
    if (path === `/persons/${PERSON_ID}/cases`) return [];
    if (path === `/persons/${PERSON_ID}/timeline`) return [];
    if (path === `/persons/${PERSON_ID}/calculations`) return [];
    throw new Error(`Unexpected path in test: ${path}`);
  }),
}));

function renderPage() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/personas/${PERSON_ID}`]}>
        <Routes>
          <Route path="/personas/:personId" element={<PersonProfilePage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("PersonProfilePage", () => {
  it("renders identity data and honest empty states for out-of-scope sections", async () => {
    renderPage();

    await waitFor(() =>
      expect(screen.getByText("Andres Felipe Mendoza Rios")).toBeInTheDocument()
    );

    expect(screen.getByText(/BIALCO-000001/)).toBeInTheDocument();
    expect(screen.getAllByText(/no disponible en esta fase/i).length).toBeGreaterThanOrEqual(2);
  });
});
