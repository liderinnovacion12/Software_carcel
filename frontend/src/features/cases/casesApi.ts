import { getCaseStatusDistribution, getCases } from "@/data/queries";
import type { CaseListItem } from "@/data/queries";

export type { CaseListItem };

export function fetchCases(filter?: { status?: string; query?: string }): Promise<CaseListItem[]> {
  return Promise.resolve(getCases(filter));
}

export function fetchCaseStatusDistribution() {
  return Promise.resolve(getCaseStatusDistribution());
}
