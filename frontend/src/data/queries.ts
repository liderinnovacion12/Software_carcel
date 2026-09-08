import { CASE_STATUS_LABELS, getDb, RULE_LABELS } from "./db";
import { Rng } from "./rng";
import type { Alert, DocumentRecord, LegalCase } from "./types";

const db = getDb();

// ---- Persons / search --------------------------------------------------

export interface LocationOut {
  establishment_name: string;
  area_name: string | null;
  cell_code: string | null;
  effective_from: string;
  effective_to: string | null;
}

export interface PersonProfileOut {
  id: string;
  internal_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  identification_type: string;
  identification_number: string;
  birth_date: string;
  sex: string;
  status: string;
  current_location: LocationOut | null;
}

function locationOut(personId: string): LocationOut | null {
  const location = db.currentLocationByPerson.get(personId);
  if (!location) return null;
  const establishment = db.establishmentById.get(location.establishmentId);
  const area = location.areaId ? db.areaById.get(location.areaId) : undefined;
  const cell = location.cellId ? db.cellById.get(location.cellId) : undefined;
  return {
    establishment_name: establishment?.name ?? "Sin asignar",
    area_name: area?.name ?? null,
    cell_code: cell?.code ?? null,
    effective_from: location.effectiveFrom,
    effective_to: location.effectiveTo,
  };
}

export function getPersonProfile(personId: string): PersonProfileOut | undefined {
  const person = db.personById.get(personId);
  if (!person) return undefined;
  return {
    id: person.id,
    internal_code: person.internalCode,
    first_name: person.firstName,
    last_name: person.lastName,
    full_name: person.fullName,
    identification_type: person.identificationType,
    identification_number: person.identificationNumber,
    birth_date: person.birthDate,
    sex: person.sex,
    status: person.status,
    current_location: locationOut(person.id),
  };
}

export interface LegalCaseOut {
  id: string;
  radicado: string;
  authority: string;
  case_type_label: string;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

const caseOut = (c: LegalCase): LegalCaseOut => ({
  id: c.id,
  radicado: c.radicado,
  authority: c.authority,
  case_type_label: c.caseTypeLabel,
  status: c.status,
  opened_at: c.openedAt,
  closed_at: c.closedAt,
});

export function getPersonCases(personId: string): LegalCaseOut[] {
  return (db.legalCasesByPerson.get(personId) ?? []).map(caseOut);
}

export interface TimelineEvent {
  date: string;
  type: string;
  title: string;
  description: string;
}

export function getPersonTimeline(personId: string): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const location of db.personLocations.filter((l) => l.personId === personId)) {
    const establishment = db.establishmentById.get(location.establishmentId);
    const area = location.areaId ? db.areaById.get(location.areaId) : undefined;
    const cell = location.cellId ? db.cellById.get(location.cellId) : undefined;
    events.push({
      date: location.effectiveFrom,
      type: "ubicacion",
      title: `Ingreso a ${establishment?.name ?? "establecimiento"}`,
      description: `Ubicado en ${area?.name ?? "patio no asignado"}${cell ? `, celda ${cell.code}` : ""}`,
    });
  }

  for (const legalCase of db.legalCasesByPerson.get(personId) ?? []) {
    events.push({
      date: legalCase.openedAt,
      type: "caso",
      title: `Apertura de proceso ${legalCase.radicado}`,
      description: `${legalCase.caseTypeLabel} - ${legalCase.authority}`,
    });

    const sentence = db.sentencesByCase.get(legalCase.id);
    if (sentence) {
      events.push({
        date: sentence.imposedAt,
        type: "sentencia",
        title: "Sentencia impuesta",
        description: `${sentence.sentenceType}: ${sentence.totalTimeDays} dias totales`,
      });
      for (const period of db.sentencePeriodsBySentence.get(sentence.id) ?? []) {
        events.push({
          date: period.startDate,
          type: "periodo",
          title: `Inicio de periodo ${period.periodType}`,
          description: `Periodo de tipo ${period.periodType}`,
        });
      }
    }
  }

  for (const redemption of db.redemptionsByPerson.get(personId) ?? []) {
    events.push({
      date: redemption.periodEnd,
      type: "redencion",
      title: `Redencion por ${redemption.activityType}`,
      description: `${redemption.daysWorked} dias trabajados, ${redemption.redemptionDaysGranted} dias redimidos`,
    });
  }

  for (const run of db.calculationsByPerson.get(personId) ?? []) {
    events.push({
      date: run.calculationDate,
      type: "calculo",
      title: "Calculo de tiempo ejecutado",
      description: `Regla aplicada: ${run.ruleReference}`,
    });
  }

  events.sort((a, b) => a.date.localeCompare(b.date));
  return events;
}

