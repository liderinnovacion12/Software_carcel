import { generateId } from "./generate";
import { Rng } from "./rng";
import type {
  Alert,
  DocumentRecord,
  Establishment,
  LegalCase,
  Person,
  PersonLocation,
  RedemptionRecord,
  Sentence,
} from "./types";

const RESPONSIBLE_USERS = ["Administrador BIALCO"];

const todayIso = () => new Date().toISOString().slice(0, 10);
const daysFromToday = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

interface AlertInputs {
  rng: Rng;
  legalCases: LegalCase[];
  sentences: Sentence[];
  redemptionRecords: RedemptionRecord[];
  documents: DocumentRecord[];
  personById: Map<string, Person>;
  currentLocationByPerson: Map<string, PersonLocation>;
  establishmentById: Map<string, Establishment>;
}

/**
 * Derives operational alerts (spec section 17) from the already-generated
 * dataset. Every alert explains what happened, why, and a recommended
 * administrative action - never a legal decision (spec section 17/2).
 */
export function generateAlerts(inputs: AlertInputs): Alert[] {
  const {
    rng,
    legalCases,
    sentences,
    redemptionRecords,
    documents,
    personById,
    currentLocationByPerson,
    establishmentById,
  } = inputs;

  const alerts: Alert[] = [];
  const sentenceByCaseId = new Map(sentences.map((s) => [s.legalCaseId, s]));
  const redemptionCountByPerson = new Map<string, number>();
  for (const record of redemptionRecords) {
    redemptionCountByPerson.set(record.personId, (redemptionCountByPerson.get(record.personId) ?? 0) + 1);
  }
  const missingDocsByCase = new Map<string, number>();
  for (const doc of documents) {
    if (doc.status === "faltante" && doc.legalCaseId) {
      missingDocsByCase.set(doc.legalCaseId, (missingDocsByCase.get(doc.legalCaseId) ?? 0) + 1);
    }
  }

  const push = (partial: Omit<Alert, "id" | "responsibleUser" | "status">) => {
    alerts.push({
      ...partial,
      id: generateId("alert"),
      responsibleUser: rng.choice(RESPONSIBLE_USERS),
      status: rng.weightedChoice(["abierta", "en_revision", "resuelta"] as const, [65, 25, 10]),
    });
  };

  const contextFor = (person: Person) => {
    const location = currentLocationByPerson.get(person.id);
    const establishment = location ? establishmentById.get(location.establishmentId) : undefined;
    return { establishmentId: establishment?.id ?? "", establishmentName: establishment?.name ?? "Sin asignar" };
  };

  for (const legalCase of legalCases) {
    const person = personById.get(legalCase.personId);
    if (!person) continue;
    const { establishmentId, establishmentName } = contextFor(person);

    if (legalCase.status === "documentacion_incompleta") {
      const missing = missingDocsByCase.get(legalCase.id) ?? 0;
      push({
        type: "expediente_incompleto",
        level: missing >= 2 ? "alto" : "medio",
        title: "Expediente incompleto",
        description: `El proceso ${legalCase.radicado} tiene ${missing || 1} documento(s) pendientes de cargue.`,
        reason: "Documentacion incompleta detectada en el expediente.",
        personId: person.id,
        personName: person.fullName,
        legalCaseId: legalCase.id,
        establishmentId,
        establishmentName,
        date: legalCase.openedAt,
        deadline: daysFromToday(rng.int(5, 20)),
        recommendedAction: "Solicitar al establecimiento el cargue de los documentos faltantes.",
      });
    }

    if (legalCase.status === "en_espera_decision") {
      push({
        type: "decision_pendiente",
        level: "alto",
        title: "Decision pendiente de ejecucion",
        description: `El proceso ${legalCase.radicado} tiene una decision registrada pendiente de ejecucion administrativa.`,
        reason: "Decision recibida sin actuacion de ejecucion registrada.",
        personId: person.id,
        personName: person.fullName,
        legalCaseId: legalCase.id,
        establishmentId,
        establishmentName,
        date: todayIso(),
        deadline: daysFromToday(rng.int(3, 15)),
        recommendedAction: "Asignar responsable para ejecutar la decision y actualizar el estado del caso.",
      });
    }

    if (
      (legalCase.status === "pendiente_revision" || legalCase.status === "en_analisis") &&
      rng.bool(0.35)
    ) {
      push({
        type: "caso_sin_movimiento",
        level: "medio",
        title: "Caso sin movimiento",
        description: `El proceso ${legalCase.radicado} no registra actuaciones recientes.`,
        reason: "Sin actuaciones registradas en un periodo prolongado.",
        personId: person.id,
        personName: person.fullName,
        legalCaseId: legalCase.id,
        establishmentId,
        establishmentName,
        date: legalCase.openedAt,
        deadline: null,
        recommendedAction: "Asignar revision prioritaria al responsable del caso.",
      });
    }

    if (legalCase.status === "identificado" && rng.bool(0.5)) {
      push({
        type: "revision_prioritaria",
        level: "critico",
        title: "Revision prioritaria",
        description: `El proceso ${legalCase.radicado} fue identificado y requiere revision inicial.`,
        reason: "Caso recien identificado sin revision inicial.",
        personId: person.id,
        personName: person.fullName,
        legalCaseId: legalCase.id,
        establishmentId,
        establishmentName,
        date: legalCase.openedAt,
        deadline: daysFromToday(rng.int(1, 10)),
        recommendedAction: "Asignar un responsable para la revision inicial del caso.",
      });
    }

    const sentence = sentenceByCaseId.get(legalCase.id);
    if (sentence && sentence.status === "vigente") {
      const imposedAt = new Date(sentence.imposedAt);
      const elapsedDays = Math.max(
        Math.round((Date.now() - imposedAt.getTime()) / 86_400_000),
        0
      );
      const pendingDays = sentence.totalTimeDays - elapsedDays;

      if (pendingDays > 0 && pendingDays <= 60) {
        push({
          type: "proximo_vencimiento",
          level: "critico",
          title: "Proximo vencimiento",
          description: `El tiempo estimado de condena de ${person.fullName} vence en aproximadamente ${pendingDays} dias.`,
          reason: "El calculo de tiempo indica un vencimiento cercano.",
          personId: person.id,
          personName: person.fullName,
          legalCaseId: legalCase.id,
          establishmentId,
          establishmentName,
          date: todayIso(),
          deadline: daysFromToday(pendingDays),
          recommendedAction: "Validar el calculo de tiempo y preparar la documentacion de egreso.",
        });
      }

      if (!redemptionCountByPerson.has(person.id) && rng.bool(0.6)) {
        push({
          type: "redencion_pendiente",
          level: "medio",
          title: "Redencion pendiente de revisar",
          description: `${person.fullName} no tiene registros de redencion asociados a su sentencia vigente.`,
          reason: "Sentencia vigente sin redenciones registradas para revision.",
          personId: person.id,
          personName: person.fullName,
          legalCaseId: legalCase.id,
          establishmentId,
          establishmentName,
          date: todayIso(),
          deadline: null,
          recommendedAction: "Revisar si la persona participa en actividades redimibles.",
        });
      }

      if (legalCase.status === "documentacion_completa" && rng.bool(0.3)) {
        push({
          type: "calculo_pendiente_validacion",
          level: "bajo",
          title: "Calculo pendiente de validacion",
          description: `El ultimo calculo de tiempo de ${person.fullName} tiene mas de 90 dias y conviene confirmar que sigue vigente.`,
          reason: "Expediente completo con calculo de tiempo susceptible de actualizacion rutinaria.",
          personId: person.id,
          personName: person.fullName,
          legalCaseId: legalCase.id,
          establishmentId,
          establishmentName,
          date: todayIso(),
          deadline: null,
          recommendedAction: "Confirmar que el calculo de tiempo registrado sigue vigente.",
        });
      }
    }
  }

  return alerts;
}
