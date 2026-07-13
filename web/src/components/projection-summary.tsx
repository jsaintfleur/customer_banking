import type { ReactNode } from "react";

export interface SummaryStat {
  label: string;
  value: string;
  /** Optional semantic tint; meaning is always carried by the label too. */
  tone?: "default" | "positive" | "gold" | "warning";
}

const toneClass: Record<NonNullable<SummaryStat["tone"]>, string> = {
  default: "text-foreground",
  positive: "text-positive",
  gold: "text-gold",
  warning: "text-warning",
};

/** Grid of headline numbers plus a plain-language sentence beneath. */
export function ProjectionSummary({
  stats,
  narrative,
}: {
  stats: SummaryStat[];
  narrative?: ReactNode;
}) {
  return (
    <div className="animate-rise space-y-4" aria-live="polite">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-surface-raised p-3">
            <dt className="text-xs uppercase tracking-wide text-muted">{stat.label}</dt>
            <dd className={`mt-1 text-lg font-semibold tabular-nums ${toneClass[stat.tone ?? "default"]}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      {narrative && <p className="text-sm leading-relaxed text-muted">{narrative}</p>}
    </div>
  );
}
