from dataclasses import dataclass, field
from datetime import date

from app.db.models.person import Person
from app.db.models.redemption_record import RedemptionRecord
from app.db.models.sentence import Sentence


@dataclass(frozen=True)
class RuleContext:
    """Immutable snapshot of the data a calculation rule is allowed to read.

    Freezing this at calculation time (rather than letting rules query the DB
    directly) is what makes each calculation_run reproducible/traceable: the
    exact inputs used are captured in calculation_details.input_snapshot.
    """

    person: Person
    sentence: Sentence | None
    redemption_records: list[RedemptionRecord]
    calculation_date: date


@dataclass
class RuleStep:
    label: str
    input_snapshot: dict
    output_value: str
    unit: str = "dias"
    notes: str | None = None


@dataclass
class RuleResult:
    steps: list[RuleStep] = field(default_factory=list)
    summary: dict = field(default_factory=dict)
