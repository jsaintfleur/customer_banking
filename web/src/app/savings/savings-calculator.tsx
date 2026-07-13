"use client";

/**
 * Savings calculator: react-hook-form + Zod validation on the left, live
 * projection (summary, stacked growth chart, contribution breakdown) on the
 * right. The projection recomputes only from values that pass the shared
 * schema — invalid input shows a message and never silently corrects.
 */

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  savingsFormSchema,
  type SavingsFormInput,
  type SavingsFormValues,
} from "@/lib/schemas";
import { projectSavings } from "@/lib/finance";
import { describeGrowth, toGrowthRows } from "@/lib/chart-data";
import { formatCurrency, formatPercent } from "@/lib/format";
import { CalculatorCard } from "@/components/calculator-card";
import {
  CompoundingSelector,
  CurrencyInput,
  RateInput,
  Select,
  TermSelector,
} from "@/components/fields";
import { ProjectionSummary } from "@/components/projection-summary";
import { GrowthChart } from "@/components/growth-chart";
import { AssumptionNotice } from "@/components/assumption-notice";
import { MethodologyDrawer } from "@/components/methodology-drawer";
import { EducationalTooltip } from "@/components/educational-tooltip";

const DEFAULTS: SavingsFormValues = {
  // Example scenario values, editable everywhere — not rate recommendations.
  principal: 5000,
  ratePct: 4.0,
  rateBasis: "APY",
  compounding: 12,
  months: 60,
  monthlyContribution: 200,
  timing: "end",
  inflationPct: 0,
  currency: "USD",
};

export function SavingsCalculator() {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<SavingsFormInput, unknown, SavingsFormValues>({
    resolver: zodResolver(savingsFormSchema),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });

  const values = watch();
  const parsed = savingsFormSchema.safeParse(values);

  const projection = useMemo(() => {
    if (!parsed.success) return null;
    const v = parsed.data;
    return projectSavings({
      principal: v.principal,
      annualRate: v.ratePct / 100,
      months: v.months,
      rateBasis: v.rateBasis,
      compounding: v.compounding,
      monthlyContribution: v.monthlyContribution,
      timing: v.timing,
      inflationRate: v.inflationPct > 0 ? v.inflationPct / 100 : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  const currency = parsed.success ? parsed.data.currency : "USD";
  const showApr = values.rateBasis === "APR";

  return (
    <div className="space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold">Savings Calculator</h1>
        <p className="mt-1 max-w-2xl text-muted">
          See how a starting balance and monthly deposits could grow with
          compound interest. Every number is an estimate from your assumptions.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <CalculatorCard title="Your assumptions">
          <form className="space-y-4" noValidate>
            <CurrencyInput
              label="Starting balance"
              error={errors.principal?.message}
              {...register("principal")}
            />
            <RateInput
              label="Annual rate"
              hint={
                <EducationalTooltip term="APY vs. APR">
                  APY (annual percentage yield) already includes compounding —
                  it&apos;s the number banks advertise. APR is the nominal rate
                  before compounding. If you type your bank&apos;s advertised
                  savings rate, keep APY selected.
                </EducationalTooltip>
              }
              error={errors.ratePct?.message}
              {...register("ratePct")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Rate type"
                options={[
                  { value: "APY", label: "APY (advertised)" },
                  { value: "APR", label: "APR (nominal)" },
                ]}
                error={errors.rateBasis?.message}
                {...register("rateBasis")}
              />
              <CompoundingSelector
                label="Compounding"
                hint={showApr ? undefined : "Only affects APR conversion."}
                error={errors.compounding?.message}
                {...register("compounding")}
              />
            </div>
            <TermSelector
              label="Time horizon"
              error={errors.months?.message}
              {...register("months")}
            />
            <CurrencyInput
              label="Monthly contribution"
              error={errors.monthlyContribution?.message}
              {...register("monthlyContribution")}
            />
            <Select
              label="Contribution timing"
              options={[
                { value: "end", label: "End of each month" },
                { value: "beginning", label: "Beginning of each month" },
              ]}
              hint="Beginning-of-month deposits earn interest for that month too."
              error={errors.timing?.message}
              {...register("timing")}
            />
            <div className="grid grid-cols-2 gap-3">
              <RateInput
                label="Inflation (optional)"
                hint="0 to skip"
                error={errors.inflationPct?.message}
                {...register("inflationPct")}
              />
              <Select
                label="Currency"
                options={["USD", "EUR", "GBP", "CAD"].map((c) => ({ value: c, label: c }))}
                error={errors.currency?.message}
                {...register("currency")}
              />
            </div>
          </form>
        </CalculatorCard>

        <div className="space-y-6">
          {projection ? (
            <>
              <CalculatorCard title="Projection">
                <ProjectionSummary
                  stats={[
                    {
                      label: "Projected balance",
                      value: formatCurrency(projection.endingBalance, currency),
                      tone: "positive",
                    },
                    {
                      label: "Interest earned",
                      value: formatCurrency(projection.interestEarned, currency),
                      tone: "gold",
                    },
                    {
                      label: "Total contributions",
                      value: formatCurrency(projection.totalContributions, currency),
                    },
                    {
                      label: "Effective APY applied",
                      value: formatPercent(projection.apy),
                    },
                    {
                      label: "Effective growth",
                      value: formatPercent(projection.effectiveGrowthPct),
                    },
                    ...(projection.realEndingBalance !== null
                      ? [
                          {
                            label: "In today's dollars",
                            value: formatCurrency(projection.realEndingBalance, currency),
                          },
                        ]
                      : []),
                  ]}
                  narrative={
                    <>
                      Over {(projection.months / 12).toFixed(1)} years, you would
                      contribute{" "}
                      <strong>
                        {formatCurrency(
                          projection.principal + projection.totalContributions,
                          currency,
                        )}
                      </strong>{" "}
                      in total and earn an estimated{" "}
                      <strong>{formatCurrency(projection.interestEarned, currency)}</strong>{" "}
                      in interest, producing a projected balance of{" "}
                      <strong>{formatCurrency(projection.endingBalance, currency)}</strong>.
                    </>
                  }
                />
              </CalculatorCard>

              <CalculatorCard
                title="Growth over time"
                description="Stacked view of starting balance, contributions, and interest."
              >
                <GrowthChart
                  rows={toGrowthRows(
                    projection.schedule,
                    projection.principal,
                    projection.inflationRate,
                  )}
                  currency={currency}
                  summary={describeGrowth(projection)}
                  showReal={projection.inflationRate !== null}
                />
              </CalculatorCard>
            </>
          ) : (
            <CalculatorCard title="Projection">
              <p className="text-sm text-muted" role="status">
                Fix the highlighted inputs to see a projection — nothing is
                calculated from invalid values.
              </p>
            </CalculatorCard>
          )}

          <AssumptionNotice>
            The rate stays constant for the whole horizon, contributions are
            the same every month, and no taxes or fees are modeled. Real rates
            change over time; projections are estimates, not guarantees.
          </AssumptionNotice>

          <MethodologyDrawer>
            <p>
              The monthly rate is derived from APY as (1 + APY)<sup>1/12</sup> − 1;
              APR input is first converted to APY for your selected compounding
              frequency. The balance is simulated month by month with your
              contribution added at the timing you chose.
            </p>
          </MethodologyDrawer>
        </div>
      </div>
    </div>
  );
}
