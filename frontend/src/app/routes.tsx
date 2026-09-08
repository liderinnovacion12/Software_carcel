import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { SkeletonBlock } from "@/design-system";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "./RequireAuth";
import LoginPage from "@/features/auth/LoginPage";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const PersonListPage = lazy(() => import("@/features/persons/PersonListPage"));
const PersonProfilePage = lazy(() => import("@/features/persons/PersonProfilePage"));
const CasesPage = lazy(() => import("@/features/cases/CasesPage"));
const AlertsPage = lazy(() => import("@/features/alerts/AlertsPage"));
const DocumentsPage = lazy(() => import("@/features/documents/DocumentsPage"));
const EstablishmentsPage = lazy(() => import("@/features/establishments/EstablishmentsPage"));
const AnalyticsPage = lazy(() => import("@/features/analytics/AnalyticsPage"));
const DetectionPage = lazy(() => import("@/features/detection/DetectionPage"));
const AdminPage = lazy(() => import("@/features/admin/AdminPage"));
const PresentationPage = lazy(() => import("@/features/presentation/PresentationPage"));

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<SkeletonBlock />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/presentacion",
    element: (
      <RequireAuth>
        {withSuspense(<PresentationPage />)}
      </RequireAuth>
    ),
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: "personas", element: withSuspense(<PersonListPage />) },
      { path: "personas/:personId", element: withSuspense(<PersonProfilePage />) },
      { path: "casos", element: withSuspense(<CasesPage />) },
      { path: "alertas", element: withSuspense(<AlertsPage />) },
      { path: "documentos", element: withSuspense(<DocumentsPage />) },
      { path: "establecimientos", element: withSuspense(<EstablishmentsPage />) },
      { path: "analitica", element: withSuspense(<AnalyticsPage />) },
      { path: "deteccion", element: withSuspense(<DetectionPage />) },
      { path: "administracion", element: withSuspense(<AdminPage />) },
    ],
  },
]);
