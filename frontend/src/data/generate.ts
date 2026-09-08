import {
  AREA_NAMES,
  CASE_AUTHORITIES,
  CASE_STATUSES,
  CASE_TYPE_LABELS,
  COLOMBIAN_CITIES_OF_ORIGIN,
  ESTABLISHMENTS,
  FIRST_NAMES_FEMALE,
  FIRST_NAMES_MALE,
  LAST_NAMES,
  REDEMPTION_ACTIVITY_TYPES,
} from "./constants";
import { Rng } from "./rng";
import type {
  Area,
  Cell,
  Establishment,
  Institution,
  LegalCase,
  Person,
  PersonLocation,
  RedemptionRecord,
  Sentence,
  SentencePeriod,
} from "./types";

const iso = (d: Date) => d.toISOString().slice(0, 10);
let counter = 0;
const id = (prefix: string) => `${prefix}-${(++counter).toString(36).padStart(6, "0")}`;

export interface RawDataset {
  institution: Institution;
  establishments: Establishment[];
  areas: Area[];
  cells: Cell[];
  persons: Person[];
  personLocations: PersonLocation[];
  legalCases: LegalCase[];
  sentences: Sentence[];
  sentencePeriods: SentencePeriod[];
  redemptionRecords: RedemptionRecord[];
}

const SENTENCED_STATUSES = new Set([
  "documentacion_completa",
  "en_espera_decision",
  "en_analisis",
  "documentacion_incompleta",
  "cerrado",
]);

