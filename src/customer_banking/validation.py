"""Input validation shared by every calculator.

Bounds are deliberately generous — this is a planning tool, and the user may
model unusual scenarios — but they exclude values that would produce
meaningless output (negative balances, 10,000% rates, million-month terms).
Validation never silently corrects a value: out-of-range input raises
ValueError with a message suitable for showing to the user.
"""

from __future__ import annotations

import math

# Upper bounds chosen to keep float arithmetic well inside its exact range
# while allowing any realistic planning scenario.
MAX_AMOUNT = 1e12  # $1 trillion
MAX_RATE = 1.0  # 100% annual rate
MAX_MONTHS = 1200  # 100 years
MAX_PENALTY_MONTHS = 60


def _require_finite(value: float, name: str) -> None:
    if not math.isfinite(value):
        raise ValueError(f"{name} must be a finite number.")


def validate_amount(value: float, name: str = "Amount", *, allow_zero: bool = True) -> float:
    """Validate a monetary amount (balance, deposit, contribution)."""
    _require_finite(value, name)
    if value < 0:
        raise ValueError(f"{name} cannot be negative.")
    if not allow_zero and value == 0:
        raise ValueError(f"{name} must be greater than zero.")
    if value > MAX_AMOUNT:
        raise ValueError(f"{name} cannot exceed ${MAX_AMOUNT:,.0f}.")
    return value


def validate_rate(value: float, name: str = "Rate") -> float:
    """Validate an annual rate given as a fraction (0.05 == 5%)."""
    _require_finite(value, name)
    if value < 0:
        raise ValueError(f"{name} cannot be negative.")
    if value > MAX_RATE:
        raise ValueError(f"{name} above 100% per year is not supported.")
    return value


def validate_months(value: int, name: str = "Term") -> int:
    """Validate a term length in whole months."""
    if not isinstance(value, int):
        raise ValueError(f"{name} must be a whole number of months.")
    if value < 1:
        raise ValueError(f"{name} must be at least 1 month.")
    if value > MAX_MONTHS:
        raise ValueError(f"{name} cannot exceed {MAX_MONTHS} months (100 years).")
    return value


def validate_penalty_months(value: float, name: str = "Penalty") -> float:
    """Validate an early-withdrawal penalty expressed in months of interest."""
    _require_finite(value, name)
    if value < 0:
        raise ValueError(f"{name} cannot be negative.")
    if value > MAX_PENALTY_MONTHS:
        raise ValueError(f"{name} cannot exceed {MAX_PENALTY_MONTHS} months of interest.")
    return value


def validate_withdrawal_month(month: int, term_months: int) -> int:
    """Validate that an early-withdrawal month falls inside the CD term."""
    if not isinstance(month, int):
        raise ValueError("Withdrawal month must be a whole number of months.")
    if month < 1:
        raise ValueError("Withdrawal month must be at least 1.")
    if month >= term_months:
        raise ValueError(
            "Withdrawal month must be before maturity — "
            "at maturity there is no early-withdrawal penalty."
        )
    return month
