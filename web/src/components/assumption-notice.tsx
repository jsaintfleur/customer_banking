import type { ReactNode } from "react";

/** Consistent, non-alarming notice that spells out modeling assumptions. */
export function AssumptionNotice({ children }: { children: ReactNode }) {
  return (
    <aside
      role="note"
      className="rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm leading-relaxed"
    >
      <span className="font-medium">Assumptions: </span>
      {children}
    </aside>
  );
}