export function generateDataset(seed: number, personCount: number): RawDataset {
  counter = 0;
  const rng = new Rng(seed);

  const institution: Institution = {
    id: id("inst"),
    name: "Instituto Nacional Demostrativo (BIALCO Demo)",
    code: "INST-DEMO-01",
  };

  const establishments: Establishment[] = ESTABLISHMENTS.map((spec) => ({
    id: id("est"),
    institutionId: institution.id,
    name: spec.name,
    code: spec.code,
    city: spec.city,
    capacity: spec.capacity,
  }));

  const areas: Area[] = [];
  const cells: Cell[] = [];
  const areasByEstablishment = new Map<string, Area[]>();
  const cellsByArea = new Map<string, Cell[]>();

  for (const establishment of establishments) {
    const areaCount = rng.int(3, 5);
    const establishmentAreas: Area[] = [];
    for (const areaName of AREA_NAMES.slice(0, areaCount)) {
      const area: Area = {
        id: id("area"),
        establishmentId: establishment.id,
        name: areaName,
        type: areaName.startsWith("Pabellon") ? "pabellon" : "patio",
        capacity: Math.floor(establishment.capacity / areaCount),
      };
      areas.push(area);
      establishmentAreas.push(area);

      const cellCount = Math.max(Math.floor(area.capacity / 4), 5);
      const areaCells: Cell[] = [];
      for (let i = 1; i <= cellCount; i++) {
        const cell: Cell = {
          id: id("cell"),
          areaId: area.id,
          code: `${areaName.slice(0, 3).toUpperCase()}-${String(i).padStart(3, "0")}`,
          capacity: 4,
        };
        cells.push(cell);
        areaCells.push(cell);
      }
      cellsByArea.set(area.id, areaCells);
    }
    areasByEstablishment.set(establishment.id, establishmentAreas);
  }

  const persons: Person[] = [];
  const personLocations: PersonLocation[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < personCount; i++) {
    const sex: "M" | "F" = rng.bool() ? "M" : "F";
    const firstName = rng.choice(sex === "M" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const lastName = `${rng.choice(LAST_NAMES)} ${rng.choice(LAST_NAMES)}`;

    let identificationNumber = String(rng.int(1_000_000_000, 1_999_999_999));
    while (usedIds.has(identificationNumber)) {
      identificationNumber = String(rng.int(1_000_000_000, 1_999_999_999));
    }
    usedIds.add(identificationNumber);

    const ageYears = rng.int(19, 65);
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - ageYears);
    birthDate.setDate(birthDate.getDate() - rng.int(0, 364));

    const person: Person = {
      id: id("p"),
      institutionId: institution.id,
      internalCode: `BIALCO-${String(i + 2).padStart(6, "0")}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      identificationType: "CC",
      identificationNumber,
      birthDate: iso(birthDate),
      sex,
      status: "activo",
      cityOfOrigin: rng.choice(COLOMBIAN_CITIES_OF_ORIGIN),
    };
    persons.push(person);

    // Weighted by capacity (with a touch of noise) so occupancy lands in a
    // plausible ~85-115% band per establishment instead of some sitting
    // empty while others triple-book - a believable "near full system" demo.
    const establishment = rng.weightedChoice(
      establishments,
      establishments.map((e) => e.capacity * (0.85 + rng.next() * 0.3))
    );
    const establishmentAreas = areasByEstablishment.get(establishment.id) ?? [];
    const area = establishmentAreas.length ? rng.choice(establishmentAreas) : null;
    const areaCells = area ? cellsByArea.get(area.id) ?? [] : [];
    const cell = areaCells.length ? rng.choice(areaCells) : null;

    personLocations.push({
      id: id("loc"),
      personId: person.id,
      establishmentId: establishment.id,
      areaId: area?.id ?? null,
      cellId: cell?.id ?? null,
      effectiveFrom: iso(rng.daysAgo(30, 2000)),
      effectiveTo: null,
    });
  }

  const legalCases: LegalCase[] = [];
  let radicadoCounter = 2;
  for (const person of persons) {
    const numCases = rng.bool(0.8) ? 1 : 2;
    for (let c = 0; c < numCases; c++) {
      const openedAt = rng.daysAgo(60, 2200);
      const status = rng.weightedChoice(CASE_STATUSES, [10, 20, 15, 12, 10, 13, 20]);
      const closedAt = status === "cerrado" ? new Date(openedAt.getTime() + rng.int(90, 900) * 86_400_000) : null;

      legalCases.push({
        id: id("case"),
        personId: person.id,
        radicado: `RAD-${String(radicadoCounter).padStart(8, "0")}-DEMO`,
        authority: rng.choice(CASE_AUTHORITIES),
        caseTypeLabel: rng.choice(CASE_TYPE_LABELS),
        status,
        openedAt: iso(openedAt),
        closedAt: closedAt ? iso(closedAt) : null,
      });
      radicadoCounter += 1;
    }
  }

  const sentences: Sentence[] = [];
  const sentencePeriods: SentencePeriod[] = [];
  const SENTENCE_TYPES = ["privativa de la libertad (demo)", "privativa domiciliaria (demo)"];

  for (const legalCase of legalCases) {
    if (!SENTENCED_STATUSES.has(legalCase.status)) continue;

    const totalDays = rng.int(365, 365 * 15);
    const sentenceStatus = legalCase.status === "cerrado" ? "cumplida" : "vigente";

    const sentence: Sentence = {
      id: id("sent"),
      legalCaseId: legalCase.id,
      sentenceType: rng.choice(SENTENCE_TYPES),
      totalTimeDays: totalDays,
      imposedAt: legalCase.openedAt,
      status: sentenceStatus,
    };
    sentences.push(sentence);

    sentencePeriods.push({
      id: id("speriod"),
      sentenceId: sentence.id,
      periodType: "intramural",
      startDate: legalCase.openedAt,
      endDate: legalCase.closedAt,
    });
  }

  const redemptionRecords: RedemptionRecord[] = [];
  const activeSentences = sentences.filter((s) => s.status === "vigente");
  const legalCaseById = new Map(legalCases.map((c) => [c.id, c]));
  const sampledSentences = rng.sample(activeSentences, Math.floor(activeSentences.length * 0.45));

  for (const sentence of sampledSentences) {
    const legalCase = legalCaseById.get(sentence.legalCaseId);
    if (!legalCase) continue;

    const numRecords = rng.int(1, 3);
    let cursor = new Date(sentence.imposedAt);
    for (let r = 0; r < numRecords; r++) {
      const periodDays = rng.int(30, 180);
      const periodStart = new Date(cursor);
      const periodEnd = new Date(periodStart.getTime() + periodDays * 86_400_000);
      const daysWorked = periodDays;
      const redemptionDaysGranted = Math.max(Math.floor(daysWorked / 2), 1);

      redemptionRecords.push({
        id: id("redemp"),
        personId: legalCase.personId,
        sentenceId: sentence.id,
        activityType: rng.choice(REDEMPTION_ACTIVITY_TYPES),
        daysWorked,
        redemptionDaysGranted,
        periodStart: iso(periodStart),
        periodEnd: iso(periodEnd),
        source: "seed",
      });

      cursor = new Date(periodEnd.getTime() + rng.int(5, 30) * 86_400_000);
    }
  }

  return {
    institution,
    establishments,
    areas,
    cells,
    persons,
    personLocations,
    legalCases,
    sentences,
    sentencePeriods,
    redemptionRecords,
  };
}

export { id as generateId, iso as toIsoDate };
