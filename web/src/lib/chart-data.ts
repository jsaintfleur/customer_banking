/**
 * Pure transforms from engine schedules to chart-ready rows. Kept free of
 * React/Recharts so they can be unit-tested directly.
 */

import type { MonthPoint, SavingsProjection } from "@/lib/finance";
import { inflationAdjustedValue } from "@/lib/finance";

export interface GrowthRow {
  month: number;
  principal: number;
  contributions: number;
  interest: number;
  balance: number;
  realBalance?: number;
}

/**
 * Stacked growth rows (principal / contributions / interest) from a monthly
 * schedule, thinned to at most `maxPoints` rows so long horizons stay
 * readable and light. The final month is always included.
 */
export function toGrowthRows(
  schedule: MonthPoint[],
  principal: number,
  inflationRate: number | null = null,
  maxPoints = 61,
): GrowthRow[] {
  const step = Math.max(1, Math.ceil(schedule.length / (maxPoints - 1)));
  const rows: GrowthRow[] = [
    { month: 0, principal, contributions: 0, interest: 0, balance: principal },
  ];
  for (const point of schedule) {
    if (point.month % step !== 0 && point.month !== schedule.length) continue;
    rows.push({
      month: point.month,
      principal,
      contributions: point.contributionsToDate,
      interest: point.interestToDate,
      balance: point.balance,
      ...(inflationRate !== null
        ? {
            realBalance: inflationAdjustedValue(
              point.balance,
              inflationRate,
              point.month / 12,
            ),
          }
        : {}),
    });
  }
  return rows;
}

export interface ComparisonRow {
  month: number;
  [scenarioLabel: string]: number;
}

/** Merge several schedules into one row set keyed by scenario label.
 * Scenarios may have different lengths; shorter ones simply stop. */
export function toComparisonRows(
  scenarios: { label: string; schedule: MonthPoint[]; principal: number }[],
  maxPoints = 61,
): ComparisonRow[] {
  const longest = Math.max(0, ...scenarios.map((s) => s.schedule.length));
  const step = Math.max(1, Math.ceil(longest / (maxPoints - 1)));
  const rows: ComparisonRow[] = [];
  for (let month = 0; month <= longest; month++) {
    if (month % step !== 0 && month !== longest) continue;
    const row: ComparisonRow = { month };
    for (const scenario of scenarios) {
      if (month === 0) row[scenario.label] = scenario.principal;
      else if (month <= scenario.schedule.length)
        row[scenario.label] = scenario.schedule[month - 1].balance;
    }
    rows.push(row);
  }
  return rows;
}

/** One sentence a screen-reader user can rely on instead of the chart. */
export function describeGrowth(projection: SavingsProjection): string {
  const years = (projection.months / 12).toFixed(1);
  return (
    `Balance grows from ${Math.round(projection.principal)} to about ` +
    `${Math.round(projection.endingBalance)} over ${years} years, of which ` +
    `${Math.round(projection.totalContributions)} comes from contributions and ` +
    `${Math.round(projection.interestEarned)} from interest.`
  );
}
