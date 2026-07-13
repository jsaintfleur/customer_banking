"""Rate conversions: APR ↔ APY, periodic rates, real (inflation-adjusted) returns.

Conventions used throughout the engine:

- Rates are fractions, not percents: 0.05 means 5%.
- APR is the *nominal* annual rate. With m compounding periods per year the
  periodic rate is simply APR / m.
- APY is the *effective* annual yield: the actual one-year growth including
  compounding. APY = (1 + APR/m)^m − 1.
- Because APY already encodes compounding, a periodic rate derived from APY,
  (1 + APY)^(1/m) − 1, reproduces the same annual growth for any m. This is
  why the projection engines can simulate month-by-month using the monthly
  rate derived from APY regardless of the bank's internal compounding
  frequency.
"""

from __future__ import annotations

from .validation import validate_rate


def apr_to_apy(apr: float, periods_per_year: int) -> float:
    """Effective annual yield for a nominal rate compounded m times per year."""
    validate_rate(apr, "APR")
    if periods_per_year < 1:
        raise ValueError("Compounding periods per year must be at least 1.")
    return float((1 + apr / periods_per_year) ** periods_per_year - 1)


def apy_to_apr(apy: float, periods_per_year: int) -> float:
    """Nominal annual rate that yields the given APY when compounded m times per year."""
    validate_rate(apy, "APY")
    if periods_per_year < 1:
        raise ValueError("Compounding periods per year must be at least 1.")
    return float(periods_per_year * ((1 + apy) ** (1 / periods_per_year) - 1))


def apy_to_periodic_rate(apy: float, periods_per_year: int) -> float:
    """Effective per-period rate that compounds to the given APY."""
    validate_rate(apy, "APY")
    if periods_per_year < 1:
        raise ValueError("Compounding periods per year must be at least 1.")
    return float((1 + apy) ** (1 / periods_per_year) - 1)


def periodic_rate_to_future_value(principal: float, periodic_rate: float, periods: int) -> float:
    """Future value of a lump sum after n periods at a per-period rate."""
    if periods < 0:
        raise ValueError("Number of periods cannot be negative.")
    return float(principal * (1 + periodic_rate) ** periods)


def effective_annual_return(start_value: float, end_value: float, years: float) -> float:
    """Annualized growth rate between two values over a number of years."""
    if start_value <= 0:
        raise ValueError("Starting value must be greater than zero.")
    if end_value < 0:
        raise ValueError("Ending value cannot be negative.")
    if years <= 0:
        raise ValueError("Years must be greater than zero.")
    return float((end_value / start_value) ** (1 / years) - 1)


def real_rate(nominal_rate: float, inflation_rate: float) -> float:
    """Inflation-adjusted (real) rate via the Fisher relation.

    (1 + real) = (1 + nominal) / (1 + inflation). This is the exact form; the
    common approximation real ≈ nominal − inflation overstates real returns.
    """
    validate_rate(inflation_rate, "Inflation rate")
    return (1 + nominal_rate) / (1 + inflation_rate) - 1


def inflation_adjusted_value(nominal_value: float, inflation_rate: float, years: float) -> float:
    """Deflate a future nominal value into today's purchasing power."""
    validate_rate(inflation_rate, "Inflation rate")
    if years < 0:
        raise ValueError("Years cannot be negative.")
    return float(nominal_value / (1 + inflation_rate) ** years)
