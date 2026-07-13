import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "Every formula and assumption behind the projections, stated plainly.",
};

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="overflow-x-auto rounded-md bg-surface-raised px-3 py-2 font-[family-name:var(--font-geist-mono)] text-sm">
      {children}
    </p>
  );
}

export default function MethodologyPage() {
  return (
    <div className="prose-sm max-w-3xl space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-bold">Methodology</h1>
        <p className="mt-1 text-muted">
          Every number this tool produces comes from the formulas below,
          applied to assumptions you enter. The same engine is implemented and
          tested twice — in Python (CLI) and TypeScript (this site) — and both
          are open source.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Conventions</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Rates are handled as fractions internally (5% = 0.05).</li>
          <li>
            All arithmetic runs at full floating-point precision; values are
            rounded to cents only when displayed, using banker&apos;s rounding.
          </li>
          <li>No taxes or fees are modeled.</li>
          <li>Rates are assumed constant for the whole projection horizon.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">APR and APY</h2>
        <p className="text-sm text-muted">
          APR is the nominal annual rate; APY is the effective annual yield
          including compounding. With m compounding periods per year:
        </p>
        <Formula>APY = (1 + APR / m)^m − 1</Formula>
        <Formula>APR = m · ((1 + APY)^(1/m) − 1)</Formula>
        <p className="text-sm text-muted">
          Because APY already encodes compounding, the effective monthly rate
          derived from it reproduces the same annual growth no matter how often
          the bank compounds internally:
        </p>
        <Formula>i = (1 + APY)^(1/12) − 1</Formula>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Savings projection</h2>
        <p className="text-sm text-muted">
          The balance is simulated month by month. Each month the balance grows
          by the monthly rate i; a recurring contribution C is added either at
          the beginning of the month (before growth — an annuity due) or the
          end (after growth — an ordinary annuity, the default). The simulation
          agrees with the closed forms:
        </p>
        <Formula>FV(principal) = P · (1 + i)^n</Formula>
        <Formula>FV(end-of-month C) = C · ((1 + i)^n − 1) / i</Formula>
        <Formula>FV(beginning-of-month C) = C · ((1 + i)^n − 1) / i · (1 + i)</Formula>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">CD projection</h2>
        <Formula>Maturity value = P · (1 + i)^n</Formula>
        <p className="text-sm text-muted">
          where n is the term in months. The early-withdrawal scenario applies
          the most common penalty structure — k months of interest — to the
          balance at the withdrawal month w:
        </p>
        <Formula>penalty = balance(w) · i · k, capped at balance(w)</Formula>
        <p className="text-sm text-muted">
          The penalty can exceed interest accrued so far, in which case it
          consumes principal; the calculator flags this. k is your assumption —
          actual bank penalty terms vary and are stated in the CD&apos;s
          disclosure.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Inflation adjustment</h2>
        <p className="text-sm text-muted">
          Future values can be restated in today&apos;s purchasing power with
          an inflation assumption π, and real rates use the exact Fisher
          relation rather than the subtraction approximation:
        </p>
        <Formula>real value = nominal / (1 + π)^years</Formula>
        <Formula>real rate = (1 + r) / (1 + π) − 1</Formula>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">CD ladders</h2>
        <p className="text-sm text-muted">
          Each rung is an independent CD projection of its allocation, term,
          and APY. The planner models each rung held to maturity without
          reinvestment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Limitations</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          <li>Projections are estimates, never guarantees.</li>
          <li>Savings rates are variable in reality; the model holds them constant.</li>
          <li>Taxes, fees, and bank-specific terms are not modeled.</li>
          <li>No live rates are fetched — every rate is user-entered.</li>
          <li>
            Nothing here is banking, investment, tax, or financial advice.
          </li>
        </ul>
      </section>

      <p className="text-sm text-muted">
        The full engine source and its test suites are on{" "}
        <a
          href="https://github.com/jsaintfleur/customer_banking"
          className="underline"
          rel="noreferrer"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
