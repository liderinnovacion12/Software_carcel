import type { CaseStatus } from "./constants";

export interface Institution {
  id: string;
  name: string;
  code: string;
}

export interface Establishment {
  id: string;
  institutionId: string;
  name: string;
  code: string;
  city: string;
  capacity: number;
}

export interface Area {
  id: string;
  establishmentId: string;
  name: string;
  type: "patio" | "pabellon";
  capacity: number;
}

export interface Cell {
  id: string;
  areaId: string;
  code: string;
  capacity: number;
}

export interface Person {
  id: string;
  institutionId: string;
  internalCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  identificationType: string;
  identificationNumber: string;
  birthDate: string; // ISO date
  sex: "M" | "F";
  status: string;
  cityOfOrigin: string;
}

export interface PersonLocation {
  id: string;
  personId: string;
  establishmentId: string;
  areaId: string | null;
  cellId: string | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface LegalCase {
  id: string;
  personId: string;
  radicado: string;
  authority: string;
  caseTypeLabel: string;
  status: CaseStatus;
  openedAt: string;
  closedAt: string | null;
}

export interface Sentence {
  id: string;
  legalCaseId: string;
  sentenceType: string;
  totalTimeDays: number;
  imposedAt: string;
  status: "vigente" | "cumplida";
}

export interface SentencePeriod {
  id: string;
  sentenceId: string;
  periodType: string;
  startDate: string;
  endDate: string | null;
}

export interface RedemptionRecord {
  id: string;
  personId: string;
  sentenceId: string | null;
  activityType: string;
  daysWorked: number;
  redemptionDaysGranted: number;
  periodStart: string;
  periodEnd: string;
  source: string;
}

export interface CalculationDetail {
  stepOrder: number;
  label: string;
  inputSnapshot: Record<string, unknown>;
  outputValue: string;
  unit: string;
  notes: string | null;
}

export interface CalculationRun {
  id: string;
  personId: string;
  sentenceId: string | null;
  ruleReference: string;
  calculationDate: string;
  status: string;
  resultSummary: Record<string, number>;
  responsibleSource: string;
  details: CalculationDetail[];
}

export type AlertLevel = "critico" | "alto" | "medio" | "bajo";
export type AlertType =
  | "revision_prioritaria"
  | "expediente_incompleto"
  | "documento_pendiente"
  | "decision_pendiente"
  | "caso_sin_movimiento"
  | "calculo_pendiente_validacion"
  | "proximo_vencimiento"
  | "redencion_pendiente";

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  reason: string;
  personId: string;
  personName: string;
  legalCaseId: string | null;
  establishmentId: string;
  establishmentName: string;
  date: string;
  deadline: string | null;
  responsibleUser: string;
  recommendedAction: string;
  status: "abierta" | "en_revision" | "resuelta";
}

export interface DocumentRecord {
  id: string;
  personId: string;
  personName: string;
  legalCaseId: string | null;
  category: string;
  status: "completo" | "faltante" | "en_revision";
  uploadedAt: string | null;
}
