import { getDocuments } from "@/data/queries";
import type { DocumentRecord } from "@/data/types";

export type { DocumentRecord };

export function fetchDocuments(filter?: { status?: string }): Promise<DocumentRecord[]> {
  return Promise.resolve(getDocuments(filter));
}
