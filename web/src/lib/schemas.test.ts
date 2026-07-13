import { describe, expect, it } from "vitest";
import { cdFormSchema, ladderFormSchema, savingsFormSchema } from "./schemas";

const validSavings = {
  principal: 5000,
  ratePct: 4,
  rateBasis: "APY",
  compounding: 12,
  months: 60,
  monthlyContribution: 200,
  timing: "end",
  inflationPct: 0,
  currency: "USD",
};

describe("savingsFormSchema", () => {
  it("accepts a valid form", () => {
    expect(savingsFormSchema.safeParse(validSavings).success).toBe(true);
  });

  it("coerces numeric strings (form inputs) to numbers", () => {
    const parsed = savingsFormSchema.safeParse({
      ...validSavings,
      principal: "5000",
      months: "60",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.principal).toBe(5000);
  });

  it.each([
    ["negative balance", { principal: -1 }],
    ["rate above 100%", { ratePct: 101 }],
    ["zero-month term", { months: 0 }],
    ["decimal months", { months: 6.5 }],
    ["term beyond 100 years", { months: 1201 }],
    ["excessively large value", { principal: 2e12 }],
    ["non-numeric value", { principal: "abc" }],
    ["empty value", { principal: "" }],
    ["unsupported currency", { currency: "JPY" }],
  ])("rejects %s", (_name, patch) => {
    expect(savingsFormSchema.safeParse({ ...validSavings, ...patch }).success).toBe(false);
  });
});

const validCD = {
  principal: 10000,
  ratePct: 4.5,
  rateBasis: "APY",
  compounding: 12,
  termMonths: 24,
  modelEarlyWithdrawal: false,
  currency: "USD",
};

describe("cdFormSchema", () => {
  it("accepts a valid form without early withdrawal", () => {
    expect(cdFormSchema.safeParse(validCD).success).toBe(true);
  });

  it("rejects a zero deposit", () => {
    expect(cdFormSchema.safeParse({ ...validCD, principal: 0 }).success).toBe(false);
  });

  it("requires withdrawal month and penalty when modeling early withdrawal", () => {
    const result = cdFormSchema.safeParse({ ...validCD, modelEarlyWithdrawal: true });
    expect(result.success).toBe(false);
  });

  it("rejects withdrawal at or after maturity", () => {
    const result = cdFormSchema.safeParse({
      ...validCD,
      modelEarlyWithdrawal: true,
      earlyWithdrawalMonth: 24,
      penaltyMonths: 3,
    });
    expect(result.success).toBe(false);
  });

  it("accepts a zero-penalty (no-penalty CD) assumption", () => {
    const result = cdFormSchema.safeParse({
      ...validCD,
      modelEarlyWithdrawal: true,
      earlyWithdrawalMonth: 12,
      penaltyMonths: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("ladderFormSchema", () => {
  it("accepts a valid ladder and bounds the rung count", () => {
    const rung = { termMonths: 12, ratePct: 4.5 };
    expect(
      ladderFormSchema.safeParse({ totalAmount: 30000, rungs: [rung], currency: "USD" }).success,
    ).toBe(true);
    expect(
      ladderFormSchema.safeParse({ totalAmount: 30000, rungs: [], currency: "USD" }).success,
    ).toBe(false);
    expect(
      ladderFormSchema.safeParse({
        totalAmount: 30000,
        rungs: Array(13).fill(rung),
        currency: "USD",
      }).success,
    ).toBe(false);
  });
});
