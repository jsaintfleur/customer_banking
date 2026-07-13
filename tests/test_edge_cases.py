"""Edge cases: rounding policy, extreme values, long terms, zero inputs."""

from decimal import Decimal

import pytest

from customer_banking import (
    format_currency,
    format_percent,
    project_cd,
    project_savings,
    round_currency,
)


def test_bankers_rounding_at_the_display_boundary():
    # ROUND_HALF_EVEN: exact halves round to the even cent.
    assert round_currency(2.675) == Decimal("2.68")  # 2.675 float is actually 2.67499…
    assert round_currency(0.125) == Decimal("0.12")
    assert round_currency(0.135) == Decimal("0.14")


def test_format_currency():
    assert format_currency(1234.5) == "$1,234.50"
    assert format_currency(0) == "$0.00"
    assert format_currency(-42.005) == "-$42.00"
    assert format_currency(1234.5, "EUR") == "€1,234.50"
    with pytest.raises(ValueError, match="Unsupported currency"):
        format_currency(1, "XYZ")


def test_format_percent():
    assert format_percent(0.051161897, 2) == "5.12%"
    assert format_percent(0.05, 1) == "5.0%"


def test_very_small_amounts():
    result = project_savings(0.01, 0.05, 12)
    assert result.ending_balance == pytest.approx(0.01 * 1.05, rel=1e-12)


def test_very_large_amounts_no_precision_blowup():
    result = project_savings(1e12, 0.05, 12)
    # At $1T the float has ~1e-4 dollars of representable precision; the
    # result must still be within a cent of the closed form.
    assert result.ending_balance == pytest.approx(1e12 * 1.05, abs=0.01)


def test_century_long_term():
    result = project_savings(1000, 0.05, 1200)  # 100 years
    assert result.ending_balance == pytest.approx(1000 * 1.05**100, rel=1e-9)
    assert len(result.schedule) == 1200


def test_zero_principal_zero_contribution_savings():
    result = project_savings(0, 0.05, 12)
    assert result.ending_balance == 0
    assert result.effective_growth_pct == 0


def test_one_month_terms():
    savings = project_savings(1000, 0.05, 1)
    assert savings.ending_balance == pytest.approx(1000 * 1.05 ** (1 / 12), rel=1e-12)
    cd = project_cd(1000, 0.05, 1)
    assert cd.maturity_balance == pytest.approx(1000 * 1.05 ** (1 / 12), rel=1e-12)


def test_simulation_matches_closed_form_to_sub_cent_precision():
    # Float drift over 600 sequential multiplications must stay far below the
    # cent-level rounding applied at display time.
    result = project_savings(100000, 0.06, 600)
    closed_form = 100000 * 1.06**50
    assert abs(result.ending_balance - closed_form) < 0.005
