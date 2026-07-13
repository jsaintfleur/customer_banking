"use client";

/**
 * CD calculator with an optional early-withdrawal scenario. The penalty is a
 * user-supplied assumption ("k months of interest") because real bank terms
 * vary — the page says so visibly.
 */

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cdFormSchema, type CDFormInput, type CDFormValues } from "@/lib/schemas";
import { projectCD } from "@/lib/finance";
import { toGrowthRows } from "@/lib/chart-data";
import { formatCurrency, formatPercent, formatTerm } from "@/lib/format";
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

const DEFAULTS: CDFormValues = {
  // Example scenario values — not rate recommendations.
  principal: 10000,
  ratePct: 4.5,
  rateBasis: "APY",
  compounding: 12,
  termMonths: 24,
  modelEarlyWithdrawal: false,
  earlyWithdrawalMonth: 12,
  penaltyMonths: 6,
  currency: "USD",
};

export function CDCalculator() {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<CDFormInput, unknown, CDFormValues>({
    resolver: zodResolver(cdFormSchema),
    defaultValues: DEFAULTS,
    mode: "onChange",
  });

  const values = watch();
  const parsed = cdFormSchema.safeParse(values);

  const projection = useMemo(() => {
    if (!parsed.success) return null;
    const v = parsed.data;
    return projectCD({
      principal: v.principal,
      annualRate: v.ratePct / 100,
      termMonths: v.termMonths,
      rateBasis: v.rateBasis,
      compounding: v.compounding,
      earlyWithdrawalMonth: v.modelEarlyWithdrawal ? v.earlyWithdrawalMonth ?? null : null,
      penaltyMonths: v.modelEarlyWithdrawal ? v.penaltyMonths ?? null : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  const currency = parsed.success ? parsed.data.currency : "USD";
  const showApr = values.rateBasis === "APR";
  const maturityDate = useMemo(() => {
    if (!parsed.success) return null;
    const date = new Date();
    date.setMonth(date.getMonth() + parsed.data.termMonths);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }, [parsed]);

  return (
    <div className="space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold">CD Calculator</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Project a certificate of deposit to maturity — and see what an early
          withdrawal could cost under a penalty assumption you control.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <CalculatorCard title="Your assumptions">
          <form className="space-y-4" noValidate>
            <CurrencyInput
              label="Initial deposit"
              error={errors.principal?.message}
              {...register("principal")}
            />
            <RateInput
              label="Annual rate"
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
              label="CD term"
              error={errors.termMonths?.message}
              {...register("termMonths")}
            />

            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" {...register("modelEarlyWithdrawal")} />
              Model an early withdrawal
            </label>

            {values.modelEarlyWithdrawal && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-surface-raised p-3">
                <TermSelector
                  label="Withdrawal month"
                  error={errors.earlyWithdrawalMonth?.message}
                  {...register("earlyWithdrawalMonth")}
                />
                <TermSelector
                  label="Penalty (months of interest)"
                  hint="3–12 is common; check your bank's terms."
                  error={errors.penaltyMonths?.message}
                  {...register("penaltyMonths")}
                />
              </div>
            )}

            <Select
              label="Currency"
              options={["USD", "EUR", "GBP", "CAD"].map((c) => ({ value: c, label: c }))}
              error={errors.currency?.message}
              {...register("currency")}
            />
          </form>
        </CalculatorCard>

        <div className="space-y-6">
          {projection ? (
            <>
              <CalculatorCard title="Projection">
                <ProjectionSummary
                  stats={[
                    {
                      label: "Balance at maturity",
                      value: formatCurrency(projection.maturityBalance, currency),
                      tone: "positive",
                    },
                    {
                      label: "Interest earned",
                      value: formatCurrency(projection.interestEarned, currency),
                      tone: "gold",
                    },
                    {
                      label: "Effective APY",
                      value: formatPercent(projection.apy),
                    },
                    {
                      label: "Term",
                      value: formatTerm(projection.termMonths),
                    },
                    ...(maturityDate
                      ? [{ label: "Matures around", value: maturityDate }]
                      : []),
                  ]}
                  narrative={
                    <>
                      A {formatCurrency(projection.principal, currency)} deposit at{" "}
                      {formatPercent(projection.apy)} APY grows to{" "}
                      <strong>{formatCurrency(projection.maturityBalance, currency)}</strong>{" "}
                      over {formatTerm(projection.termMonths)} if held to maturity.
                    </>
                  }
                />
              </CalculatorCard>

              {projection.earlyWithdrawalBalance !== null && (
                <CalculatorCard title="Early-withdrawal scenario">
                  <ProjectionSummary
                    stats={[
                      {
                        label: `Balance at month ${projection.earlyWithdrawalMonth}`,
                        value: formatCurrency(projection.balanceAtWithdrawal ?? 0, currency),
                      },
                      {
                        label: "Estimated penalty",
                        value: formatCurrency(projection.penaltyAmount ?? 0, currency),
                        tone: "warning",
                      },
                      {
                        label: "You would receive",
                        value: formatCurrency(projection.earlyWithdrawalBalance, currency),
                      },
                      {
                        label: "Cost vs. holding to maturity",
                        value: formatCurrency(projection.costOfEarlyWithdrawal ?? 0, currency),
                        tone: "warning",
                      },
                    ]}
                    narrative={
                      projection.penaltyExceedsInterest ? (
                        <span className="font-medium text-negative">
                          ⚠ Under this assumption the penalty exceeds the
                          interest earned by month {projection.earlyWithdrawalMonth},
                          so the withdrawal would return less than the original
                          deposit.
                        </span>
                      ) : (
                        <>
                          Withdrawing at month {projection.earlyWithdrawalMonth}{" "}
                          keeps some interest but gives up{" "}
                          <strong>
                            {formatCurrency(projection.costOfEarlyWithdrawal ?? 0, currency)}
                          </strong>{" "}
                          versus holding to maturity.
                        </>
                      )
                    }
                  />
                </CalculatorCard>
              )}

              <CalculatorCard title="Growth to maturity">
                <GrowthChart
                  rows={toGrowthRows(projection.schedule, projection.principal)}
                  currency={currency}
                  summary={`CD balance grows from ${formatCurrency(
                    projection.principal,
                    currency,
                  )} to ${formatCurrency(projection.maturityBalance, currency)} over ${formatTerm(
                    projection.termMonths,
                  )}.`}
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
            Actual CD compounding and early-withdrawal terms vary by
            institution. Review the bank&apos;s disclosure before opening or
            closing a CD. The penalty modeled here is your assumption, not a
            quote.
          </AssumptionNotice>

          <MethodologyDrawer>
            <p>
              Maturity value is P·(1 + i)<sup>n</sup> with the monthly rate i
              derived from APY. The early-withdrawal penalty is k months of
              interest on the balance at withdrawal, capped so the payout
              can&apos;t go below zero.
            </p>
          </MethodologyDrawer>
        </div>
      </div>
    </div>
  );
}
