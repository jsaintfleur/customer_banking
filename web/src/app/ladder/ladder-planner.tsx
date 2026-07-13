"use client";

/**
 * CD ladder planner: split a total across rungs with staggered terms, each
 * with its own APY assumption. Templates cover the common 3-rung, 5-rung,
 * and short-term shapes; every value stays editable.
 */

import { useMemo, useState } from "react";
import { ladderFormSchema } from "@/lib/schemas";
import { buildLadder } from "@/lib/finance";
import { formatCurrency, formatPercent, formatTerm } from "@/lib/format";
import { CalculatorCard } from "@/components/calculator-card";
import { CurrencyInput, RateInput, TermSelector } from "@/components/fields";
import { ProjectionSummary } from "@/components/projection-summary";
import { CDLadderTimeline } from "@/components/cd-ladder-timeline";
import { AssumptionNotice } from "@/components/assumption-notice";
import { MethodologyDrawer } from "@/components/methodology-drawer";

interface RungState {
  termMonths: number | string;
  ratePct: number | string;
}

const TEMPLATES: Record<string, { label: string; rungs: RungState[] }> = {
  three: {
    label: "3-rung ladder (1–3 yrs)",
    rungs: [
      { termMonths: 12, ratePct: 4.6 },
      { termMonths: 24, ratePct: 4.4 },
      { termMonths: 36, ratePct: 4.2 },
    ],
  },
  five: {
    label: "5-rung ladder (1–5 yrs)",
    rungs: [
      { termMonths: 12, ratePct: 4.6 },
      { termMonths: 24, ratePct: 4.4 },
      { termMonths: 36, ratePct: 4.2 },
      { termMonths: 48, ratePct: 4.1 },
      { termMonths: 60, ratePct: 4.0 },
    ],
  },
  short: {
    label: "Short-term ladder (3–12 mo)",
    rungs: [
      { termMonths: 3, ratePct: 4.8 },
      { termMonths: 6, ratePct: 4.7 },
      { termMonths: 9, ratePct: 4.6 },
      { termMonths: 12, ratePct: 4.5 },
    ],
  },
};

