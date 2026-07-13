import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-surface">
      <div className="mx-auto max-w-6xl space-y-3 px-4 py-8 text-sm text-muted sm:px-6">
        <p className="max-w-3xl">
          This application provides educational projections based on
          user-entered assumptions. It does not provide banking, investment,
          tax, or financial advice, and it does not guarantee future returns.
          It is not a bank and holds no accounts or customer data.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/methodology" className="underline hover:text-foreground">
            Methodology
          </Link>
          <a
            href="https://github.com/jsaintfleur/customer_banking"
            className="underline hover:text-foreground"
            rel="noreferrer"
          >
            Source code
          </a>
          <span>No accounts. No tracking of your numbers.</span>
        </p>
      </div>
    </footer>
  );
}
