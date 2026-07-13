import Link from "next/link";

/** Collapsible "how is this calculated?" block linking to /methodology. */
export function MethodologyDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-lg border bg-surface px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium">
        How is this calculated?
      </summary>
      <div className="mt-2 space-y-2 leading-relaxed text-muted">
        {children}
        <p>
          Full formulas and assumptions:{" "}
          <Link href="/methodology" className="underline">
            Methodology
          </Link>
          .
        </p>
      </div>
    </details>
  );
}
