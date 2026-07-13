"""Savings Growth Planner — interactive CLI.

A menu-driven planner for savings and CD projections. All arithmetic lives in
the tested `customer_banking` engine; this module only prompts, validates
retry-ably, and formats output. Educational projections only — not financial
advice, and never a guarantee of future returns.
"""

from __future__ import annotations

import sys
from collections.abc import Callable
from typing import TypeVar

from customer_banking import (
    Compounding,
    ContributionTiming,
    RateBasis,
    build_ladder,
    format_currency,
    format_percent,
    project_cd,
    project_savings,
)

T = TypeVar("T")

DISCLAIMER = (
    "Educational projections based on the assumptions you enter. Not banking,\n"
    "investment, or tax advice; actual bank terms and future rates vary."
)


def prompt(message: str, parse: Callable[[str], T]) -> T:
    """Prompt until the input parses and validates; Ctrl+C/Ctrl+D exit cleanly."""
    while True:
        try:
            raw = input(message).strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            sys.exit(0)
        try:
            return parse(raw)
        except ValueError as exc:
            print(f"  ✗ {exc} Please try again.")


def parse_money(raw: str) -> float:
    value = float(raw.replace("$", "").replace(",", ""))
    if value < 0:
        raise ValueError("Amount cannot be negative.")
    return value


def parse_percent(raw: str) -> float:
    """Accept a percentage like '4.5' or '4.5%' and return the fraction 0.045."""
    value = float(raw.replace("%", "")) / 100
    if value < 0:
        raise ValueError("Rate cannot be negative.")
    if value > 1:
        raise ValueError("Rates above 100% per year are not supported.")
    return value


def parse_months(raw: str) -> int:
    value = int(raw)
    if not 1 <= value <= 1200:
        raise ValueError("Enter a term between 1 and 1200 months.")
    return value


def parse_yes_no(raw: str) -> bool:
    lowered = raw.lower()
    if lowered in ("y", "yes"):
        return True
    if lowered in ("n", "no", ""):
        return False
    raise ValueError("Enter y or n.")


def prompt_rate_basis() -> RateBasis:
    def parse(raw: str) -> RateBasis:
        lowered = raw.lower()
        if lowered in ("apy", "y", ""):
            return RateBasis.APY
        if lowered in ("apr", "r"):
            return RateBasis.APR
        raise ValueError("Enter APY or APR.")

    return prompt("Is that rate an APY (what banks advertise) or an APR? [APY] ", parse)


def prompt_compounding() -> Compounding:
    options = {
        "1": Compounding.ANNUALLY,
        "2": Compounding.SEMIANNUALLY,
        "4": Compounding.QUARTERLY,
        "12": Compounding.MONTHLY,
        "365": Compounding.DAILY,
    }

    def parse(raw: str) -> Compounding:
        if raw == "":
            return Compounding.MONTHLY
        if raw in options:
            return options[raw]
        raise ValueError("Enter 1, 2, 4, 12, or 365.")

    return prompt("Compounding periods per year (1/2/4/12/365) [12]: ", parse)


def run_savings_calculator() -> None:
    print("\n─── Savings Calculator ───")
    balance = prompt("Starting balance: $", parse_money)
    rate = prompt("Annual rate (e.g. 4.5 for 4.5%): ", parse_percent)
    basis = prompt_rate_basis()
    compounding = prompt_compounding() if basis is RateBasis.APR else Compounding.MONTHLY
    months = prompt("Time horizon in months: ", parse_months)
    contribution = prompt("Monthly contribution (0 for none): $", parse_money)
    timing = ContributionTiming.END
    if contribution > 0:
        at_start = prompt("Deposit at the beginning of each month? (y/N) ", parse_yes_no)
        timing = ContributionTiming.BEGINNING if at_start else ContributionTiming.END
    use_inflation = prompt("Show inflation-adjusted value? (y/N) ", parse_yes_no)
    inflation = (
        prompt("Assumed annual inflation (e.g. 3): ", parse_percent) if use_inflation else None
    )

    result = project_savings(
        balance,
        rate,
        months,
        rate_basis=basis,
        compounding=compounding,
        monthly_contribution=contribution,
        timing=timing,
        inflation_rate=inflation,
    )

    print(f"\n  Effective APY applied:  {format_percent(result.apy)}")
    print(f"  Total contributions:    {format_currency(result.total_contributions)}")
    print(f"  Interest earned:        {format_currency(result.interest_earned)}")
    print(f"  Projected balance:      {format_currency(result.ending_balance)}")
    print(f"  Effective growth:       {format_percent(result.effective_growth_pct)}")
    if result.real_ending_balance is not None:
        print(f"  In today's dollars:     {format_currency(result.real_ending_balance)}")
    years = months / 12
    print(
        f"\n  Over {years:.1f} year(s), you would put in "
        f"{format_currency(balance + result.total_contributions)} and earn an estimated "
        f"{format_currency(result.interest_earned)} in interest."
    )


