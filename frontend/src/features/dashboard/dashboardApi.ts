import { apiRequest } from "@/lib/apiClient";

export interface DashboardIndicators {
  poblacion_registrada: number;
  casos_activos: number;
  casos_pendientes_revision: number;
  expedientes_incompletos: number;
  redenciones_pendientes: number;
  establecimientos_count: number;
  capacidad_total: number;
  ocupacion_actual: number;
  ocupacion_porcentaje: number;
}

export function fetchDashboardIndicators(): Promise<DashboardIndicators> {
  return apiRequest<DashboardIndicators>("/dashboard/indicators");
}
