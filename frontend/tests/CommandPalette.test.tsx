import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CommandPalette } from "@/components/search/CommandPalette";

// No mocking needed: the app is a static demo backed by an in-memory,
// deterministically-seeded dataset (@/data), so searching for the golden
// case "Andres" against the real data layer is both realistic and stable.

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
    localStorage.clear();
  });

  it("shows debounced search results and lets the user select one", async () => {
    const user = userEvent.setup();
    const { onClose } = renderPalette();

    const input = screen.getByLabelText(/buscar personas/i);
    await user.type(input, "Andres Felipe Mendoza");

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
