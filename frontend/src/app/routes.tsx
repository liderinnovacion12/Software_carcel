import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import { SkeletonBlock } from "@/design-system";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth } from "./RequireAuth";
import LoginPage from "@/features/auth/LoginPage";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const PersonListPage = lazy(() => import("@/features/persons/PersonListPage"));
const PersonProfilePage = lazy(() => import("@/features/persons/PersonProfilePage"));
const ComingSoonPage = lazy(() => import("@/features/placeholders/ComingSoonPage"));

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<SkeletonBlock />}>{element}</Suspense>;
}

function comingSoon(moduleName: string) {
  return withSuspense(<ComingSoonPage moduleName={moduleName} />);
}

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
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
      { path: "casos", element: comingSoon("Casos") },
      { path: "alertas", element: comingSoon("Alertas") },
      { path: "documentos", element: comingSoon("Documentos") },
      { path: "establecimientos", element: comingSoon("Establecimientos") },
      { path: "analitica", element: comingSoon("Analitica") },
      { path: "deteccion", element: comingSoon("Deteccion") },
      { path: "administracion", element: comingSoon("Administracion") },
    ],
  },
]);
