"use client";

/** Route-level error boundary: friendly message plus a reset action. */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 py-24">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-muted">
        The page hit an unexpected error. Your inputs never leave the browser,
        so nothing was lost server-side — try again.
      </p>
      {error.digest && (
        <p className="text-xs text-muted">Reference: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground"
      >
        Try again
      </button>
    </div>
  );
}
