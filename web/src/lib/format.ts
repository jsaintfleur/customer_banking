/**
 * Display formatting — the engine's single rounding boundary.
 *
 * All engine math runs at full double precision; Intl.NumberFormat rounds to
 * cents here, at display time only. This mirrors the Python engine's policy
 * (formatting.py), so CLI and web output agree to the cent.
 */

export type Currency = "USD" | "EUR" | "GBP" | "CAD";

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "CAD"];

const formatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: Currency, compact: boolean): Intl.NumberFormat {
  const key = `${currency}:${compact}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      ...(compact
        ? { notation: "compact", maximumFractionDigits: 1 }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/** "$1,234.50" — full currency precision for summaries and tables. */
export function formatCurrency(value: number, currency: Currency = "USD"): string {
  return currencyFormatter(currency, false).format(value);
}

/** "$1.2K" — compact form for chart axis ticks. */
export function formatCurrencyCompact(value: number, currency: Currency = "USD"): string {
  return currencyFormatter(currency, true).format(value);
}

/** 0.0512 → "5.12%". */
export function formatPercent(fraction: number, decimals = 2): string {
  return `${(fraction * 100).toFixed(decimals)}%`;
}

/** 18 → "1 yr 6 mo"; 12 → "1 yr"; 7 → "7 mo". */
export function formatTerm(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return years === 1 ? "1 yr" : `${years} yrs`;
  return `${years} yr${years > 1 ? "s" : ""} ${rest} mo`;
}
