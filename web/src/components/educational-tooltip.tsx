"use client";

/**
 * Inline term explainer. Uses a native <details> disclosure rather than a
 * hover tooltip so it works with keyboards, touch, and screen readers.
 */
export function EducationalTooltip({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <details className="inline-block align-baseline">
      <summary className="cursor-pointer list-none text-sm underline decoration-dotted underline-offset-2 text-info">
        {term}
        <span aria-hidden> ⓘ</span>
      </summary>
      <span className="mt-1 block max-w-md rounded-md border bg-surface-raised px-3 py-2 text-xs leading-relaxed text-muted">
        {children}
      </span>
    </details>
  );
}
