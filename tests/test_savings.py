"""Savings projection tests: compounding, contributions, timing, inflation."""

import pytest

from customer_banking import (
    Compounding,
    ContributionTiming,
    RateBasis,
    project_savings,
)


def test_apy_basis_one_year_grows_by_exactly_apy():
    # APY is the effective annual yield by definition, so 12 months at 5% APY
    # must grow the balance by exactly 5% regardless of compounding frequency.
    result = project_savings(10000, 0.05, 12)
    assert result.ending_balance == pytest.approx(10500.0, abs=1e-9)
    assert result.interest_earned == pytest.approx(500.0, abs=1e-9)


def test_original_readme_example_now_correctly_labeled():
    # The legacy README example ($1,000 at "5%" for 12 months → $50 interest)
    # holds when the 5% is interpreted as APY.
    result = project_savings(1000, 0.05, 12)
    assert result.interest_earned == pytest.approx(50.0, abs=1e-9)


def test_apr_basis_earns_more_than_nominal_over_a_year():
    # 5% APR compounded monthly ≈ 5.116% APY.
    result = project_savings(
        10000, 0.05, 12, rate_basis=RateBasis.APR, compounding=Compounding.MONTHLY
    )
    assert result.apy == pytest.approx(0.051161897881733, rel=1e-9)
    assert result.ending_balance == pytest.approx(10511.61897881733, rel=1e-9)


def test_zero_rate_with_contributions_is_pure_saving():
    result = project_savings(1000, 0.0, 12, monthly_contribution=100)
    assert result.ending_balance == pytest.approx(2200.0)
    assert result.total_contributions == pytest.approx(1200.0)
    assert result.interest_earned == pytest.approx(0.0, abs=1e-9)


def test_end_of_month_contributions_match_ordinary_annuity_formula():
    # Closed-form ordinary annuity: FV = C·((1+i)^n − 1)/i, plus the compounded
    # principal. Simulation must agree with the closed form.
    apy, months, contribution, principal = 0.05, 60, 200.0, 5000.0
    i = (1 + apy) ** (1 / 12) - 1
    expected = principal * (1 + i) ** months + contribution * ((1 + i) ** months - 1) / i
    result = project_savings(principal, apy, months, monthly_contribution=contribution)
    assert result.ending_balance == pytest.approx(expected, rel=1e-12)


def test_beginning_of_month_contributions_match_annuity_due_formula():
    apy, months, contribution = 0.05, 60, 200.0
    i = (1 + apy) ** (1 / 12) - 1
    expected = contribution * ((1 + i) ** months - 1) / i * (1 + i)
    result = project_savings(
        0, apy, months, monthly_contribution=contribution, timing=ContributionTiming.BEGINNING
    )
    assert result.ending_balance == pytest.approx(expected, rel=1e-12)


def test_beginning_timing_beats_end_timing_at_positive_rates():
    end = project_savings(1000, 0.05, 24, monthly_contribution=100)
    begin = project_savings(
        1000, 0.05, 24, monthly_contribution=100, timing=ContributionTiming.BEGINNING
    )
    assert begin.ending_balance > end.ending_balance


def test_partial_year_term():
    # 7 months at 5% APY: growth factor (1.05)^(7/12).
    result = project_savings(10000, 0.05, 7)
    assert result.ending_balance == pytest.approx(10000 * 1.05 ** (7 / 12), rel=1e-12)


def test_schedule_is_consistent_with_summary():
    result = project_savings(2500, 0.04, 36, monthly_contribution=50)
    assert len(result.schedule) == 36
    last = result.schedule[-1]
    assert last.balance == pytest.approx(result.ending_balance)
    assert last.contributions_to_date == pytest.approx(result.total_contributions)
    assert last.interest_to_date == pytest.approx(result.interest_earned)
    # Balances must be strictly increasing with positive rate and deposits.
    balances = [point.balance for point in result.schedule]
    assert balances == sorted(balances)


def test_inflation_adjustment():
    result = project_savings(10000, 0.05, 12, inflation_rate=0.03)
    assert result.real_ending_balance == pytest.approx(10500 / 1.03, rel=1e-12)
    # Real value must be below nominal whenever inflation is positive.
    assert result.real_ending_balance < result.ending_balance


def test_no_inflation_rate_means_no_real_value():
    result = project_savings(10000, 0.05, 12)
    assert result.real_ending_balance is None


def test_effective_growth_pct():
    result = project_savings(10000, 0.05, 12)
    assert result.effective_growth_pct == pytest.approx(0.05, abs=1e-12)
