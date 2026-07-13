import { describe, expect, it } from "vitest";
import { formatCurrency, formatCurrencyCompact, formatPercent, formatTerm } from "./format";

describe("formatCurrency", () => {
  it("formats to currency precision with separators", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("supports the non-USD currencies", () => {
    expect(formatCurrency(1234.5, "EUR")).toBe("€1,234.50");
    expect(formatCurrency(1234.5, "GBP")).toBe("£1,234.50");
    expect(formatCurrency(1234.5, "CAD")).toBe("CA$1,234.50");
  });

  it("compacts large values for axis ticks", () => {
    expect(formatCurrencyCompact(1200)).toBe("$1.2K");
    expect(formatCurrencyCompact(2500000)).toBe("$2.5M");
  });
});

describe("formatPercent", () => {
  it("renders fractions as percentages", () => {
    expect(formatPercent(0.051161897)).toBe("5.12%");
    expect(formatPercent(0.05, 1)).toBe("5.0%");
  });
});

describe("formatTerm", () => {
  it("renders months, years, and mixed terms", () => {
    expect(formatTerm(7)).toBe("7 mo");
    expect(formatTerm(12)).toBe("1 yr");
    expect(formatTerm(18)).toBe("1 yr 6 mo");
    expect(formatTerm(24)).toBe("2 yrs");
    expect(formatTerm(30)).toBe("2 yrs 6 mo");
  });
});
