import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-24">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-muted">
        That page doesn&apos;t exist. The calculators are all reachable from
        the navigation above.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground"
      >
        Back to overview
      </Link>
    </div>
  );
}