export function LadderPlanner() {
  const [totalAmount, setTotalAmount] = useState<number | string>(30000);
  const [rungs, setRungs] = useState<RungState[]>(TEMPLATES.three.rungs);

  const parsed = ladderFormSchema.safeParse({
    totalAmount,
    rungs,
    currency: "USD",
  });

  const plan = useMemo(() => {
    if (!parsed.success) return null;
    return buildLadder(
      parsed.data.totalAmount,
      parsed.data.rungs.map((rung) => ({
        termMonths: rung.termMonths,
        apy: rung.ratePct / 100,
      })),
    );
  }, [parsed]);

  const fieldError = (index: number, field: "termMonths" | "ratePct") =>
    parsed.success
      ? undefined
      : parsed.error.issues.find(
          (issue) => issue.path[0] === "rungs" && issue.path[1] === index && issue.path[2] === field,
        )?.message;

  return (
    <div className="space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold">CD Ladder Planner</h1>
        <p className="mt-1 max-w-2xl text-muted">
          A ladder splits your money across CDs with staggered maturities, so
          part of it becomes liquid at regular intervals instead of all at once.
        </p>
      </header>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Ladder templates">
        {Object.entries(TEMPLATES).map(([key, template]) => (
          <button
            key={key}
            type="button"
            onClick={() => setRungs(template.rungs.map((rung) => ({ ...rung })))}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
          >
            {template.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <CalculatorCard title="Your ladder">
          <div className="space-y-4">
            <CurrencyInput
              label="Total amount to allocate"
              value={totalAmount}
              error={
                parsed.success
                  ? undefined
                  : parsed.error.issues.find((issue) => issue.path[0] === "totalAmount")?.message
              }
              onChange={(event) => setTotalAmount(event.target.value)}
            />
            <p className="text-xs text-muted">
              Split equally across {rungs.length} rung{rungs.length > 1 ? "s" : ""} (
              {parsed.success
                ? formatCurrency(parsed.data.totalAmount / rungs.length)
                : "—"}{" "}
              each).
            </p>
            {rungs.map((rung, index) => (
              <fieldset key={index} className="rounded-lg border bg-surface-raised p-3">
                <legend className="px-1 text-sm font-medium">Rung {index + 1}</legend>
                <div className="grid grid-cols-2 gap-3">
                  <TermSelector
                    label="Term"
                    value={rung.termMonths}
                    error={fieldError(index, "termMonths")}
                    onChange={(event) =>
                      setRungs((current) =>
                        current.map((existing, i) =>
                          i === index
                            ? { ...existing, termMonths: event.target.value }
                            : existing,
                        ),
                      )
                    }
                  />
                  <RateInput
                    label="APY"
                    value={rung.ratePct}
                    error={fieldError(index, "ratePct")}
                    onChange={(event) =>
                      setRungs((current) =>
                        current.map((existing, i) =>
                          i === index
                            ? { ...existing, ratePct: event.target.value }
                            : existing,
                        ),
                      )
                    }
                  />
                </div>
                {rungs.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setRungs((current) => current.filter((_, i) => i !== index))
                    }
                    className="mt-2 text-xs text-negative underline"
                  >
                    Remove rung
                  </button>
                )}
              </fieldset>
            ))}
            {rungs.length < 12 && (
              <button
                type="button"
                onClick={() =>
                  setRungs((current) => [
                    ...current,
                    { termMonths: (current.length + 1) * 12, ratePct: 4.0 },
                  ])
                }
                className="w-full rounded-lg border border-dashed py-2 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
              >
                + Add rung
              </button>
            )}
          </div>
        </CalculatorCard>

        <div className="space-y-6">
          {plan ? (
            <>
              <CalculatorCard title="Projected ladder">
                <ProjectionSummary
                  stats={[
                    {
                      label: "Total allocated",
                      value: formatCurrency(plan.totalAllocated),
                    },
                    {
                      label: "Total at maturity",
                      value: formatCurrency(plan.totalMaturityValue),
                      tone: "positive",
                    },
                    {
                      label: "Total projected interest",
                      value: formatCurrency(plan.totalInterest),
                      tone: "gold",
                    },
                  ]}
                  narrative={
                    <>
                      Money becomes available at{" "}
                      {plan.rungs
                        .map((rung) => formatTerm(rung.termMonths))
                        .join(", ")}{" "}
                      — that is the ladder&apos;s liquidity schedule.
                    </>
                  }
                />
              </CalculatorCard>

              <CalculatorCard
                title="Maturity timeline"
                description="Each bar spans from opening to that rung's maturity."
              >
                <CDLadderTimeline rungs={plan.rungs} currency="USD" />
              </CalculatorCard>

              <CalculatorCard title="Rung details">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-sm">
                    <caption className="sr-only">
                      Allocation, term, APY, and projected maturity value per rung.
                    </caption>
                    <thead>
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                        <th scope="col" className="py-2 pr-4">Rung</th>
                        <th scope="col" className="py-2 pr-4">Amount</th>
                        <th scope="col" className="py-2 pr-4">Term</th>
                        <th scope="col" className="py-2 pr-4">APY</th>
                        <th scope="col" className="py-2 pr-4">Interest</th>
                        <th scope="col" className="py-2">At maturity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.rungs.map((rung, index) => (
                        <tr key={index} className="border-b last:border-0">
                          <th scope="row" className="py-2 pr-4 text-left font-medium">
                            {index + 1}
                          </th>
                          <td className="py-2 pr-4 tabular-nums">
                            {formatCurrency(rung.allocation)}
                          </td>
                          <td className="py-2 pr-4">{formatTerm(rung.termMonths)}</td>
                          <td className="py-2 pr-4 tabular-nums">{formatPercent(rung.apy)}</td>
                          <td className="py-2 pr-4 tabular-nums text-gold">
                            {formatCurrency(rung.interestEarned)}
                          </td>
                          <td className="py-2 font-semibold tabular-nums">
                            {formatCurrency(rung.maturityBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CalculatorCard>
            </>
          ) : (
            <CalculatorCard title="Projected ladder">
              <p className="text-sm text-muted" role="status">
                Fix the highlighted inputs to see the ladder projection.
              </p>
            </CalculatorCard>
          )}

          <AssumptionNotice>
            The APY for each rung is your scenario assumption, not a live
            offer. This planner models each rung held to maturity without
            reinvestment; real ladders typically roll maturing rungs into new
            CDs at whatever rates are then available.
          </AssumptionNotice>

          <MethodologyDrawer>
            <p>
              Each rung is an independent CD projection: allocation ×
              (1 + i)<sup>n</sup> with the monthly rate i derived from that
              rung&apos;s APY.
            </p>
          </MethodologyDrawer>
        </div>
      </div>
    </div>
  );
}
