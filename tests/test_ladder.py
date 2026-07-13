"""CD ladder planner tests."""

import pytest

from customer_banking import build_ladder, project_cd


def test_equal_split_three_rung_ladder():
    plan = build_ladder(30000, [(12, 0.045), (24, 0.047), (36, 0.05)])
    assert len(plan.rungs) == 3
    for rung in plan.rungs:
        assert rung.allocation == pytest.approx(10000.0)
    # Each rung must match a standalone CD projection of the same terms.
    standalone = project_cd(10000, 0.05, 36)
    assert plan.rungs[2].maturity_balance == pytest.approx(standalone.maturity_balance)
    assert plan.total_maturity_value == pytest.approx(
        sum(r.maturity_balance for r in plan.rungs)
    )
    assert plan.total_interest == pytest.approx(plan.total_maturity_value - 30000)


def test_custom_allocations():
    plan = build_ladder(10000, [(12, 0.04), (24, 0.045)], allocations=[4000, 6000])
    assert plan.rungs[0].allocation == 4000
    assert plan.rungs[1].allocation == 6000


def test_allocations_must_sum_to_total():
    with pytest.raises(ValueError, match="add up"):
        build_ladder(10000, [(12, 0.04), (24, 0.045)], allocations=[4000, 5000])


def test_allocation_count_must_match_rungs():
    with pytest.raises(ValueError, match="one allocation per rung"):
        build_ladder(10000, [(12, 0.04), (24, 0.045)], allocations=[10000])


def test_empty_ladder_rejected():
    with pytest.raises(ValueError, match="at least one rung"):
        build_ladder(10000, [])


def test_too_many_rungs_rejected():
    with pytest.raises(ValueError, match="more than 12"):
        build_ladder(13000, [(12 * (i + 1), 0.04) for i in range(13)])
