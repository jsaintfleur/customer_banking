"use client";

/**
 * Savings-vs-CD comparison: up to three independently editable scenarios,
 * a side-by-side table, and a growth chart. The tool never crowns a single
 * "best" option — it labels highest projected balance and most flexible
 * separately, because liquidity and time horizon matter as much as yield.
 */

import { useMemo, useState } from "react";
import { comparisonScenarioSchema, type ComparisonScenario } from "@/lib/schemas";
import { projectSavings, projectCD, type MonthPoint } from "@/lib/finance";
import { toComparisonRows } from "@/lib/chart-data";
import { formatCurrency, formatPercent, formatTerm } from "@/lib/format";
import { CalculatorCard } from "@/components/calculator-card";
import { CurrencyInput, RateInput, Select, TermSelector } from "@/components/fields";
import { ComparisonChart } from "@/components/comparison-chart";
import { AssumptionNotice } from "@/components/assumption-notice";

interface ScenarioResult {
  scenario: ComparisonScenario;
  endingBalance: number;
  interest: number;
  contributions: number;
  schedule: MonthPoint[];
}

const PRESETS: ComparisonScenario[] = [
  {
    label: "High-yield savings",
    kind: "savings",
    principal: 10000,
    ratePct: 4.0,
    months: 24,
    monthlyContribution: 0,
  },
  {
    label: "12-month CD",
    kind: "cd",
    principal: 10000,
    ratePct: 4.6,
    months: 12,
    monthlyContribution: 0,
  },
  {
    label: "24-month CD",
    kind: "cd",
    principal: 10000,
    ratePct: 4.3,
    months: 24,
    monthlyContribution: 0,
  },
];

function ScenarioEditor({
  scenario,
  onChange,
  onRemove,
  errors,
}: {
  scenario: ComparisonScenario;
  onChange: (next: ComparisonScenario) => void;
  onRemove?: () => void;
  errors: Partial<Record<keyof ComparisonScenario, string>>;
}) {
  const set = (patch: Partial<Record<keyof ComparisonScenario, string | number>>) =>
    onChange({ ...scenario, ...patch } as ComparisonScenario);

  return (
    <CalculatorCard title={scenario.label || "Scenario"}>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="block text-sm font-medium" htmlFor={`label-${scenario.label}`}>
            Name
          </label>
          <input
            id={`label-${scenario.label}`}
            value={scenario.label}
            onChange={(event) => set({ label: event.target.value })}
            className="w-full rounded-md border bg-surface px-3 py-2 text-sm"
          />
          {errors.label && (
            <p role="alert" className="text-sm text-negative">
              {errors.label}
            </p>
          )}
        </div>
        <Select
          label="Product type"
          options={[
            { value: "savings", label: "Savings account" },
            { value: "cd", label: "CD" },
          ]}
          value={scenario.kind}
          onChange={(event) => set({ kind: event.target.value })}
        />
        <CurrencyInput
          label="Starting balance"
          value={scenario.principal}
          error={errors.principal}
          onChange={(event) => set({ principal: event.target.value })}
        />
        <RateInput
          label="APY"
          value={scenario.ratePct}
          error={errors.ratePct}
          onChange={(event) => set({ ratePct: event.target.value })}
        />
        <TermSelector
          label="Term"
          value={scenario.months}
          error={errors.months}
          onChange={(event) => set({ months: event.target.value })}
        />
        {scenario.kind === "savings" ? (
          <CurrencyInput
            label="Monthly contribution"
            value={scenario.monthlyContribution}
            error={errors.monthlyContribution}
            onChange={(event) => set({ monthlyContribution: event.target.value })}
          />
        ) : (
          <p className="text-xs text-muted">
            CDs don&apos;t accept ongoing contributions — the deposit is fixed
            at opening.
          </p>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-sm text-negative underline"
          >
            Remove scenario
          </button>
        )}
      </div>
    </CalculatorCard>
  );
}

