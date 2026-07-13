"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/** Light/dark toggle. Renders a stable placeholder until mounted so the
 * server-rendered markup never disagrees with the client theme. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={mounted ? `Switch to ${dark ? "light" : "dark"} mode` : "Toggle theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-background"
    >
      <span aria-hidden>{mounted ? (dark ? "☀️" : "🌙") : "◐"}</span>
    </button>
  );
}
