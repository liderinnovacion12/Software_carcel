import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { RadialNav } from "@/components/layout/RadialNav/RadialNav";
import { NAV_MODULES } from "@/components/layout/RadialNav/useRadialNavState";

function renderNav() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <RadialNav />
    </MemoryRouter>
  );
}

describe("RadialNav", () => {
  it("renders a real link/button for every module, including not-yet-built ones", () => {
    renderNav();
    for (const module of NAV_MODULES) {
      expect(screen.getByRole("button", { name: module.label })).toBeInTheDocument();
    }
  });

  it("is collapsed by default and expands on click", async () => {
    const user = userEvent.setup();
    renderNav();
    const nav = screen.getByRole("navigation", { name: /navegacion principal/i });
    expect(nav.className).not.toContain("radial-nav--expanded");

    const handle = screen.getByRole("button", { name: /abrir menu de navegacion/i });
    await user.click(handle);

    expect(nav.className).toContain("radial-nav--expanded");
  });

  it("expands via keyboard (Enter) and closes with Escape", async () => {
    const user = userEvent.setup();
    renderNav();
    const handle = screen.getByRole("button", { name: /abrir menu de navegacion/i });

    handle.focus();
    await user.keyboard("{Enter}");

    const nav = screen.getByRole("navigation", { name: /navegacion principal/i });
    expect(nav.className).toContain("radial-nav--expanded");

    await user.keyboard("{Escape}");
    expect(nav.className).not.toContain("radial-nav--expanded");
  });
});