export function CompareTool() {
  const [scenarios, setScenarios] = useState<ComparisonScenario[]>(PRESETS.slice(0, 2));
  const [inflationPct, setInflationPct] = useState(0);

  const results: (ScenarioResult | null)[] = useMemo(
    () =>
      scenarios.map((scenario) => {
        const parsed = comparisonScenarioSchema.safeParse(scenario);
        if (!parsed.success) return null;
        const v = parsed.data;
        if (v.kind === "savings") {
          const p = projectSavings({
            principal: v.principal,
            annualRate: v.ratePct / 100,
            months: v.months,
            monthlyContribution: v.monthlyContribution,
          });
          return {
            scenario: v,
            endingBalance: p.endingBalance,
            interest: p.interestEarned,
            contributions: p.totalContributions,
            schedule: p.schedule,
          };
        }
        const p = projectCD({
          principal: v.principal,
          annualRate: v.ratePct / 100,
          termMonths: v.months,
        });
        return {
          scenario: v,
          endingBalance: p.maturityBalance,
          interest: p.interestEarned,
          contributions: 0,
          schedule: p.schedule,
        };
      }),
    [scenarios],
  );

  const valid = results.filter((r): r is ScenarioResult => r !== null);
  const highestBalance =
    valid.length > 0 ? Math.max(...valid.map((r) => r.endingBalance)) : null;

  const errorsByIndex = scenarios.map((scenario) => {
    const parsed = comparisonScenarioSchema.safeParse(scenario);
    if (parsed.success) return {};
    const fieldErrors: Partial<Record<keyof ComparisonScenario, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ComparisonScenario;
      fieldErrors[key] ??= issue.message;
    }
    return fieldErrors;
  });

  return (
    <div className="space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold">Compare Scenarios</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Put up to three savings or CD scenarios side by side. Yield is only
          one dimension — liquidity and time horizon matter too.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {scenarios.map((scenario, index) => (
          <ScenarioEditor
            key={index}
            scenario={scenario}
            errors={errorsByIndex[index]}
            onChange={(next) =>
              setScenarios((current) =>
                current.map((existing, i) => (i === index ? next : existing)),
              )
            }
            onRemove={
              scenarios.length > 1
                ? () => setScenarios((current) => current.filter((_, i) => i !== index))
                : undefined
            }
          />
        ))}
        {scenarios.length < 3 && (
          <button
            type="button"
            onClick={() =>
              setScenarios((current) => [...current, PRESETS[current.length % PRESETS.length]])
            }
            className="rounded-xl border border-dashed p-6 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
          >
            + Add a scenario (up to 3)
          </button>
        )}
      </div>

      {valid.length > 0 && (
        <>
          <CalculatorCard title="Side by side">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <caption className="sr-only">
                  Comparison of the entered savings and CD scenarios.
                </caption>
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="py-2 pr-4">Scenario</th>
                    <th scope="col" className="py-2 pr-4">Type</th>
                    <th scope="col" className="py-2 pr-4">Start</th>
                    <th scope="col" className="py-2 pr-4">APY</th>
                    <th scope="col" className="py-2 pr-4">Term</th>
                    <th scope="col" className="py-2 pr-4">Liquidity</th>
                    <th scope="col" className="py-2 pr-4">Contributions</th>
                    <th scope="col" className="py-2 pr-4">Interest</th>
                    <th scope="col" className="py-2 pr-4">Ending balance</th>
                    <th scope="col" className="py-2">Today&apos;s dollars*</th>
                  </tr>
                </thead>
                <tbody>
                  {valid.map((result) => (
                    <tr key={result.scenario.label} className="border-b last:border-0">
                      <th scope="row" className="py-2 pr-4 text-left font-medium">
                        {result.scenario.label}
                        {result.endingBalance === highestBalance && (
                          <span className="ml-2 rounded bg-gold/15 px-1.5 py-0.5 text-xs text-gold">
                            highest projected balance
                          </span>
                        )}
                        {result.scenario.kind === "savings" && (
                          <span className="ml-2 rounded bg-secondary/15 px-1.5 py-0.5 text-xs text-secondary">
                            most flexible
                          </span>
                        )}
                      </th>
                      <td className="py-2 pr-4">
                        {result.scenario.kind === "savings" ? "Savings" : "CD"}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">
                        {formatCurrency(result.scenario.principal)}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">
                        {formatPercent(result.scenario.ratePct / 100)}
                      </td>
                      <td className="py-2 pr-4">{formatTerm(result.scenario.months)}</td>
                      <td className="py-2 pr-4">
                        {result.scenario.kind === "savings" ? "Anytime" : "At maturity"}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">
                        {result.scenario.kind === "savings"
                          ? formatCurrency(result.contributions)
                          : "Not allowed"}
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-gold">
                        {formatCurrency(result.interest)}
                      </td>
                      <td className="py-2 pr-4 font-semibold tabular-nums">
                        {formatCurrency(result.endingBalance)}
                      </td>
                      <td className="py-2 tabular-nums">
                        {inflationPct > 0
                          ? formatCurrency(
                              result.endingBalance /
                                Math.pow(1 + inflationPct / 100, result.scenario.months / 12),
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <div className="w-40">
                <RateInput
                  label="Inflation assumption*"
                  hint="0 to skip"
                  value={inflationPct}
                  onChange={(event) => setInflationPct(Number(event.target.value) || 0)}
                />
              </div>
              <p className="text-xs text-muted">
                CDs lock the deposit until maturity; withdrawing early usually
                costs a penalty. Savings stays liquid but its rate can change
                at any time.
              </p>
            </div>
          </CalculatorCard>

          <CalculatorCard title="Growth over time">
            <ComparisonChart
              rows={toComparisonRows(
                valid.map((result) => ({
                  label: result.scenario.label,
                  schedule: result.schedule,
                  principal: result.scenario.principal,
                })),
              )}
              labels={valid.map((result) => result.scenario.label)}
              currency="USD"
              summary={valid
                .map(
                  (result) =>
                    `${result.scenario.label} reaches ${formatCurrency(result.endingBalance)} after ${formatTerm(result.scenario.months)}`,
                )
                .join("; ")}
            />
          </CalculatorCard>
        </>
      )}

      <AssumptionNotice>
        All rates are your scenario assumptions, not live offers. Savings
        rates are variable in reality; CD rates are fixed for the term.
        Projections assume rates hold for the whole horizon.
      </AssumptionNotice>
    </div>
  );
}
