import { describe, expect, it } from "vitest";
import { getDb } from "@/data/db";
import {
  getDashboardIndicators,
  getPersonCalculations,
  runNewCalculation,
  searchPersons,
} from "@/data/queries";

describe("synthetic data layer", () => {
  it("generates approximately 800 persons including the golden case", () => {
    const db = getDb();
    expect(db.persons.length).toBe(800);
  });

  it("makes the golden case (Andres) findable by search", () => {
    const results = searchPersons("Andres Felipe Mendoza");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].full_name).toBe("Andres Felipe Mendoza Rios");
    expect(results[0].internal_code).toBe("BIALCO-000001");
  });

  it("seeds a traceable calculation run for the golden case", () => {
    const andres = searchPersons("Andres Felipe Mendoza")[0];
    const runs = getPersonCalculations(andres.person_id);
    expect(runs.length).toBeGreaterThan(0);
    expect(runs[0].details.length).toBeGreaterThan(0);
  });

  it("can execute a new calculation on demand", () => {
    const andres = searchPersons("Andres Felipe Mendoza")[0];
    const before = getPersonCalculations(andres.person_id).length;
    runNewCalculation(andres.person_id, "demo-tiempo-cumplido-v1");
    const after = getPersonCalculations(andres.person_id).length;
    expect(after).toBe(before + 1);
  });

  it("computes dashboard indicators from the generated dataset", () => {
    const indicators = getDashboardIndicators();
    expect(indicators.poblacion_registrada).toBe(800);
    expect(indicators.establecimientos_count).toBe(3);
    expect(indicators.ocupacion_actual).toBe(800);
  });
});
