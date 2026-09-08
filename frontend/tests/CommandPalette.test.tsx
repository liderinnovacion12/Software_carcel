import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommandPalette } from "@/components/search/CommandPalette";

vi.mock("@/lib/apiClient", () => ({
  apiRequest: vi.fn(async (path: string) => {
    if (path === "/search") {
      return {
        query: "andres",
        results: [
          {
            person_id: "11111111-1111-1111-1111-111111111111",
            full_name: "Andres Felipe Mendoza Rios",
            internal_code: "BIALCO-000001",
            identification_number: "1000999888",
            establishment_name: "Establecimiento Demo",
            status: "activo",
            match_reason: "Coincidencia por nombre",
          },
        ],
      };
    }
    throw new Error(`Unexpected path in test: ${path}`);
  }),
}));

function renderPalette(onClose = vi.fn()) {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CommandPalette open onClose={onClose} />
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { onClose };
}

describe("CommandPalette", () => {
  afterEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows debounced search results and lets the user select one", async () => {
    const user = userEvent.setup();
    const { onClose } = renderPalette();

    const input = screen.getByLabelText(/buscar personas/i);
    await user.type(input, "andres");

    await waitFor(() =>
      expect(screen.getByText("Andres Felipe Mendoza Rios")).toBeInTheDocument()
    );

    await user.click(screen.getByText("Andres Felipe Mendoza Rios"));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows guidance text when the query is empty", () => {
    renderPalette();
    expect(
      screen.getByText(/escriba un nombre, numero de identificacion/i)
    ).toBeInTheDocument();
  });
});
