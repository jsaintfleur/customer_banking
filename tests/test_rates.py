"""Rate-conversion tests: APR↔APY, periodic rates, real returns."""

import math

import pytest

from customer_banking import (
    apr_to_apy,
    apy_to_apr,
    apy_to_periodic_rate,
    effective_annual_return,
    inflation_adjusted_value,
    periodic_rate_to_future_value,
    real_rate,
)


def test_apr_to_apy_monthly_compounding_textbook_value():
    # 5% APR compounded monthly is a standard textbook case: ≈ 5.1162% APY.
    assert apr_to_apy(0.05, 12) == pytest.approx(0.051161897881733, rel=1e-12)


def test_apr_to_apy_annual_compounding_is_identity():
    assert apr_to_apy(0.05, 1) == pytest.approx(0.05)


def test_apr_to_apy_daily_compounding():
    assert apr_to_apy(0.05, 365) == pytest.approx((1 + 0.05 / 365) ** 365 - 1)


def test_apy_to_apr_round_trips_with_apr_to_apy():
    for periods in (1, 2, 4, 12, 365):
        apy = apr_to_apy(0.0475, periods)
        assert apy_to_apr(apy, periods) == pytest.approx(0.0475, rel=1e-12)


def test_apy_to_periodic_rate_compounds_back_to_apy():
    monthly = apy_to_periodic_rate(0.05, 12)
    assert (1 + monthly) ** 12 - 1 == pytest.approx(0.05, rel=1e-12)


def test_periodic_rate_to_future_value():
    assert periodic_rate_to_future_value(1000, 0.01, 12) == pytest.approx(1000 * 1.01**12)


def test_periodic_rate_zero_periods_returns_principal():
    assert periodic_rate_to_future_value(1000, 0.01, 0) == 1000


def test_effective_annual_return():
    # Doubling over 10 years ≈ 7.177% annualized.
    assert effective_annual_return(1000, 2000, 10) == pytest.approx(2 ** (1 / 10) - 1)


def test_real_rate_fisher_relation():
    # 5% nominal with 3% inflation is ≈ 1.9417% real, not the naive 2%.
    assert real_rate(0.05, 0.03) == pytest.approx(1.05 / 1.03 - 1)


def test_inflation_adjusted_value():
    assert inflation_adjusted_value(10000, 0.03, 1) == pytest.approx(10000 / 1.03)
    assert inflation_adjusted_value(10000, 0.0, 5) == 10000


def test_invalid_rates_raise():
    with pytest.raises(ValueError):
        apr_to_apy(-0.01, 12)
    with pytest.raises(ValueError):
        apr_to_apy(1.5, 12)
    with pytest.raises(ValueError):
        apr_to_apy(0.05, 0)
    with pytest.raises(ValueError):
        apr_to_apy(math.nan, 12)
    with pytest.raises(ValueError):
        effective_annual_return(0, 100, 1)
    with pytest.raises(ValueError):
        effective_annual_return(100, 200, 0)
