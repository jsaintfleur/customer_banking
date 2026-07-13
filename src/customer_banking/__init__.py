"""Savings Growth Planner — educational savings and CD projection engine.

This package computes projections from user-entered assumptions. It does not
provide banking, investment, tax, or financial advice, and it does not
guarantee future returns.
"""

from .cd import project_cd
from .formatting import format_currency, format_percent, round_currency
from .ladder import build_ladder
from .models import (
    CDProjection,
    Compounding,
    ContributionTiming,
    LadderPlan,
    LadderRung,
    MonthPoint,
    RateBasis,
    SavingsProjection,
)
from .rates import (
    apr_to_apy,
    apy_to_apr,
    apy_to_periodic_rate,
    effective_annual_return,
    inflation_adjusted_value,
    periodic_rate_to_future_value,
    real_rate,
)
from .savings import project_savings, resolve_apy

__version__ = "2.0.0"

__all__ = [
    "CDProjection",
    "Compounding",
    "ContributionTiming",
    "LadderPlan",
    "LadderRung",
    "MonthPoint",
    "RateBasis",
    "SavingsProjection",
    "__version__",
    "apr_to_apy",
    "apy_to_apr",
    "apy_to_periodic_rate",
    "build_ladder",
    "effective_annual_return",
    "format_currency",
    "format_percent",
    "inflation_adjusted_value",
    "periodic_rate_to_future_value",
    "project_cd",
    "project_savings",
    "real_rate",
    "resolve_apy",
    "round_currency",
]
