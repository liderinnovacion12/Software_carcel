import { getEstablishments } from "@/data/queries";
import type { EstablishmentOut } from "@/data/queries";

export type { EstablishmentOut };

export function fetchEstablishments(): Promise<EstablishmentOut[]> {
  return Promise.resolve(getEstablishments());
}
