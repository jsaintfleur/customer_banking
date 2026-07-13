import Link from "next/link";
import { projectSavings } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { CalculatorCard } from "@/components/calculator-card";

/**
 * Homepage — static server component. The sample projection is computed at
 * build time from the same engine the calculators use, so the numbers shown
 * are real output, not marketing copy.
 */

const SAMPLE = projectSavings({
  principal: 5000,
  annualRate: 0.04,
  months: 60,
  monthlyContribution: 200,
});

const TOOLS = [
  {
    href: "/savings",
    title: "Savings Calculator",
    description:
      "Project a balance with compound interest, monthly deposits, and an optional inflation adjustment.",
  },
  {
    href: "/cd",
    title: "CD Calculator",
    description:
      "Model a certificate of deposit to maturity — including what an early withdrawal could cost.",
  },
  {
    href: "/compare",
    title: "Compare",
    description:
      "Put savings accounts and CDs side by side on balance, interest, and liquidity.",
  },
  {
    href: "/ladder",
    title: "CD Ladder",
    description:
      "Split an amount across staggered maturities and see the liquidity schedule.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12 py-10">
      <section className="max-w-3xl space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
          Savings Growth Planner
        </p>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          See how your savings <span className="text-primary">could grow</span>.
        </h1>
        <p className="text-lg text-muted">
          Compare savings accounts and CDs, test different rates and timelines,
          and understand the assumptions behind every projection. No account,
          no data collection — just transparent math.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/savings"
            className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try the savings calculator
          </Link>
          <Link
            href="/cd"
            className="rounded-lg border px-5 py-3 font-medium transition-colors hover:border-primary hover:text-primary"
          >
            Explore CDs
          </Link>
        </div>
      </section>

      <section aria-label="Sample projection">
        <CalculatorCard
          title="A sample projection"
          description="Computed by the same engine as the calculators — $5,000 to start, $200 a month, 4% APY, 5 years."
        >
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">You put in</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">
                {formatCurrency(SAMPLE.principal + SAMPLE.totalContributions)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Interest earned</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-gold">
                {formatCurrency(SAMPLE.interestEarned)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Projected balance</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-positive">
                {formatCurrency(SAMPLE.endingBalance)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Time</dt>
              <dd className="mt-1 text-xl font-semibold">5 years</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted">
            An estimate from fixed assumptions, not a guarantee — real rates
            change over time.{" "}
            <Link href="/methodology" className="underline">
              See exactly how it&apos;s calculated
            </Link>
            .
          </p>
        </CalculatorCard>
      </section>

      <section aria-label="Tools" className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border bg-surface p-5 transition-colors hover:border-primary"
          >
            <h2 className="font-semibold group-hover:text-primary">{tool.title} →</h2>
            <p className="mt-1 text-sm text-muted">{tool.description}</p>
          </Link>
        ))}
      </section>

      <section className="rounded-xl border bg-surface p-5 text-sm text-muted">
        <h2 className="font-semibold text-foreground">What this is — and isn&apos;t</h2>
        <p className="mt-2 max-w-3xl">
          This is a financial education and planning tool. It is not a bank,
          does not manage accounts or money, never asks for personal or
          account information, and does not provide investment advice. All
          projections come from assumptions you enter.{" "}
          <Link href="/learn" className="underline">
            Learn how savings and CDs work
          </Link>{" "}
          or read the{" "}
          <Link href="/methodology" className="underline">
            methodology
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
