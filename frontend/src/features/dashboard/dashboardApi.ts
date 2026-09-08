import { getDashboardIndicators } from "@/data/queries";
import type { DashboardIndicators } from "@/data/queries";

export type { DashboardIndicators };

export function fetchDashboardIndicators(): Promise<DashboardIndicators> {
  return Promise.resolve(getDashboardIndicators());
}
