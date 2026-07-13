"""Savings-account projection.

The projection is a month-by-month simulation rather than a closed-form
annuity formula so that the schedule (used for charts and tables) and the
summary numbers always come from the same arithmetic.

Model assumptions (documented in /methodology and the README):
- The annual rate is converted to an effective monthly rate via the APY:
  monthly = (1 + APY)^(1/12) − 1. When the input is an APR, it is first
  converted to APY using the selected compounding frequency.
- Recurring contributions are monthly and constant. BEGINNING timing deposits
  before growth is applied for the month (annuity-due); END deposits after
  (ordinary annuity).
- No taxes or fees are modeled. Projections assume the rate stays constant,
  which real rates do not — this is a planning assumption, not a prediction.
"""

from __future__ import annotations

from .models import (
    Compounding,
    ContributionTiming,
    MonthPoint,
    RateBasis,
    SavingsProjection,
)
from .rates import apr_to_apy, apy_to_periodic_rate, inflation_adjusted_value
from .validation import validate_amount, validate_months, validate_rate


def resolve_apy(annual_rate: float, rate_basis: RateBasis, compounding: Compounding) -> float:
    """Normalize an annual rate to APY according to its basis."""
    validate_rate(annual_rate, "Annual rate")
    if rate_basis is RateBasis.APR:
        return apr_to_apy(annual_rate, compounding.periods_per_year)
    return annual_rate


def project_savings(
    principal: float,
    annual_rate: float,
    months: int,
    *,
    rate_basis: RateBasis = RateBasis.APY,
    compounding: Compounding = Compounding.MONTHLY,
    monthly_contribution: float = 0.0,
    timing: ContributionTiming = ContributionTiming.END,
    inflation_rate: float | None = None,
) -> SavingsProjection:
    """Project a savings balance month by month.

    Args:
        principal: Starting balance.
        annual_rate: Annual rate as a fraction (0.045 == 4.5%).
        months: Time horizon in whole months.
        rate_basis: Whether annual_rate is an APR (nominal) or APY (effective).
        compounding: Compounding frequency — only used to convert APR to APY.
        monthly_contribution: Recurring deposit added every month.
        timing: Whether deposits land at the beginning or end of each month.
        inflation_rate: Optional annual inflation assumption for the
            real-value (today's dollars) figure.
    """
    validate_amount(principal, "Starting balance")
    validate_months(months, "Time horizon")
    validate_amount(monthly_contribution, "Monthly contribution")
    if inflation_rate is not None:
        validate_rate(inflation_rate, "Inflation rate")

    apy = resolve_apy(annual_rate, rate_basis, compounding)
    monthly_rate = apy_to_periodic_rate(apy, 12)

    balance = principal
    contributions = 0.0
    schedule: list[MonthPoint] = []

    for month in range(1, months + 1):
        if timing is ContributionTiming.BEGINNING:
            balance += monthly_contribution
            contributions += monthly_contribution
        balance *= 1 + monthly_rate
        if timing is ContributionTiming.END:
            balance += monthly_contribution
            contributions += monthly_contribution
        interest_to_date = balance - principal - contributions
        schedule.append(
            MonthPoint(
                month=month,
                balance=balance,
                contributions_to_date=contributions,
                interest_to_date=interest_to_date,
            )
        )

    total_in = principal + contributions
    interest_earned = balance - total_in
    # Effective growth over everything the saver put in. Zero-input edge case
    # (0 principal, 0 contributions) yields 0 growth by definition.
    effective_growth = (balance / total_in - 1) if total_in > 0 else 0.0

    real_ending = (
        inflation_adjusted_value(balance, inflation_rate, months / 12)
        if inflation_rate is not None
        else None
    )

    return SavingsProjection(
        principal=principal,
        months=months,
        apy=apy,
        monthly_contribution=monthly_contribution,
        timing=timing,
        ending_balance=balance,
        total_contributions=contributions,
        interest_earned=interest_earned,
        effective_growth_pct=effective_growth,
        inflation_rate=inflation_rate,
        real_ending_balance=real_ending,
        schedule=tuple(schedule),
    )