export interface SearchResultItem {
  person_id: string;
  full_name: string;
  internal_code: string;
  identification_number: string;
  establishment_name: string | null;
  status: string;
  match_reason: string;
}

const MAX_SEARCH_RESULTS = 15;

export function searchPersons(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchResultItem[] = [];
  for (const person of db.persons) {
    let reason: string | null = null;
    if (
      person.firstName.toLowerCase().includes(q) ||
      person.lastName.toLowerCase().includes(q) ||
      person.fullName.toLowerCase().includes(q)
    ) {
      reason = "Coincidencia por nombre";
    } else if (person.identificationNumber.toLowerCase().includes(q)) {
      reason = "Coincidencia por identificacion";
    } else if (person.internalCode.toLowerCase().includes(q)) {
      reason = "Coincidencia por codigo interno";
    } else {
      const matchingCase = (db.legalCasesByPerson.get(person.id) ?? []).find((c) =>
        c.radicado.toLowerCase().includes(q)
      );
      if (matchingCase) reason = "Coincidencia por radicado de proceso";
    }

    if (reason) {
      const location = db.currentLocationByPerson.get(person.id);
      const establishment = location ? db.establishmentById.get(location.establishmentId) : undefined;
      results.push({
        person_id: person.id,
        full_name: person.fullName,
        internal_code: person.internalCode,
        identification_number: person.identificationNumber,
        establishment_name: establishment?.name ?? null,
        status: person.status,
        match_reason: reason,
      });
      if (results.length >= MAX_SEARCH_RESULTS) break;
    }
  }

  return results;
}

// ---- Calculations --------------------------------------------------------

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
  result_summary: Record<string, number>;
  responsible_source: string;
  details: CalculationDetailOut[];
}

export function getPersonCalculations(personId: string): CalculationRunOut[] {
  const runs = db.calculationsByPerson.get(personId) ?? [];
  return [...runs]
    .sort((a, b) => b.calculationDate.localeCompare(a.calculationDate))
    .map((run) => ({
      id: run.id,
      rule_reference: run.ruleReference,
      calculation_date: run.calculationDate,
      status: run.status,
      result_summary: run.resultSummary,
      responsible_source: run.responsibleSource,
      details: run.details.map((d) => ({
        step_order: d.stepOrder,
        label: d.label,
        input_snapshot: d.inputSnapshot,
        output_value: d.outputValue,
        unit: d.unit,
        notes: d.notes,
      })),
    }));
}

export function runNewCalculation(personId: string, ruleKey: string): CalculationRunOut {
  const run = db.runCalculation(personId, ruleKey, "Administrador BIALCO");
  return getPersonCalculations(personId).find((r) => r.id === run.id)!;
}

export function ruleLabel(ruleReference: string): string {
  return RULE_LABELS[ruleReference] ?? ruleReference;
}

// ---- Dashboard -------------------------------------------------------------

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

export function getDashboardIndicators(): DashboardIndicators {
  const poblacionRegistrada = db.persons.length;
  const casosActivos = db.legalCases.filter((c) => c.status !== "cerrado").length;
  const casosPendientesRevision = db.legalCases.filter((c) => c.status === "identificado").length;

  const personsWithRedemption = new Set(db.redemptionRecords.map((r) => r.personId));
  let expedientesIncompletos = 0;
  const countedPersons = new Set<string>();
  for (const sentence of db.sentences) {
    if (sentence.status !== "vigente") continue;
    const legalCase = db.legalCases.find((c) => c.id === sentence.legalCaseId);
    if (!legalCase) continue;
    if (!personsWithRedemption.has(legalCase.personId) && !countedPersons.has(legalCase.personId)) {
      countedPersons.add(legalCase.personId);
      expedientesIncompletos += 1;
    }
  }

  const establecimientosCount = db.establishments.length;
  const capacidadTotal = db.establishments.reduce((sum, e) => sum + e.capacity, 0);
  const ocupacionActual = db.currentLocationByPerson.size;
  const ocupacionPorcentaje = capacidadTotal
    ? Math.round((ocupacionActual / capacidadTotal) * 1000) / 10
    : 0;

  return {
    poblacion_registrada: poblacionRegistrada,
    casos_activos: casosActivos,
    casos_pendientes_revision: casosPendientesRevision,
    expedientes_incompletos: expedientesIncompletos,
    redenciones_pendientes: expedientesIncompletos,
    establecimientos_count: establecimientosCount,
    capacidad_total: capacidadTotal,
    ocupacion_actual: ocupacionActual,
    ocupacion_porcentaje: ocupacionPorcentaje,
  };
}

// ---- Establishments ---------------------------------------------------

export interface EstablishmentOut {
  id: string;
  name: string;
  code: string;
  city: string;
  capacity: number;
  occupancy: number;
  areas: { id: string; name: string; type: string; capacity: number; occupancy: number }[];
}

