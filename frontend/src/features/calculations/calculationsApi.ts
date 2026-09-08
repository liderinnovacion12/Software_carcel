import { apiRequest } from "@/lib/apiClient";

export interface CalculationDetailOut {
  step_order: number;
  label: string;
  input_snapshot: Record<string, unknown>;
  output_value: string;
  unit: string;
  notes: string | null;
}

export interface CalculationRunOut {
  id: string;
  rule_reference: string;
  calculation_date: string;
  status: string;
  result_summary: Record<string, unknown>;
  responsible_source: string;
  details: CalculationDetailOut[];
}

export function fetchPersonCalculations(personId: string): Promise<CalculationRunOut[]> {
  return apiRequest<CalculationRunOut[]>(`/persons/${personId}/calculations`);
}

export function runCalculation(personId: string, ruleKey: string): Promise<CalculationRunOut> {
  return apiRequest<CalculationRunOut>(`/persons/${personId}/calculations`, {
    method: "POST",
    body: { rule_key: ruleKey },
  });
}

const RULE_LABELS: Record<string, string> = {
  "demo-tiempo-cumplido-v1": "Tiempo cumplido (regla de demostracion)",
  "demo-redencion-v1": "Redencion por trabajo/estudio (regla de demostracion)",
};

export function ruleLabel(ruleReference: string): string {
  return RULE_LABELS[ruleReference] ?? ruleReference;
}
