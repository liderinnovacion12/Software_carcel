import { DOCUMENT_CATEGORIES } from "./constants";
import { generateId } from "./generate";
import { Rng } from "./rng";
import type { DocumentRecord, LegalCase, Person } from "./types";

/**
 * Mock document metadata per legal case (spec section 19). Not real files -
 * this only demonstrates the shape of BIALCO's document tracking so
 * DocumentsPage / missing-document alerts have something real to show.
 */
export function generateDocuments(
  rng: Rng,
  legalCases: LegalCase[],
  personById: Map<string, Person>
): DocumentRecord[] {
  const documents: DocumentRecord[] = [];

  for (const legalCase of legalCases) {
    const person = personById.get(legalCase.personId);
    if (!person) continue;

    const categoryCount = rng.int(2, DOCUMENT_CATEGORIES.length);
    const categories = rng.sample(DOCUMENT_CATEGORIES, categoryCount);

    for (const category of categories) {
      const isIncomplete = legalCase.status === "documentacion_incompleta";
      const status = isIncomplete && rng.bool(0.4) ? "faltante" : rng.bool(0.85) ? "completo" : "en_revision";

      documents.push({
        id: generateId("doc"),
        personId: person.id,
        personName: person.fullName,
        legalCaseId: legalCase.id,
        category,
        status,
        uploadedAt: status === "faltante" ? null : legalCase.openedAt,
      });
    }
  }

  return documents;
}
