/**
 * Savings Growth Planner — calculation engine.
 *
 * This is a line-for-line mirror of the tested Python engine in
 * `src/customer_banking/` (rates.py, savings.py, cd.py, ladder.py). Both
 * engines compute in IEEE-754 doubles and round only at the display
 * boundary, so CLI and web results agree to the cent. If you change a
 * formula here, change it there and in /methodology too.
 *
 * Conventions:
 * - Rates are fractions (0.05 = 5%), never percents.
 * - APR is the nominal annual rate; APY is the effective annual yield.
 * - All projections are educational estimates from user assumptions —
 *   nothing here predicts or guarantees actual bank behavior.
 */

export type RateBasis = "APR" | "APY";
export type ContributionTiming = "beginning" | "end";
export type CompoundingPeriods = 1 | 2 | 4 | 12 | 365;

export const COMPOUNDING_LABELS: Record<CompoundingPeriods, string> = {
  1: "Annually",
  2: "Semiannually",
  4: "Quarterly",
  12: "Monthly",
  365: "Daily",
};

// ── Rate conversions ────────────────────────────────────────────────────────

/** Effective annual yield for a nominal rate compounded m times per year. */
export function aprToApy(apr: number, periodsPerYear: number): number {
  return Math.pow(1 + apr / periodsPerYear, periodsPerYear) - 1;
}

/** Nominal annual rate that produces the given APY at m periods per year. */
export function apyToApr(apy: number, periodsPerYear: number): number {
  return periodsPerYear * (Math.pow(1 + apy, 1 / periodsPerYear) - 1);
}

/**
 * Effective per-period rate that compounds to the given APY. Because APY
 * already encodes compounding, the monthly rate derived from it reproduces
 * the same annual growth regardless of the bank's internal frequency.
 */
export function apyToPeriodicRate(apy: number, periodsPerYear: number): number {
  return Math.pow(1 + apy, 1 / periodsPerYear) - 1;
}

/** Inflation-adjusted (real) rate via the exact Fisher relation. */
export function realRate(nominalRate: number, inflationRate: number): number {
  return (1 + nominalRate) / (1 + inflationRate) - 1;
}

/** Deflate a future nominal value into today's purchasing power. */
export function inflationAdjustedValue(
  nominalValue: number,
  inflationRate: number,
  years: number,
): number {
  return nominalValue / Math.pow(1 + inflationRate, years);
}

/** Normalize an annual rate to APY according to its basis. */
export function resolveApy(
  annualRate: number,
  rateBasis: RateBasis,
  compounding: CompoundingPeriods,
): number {
  return rateBasis === "APR" ? aprToApy(annualRate, compounding) : annualRate;
}

// ── Savings projection ──────────────────────────────────────────────────────

export interface MonthPoint {
  month: number;
  balance: number;
  contributionsToDate: number;
  interestToDate: number;
}

export interface SavingsInput {
  principal: number;
  annualRate: number;
  months: number;
  rateBasis?: RateBasis;
  compounding?: CompoundingPeriods;
  monthlyContribution?: number;
  timing?: ContributionTiming;
  inflationRate?: number | null;
}

export interface SavingsProjection {
  principal: number;
  months: number;
  apy: number;
  monthlyContribution: number;
  timing: ContributionTiming;
  endingBalance: number;
  totalContributions: number;
  interestEarned: number;
  effectiveGrowthPct: number;
  inflationRate: number | null;
  realEndingBalance: number | null;
  schedule: MonthPoint[];
}

/**
 * Month-by-month savings simulation. Contributions land at the beginning
 * (annuity-due) or end (ordinary annuity) of each month; end is the
 * conservative default. See /methodology for assumptions.
 */
export function projectSavings(input: SavingsInput): SavingsProjection {
  const {
    principal,
    annualRate,
    months,
    rateBasis = "APY",
    compounding = 12,
    monthlyContribution = 0,
    timing = "end",
    inflationRate = null,
  } = input;

  const apy = resolveApy(annualRate, rateBasis, compounding);
  const monthlyRate = apyToPeriodicRate(apy, 12);

  let balance = principal;
  let contributions = 0;
  const schedule: MonthPoint[] = [];

  for (let month = 1; month <= months; month++) {
    if (timing === "beginning") {
      balance += monthlyContribution;
      contributions += monthlyContribution;
    }
    balance *= 1 + monthlyRate;
    if (timing === "end") {
      balance += monthlyContribution;
      contributions += monthlyContribution;
    }
    schedule.push({
      month,
      balance,
      contributionsToDate: contributions,
      interestToDate: balance - principal - contributions,
    });
  }

  const totalIn = principal + contributions;
  return {
    principal,
    months,
    apy,
    monthlyContribution,
    timing,
    endingBalance: balance,
    totalContributions: contributions,
    interestEarned: balance - totalIn,
    effectiveGrowthPct: totalIn > 0 ? balance / totalIn - 1 : 0,
    inflationRate,
    realEndingBalance:
      inflationRate !== null
        ? inflationAdjustedValue(balance, inflationRate, months / 12)
        : null,
    schedule,
  };
}

