/**
 * Shared Zod schemas for every calculator form.
 *
 * Bounds mirror the Python engine's validation.py. Validation never silently
 * corrects input — out-of-range values produce a respectful message and the
 * projection simply doesn't update until the input is valid.
 */

import { z } from "zod";

export const MAX_AMOUNT = 1e12; // $1 trillion
export const MAX_RATE_PCT = 100; // rates are entered as percents in the UI
export const MAX_MONTHS = 1200; // 100 years

// Form inputs arrive as strings. Unlike z.coerce, this preprocessor maps an
// empty string to NaN (which z.number() rejects) instead of silently
// coercing it to 0 — empty input must produce a message, not a value.
const toNumber = (value: unknown) =>
  typeof value === "string" ? (value.trim() === "" ? NaN : Number(value)) : value;

const amount = (name: string) =>
  z.preprocess(
    toNumber,
    z
      .number({ error: `${name} must be a number.` })
      .nonnegative(`${name} cannot be negative.`)
      .max(MAX_AMOUNT, `${name} cannot exceed $1 trillion.`),
  );

const ratePct = (name: string) =>
  z.preprocess(
    toNumber,
    z
      .number({ error: `${name} must be a number.` })
      .nonnegative(`${name} cannot be negative.`)
      .max(MAX_RATE_PCT, `${name} above 100% per year isn't supported.`),
  );

const months = (name: string) =>
  z.preprocess(
    toNumber,
    z
      .number({ error: `${name} must be a number.` })
      .int(`${name} must be a whole number of months.`)
      .min(1, `${name} must be at least 1 month.`)
      .max(MAX_MONTHS, `${name} cannot exceed 1200 months (100 years).`),
  );

export const rateBasisSchema = z.enum(["APY", "APR"]);
export const compoundingSchema = z.coerce
  .number()
  .pipe(z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(12), z.literal(365)]));
export const timingSchema = z.enum(["beginning", "end"]);
export const currencySchema = z.enum(["USD", "EUR", "GBP", "CAD"]);

export const savingsFormSchema = z.object({
  principal: amount("Starting balance"),
  ratePct: ratePct("Rate"),
  rateBasis: rateBasisSchema,
  compounding: compoundingSchema,
  months: months("Time horizon"),
  monthlyContribution: amount("Monthly contribution"),
  timing: timingSchema,
  inflationPct: ratePct("Inflation rate"),
  currency: currencySchema,
});

export type SavingsFormValues = z.infer<typeof savingsFormSchema>;
/** Raw (pre-parse) form shape — what react-hook-form holds before Zod runs. */
export type SavingsFormInput = z.input<typeof savingsFormSchema>;

export const cdFormSchema = z
  .object({
    principal: amount("Initial deposit").refine((v) => v > 0, {
      message: "Initial deposit must be greater than zero.",
    }),
    ratePct: ratePct("Rate"),
    rateBasis: rateBasisSchema,
    compounding: compoundingSchema,
    termMonths: months("CD term"),
    modelEarlyWithdrawal: z.boolean(),
    earlyWithdrawalMonth: z.preprocess(
      toNumber,
      z
        .number({ error: "Withdrawal month must be a number." })
        .int("Withdrawal month must be a whole number.")
        .min(1, "Withdrawal month must be at least 1.")
        .optional(),
    ),
    penaltyMonths: z.preprocess(
      toNumber,
      z
        .number({ error: "Penalty must be a number." })
        .nonnegative("Penalty cannot be negative.")
        .max(60, "Penalty cannot exceed 60 months of interest.")
        .optional(),
    ),
    currency: currencySchema,
  })
  .superRefine((values, ctx) => {
    if (!values.modelEarlyWithdrawal) return;
    if (values.earlyWithdrawalMonth === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["earlyWithdrawalMonth"],
        message: "Enter the withdrawal month.",
      });
    } else if (values.earlyWithdrawalMonth >= values.termMonths) {
      ctx.addIssue({
        code: "custom",
        path: ["earlyWithdrawalMonth"],
        message: "Withdrawal must happen before maturity — at maturity there is no penalty.",
      });
    }
    if (values.penaltyMonths === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["penaltyMonths"],
        message: "Enter a penalty assumption (0 for a no-penalty CD).",
      });
    }
  });

export type CDFormValues = z.infer<typeof cdFormSchema>;
/** Raw (pre-parse) form shape — what react-hook-form holds before Zod runs. */
export type CDFormInput = z.input<typeof cdFormSchema>;

export const comparisonScenarioSchema = z.object({
  label: z.string().min(1, "Give this scenario a name.").max(40),
  kind: z.enum(["savings", "cd"]),
  principal: amount("Starting balance"),
  ratePct: ratePct("APY"),
  months: months("Term"),
  monthlyContribution: amount("Monthly contribution"),
});

export type ComparisonScenario = z.infer<typeof comparisonScenarioSchema>;

export const ladderRungSchema = z.object({
  termMonths: months("Rung term"),
  ratePct: ratePct("Rung APY"),
});

export const ladderFormSchema = z.object({
  totalAmount: amount("Total amount").refine((v) => v > 0, {
    message: "Total amount must be greater than zero.",
  }),
  rungs: z
    .array(ladderRungSchema)
    .min(1, "A ladder needs at least one rung.")
    .max(12, "A ladder cannot have more than 12 rungs."),
  currency: currencySchema,
});

export type LadderFormValues = z.infer<typeof ladderFormSchema>;
