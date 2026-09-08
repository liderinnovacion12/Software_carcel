// Synthetic demonstration calculation rules - ported from
// backend/app/services/calculation_rules/. These do NOT represent current
// Colombian law or any official penitentiary calculation; they exist to
// demonstrate BIALCO's traceable calculation-engine shape (spec section 15/16).
import type { CalculationDetail, RedemptionRecord, Sentence } from "./types";

export interface RuleContext {
  sentence: Sentence | null;
  redemptionRecords: RedemptionRecord[];
  calculationDate: Date;
}

export interface RuleResult {
  steps: CalculationDetail[];
  summary: Record<string, number>;
}

const daysBetween = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86_400_000);

export const RULE_LABELS: Record<string, string> = {
  "demo-tiempo-cumplido-v1": "Tiempo cumplido (regla de demostracion)",
  "demo-redencion-v1": "Redencion por trabajo/estudio (regla de demostracion)",
};

function tiempoCumplidoSimple(context: RuleContext): RuleResult {
  const steps: CalculationDetail[] = [];

  if (!context.sentence) {
    steps.push({
      stepOrder: 1,
      label: "Verificacion de sentencia activa",
      inputSnapshot: { sentence_present: false },
      outputValue: "0",
      unit: "dias",
      notes: "La persona no tiene una sentencia activa registrada.",
    });
    return { steps, summary: { tiempo_pendiente_dias: 0 } };
  }

  const totalDays = context.sentence.totalTimeDays;
  const imposedAt = new Date(context.sentence.imposedAt);
  const daysElapsed = Math.max(daysBetween(context.calculationDate, imposedAt), 0);
  const physicalDays = Math.min(daysElapsed, totalDays);

  steps.push({
    stepOrder: 1,
    label: "Tiempo total de la condena",
    inputSnapshot: { sentence_id: context.sentence.id, total_time_days: totalDays },
    outputValue: String(totalDays),
    unit: "dias",
    notes: null,
  });
  steps.push({
    stepOrder: 2,
    label: "Tiempo fisico transcurrido desde la sentencia",
    inputSnapshot: {
      imposed_at: context.sentence.imposedAt,
      calculation_date: context.calculationDate.toISOString().slice(0, 10),
    },
    outputValue: String(physicalDays),
    unit: "dias",
    notes: null,
  });

  const pendingDays = Math.max(totalDays - physicalDays, 0);
  const percentage = totalDays ? Math.round((physicalDays / totalDays) * 1000) / 10 : 0;

  steps.push({
    stepOrder: 3,
    label: "Tiempo pendiente estimado",
    inputSnapshot: { total_time_days: totalDays, physical_days: physicalDays },
    outputValue: String(pendingDays),
    unit: "dias",
    notes: "Calculo de demostracion; no constituye un computo juridico oficial.",
  });

  return {
    steps,
    summary: {
      tiempo_total_dias: totalDays,
      tiempo_fisico_dias: physicalDays,
      tiempo_pendiente_dias: pendingDays,
      porcentaje_cumplido: percentage,
    },
  };
}

function redencionTrabajoEstudio(context: RuleContext): RuleResult {
  const base = tiempoCumplidoSimple(context);
  const steps = [...base.steps];

  const totalRedemptionDays = context.redemptionRecords.reduce(
    (sum, r) => sum + r.redemptionDaysGranted,
    0
  );

  steps.push({
    stepOrder: steps.length + 1,
    label: "Total de dias redimidos por trabajo/estudio/ensenanza",
    inputSnapshot: {
      redemption_records_count: context.redemptionRecords.length,
      records: context.redemptionRecords.map((r) => ({
        activity_type: r.activityType,
        redemption_days_granted: r.redemptionDaysGranted,
        period_start: r.periodStart,
        period_end: r.periodEnd,
      })),
    },
    outputValue: String(totalRedemptionDays),
    unit: "dias",
    notes: null,
  });

  const physicalDays = base.summary.tiempo_fisico_dias ?? 0;
  const totalDays = base.summary.tiempo_total_dias ?? 0;
  const effectiveDays = physicalDays + totalRedemptionDays;
  const pendingDays = Math.max(totalDays - effectiveDays, 0);
  const percentage = totalDays ? Math.round((effectiveDays / totalDays) * 1000) / 10 : 0;

  steps.push({
    stepOrder: steps.length + 1,
    label: "Tiempo efectivo (fisico + redimido)",
    inputSnapshot: { tiempo_fisico_dias: physicalDays, dias_redimidos: totalRedemptionDays },
    outputValue: String(effectiveDays),
    unit: "dias",
    notes: "Calculo de demostracion; no constituye un computo juridico oficial.",
  });

  return {
    steps,
    summary: {
      tiempo_total_dias: totalDays,
      tiempo_fisico_dias: physicalDays,
      dias_redimidos: totalRedemptionDays,
      tiempo_efectivo_dias: effectiveDays,
      tiempo_pendiente_dias: pendingDays,
      porcentaje_cumplido: percentage,
    },
  };
}

export const RULE_REGISTRY: Record<string, (context: RuleContext) => RuleResult> = {
  "demo-tiempo-cumplido-v1": tiempoCumplidoSimple,
  "demo-redencion-v1": redencionTrabajoEstudio,
};