// ── CD projection ───────────────────────────────────────────────────────────

export interface CDInput {
  principal: number;
  annualRate: number;
  termMonths: number;
  rateBasis?: RateBasis;
  compounding?: CompoundingPeriods;
  earlyWithdrawalMonth?: number | null;
  penaltyMonths?: number | null;
}

export interface CDProjection {
  principal: number;
  termMonths: number;
  apy: number;
  maturityBalance: number;
  interestEarned: number;
  earlyWithdrawalMonth: number | null;
  penaltyMonths: number | null;
  balanceAtWithdrawal: number | null;
  penaltyAmount: number | null;
  earlyWithdrawalBalance: number | null;
  penaltyExceedsInterest: boolean;
  costOfEarlyWithdrawal: number | null;
  schedule: MonthPoint[];
}

/**
 * CD projection to maturity with an optional early-withdrawal scenario. The
 * penalty is the common "k months of interest" structure, computed on the
 * balance at withdrawal and capped so the payout can't go below zero. Real
 * bank penalty terms vary — the k is a user-supplied assumption.
 */
export function projectCD(input: CDInput): CDProjection {
  const {
    principal,
    annualRate,
    termMonths,
    rateBasis = "APY",
    compounding = 12,
    earlyWithdrawalMonth = null,
    penaltyMonths = null,
  } = input;

  const apy = resolveApy(annualRate, rateBasis, compounding);
  const monthlyRate = apyToPeriodicRate(apy, 12);

  let balance = principal;
  const schedule: MonthPoint[] = [];
  for (let month = 1; month <= termMonths; month++) {
    balance *= 1 + monthlyRate;
    schedule.push({
      month,
      balance,
      contributionsToDate: 0,
      interestToDate: balance - principal,
    });
  }

  const maturityBalance = balance;
  let balanceAtWithdrawal: number | null = null;
  let penaltyAmount: number | null = null;
  let earlyWithdrawalBalance: number | null = null;
  let penaltyExceedsInterest = false;
  let costOfEarlyWithdrawal: number | null = null;

  if (earlyWithdrawalMonth !== null && penaltyMonths !== null) {
    balanceAtWithdrawal = schedule[earlyWithdrawalMonth - 1].balance;
    penaltyAmount = Math.min(
      balanceAtWithdrawal * monthlyRate * penaltyMonths,
      balanceAtWithdrawal,
    );
    earlyWithdrawalBalance = balanceAtWithdrawal - penaltyAmount;
    penaltyExceedsInterest = penaltyAmount > balanceAtWithdrawal - principal;
    costOfEarlyWithdrawal = maturityBalance - earlyWithdrawalBalance;
  }

  return {
    principal,
    termMonths,
    apy,
    maturityBalance,
    interestEarned: maturityBalance - principal,
    earlyWithdrawalMonth,
    penaltyMonths: earlyWithdrawalMonth !== null ? penaltyMonths : null,
    balanceAtWithdrawal,
    penaltyAmount,
    earlyWithdrawalBalance,
    penaltyExceedsInterest,
    costOfEarlyWithdrawal,
    schedule,
  };
}

// ── CD ladder ───────────────────────────────────────────────────────────────

export interface LadderRungInput {
  termMonths: number;
  apy: number;
}

export interface LadderRung extends LadderRungInput {
  allocation: number;
  maturityBalance: number;
  interestEarned: number;
}

export interface LadderPlan {
  totalAllocated: number;
  rungs: LadderRung[];
  totalMaturityValue: number;
  totalInterest: number;
}

/** Equal-split CD ladder: each rung is an independent CD projection. */
export function buildLadder(
  totalAmount: number,
  rungs: LadderRungInput[],
): LadderPlan {
  const allocation = totalAmount / rungs.length;
  const built = rungs.map((rung) => {
    const cd = projectCD({
      principal: allocation,
      annualRate: rung.apy,
      termMonths: rung.termMonths,
    });
    return {
      ...rung,
      allocation,
      maturityBalance: cd.maturityBalance,
      interestEarned: cd.interestEarned,
    };
  });
  const totalMaturityValue = built.reduce((sum, r) => sum + r.maturityBalance, 0);
  return {
    totalAllocated: totalAmount,
    rungs: built,
    totalMaturityValue,
    totalInterest: totalMaturityValue - totalAmount,
  };
}
