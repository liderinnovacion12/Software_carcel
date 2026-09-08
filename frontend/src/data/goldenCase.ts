import { generateId, toIsoDate } from "./generate";
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

export const GOLDEN_INTERNAL_CODE = "BIALCO-000001";
export const GOLDEN_IDENTIFICATION = "1000999888";

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

/**
 * Builds the polished, always-present demo case: Andres Felipe Mendoza Rios
 * (spec section 38). Entirely fictional, hand-built (not randomly drawn) so
 * the golden-path demo walkthrough is reproducible regardless of the RNG
 * seed used for the bulk synthetic population.
 */
export function buildGoldenCase(institution: Institution, establishment: Establishment, area: Area | null, cell: Cell | null) {
  const entryDate = daysFromNow(980);

  const person: Person = {
    id: generateId("p"),
    institutionId: institution.id,
    internalCode: GOLDEN_INTERNAL_CODE,
    firstName: "Andres Felipe",
    lastName: "Mendoza Rios",
    fullName: "Andres Felipe Mendoza Rios",
    identificationType: "CC",
    identificationNumber: GOLDEN_IDENTIFICATION,
    birthDate: "1990-04-12",
    sex: "M",
    status: "activo",
    cityOfOrigin: "Bogota",
  };

  const location: PersonLocation = {
    id: generateId("loc"),
    personId: person.id,
    establishmentId: establishment.id,
    areaId: area?.id ?? null,
    cellId: cell?.id ?? null,
    effectiveFrom: toIsoDate(entryDate),
    effectiveTo: null,
  };

  const caseOpenedAt = new Date(entryDate.getTime() + 15 * 86_400_000);
  const legalCase: LegalCase = {
    id: generateId("case"),
    personId: person.id,
    radicado: "RAD-00000001-DEMO",
    authority: "Juzgado de Ejecucion de Penas y Medidas de Seguridad No. 1 (demo)",
    caseTypeLabel: "Proceso penal - etapa de ejecucion de penas (demo)",
    status: "documentacion_incompleta",
    openedAt: toIsoDate(caseOpenedAt),
    closedAt: null,
  };

  const imposedAt = new Date(caseOpenedAt.getTime() + 45 * 86_400_000);
  const sentence: Sentence = {
    id: generateId("sent"),
    legalCaseId: legalCase.id,
    sentenceType: "privativa de la libertad (demo)",
    totalTimeDays: 365 * 6,
    imposedAt: toIsoDate(imposedAt),
    status: "vigente",
  };

  const sentencePeriod: SentencePeriod = {
    id: generateId("speriod"),
    sentenceId: sentence.id,
    periodType: "intramural",
    startDate: sentence.imposedAt,
    endDate: null,
  };

  const redemptionPeriods: [Date, Date, string][] = [
    [new Date(imposedAt.getTime() + 30 * 86_400_000), new Date(imposedAt.getTime() + 150 * 86_400_000), "trabajo"],
    [new Date(imposedAt.getTime() + 160 * 86_400_000), new Date(imposedAt.getTime() + 280 * 86_400_000), "estudio"],
  ];

  const redemptionRecords: RedemptionRecord[] = redemptionPeriods.map(([start, end, activityType]) => {
    const daysWorked = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    return {
      id: generateId("redemp"),
      personId: person.id,
      sentenceId: sentence.id,
      activityType,
      daysWorked,
      redemptionDaysGranted: Math.max(Math.floor(daysWorked / 2), 1),
      periodStart: toIsoDate(start),
      periodEnd: toIsoDate(end),
      source: "seed",
    };
  });

  return { person, location, legalCase, sentence, sentencePeriod, redemptionRecords };
}
