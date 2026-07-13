"""Domain models for the Savings Growth Planner calculation engine.

All models are immutable dataclasses: the engine computes projections from
user-supplied assumptions and never mutates state. Monetary values are plain
floats at full precision — rounding to currency precision happens only at the
display boundary (see formatting.py for the rounding policy).
"""

from __future__ import annotations

import enum
from dataclasses import dataclass, field


class RateBasis(enum.Enum):
    """How the user's annual rate should be interpreted.

    APR is the nominal annual rate (does not include compounding).
    APY is the effective annual yield (already includes compounding) — this is
    the number banks advertise for savings accounts and CDs.
    """

    APR = "apr"
    APY = "apy"


class Compounding(enum.Enum):
    """Compounding frequency, expressed as periods per year."""

    ANNUALLY = 1
    SEMIANNUALLY = 2
    QUARTERLY = 4
    MONTHLY = 12
    DAILY = 365

    @property
    def periods_per_year(self) -> int:
        return self.value


class ContributionTiming(enum.Enum):
    """When a recurring monthly contribution is deposited within each month.

    BEGINNING (annuity-due): the deposit earns interest for the month it is
    made. END (ordinary annuity): the deposit earns interest starting the
    following month. END is the default because it is the conservative
    assumption.
    """

    BEGINNING = "beginning"
    END = "end"


@dataclass(frozen=True)
class MonthPoint:
    """Balance snapshot at the end of one month of a projection."""

    month: int  # 1-based month index
    balance: float  # balance at end of month
    contributions_to_date: float  # cumulative contributions, excluding principal
    interest_to_date: float  # cumulative interest earned


@dataclass(frozen=True)
class SavingsProjection:
    """Result of a savings-account projection."""

    principal: float
    months: int
    apy: float  # effective annual yield actually applied (fraction)
    monthly_contribution: float
    timing: ContributionTiming
    ending_balance: float
    total_contributions: float  # recurring contributions only, excludes principal
    interest_earned: float
    effective_growth_pct: float  # (ending / total in) − 1, as a fraction
    inflation_rate: float | None
    real_ending_balance: float | None  # ending balance in today's dollars
    schedule: tuple[MonthPoint, ...] = field(repr=False)


@dataclass(frozen=True)
class CDProjection:
    """Result of a certificate-of-deposit projection."""

    principal: float
    term_months: int
    apy: float  # effective annual yield actually applied (fraction)
    maturity_balance: float
    interest_earned: float
    # Early-withdrawal scenario (None when not requested).
    early_withdrawal_month: int | None
    penalty_months: float | None  # penalty expressed as months of interest
    balance_at_withdrawal: float | None  # before penalty
    penalty_amount: float | None
    early_withdrawal_balance: float | None  # after penalty
    penalty_exceeds_interest: bool  # True when the penalty eats into principal
    cost_of_early_withdrawal: float | None  # maturity balance − early balance
    schedule: tuple[MonthPoint, ...] = field(repr=False)


@dataclass(frozen=True)
class LadderRung:
    """One CD within a ladder."""

    allocation: float
    term_months: int
    apy: float
    maturity_balance: float
    interest_earned: float


@dataclass(frozen=True)
class LadderPlan:
    """A CD ladder: several CDs opened together with staggered maturities."""

    total_allocated: float
    rungs: tuple[LadderRung, ...]
    total_maturity_value: float
    total_interest: float
