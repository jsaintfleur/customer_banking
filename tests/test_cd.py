"""CD projection tests: maturity, APR/APY modes, early-withdrawal penalties."""

import pytest

from customer_banking import Compounding, RateBasis, project_cd


def test_maturity_at_apy_basis():
    # 24-month CD at 4% APY: FV = P·(1.04)^2.
    result = project_cd(10000, 0.04, 24)
    assert result.maturity_balance == pytest.approx(10000 * 1.04**2, rel=1e-12)
    assert result.interest_earned == pytest.approx(10000 * 1.04**2 - 10000, rel=1e-12)


def test_maturity_at_apr_basis_quarterly_compounding():
    result = project_cd(
        10000, 0.04, 12, rate_basis=RateBasis.APR, compounding=Compounding.QUARTERLY
    )
    expected_apy = (1 + 0.04 / 4) ** 4 - 1
    assert result.apy == pytest.approx(expected_apy, rel=1e-12)
    assert result.maturity_balance == pytest.approx(10000 * (1 + expected_apy), rel=1e-12)


def test_legacy_formula_no_longer_used_for_cds():
    # The legacy simple-interest formula gave $120 on $2,000 at 3% for 24
    # months. Compounding gives more; assert we do NOT reproduce the old value.
    result = project_cd(2000, 0.03, 24)
    assert result.interest_earned == pytest.approx(2000 * (1.03**2 - 1), rel=1e-12)
    assert result.interest_earned != pytest.approx(120.0, abs=0.005)


def test_early_withdrawal_penalty_basic():
    result = project_cd(10000, 0.04, 24, early_withdrawal_month=12, penalty_months=3)
    assert result.balance_at_withdrawal == pytest.approx(10400.0, rel=1e-12)
    monthly = 1.04 ** (1 / 12) - 1
    expected_penalty = 10400.0 * monthly * 3
    assert result.penalty_amount == pytest.approx(expected_penalty, rel=1e-9)
    assert result.early_withdrawal_balance == pytest.approx(10400.0 - expected_penalty, rel=1e-9)
    assert result.penalty_exceeds_interest is False
    assert result.cost_of_early_withdrawal == pytest.approx(
        result.maturity_balance - result.early_withdrawal_balance
    )


def test_penalty_larger_than_accrued_interest_is_flagged():
    # Withdrawing after 1 month with a 12-month penalty must eat principal.
    result = project_cd(10000, 0.04, 24, early_withdrawal_month=1, penalty_months=12)
    accrued = result.balance_at_withdrawal - 10000
    assert result.penalty_amount > accrued
    assert result.penalty_exceeds_interest is True
    assert result.early_withdrawal_balance < 10000


def test_zero_penalty_no_penalty_cd():
    result = project_cd(10000, 0.04, 24, early_withdrawal_month=12, penalty_months=0)
    assert result.penalty_amount == 0.0
    assert result.early_withdrawal_balance == pytest.approx(result.balance_at_withdrawal)


def test_withdrawal_at_or_after_maturity_rejected():
    with pytest.raises(ValueError, match="before maturity"):
        project_cd(10000, 0.04, 24, early_withdrawal_month=24, penalty_months=3)
    with pytest.raises(ValueError, match="before maturity"):
        project_cd(10000, 0.04, 24, early_withdrawal_month=36, penalty_months=3)


def test_withdrawal_requires_penalty_assumption():
    with pytest.raises(ValueError, match="penalty assumption"):
        project_cd(10000, 0.04, 24, early_withdrawal_month=12)


def test_zero_principal_rejected():
    with pytest.raises(ValueError):
        project_cd(0, 0.04, 24)


def test_schedule_length_and_monotonicity():
    result = project_cd(5000, 0.05, 36)
    assert len(result.schedule) == 36
    balances = [point.balance for point in result.schedule]
    assert balances == sorted(balances)
    assert result.schedule[-1].balance == pytest.approx(result.maturity_balance)
