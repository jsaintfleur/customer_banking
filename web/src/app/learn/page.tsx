import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Plain-language explanations of APY, compound interest, CDs, ladders, inflation, and liquidity.",
};

/** Learning center — concise, plain-language education. No personalized advice. */

const TOPICS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "apr-vs-apy",
    title: "APR vs. APY",
    body: (
      <>
        <p>
          <strong>APR</strong> (annual percentage rate) is the nominal yearly
          rate before compounding. <strong>APY</strong> (annual percentage
          yield) is what you actually earn in a year once compounding is
          included. A 5% APR compounded monthly works out to about 5.12% APY.
        </p>
        <p>
          Banks advertise savings and CD rates as APY, so when a calculator
          asks for a rate, the advertised number is usually the APY.
        </p>
      </>
    ),
  },
  {
    id: "simple-vs-compound",
    title: "Simple vs. compound interest",
    body: (
      <>
        <p>
          Simple interest is paid only on the original amount: $1,000 at 5%
          simple interest earns $50 every year. Compound interest is paid on
          the balance <em>including past interest</em>, so each year earns a
          little more than the last. Over long periods the difference is large
          — savings accounts and CDs compound.
        </p>
      </>
    ),
  },
  {
    id: "how-savings-grow",
    title: "How savings accounts grow",
    body: (
      <>
        <p>
          A savings balance grows from two sources: deposits you make and
          interest the bank pays. Rates on savings accounts are variable — the
          bank can change them at any time — and you can add or withdraw money
          whenever you like. Regular monthly deposits often contribute more to
          the ending balance than interest does; the calculator&apos;s stacked
          chart makes that split visible.
        </p>
      </>
    ),
  },
  {
    id: "how-cds-work",
    title: "How CDs work",
    body: (
      <>
        <p>
          A certificate of deposit locks a fixed amount for a fixed term (say
          12 or 24 months) at a fixed rate. In exchange for giving up access,
          CDs often pay a higher rate than savings accounts. You generally
          cannot add money to a CD after opening it.
        </p>
      </>
    ),
  },
  {
    id: "maturity",
    title: "CD maturity",
    body: (
      <>
        <p>
          Maturity is the end of the CD&apos;s term, when the deposit plus
          interest becomes available without penalty. Many banks auto-renew a
          CD into a new term if you do nothing during a short grace window, so
          it pays to note the maturity date.
        </p>
      </>
    ),
  },
  {
    id: "early-withdrawal",
    title: "Early-withdrawal penalties",
    body: (
      <>
        <p>
          Taking money out of a CD before maturity usually costs a penalty,
          most commonly expressed as a number of months of interest (for
          example, &ldquo;6 months of interest&rdquo; on a 2-year CD). If you
          withdraw very early, the penalty can exceed the interest earned so
          far and eat into your original deposit. Every bank&apos;s terms
          differ — the CD calculator lets you test your own penalty
          assumption.
        </p>
      </>
    ),
  },
  {
    id: "ladders",
    title: "CD ladders",
    body: (
      <>
        <p>
          A ladder splits money across several CDs with staggered maturities —
          for example a third each in 1-, 2-, and 3-year CDs. One rung matures
          at a time, giving you periodic access to cash while most of the money
          keeps earning longer-term rates. The{" "}
          <Link href="/ladder" className="underline">
            ladder planner
          </Link>{" "}
          shows the liquidity schedule.
        </p>
      </>
    ),
  },
  {
    id: "inflation",
    title: "Inflation and real returns",
    body: (
      <>
        <p>
          Inflation quietly reduces what a dollar buys. If your savings earn 4%
          while inflation runs 3%, your <em>real</em> return is roughly 1% —
          precisely, (1.04 / 1.03) − 1 ≈ 0.97%. The calculators can show every
          projection in &ldquo;today&apos;s dollars&rdquo; so growth isn&apos;t
          overstated.
        </p>
      </>
    ),
  },
  {
    id: "liquidity",
    title: "Liquidity",
    body: (
      <>
        <p>
          Liquidity is how quickly you can turn an asset into spendable cash
          without losing value. Savings accounts are highly liquid; CDs are
          not, until maturity. A higher CD rate is partly payment for giving up
          liquidity — which is why &ldquo;highest rate&rdquo; isn&apos;t
          automatically &ldquo;best choice.&rdquo;
        </p>
      </>
    ),
  },
  {
    id: "emergency-funds",
    title: "Emergency funds",
    body: (
      <>
        <p>
          An emergency fund is money set aside for surprises — a car repair, a
          medical bill, a gap between jobs. Because emergencies don&apos;t wait
          for maturity dates, emergency savings are usually kept somewhere
          liquid, like a savings account, even if a CD pays more.
        </p>
      </>
    ),
  },
  {
    id: "why-rates-change",
    title: "Why rates change",
    body: (
      <>
        <p>
          Banks set savings and CD rates in response to central-bank policy
          rates, competition for deposits, and their own funding needs. When
          policy rates fall, savings rates usually follow quickly; existing CD
          rates stay fixed until maturity. That&apos;s why projections here
          treat the rate as an assumption you choose, not a promise.
        </p>
      </>
    ),
  },
];

export default function LearnPage() {
  return (
    <div className="space-y-8 py-8">
      <header className="max-w-2xl">
        <h1 className="text-2xl font-bold">Learn</h1>
        <p className="mt-1 text-muted">
          Short, plain-language explanations of the ideas behind the
          calculators. Educational only — nothing here is personalized
          financial advice.
        </p>
      </header>

      <nav aria-label="Topics" className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <a
            key={topic.id}
            href={`#${topic.id}`}
            className="rounded-full border px-3 py-1.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
          >
            {topic.title}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 md:grid-cols-2">
        {TOPICS.map((topic) => (
          <article
            key={topic.id}
            id={topic.id}
            className="scroll-mt-24 rounded-xl border bg-surface p-5"
          >
            <h2 className="font-semibold">{topic.title}</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted">
              {topic.body}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
