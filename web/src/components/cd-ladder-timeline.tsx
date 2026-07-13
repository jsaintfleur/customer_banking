"use client";

/**
 * Horizontal timeline of ladder rungs: each bar spans from opening to
 * maturity, with the maturity value marked. Rendered as semantic HTML (not
 * canvas/SVG) so it is inherently accessible and responsive.
 */

import type { LadderRung } from "@/lib/finance";
import { formatCurrency, formatTerm, type Currency } from "@/lib/format";

export function CDLadderTimeline({
  rungs,
  currency,
}: {
  rungs: LadderRung[];
  currency: Currency;
}) {
  const longest = Math.max(...rungs.map((rung) => rung.termMonths));
  return (
    <ol className="space-y-3" aria-label="CD ladder maturity timeline">
      {rungs.map((rung, index) => {
        const widthPct = Math.max(8, (rung.termMonths / longest) * 100);
        return (
          <li key={index} className="text-sm">
            <div className="mb-1 flex flex-wrap justify-between gap-2">
              <span className="font-medium">
                Rung {index + 1} · {formatCurrency(rung.allocation, currency)} at{" "}
                {(rung.apy * 100).toFixed(2)}% APY
              </span>
              <span className="text-muted">
                matures at {formatTerm(rung.termMonths)} →{" "}
                <span className="font-semibold text-gold">
                  {formatCurrency(rung.maturityBalance, currency)}
                </span>
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-surface-raised">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] motion-reduce:transition-none"
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
