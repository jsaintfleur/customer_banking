"use client";

/**
 * Top navigation. Desktop shows inline links; mobile collapses into an
 * accessible disclosure menu (real button, aria-expanded, Escape to close).
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/savings", label: "Savings Calculator" },
  { href: "/cd", label: "CD Calculator" },
  { href: "/compare", label: "Compare" },
  { href: "/ladder", label: "CD Ladder" },
  { href: "/learn", label: "Learn" },
  { href: "/methodology", label: "Methodology" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-surface/95 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <span aria-hidden className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-primary to-secondary" />
          Savings Growth Planner
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-background ${
                pathname === link.href ? "font-semibold text-primary" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
            onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t bg-surface px-4 pb-4 lg:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`block rounded-md px-3 py-3 text-sm ${
                pathname === link.href ? "font-semibold text-primary" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
