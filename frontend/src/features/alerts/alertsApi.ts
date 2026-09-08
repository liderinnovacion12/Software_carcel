import { getAlertCountsByLevel, getAlerts } from "@/data/queries";
import type { AlertOut } from "@/data/queries";

export type { AlertOut };

export function fetchAlerts(filter?: { level?: string }): Promise<AlertOut[]> {
  return Promise.resolve(getAlerts(filter));
}

export function fetchAlertCounts() {
  return Promise.resolve(getAlertCountsByLevel());
}
