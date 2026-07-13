/** Route-transition skeleton. */
export default function Loading() {
  return (
    <div className="space-y-4 py-10" role="status" aria-label="Loading page">
      <div className="h-8 w-64 animate-pulse rounded-md bg-surface-raised" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-surface-raised" />
      <div className="h-64 animate-pulse rounded-xl bg-surface-raised" />
    </div>
  );
}
