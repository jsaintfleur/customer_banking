"""CD ladder planning: several CDs opened together with staggered maturities.

A ladder trades some yield for liquidity — one rung matures at a time. The
planner splits a total amount across user-defined rungs (equal split by
default), projects each rung independently with the CD engine, and reports the
combined maturity schedule. Rates are user-supplied scenario assumptions, not
live offers.
"""

from __future__ import annotations

from .cd import project_cd
from .models import Compounding, LadderPlan, LadderRung, RateBasis
from .validation import validate_amount, validate_months, validate_rate


def build_ladder(
    total_amount: float,
    rungs: list[tuple[int, float]],
    *,
    rate_basis: RateBasis = RateBasis.APY,
    compounding: Compounding = Compounding.MONTHLY,
    allocations: list[float] | None = None,
) -> LadderPlan:
    """Build a CD ladder plan.

    Args:
        total_amount: Total to allocate across all rungs.
        rungs: List of (term_months, annual_rate) per rung.
        rate_basis: Whether the rates are APR or APY.
        compounding: Compounding frequency for APR conversion.
        allocations: Optional explicit dollar allocation per rung; must sum to
            total_amount. Defaults to an equal split.
    """
    validate_amount(total_amount, "Total amount", allow_zero=False)
    if not rungs:
        raise ValueError("A ladder needs at least one rung.")
    if len(rungs) > 12:
        raise ValueError("A ladder cannot have more than 12 rungs.")

    for term, rate in rungs:
        validate_months(term, "Rung term")
        validate_rate(rate, "Rung rate")

    if allocations is None:
        allocations = [total_amount / len(rungs)] * len(rungs)
    else:
        if len(allocations) != len(rungs):
            raise ValueError("Provide one allocation per rung.")
        for amount in allocations:
            validate_amount(amount, "Rung allocation", allow_zero=False)
        # Tolerate sub-cent float drift in a user-entered split.
        if abs(sum(allocations) - total_amount) > 0.01:
            raise ValueError("Rung allocations must add up to the total amount.")

    built: list[LadderRung] = []
    for (term, rate), amount in zip(rungs, allocations, strict=True):
        projection = project_cd(
            amount, rate, term, rate_basis=rate_basis, compounding=compounding
        )
        built.append(
            LadderRung(
                allocation=amount,
                term_months=term,
                apy=projection.apy,
                maturity_balance=projection.maturity_balance,
                interest_earned=projection.interest_earned,
            )
        )

    total_maturity = sum(r.maturity_balance for r in built)
    return LadderPlan(
        total_allocated=total_amount,
        rungs=tuple(built),
        total_maturity_value=total_maturity,
        total_interest=total_maturity - total_amount,
    )
