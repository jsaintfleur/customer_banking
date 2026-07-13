"""Validation tests: bounds, types, and error messages."""

import math

import pytest

from customer_banking.validation import (
    validate_amount,
    validate_months,
    validate_penalty_months,
    validate_rate,
    validate_withdrawal_month,
)


def test_amount_bounds():
    assert validate_amount(0) == 0
    assert validate_amount(1e12) == 1e12
    with pytest.raises(ValueError, match="negative"):
        validate_amount(-1)
    with pytest.raises(ValueError, match="exceed"):
        validate_amount(1e12 + 1)
    with pytest.raises(ValueError, match="greater than zero"):
        validate_amount(0, allow_zero=False)


def test_amount_rejects_nan_and_infinity():
    with pytest.raises(ValueError, match="finite"):
        validate_amount(math.nan)
    with pytest.raises(ValueError, match="finite"):
        validate_amount(math.inf)


def test_rate_bounds():
    assert validate_rate(0.0) == 0.0
    assert validate_rate(1.0) == 1.0
    with pytest.raises(ValueError, match="negative"):
        validate_rate(-0.01)
    with pytest.raises(ValueError, match="100%"):
        validate_rate(1.01)


def test_months_bounds_and_type():
    assert validate_months(1) == 1
    assert validate_months(1200) == 1200
    with pytest.raises(ValueError, match="at least 1"):
        validate_months(0)
    with pytest.raises(ValueError, match="exceed"):
        validate_months(1201)
    with pytest.raises(ValueError, match="whole number"):
        validate_months(6.5)  # type: ignore[arg-type]


def test_penalty_months_bounds():
    assert validate_penalty_months(0) == 0
    assert validate_penalty_months(60) == 60
    with pytest.raises(ValueError):
        validate_penalty_months(-1)
    with pytest.raises(ValueError):
        validate_penalty_months(61)


def test_withdrawal_month_must_precede_maturity():
    assert validate_withdrawal_month(11, 12) == 11
    with pytest.raises(ValueError):
        validate_withdrawal_month(12, 12)
    with pytest.raises(ValueError):
        validate_withdrawal_month(0, 12)
