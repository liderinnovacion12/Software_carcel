import { getPersonCalculations, ruleLabel, runNewCalculation } from "@/data/queries";
import type { CalculationDetailOut, CalculationRunOut } from "@/data/queries";

export type { CalculationDetailOut, CalculationRunOut };

export function fetchPersonCalculations(personId: string): Promise<CalculationRunOut[]> {
  return Promise.resolve(getPersonCalculations(personId));
}

export function runCalculation(personId: string, ruleKey: string): Promise<CalculationRunOut> {
  return Promise.resolve(runNewCalculation(personId, ruleKey));
}

export { ruleLabel };
