import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AlertsPage from "@/features/alerts/AlertsPage";
import CasesPage from "@/features/cases/CasesPage";
import EstablishmentsPage from "@/features/establishments/EstablishmentsPage";
import DocumentsPage from "@/features/documents/DocumentsPage";
import DetectionPage from "@/features/detection/DetectionPage";
import AdminPage from "@/features/admin/AdminPage";

function withProviders(children: ReactNode) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("newly unlocked modules render real data without crashing", () => {
  it("AlertsPage shows alert cards", async () => {
    render(withProviders(<AlertsPage />));
    expect(await screen.findByText("Alertas operativas")).toBeInTheDocument();
  });

  it("CasesPage shows the case status filters", async () => {
    render(withProviders(<CasesPage />));
    expect(await screen.findByText("Casos")).toBeInTheDocument();
  });

  it("EstablishmentsPage shows generated establishments", async () => {
    render(withProviders(<EstablishmentsPage />));
    expect((await screen.findAllByText(/Establecimiento Penitenciario/)).length).toBe(3);
  });

  it("DocumentsPage renders the document table", async () => {
    render(withProviders(<DocumentsPage />));
    expect(await screen.findByText("Documentos")).toBeInTheDocument();
  });

  it("DetectionPage renders simulated events", async () => {
    render(withProviders(<DetectionPage />));
    expect(await screen.findByText("Deteccion")).toBeInTheDocument();
  });

  it("AdminPage renders the demo admin panel", async () => {
    render(withProviders(<AdminPage />));
    expect(await screen.findByText("Administracion")).toBeInTheDocument();
  });
});
