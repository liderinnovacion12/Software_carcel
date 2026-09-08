"""Regla de demostracion: tiempo efectivo con redencion por trabajo/estudio.

Synthetic demonstration rule only - see tiempo_cumplido_simple.py header note.
"""

from app.services.calculation_rules.base import RuleContext, RuleResult, RuleStep
from app.services.calculation_rules.tiempo_cumplido_simple import (
    calcular as calcular_tiempo_cumplido,
)

RULE_LABEL = "Redencion por trabajo/estudio (regla de demostracion)"


def calcular(context: RuleContext) -> RuleResult:
    base_result = calcular_tiempo_cumplido(context)
    steps: list[RuleStep] = list(base_result.steps)

    total_redemption_days = sum(
        record.redemption_days_granted for record in context.redemption_records
    )

    steps.append(
        RuleStep(
            label="Total de dias redimidos por trabajo/estudio/ensenanza",
            input_snapshot={
                "redemption_records_count": len(context.redemption_records),
                "records": [
                    {
                        "activity_type": record.activity_type,
                        "redemption_days_granted": record.redemption_days_granted,
                        "period_start": record.period_start.isoformat(),
                        "period_end": record.period_end.isoformat(),
                    }
                    for record in context.redemption_records
                ],
            },
            output_value=str(total_redemption_days),
        )
    )

    physical_days = base_result.summary.get("tiempo_fisico_dias", 0)
    total_days = base_result.summary.get("tiempo_total_dias", 0)
    effective_days = physical_days + total_redemption_days
    pending_days = max(total_days - effective_days, 0)
    percentage = round((effective_days / total_days) * 100, 1) if total_days else 0.0

    steps.append(
        RuleStep(
            label="Tiempo efectivo (fisico + redimido)",
            input_snapshot={
                "tiempo_fisico_dias": physical_days,
                "dias_redimidos": total_redemption_days,
            },
            output_value=str(effective_days),
            notes="Calculo de demostracion; no constituye un computo juridico oficial.",
        )
    )

    return RuleResult(
        steps=steps,
        summary={
            "tiempo_total_dias": total_days,
            "tiempo_fisico_dias": physical_days,
            "dias_redimidos": total_redemption_days,
            "tiempo_efectivo_dias": effective_days,
            "tiempo_pendiente_dias": pending_days,
            "porcentaje_cumplido": percentage,
        },
    )
