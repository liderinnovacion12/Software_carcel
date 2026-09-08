"""Regla de demostracion: tiempo fisico cumplido vs tiempo pendiente.

This is a synthetic demonstration rule. It does NOT represent current
Colombian law or any official penitentiary calculation. It exists to prove
the traceability shape of BIALCO's calculation engine (see spec section 15/16).
"""

from app.services.calculation_rules.base import RuleContext, RuleResult, RuleStep

RULE_LABEL = "Tiempo cumplido (regla de demostracion)"


def calcular(context: RuleContext) -> RuleResult:
    steps: list[RuleStep] = []

    if context.sentence is None:
        steps.append(
            RuleStep(
                label="Verificacion de sentencia activa",
                input_snapshot={"sentence_present": False},
                output_value="0",
                unit="dias",
                notes="La persona no tiene una sentencia activa registrada.",
            )
        )
        return RuleResult(steps=steps, summary={"tiempo_pendiente_dias": 0})

    total_days = context.sentence.total_time_days
    days_elapsed = max((context.calculation_date - context.sentence.imposed_at).days, 0)
    physical_days = min(days_elapsed, total_days)

    steps.append(
        RuleStep(
            label="Tiempo total de la condena",
            input_snapshot={
                "sentence_id": str(context.sentence.id),
                "total_time_days": total_days,
            },
            output_value=str(total_days),
        )
    )
    steps.append(
        RuleStep(
            label="Tiempo fisico transcurrido desde la sentencia",
            input_snapshot={
                "imposed_at": context.sentence.imposed_at.isoformat(),
                "calculation_date": context.calculation_date.isoformat(),
            },
            output_value=str(physical_days),
        )
    )

    pending_days = max(total_days - physical_days, 0)
    percentage = round((physical_days / total_days) * 100, 1) if total_days else 0.0

    steps.append(
        RuleStep(
            label="Tiempo pendiente estimado",
            input_snapshot={
                "total_time_days": total_days,
                "physical_days": physical_days,
            },
            output_value=str(pending_days),
            notes="Calculo de demostracion; no constituye un computo juridico oficial.",
        )
    )

    return RuleResult(
        steps=steps,
        summary={
            "tiempo_total_dias": total_days,
            "tiempo_fisico_dias": physical_days,
            "tiempo_pendiente_dias": pending_days,
            "porcentaje_cumplido": percentage,
        },
    )
