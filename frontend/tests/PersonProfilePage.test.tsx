import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PersonProfilePage from "@/features/persons/PersonProfilePage";
import { searchPersons } from "@/data/queries";

// No mocking needed: reads the real in-memory synthetic dataset. The golden
// case's id is generated at dataset-build time (not a fixed constant), so we
// look it up the same way the app's search does.
const andres = searchPersons("Andres Felipe Mendoza")[0];

function renderPage() {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/personas/${andres.person_id}`]}>
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
