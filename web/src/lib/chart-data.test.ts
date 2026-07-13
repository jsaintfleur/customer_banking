import { describe, expect, it } from "vitest";
import { projectSavings } from "./finance";
import { describeGrowth, toComparisonRows, toGrowthRows } from "./chart-data";

describe("toGrowthRows", () => {
  const projection = projectSavings({
    principal: 5000,
    annualRate: 0.04,
    months: 120,
    monthlyContribution: 100,
  });

  it("starts at month 0 with the principal and always includes the final month", () => {
    const rows = toGrowthRows(projection.schedule, projection.principal);
    expect(rows[0]).toMatchObject({ month: 0, balance: 5000, interest: 0 });
    expect(rows[rows.length - 1].month).toBe(120);
    expect(rows[rows.length - 1].balance).toBeCloseTo(projection.endingBalance, 6);
  });

  it("thins long schedules below the point budget", () => {
    const rows = toGrowthRows(projection.schedule, projection.principal, null, 61);
    expect(rows.length).toBeLessThanOrEqual(62);
  });

  it("adds realBalance only when an inflation rate is given", () => {
    const withoutInflation = toGrowthRows(projection.schedule, projection.principal);
    const withInflation = toGrowthRows(projection.schedule, projection.principal, 0.03);
    expect(withoutInflation[1].realBalance).toBeUndefined();
    expect(withInflation[withInflation.length - 1].realBalance).toBeLessThan(
      withInflation[withInflation.length - 1].balance,
    );
  });
});

describe("toComparisonRows", () => {
  it("keys rows by scenario label and stops shorter scenarios early", () => {
    const short = projectSavings({ principal: 1000, annualRate: 0.04, months: 12 });
    const long = projectSavings({ principal: 1000, annualRate: 0.05, months: 24 });
    const rows = toComparisonRows([
      { label: "Short", schedule: short.schedule, principal: 1000 },
      { label: "Long", schedule: long.schedule, principal: 1000 },
    ]);
    expect(rows[0]).toMatchObject({ month: 0, Short: 1000, Long: 1000 });
    const last = rows[rows.length - 1];
    expect(last.month).toBe(24);
    expect(last.Short).toBeUndefined();
    expect(last.Long).toBeCloseTo(long.endingBalance, 6);
  });
});

describe("describeGrowth", () => {
  it("produces a sentence with the key figures for screen readers", () => {
    const projection = projectSavings({
      principal: 5000,
      annualRate: 0.04,
      months: 60,
      monthlyContribution: 200,
    });
    const text = describeGrowth(projection);
    expect(text).toContain("5000");
    expect(text).toContain("5.0 years");
  });
});