export function getEstablishments(): EstablishmentOut[] {
  const occupancyByEstablishment = new Map<string, number>();
  const occupancyByArea = new Map<string, number>();
  for (const location of db.currentLocationByPerson.values()) {
    occupancyByEstablishment.set(
      location.establishmentId,
      (occupancyByEstablishment.get(location.establishmentId) ?? 0) + 1
    );
    if (location.areaId) {
      occupancyByArea.set(location.areaId, (occupancyByArea.get(location.areaId) ?? 0) + 1);
    }
  }

  return db.establishments.map((establishment) => ({
    id: establishment.id,
    name: establishment.name,
    code: establishment.code,
    city: establishment.city,
    capacity: establishment.capacity,
    occupancy: occupancyByEstablishment.get(establishment.id) ?? 0,
    areas: db.areas
      .filter((a) => a.establishmentId === establishment.id)
      .map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        capacity: a.capacity,
        occupancy: occupancyByArea.get(a.id) ?? 0,
      })),
  }));
}

// ---- Cases (global) -----------------------------------------------------

export interface CaseListItem {
  id: string;
  radicado: string;
  case_type_label: string;
  authority: string;
  status: string;
  status_label: string;
  opened_at: string;
  person_id: string;
  person_name: string;
  internal_code: string;
  establishment_name: string | null;
}

export function getCases(filter?: { status?: string; query?: string }): CaseListItem[] {
  return db.legalCases
    .map((c) => {
      const person = db.personById.get(c.personId)!;
      const location = db.currentLocationByPerson.get(c.personId);
      const establishment = location ? db.establishmentById.get(location.establishmentId) : undefined;
      return {
        id: c.id,
        radicado: c.radicado,
        case_type_label: c.caseTypeLabel,
        authority: c.authority,
        status: c.status,
        status_label: CASE_STATUS_LABELS[c.status],
        opened_at: c.openedAt,
        person_id: person.id,
        person_name: person.fullName,
        internal_code: person.internalCode,
        establishment_name: establishment?.name ?? null,
      };
    })
    .filter((c) => (filter?.status ? c.status === filter.status : true))
    .filter((c) =>
      filter?.query
        ? c.radicado.toLowerCase().includes(filter.query.toLowerCase()) ||
          c.person_name.toLowerCase().includes(filter.query.toLowerCase())
        : true
    )
    .sort((a, b) => b.opened_at.localeCompare(a.opened_at));
}

export function getCaseStatusDistribution(): { status: string; label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const c of db.legalCases) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
  return Object.entries(CASE_STATUS_LABELS).map(([status, label]) => ({
    status,
    label,
    count: counts.get(status) ?? 0,
  }));
}

// ---- Alerts ------------------------------------------------------------

export type AlertOut = Alert;

export function getAlerts(filter?: { level?: string }): AlertOut[] {
  return db.alerts
    .filter((a) => (filter?.level ? a.level === filter.level : true))
    .sort((a, b) => {
      const order = { critico: 0, alto: 1, medio: 2, bajo: 3 };
      return order[a.level] - order[b.level] || b.date.localeCompare(a.date);
    });
}

export function getAlertCountsByLevel(): Record<string, number> {
  const counts = { critico: 0, alto: 0, medio: 0, bajo: 0 };
  for (const a of db.alerts) counts[a.level] += 1;
  return counts;
}

// ---- Documents -----------------------------------------------------------

export function getDocuments(filter?: { status?: string }): DocumentRecord[] {
  return db.documents
    .filter((d) => (filter?.status ? d.status === filter.status : true))
    .sort((a, b) => a.category.localeCompare(b.category));
}

// ---- Analytics -----------------------------------------------------------

export function getOccupancyByEstablishment() {
  return getEstablishments().map((e) => ({
    name: e.name,
    ocupacion: e.occupancy,
    capacidad: e.capacity,
  }));
}

export function getPopulationTrend(): { month: string; poblacion: number }[] {
  const rng = new Rng(99);
  const months = ["Abr", "May", "Jun", "Jul", "Ago", "Sep"];
  const target = db.persons.length;
  const start = Math.round(target * 0.8);
  const steps = months.length - 1;

  return months.map((month, i) => {
    if (i === steps) return { month, poblacion: target };
    // Smooth ease-out growth spread evenly across the months, plus a touch
    // of noise per point so the line reads as real data, not a straight ramp.
    const progress = i / steps;
    const eased = 1 - Math.pow(1 - progress, 2);
    const base = start + (target - start) * eased;
    const noise = (rng.next() - 0.5) * target * 0.02;
    return { month, poblacion: Math.round(base + noise) };
  });
}