def run_cd_calculator() -> None:
    print("\n─── CD Calculator ───")
    deposit = prompt("Initial deposit: $", parse_money)
    rate = prompt("Annual rate (e.g. 4.5 for 4.5%): ", parse_percent)
    basis = prompt_rate_basis()
    compounding = prompt_compounding() if basis is RateBasis.APR else Compounding.MONTHLY
    term = prompt("CD term in months: ", parse_months)

    early_month: int | None = None
    penalty: float | None = None
    if prompt("Model an early withdrawal? (y/N) ", parse_yes_no):
        def parse_early(raw: str) -> int:
            value = int(raw)
            if not 1 <= value < term:
                raise ValueError(f"Enter a month between 1 and {term - 1}.")
            return value

        early_month = prompt("Withdrawal month: ", parse_early)
        penalty = prompt(
            "Penalty in months of interest (bank terms vary; 3–12 is common): ",
            lambda raw: float(raw),
        )

    result = project_cd(
        deposit,
        rate,
        term,
        rate_basis=basis,
        compounding=compounding,
        early_withdrawal_month=early_month,
        penalty_months=penalty,
    )

    print(f"\n  Effective APY applied:  {format_percent(result.apy)}")
    print(f"  Balance at maturity:    {format_currency(result.maturity_balance)}")
    print(f"  Interest earned:        {format_currency(result.interest_earned)}")
    if result.early_withdrawal_balance is not None:
        assert result.penalty_amount is not None
        assert result.cost_of_early_withdrawal is not None
        print(f"\n  If withdrawn at month {result.early_withdrawal_month}:")
        print(f"    Balance before penalty: {format_currency(result.balance_at_withdrawal or 0)}")
        print(f"    Estimated penalty:      {format_currency(result.penalty_amount)}")
        print(f"    You would receive:      {format_currency(result.early_withdrawal_balance)}")
        print(f"    Cost vs. maturity:      {format_currency(result.cost_of_early_withdrawal)}")
        if result.penalty_exceeds_interest:
            print("    ⚠ The penalty exceeds interest earned — it would eat into principal.")
    print(
        "\n  Note: actual CD compounding and early-withdrawal terms vary by institution.\n"
        "  Review the bank's disclosure before opening or closing a CD."
    )


def run_comparison() -> None:
    print("\n─── Savings vs. CD Comparison ───")
    amount = prompt("Amount to compare: $", parse_money)
    months = prompt("Time horizon in months: ", parse_months)
    savings_rate = prompt("Savings APY (e.g. 4.0): ", parse_percent)
    cd_rate = prompt("CD APY (e.g. 4.5): ", parse_percent)

    savings = project_savings(amount, savings_rate, months)
    cd = project_cd(amount, cd_rate, months)

    print(f"\n  {'':24}{'Savings':>14}{'CD':>14}")
    print(f"  {'APY':24}{format_percent(savings.apy):>14}{format_percent(cd.apy):>14}")
    print(
        f"  {'Projected balance':24}"
        f"{format_currency(savings.ending_balance):>14}"
        f"{format_currency(cd.maturity_balance):>14}"
    )
    print(
        f"  {'Interest earned':24}"
        f"{format_currency(savings.interest_earned):>14}"
        f"{format_currency(cd.interest_earned):>14}"
    )
    print(f"  {'Liquidity':24}{'anytime':>14}{'at maturity':>14}")
    diff = cd.maturity_balance - savings.ending_balance
    leader = "CD" if diff > 0 else "savings account"
    print(
        f"\n  With these assumptions the {leader} projects "
        f"{format_currency(abs(diff))} higher — but the savings account stays\n"
        "  liquid the whole time, while the CD locks the money until maturity."
    )


def run_ladder_planner() -> None:
    print("\n─── CD Ladder Planner ───")
    total = prompt("Total amount to allocate: $", parse_money)

    def parse_rungs(raw: str) -> int:
        value = int(raw)
        if not 1 <= value <= 12:
            raise ValueError("Enter between 1 and 12 rungs.")
        return value

    count = prompt("Number of rungs (e.g. 3): ", parse_rungs)
    rungs: list[tuple[int, float]] = []
    for index in range(1, count + 1):
        print(f"  Rung {index}:")
        term = prompt("    Term in months: ", parse_months)
        rate = prompt("    APY (e.g. 4.5): ", parse_percent)
        rungs.append((term, rate))

    plan = build_ladder(total, rungs)

    print(f"\n  {'Rung':6}{'Amount':>14}{'Term':>10}{'APY':>9}{'At maturity':>16}")
    for index, rung in enumerate(plan.rungs, start=1):
        print(
            f"  {index:<6}{format_currency(rung.allocation):>14}"
            f"{f'{rung.term_months} mo':>10}{format_percent(rung.apy):>9}"
            f"{format_currency(rung.maturity_balance):>16}"
        )
    print(f"\n  Total at maturity: {format_currency(plan.total_maturity_value)}")
    print(f"  Total interest:    {format_currency(plan.total_interest)}")
    print("  Rates are your scenario assumptions, not live offers.")


def main() -> None:
    print("\n╭──────────────────────────────────────╮")
    print("│        Savings Growth Planner        │")
    print("╰──────────────────────────────────────╯")
    print(DISCLAIMER)

    actions = {
        "1": ("Savings calculator", run_savings_calculator),
        "2": ("CD calculator", run_cd_calculator),
        "3": ("Savings vs. CD comparison", run_comparison),
        "4": ("CD ladder planner", run_ladder_planner),
        "5": ("Quit", None),
    }

    while True:
        print("\nWhat would you like to do?")
        for key, (label, _) in actions.items():
            print(f"  {key}. {label}")

        def parse_choice(raw: str) -> str:
            if raw in actions:
                return raw
            raise ValueError("Enter a number from the menu.")

        choice = prompt("> ", parse_choice)
        if choice == "5":
            print("Goodbye!")
            return
        action = actions[choice][1]
        assert action is not None
        action()


if __name__ == "__main__":
    main()
