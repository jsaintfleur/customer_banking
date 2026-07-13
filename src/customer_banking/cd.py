"""Certificate-of-deposit projection with optional early-withdrawal scenario.

Model assumptions (documented in /methodology and the README):
- The CD compounds at the effective monthly rate derived from its APY, so the
  schedule is monthly regardless of the bank's internal compounding frequency.
  When the input is an APR, it is converted to APY using the selected
  compounding frequency first.
- No deposits or withdrawals during the term (standard CD behavior).
- The early-withdrawal penalty is the most common structure: a user-supplied
  number of months of interest, computed at the monthly rate on the balance at
  withdrawal. Penalties CAN exceed accrued interest and eat into principal —
  many real CDs work this way — and the projection flags when that happens.
  Actual bank penalty terms vary; the user supplies the assumption.
"""

from __future__ import annotations

from .models import CDProjection, Compounding, MonthPoint, RateBasis
from .rates import apy_to_periodic_rate
from .savings import resolve_apy
from .validation import (
    validate_amount,
    validate_months,
    validate_penalty_months,
    validate_withdrawal_month,
)


def project_cd(
    principal: float,
    annual_rate: float,
    term_months: int,
    *,
    rate_basis: RateBasis = RateBasis.APY,
    compounding: Compounding = Compounding.MONTHLY,
    early_withdrawal_month: int | None = None,
    penalty_months: float | None = None,
) -> CDProjection:
    """Project a CD to maturity, optionally modeling an early withdrawal.

    Args:
        principal: Initial deposit.
        annual_rate: Annual rate as a fraction (0.045 == 4.5%).
        term_months: CD term in whole months.
        rate_basis: Whether annual_rate is an APR (nominal) or APY (effective).
        compounding: Compounding frequency — only used to convert APR to APY.
        early_withdrawal_month: Optional month (1..term−1) at which the full
            balance is withdrawn early.
        penalty_months: Penalty as months of interest; required when an early
            withdrawal month is given (0 is allowed for no-penalty CDs).
    """
    validate_amount(principal, "Initial deposit", allow_zero=False)
    validate_months(term_months, "CD term")

    apy = resolve_apy(annual_rate, rate_basis, compounding)
    monthly_rate = apy_to_periodic_rate(apy, 12)

    balance = principal
    schedule: list[MonthPoint] = []
    for month in range(1, term_months + 1):
        balance *= 1 + monthly_rate
        schedule.append(
            MonthPoint(
                month=month,
                balance=balance,
                contributions_to_date=0.0,
                interest_to_date=balance - principal,
            )
        )

    maturity_balance = balance
    interest_earned = maturity_balance - principal

    balance_at_withdrawal: float | None = None
    penalty_amount: float | None = None
    early_balance: float | None = None
    penalty_exceeds_interest = False
    cost_of_early_withdrawal: float | None = None

    if early_withdrawal_month is not None:
        validate_withdrawal_month(early_withdrawal_month, term_months)
        if penalty_months is None:
            raise ValueError(
                "A penalty assumption (months of interest) is required "
                "to model an early withdrawal. Use 0 for a no-penalty CD."
            )
        validate_penalty_months(penalty_months, "Penalty")

        balance_at_withdrawal = schedule[early_withdrawal_month - 1].balance
        # k months of interest on the balance being withdrawn, capped so the
        # withdrawal can never go below zero.
        penalty_amount = min(
            balance_at_withdrawal * monthly_rate * penalty_months,
            balance_at_withdrawal,
        )
        early_balance = balance_at_withdrawal - penalty_amount
        accrued = balance_at_withdrawal - principal
        penalty_exceeds_interest = penalty_amount > accrued
        cost_of_early_withdrawal = maturity_balance - early_balance

    return CDProjection(
        principal=principal,
        term_months=term_months,
        apy=apy,
        maturity_balance=maturity_balance,
        interest_earned=interest_earned,
        early_withdrawal_month=early_withdrawal_month,
        penalty_months=penalty_months if early_withdrawal_month is not None else None,
        balance_at_withdrawal=balance_at_withdrawal,
        penalty_amount=penalty_amount,
        early_withdrawal_balance=early_balance,
        penalty_exceeds_interest=penalty_exceeds_interest,
        cost_of_early_withdrawal=cost_of_early_withdrawal,
        schedule=tuple(schedule),
    )
