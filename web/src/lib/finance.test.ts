/**
 * Engine tests. The expected values intentionally match the Python suite
 * (tests/test_rates.py etc.) — both engines must produce identical numbers.
 */

import { describe, expect, it } from "vitest";
import {
  aprToApy,
  apyToApr,
  apyToPeriodicRate,
  buildLadder,
  inflationAdjustedValue,
  projectCD,
  projectSavings,
  realRate,
} from "./finance";

describe("rate conversions", () => {
  it("converts 5% APR at monthly compounding to the textbook APY", () => {
    expect(aprToApy(0.05, 12)).toBeCloseTo(0.051161897881733, 12);
  });

  it("is the identity at annual compounding", () => {
    expect(aprToApy(0.05, 1)).toBeCloseTo(0.05, 12);
  });

  it("round-trips APR → APY → APR", () => {
    for (const periods of [1, 2, 4, 12, 365]) {
      expect(apyToApr(aprToApy(0.0475, periods), periods)).toBeCloseTo(0.0475, 12);
    }
  });

  it("derives a periodic rate that compounds back to the APY", () => {
    const monthly = apyToPeriodicRate(0.05, 12);
    expect(Math.pow(1 + monthly, 12) - 1).toBeCloseTo(0.05, 12);
  });

  it("uses the exact Fisher relation for real rates", () => {
    expect(realRate(0.05, 0.03)).toBeCloseTo(1.05 / 1.03 - 1, 12);
  });

  it("deflates future values by inflation", () => {
    expect(inflationAdjustedValue(10000, 0.03, 1)).toBeCloseTo(10000 / 1.03, 9);
  });
});

describe("projectSavings", () => {
  it("grows by exactly the APY over one year", () => {
    const result = projectSavings({ principal: 10000, annualRate: 0.05, months: 12 });
    expect(result.endingBalance).toBeCloseTo(10500, 8);
    expect(result.interestEarned).toBeCloseTo(500, 8);
  });

  it("treats zero rate with contributions as pure saving", () => {
    const result = projectSavings({
      principal: 1000,
      annualRate: 0,
      months: 12,
      monthlyContribution: 100,
    });
    expect(result.endingBalance).toBeCloseTo(2200, 8);
    expect(result.totalContributions).toBeCloseTo(1200, 8);
  });

  it("matches the closed-form ordinary annuity", () => {
    const i = Math.pow(1.05, 1 / 12) - 1;
    const expected = 5000 * Math.pow(1 + i, 60) + (200 * (Math.pow(1 + i, 60) - 1)) / i;
    const result = projectSavings({
      principal: 5000,
      annualRate: 0.05,
      months: 60,
      monthlyContribution: 200,
    });
    expect(result.endingBalance).toBeCloseTo(expected, 6);
  });

  it("pays more for beginning-of-month contributions", () => {
    const base = { principal: 1000, annualRate: 0.05, months: 24, monthlyContribution: 100 };
    const end = projectSavings({ ...base, timing: "end" });
    const beginning = projectSavings({ ...base, timing: "beginning" });
    expect(beginning.endingBalance).toBeGreaterThan(end.endingBalance);
  });

  it("computes inflation-adjusted ending balance", () => {
    const result = projectSavings({
      principal: 10000,
      annualRate: 0.05,
      months: 12,
      inflationRate: 0.03,
    });
    expect(result.realEndingBalance).toBeCloseTo(10500 / 1.03, 6);
  });

  it("keeps the schedule consistent with the summary", () => {
    const result = projectSavings({
      principal: 2500,
      annualRate: 0.04,
      months: 36,
      monthlyContribution: 50,
    });
    const last = result.schedule[result.schedule.length - 1];
    expect(result.schedule).toHaveLength(36);
    expect(last.balance).toBeCloseTo(result.endingBalance, 9);
    expect(last.interestToDate).toBeCloseTo(result.interestEarned, 9);
  });
});

describe("projectCD", () => {
  it("compounds to maturity at the APY", () => {
    const result = projectCD({ principal: 10000, annualRate: 0.04, termMonths: 24 });
    expect(result.maturityBalance).toBeCloseTo(10000 * 1.04 ** 2, 6);
  });

  it("no longer reproduces the legacy simple-interest value", () => {
    const result = projectCD({ principal: 2000, annualRate: 0.03, termMonths: 24 });
    expect(result.interestEarned).toBeCloseTo(2000 * (1.03 ** 2 - 1), 6);
    expect(Math.abs(result.interestEarned - 120)).toBeGreaterThan(0.005);
  });

  it("models a k-months-of-interest early-withdrawal penalty", () => {
    const result = projectCD({
      principal: 10000,
      annualRate: 0.04,
      termMonths: 24,
      earlyWithdrawalMonth: 12,
      penaltyMonths: 3,
    });
    const monthly = Math.pow(1.04, 1 / 12) - 1;
    expect(result.balanceAtWithdrawal).toBeCloseTo(10400, 6);
    expect(result.penaltyAmount).toBeCloseTo(10400 * monthly * 3, 6);
    expect(result.penaltyExceedsInterest).toBe(false);
  });

  it("flags penalties that eat into principal", () => {
    const result = projectCD({
      principal: 10000,
      annualRate: 0.04,
      termMonths: 24,
      earlyWithdrawalMonth: 1,
      penaltyMonths: 12,
    });
    expect(result.penaltyExceedsInterest).toBe(true);
    expect(result.earlyWithdrawalBalance!).toBeLessThan(10000);
  });
});

describe("buildLadder", () => {
  it("splits equally and sums rung maturities", () => {
    const plan = buildLadder(30000, [
      { termMonths: 12, apy: 0.045 },
      { termMonths: 24, apy: 0.047 },
      { termMonths: 36, apy: 0.05 },
    ]);
    expect(plan.rungs).toHaveLength(3);
    for (const rung of plan.rungs) expect(rung.allocation).toBeCloseTo(10000, 8);
    const standalone = projectCD({ principal: 10000, annualRate: 0.05, termMonths: 36 });
    expect(plan.rungs[2].maturityBalance).toBeCloseTo(standalone.maturityBalance, 8);
    expect(plan.totalInterest).toBeCloseTo(plan.totalMaturityValue - 30000, 8);
  });
});
