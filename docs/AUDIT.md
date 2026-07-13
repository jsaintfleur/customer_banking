# Repository Audit — Customer Banking → Savings Growth Planner

Date: 2026-07-13
Scope: full audit of the original `M3_Starter_Code` project (now preserved under
`legacy/M3_Starter_Code/`) covering code architecture, financial correctness,
testing, documentation, and product positioning.

---

## Executive summary

The original project is a four-file Python CLI that models a savings account and
a certificate of deposit (CD) with the **same simple-interest formula**, labels
that formula's input "APR", and describes itself in the README as a system that
helps users "manage" their savings and investments. The code is readable and
consistently commented, but it has no tests, no packaging, a cross-platform
import hazard (`Account.py`), and financial modeling that is misleading for
both products it claims to represent.

This audit groups findings into Critical / High / Medium / Optional. All
Critical and High items are implemented in this change set; Medium items are
implemented where they fell out naturally from the restructure; Optional items
are listed in the README roadmap.

---

## Critical issues (fixed)

### C1. Savings and CDs use the identical simple-interest formula
`savings_account.py` and `cd_account.py` are byte-for-byte identical except for
variable names. Both compute:

```python
interest = balance * (rate / 100) * (months / 12)
```

Real savings accounts and CDs **compound**. For a 5% rate over 24 months on
$10,000, simple interest gives $1,000.00 while annual compounding gives
$1,025.00 — the error grows with term length and rate. More importantly,
modeling two different financial products identically teaches users the wrong
mental model.

**Fix:** a shared, tested calculation engine (`src/customer_banking/`) with
product-specific projections: savings supports recurring contributions and
month-by-month compounding; CDs support maturity, APR/APY input modes, and
early-withdrawal penalty scenarios.

### C2. APR/APY confusion
The code prompts for "annual interest rate (APR)" and then applies it as if it
were a simple annual yield. APR (nominal rate) and APY (effective annual yield)
differ whenever compounding is more frequent than annual: 5% APR compounded
monthly is ≈ 5.116% APY. Banks advertise savings and CD rates as **APY**, so a
user typing their bank's advertised rate into this tool got a subtly wrong
number labeled with the wrong acronym.

**Fix:** explicit `APR` / `APY` rate-basis handling with tested conversion
functions (`rates.py`), and UI/CLI copy that explains the difference.

### C3. Product positioning overstates what the software does
The README describes "managing" accounts and "accurate interest calculation"
for a tool that stores nothing and models neither product correctly. Nothing in
the code touches a real account, but the language invites that reading.

**Fix:** repositioned as an educational planning tool ("Savings Growth
Planner") with a prominent disclaimer; no account data, credentials, or PII are
collected anywhere in the new code.

### C4. No tests
Zero automated tests existed for code whose entire purpose is numeric
correctness.

**Fix:** pytest suite covering rate conversions, compounding, contributions
(both timings), CD maturity, early-withdrawal penalties, inflation adjustment,
rounding, validation, and extreme values; frontend unit tests (Vitest) for the
mirrored TypeScript engine, schemas, and formatting; CI runs all of it.

---

## High-priority issues (fixed)

### H1. `Account.py` capitalized filename
`from Account import Account` works on case-insensitive filesystems (macOS
default, Windows) but is fragile on case-sensitive Linux filesystems and
violates PEP 8 module naming. All new modules use lowercase snake_case; the
legacy file is preserved unmodified under `legacy/` for history.

### H2. Calculation logic coupled to I/O
`create_savings_account()` both computes and mutates an `Account` instance;
`customer_banking.py` mixes `input()` calls directly with computation, making
the logic untestable. **Fix:** pure functions in the engine; the CLI and web
UI are thin presentation layers over the same formulas.

### H3. The `Account` class adds Java-style getters/setters with no behavior
`set_balance`/`get_balance` wrap plain attributes and the "validation" they
provide (non-negative) is duplicated in the account-creation functions anyway.
**Fix:** frozen dataclasses as result models; validation centralized in
`validation.py` with meaningful bounds and error messages.

### H4. Duplicate code between the two account modules
100% duplication. **Fix:** shared engine; savings- and CD-specific behavior
lives in `savings.py` and `cd.py` respectively.

### H5. No recurring contributions, no maturity concept, no penalties
The original tool cannot answer the questions savers actually have. **Fix:**
monthly contributions (beginning- or end-of-month), CD maturity dates,
user-supplied early-withdrawal penalty assumptions, inflation adjustment, and
CD ladders.

### H6. Input handling loses the user's session on the first bad keystroke
A single non-numeric input aborts the whole program. **Fix:** the CLI
re-prompts with a clear message; the web forms validate per-field with Zod and
never silently correct input.

---

## Medium-priority improvements (implemented)

- **M1. Packaging:** `pyproject.toml` with a `src/` layout; installable and
  importable (`pip install -e .`), console entry point `savings-planner`.
- **M2. Rounding policy:** all engine math runs in full-precision floats;
  monetary values are rounded **only at the display boundary** to cents using
  banker's rounding (`ROUND_HALF_EVEN` via `Decimal`). Intermediate values are
  never rounded. The TypeScript web engine uses the same policy, so CLI and
  web results agree to the cent.
- **M3. Type hints** throughout the engine; `mypy`-clean; `ruff` for lint.
- **M4. Currency formatting** centralized (`formatting.py` / `format.ts`).
- **M5. CI:** GitHub Actions running Python lint + type-check + tests and
  frontend lint + type-check + unit tests + production build.

## Optional enhancements (roadmap, not implemented)

- Live rate feeds (deliberately excluded — the tool must not fabricate or
  imply current bank rates).
- Tax-estimate mode (excluded per scope; taxes vary too much to model
  responsibly without clear labeling).
- Scenario save/share via URL state.
- Additional currencies beyond the supported formatting set.
- i18n.

---

## Financial model decisions (methodology summary)

Full user-facing write-up lives at `/methodology` in the web app and in the
README. Key decisions:

1. **Rates are fractions internally** (5% = 0.05); UI accepts percent.
2. **APR → APY:** `APY = (1 + APR/m)^m − 1` for `m` compounding periods/year.
3. **APY → periodic rate:** `i = (1 + APY)^(1/m) − 1`. Because APY already
   encodes compounding, the monthly effective rate derived from APY is exact
   regardless of the bank's internal compounding frequency.
4. **Savings projection:** month-by-month simulation. Contributions are added
   at the beginning (annuity-due) or end (ordinary annuity) of each month —
   user-selectable and clearly labeled; default is end-of-month.
5. **CD maturity:** `FV = P·(1 + i)^n` with the periodic rate from the chosen
   rate basis and compounding frequency.
6. **Early withdrawal:** penalty = *k* months of interest on the balance at
   withdrawal, where *k* is user-supplied. Penalties may exceed accrued
   interest (they can consume principal, as real bank penalties sometimes do);
   the UI flags this case. Actual bank terms vary and the UI says so.
7. **Inflation adjustment:** real value = nominal / (1 + π)^years; real rate
   uses the Fisher relation `(1 + r)/(1 + π) − 1`.
8. **No projection is presented as guaranteed**; every calculator carries an
   assumptions notice.
