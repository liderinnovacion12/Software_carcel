import { generateAlerts } from "./alerts";
import { RULE_LABELS, RULE_REGISTRY } from "./calculationRules";
import { CASE_STATUS_LABELS } from "./constants";
import { generateDocuments } from "./documents";
import { generateDataset, generateId, toIsoDate } from "./generate";
import { buildGoldenCase } from "./goldenCase";
import { Rng } from "./rng";
import type {
  Alert,
  Area,
  CalculationRun,
  Cell,
  DocumentRecord,
  Establishment,
  Institution,
  LegalCase,
  Person,
  PersonLocation,
  RedemptionRecord,
  Sentence,
  SentencePeriod,
} from "./types";

const SEED = 42;
const PERSON_COUNT = 799; // + golden case = 800

class Database {
  institution!: Institution;
  establishments: Establishment[] = [];
  areas: Area[] = [];
  cells: Cell[] = [];
  persons: Person[] = [];
  personLocations: PersonLocation[] = [];
  legalCases: LegalCase[] = [];
  sentences: Sentence[] = [];
  sentencePeriods: SentencePeriod[] = [];
  redemptionRecords: RedemptionRecord[] = [];
  calculationRuns: CalculationRun[] = [];
  documents: DocumentRecord[] = [];
  alerts: Alert[] = [];

  personById = new Map<string, Person>();
  establishmentById = new Map<string, Establishment>();
  areaById = new Map<string, Area>();
  cellById = new Map<string, Cell>();
  legalCasesByPerson = new Map<string, LegalCase[]>();
  sentencesByCase = new Map<string, Sentence>();
  sentencePeriodsBySentence = new Map<string, SentencePeriod[]>();
  redemptionsByPerson = new Map<string, RedemptionRecord[]>();
  currentLocationByPerson = new Map<string, PersonLocation>();
  calculationsByPerson = new Map<string, CalculationRun[]>();

  constructor() {
    const raw = generateDataset(SEED, PERSON_COUNT);
    Object.assign(this, raw);

    // Insert the golden case into the first establishment/area/cell.
    const establishment = this.establishments[0];
    const area = this.areas.find((a) => a.establishmentId === establishment.id) ?? null;
    const cell = area ? this.cells.find((c) => c.areaId === area.id) ?? null : null;
    const golden = buildGoldenCase(this.institution, establishment, area, cell);

    this.persons.push(golden.person);
    this.personLocations.push(golden.location);
    this.legalCases.push(golden.legalCase);
    this.sentences.push(golden.sentence);
    this.sentencePeriods.push(golden.sentencePeriod);
    this.redemptionRecords.push(...golden.redemptionRecords);

    this.buildIndexes();

    const rng = new Rng(SEED + 1);
    this.documents = generateDocuments(rng, this.legalCases, this.personById);
    this.alerts = generateAlerts({
      rng: new Rng(SEED + 2),
      legalCases: this.legalCases,
      sentences: this.sentences,
      redemptionRecords: this.redemptionRecords,
      documents: this.documents,
      personById: this.personById,
      currentLocationByPerson: this.currentLocationByPerson,
      establishmentById: this.establishmentById,
    });

    // Seed a sample of traceable calculations, plus a guaranteed one for Andres.
    const activeSentences = this.sentences.filter((s) => s.status === "vigente");
    const sampleRng = new Rng(SEED + 3);
    const sample = sampleRng.sample(activeSentences, Math.min(120, activeSentences.length));
    for (const sentence of sample) {
      const legalCase = this.legalCases.find((c) => c.id === sentence.legalCaseId);
      if (!legalCase) continue;
      const ruleKey = sampleRng.bool() ? "demo-tiempo-cumplido-v1" : "demo-redencion-v1";
      this.runCalculation(legalCase.personId, ruleKey, "Generado en datos semilla");
    }
    this.runCalculation(golden.person.id, "demo-redencion-v1", "Generado en datos semilla");
  }

  private buildIndexes() {
    this.personById = new Map(this.persons.map((p) => [p.id, p]));
    this.establishmentById = new Map(this.establishments.map((e) => [e.id, e]));
    this.areaById = new Map(this.areas.map((a) => [a.id, a]));
    this.cellById = new Map(this.cells.map((c) => [c.id, c]));

    this.legalCasesByPerson = new Map();
    for (const legalCase of this.legalCases) {
      const list = this.legalCasesByPerson.get(legalCase.personId) ?? [];
      list.push(legalCase);
      this.legalCasesByPerson.set(legalCase.personId, list);
    }

    this.sentencesByCase = new Map(this.sentences.map((s) => [s.legalCaseId, s]));

    this.sentencePeriodsBySentence = new Map();
    for (const period of this.sentencePeriods) {
      const list = this.sentencePeriodsBySentence.get(period.sentenceId) ?? [];
      list.push(period);
      this.sentencePeriodsBySentence.set(period.sentenceId, list);
    }

    this.redemptionsByPerson = new Map();
    for (const record of this.redemptionRecords) {
      const list = this.redemptionsByPerson.get(record.personId) ?? [];
      list.push(record);
      this.redemptionsByPerson.set(record.personId, list);
    }

    this.currentLocationByPerson = new Map();
    for (const location of this.personLocations) {
      if (location.effectiveTo === null) this.currentLocationByPerson.set(location.personId, location);
    }
  }

  runCalculation(personId: string, ruleKey: string, responsibleSource: string): CalculationRun {
    const ruleFn = RULE_REGISTRY[ruleKey];
    const legalCases = this.legalCasesByPerson.get(personId) ?? [];
    let sentence: Sentence | null = null;
    for (const legalCase of legalCases) {
      const s = this.sentencesByCase.get(legalCase.id);
      if (s && s.status === "vigente") {
        sentence = s;
        break;
      }
    }
    const redemptionRecords = this.redemptionsByPerson.get(personId) ?? [];

    const result = ruleFn({ sentence, redemptionRecords, calculationDate: new Date() });

    const run: CalculationRun = {
      id: generateId("calc"),
      personId,
      sentenceId: sentence?.id ?? null,
      ruleReference: ruleKey,
      calculationDate: toIsoDate(new Date()),
      status: "completado",
      resultSummary: result.summary,
      responsibleSource,
      details: result.steps,
    };

    this.calculationRuns.push(run);
    const list = this.calculationsByPerson.get(personId) ?? [];
    list.push(run);
    this.calculationsByPerson.set(personId, list);

    return run;
  }
}

let instance: Database | null = null;

export function getDb(): Database {
  if (!instance) instance = new Database();
  return instance;
}

export { RULE_LABELS, CASE_STATUS_LABELS };
export type { Database };
