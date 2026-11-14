"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = resolvedTheme === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border px-3 font-sans text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {mounted ? (dark ? "Light" : "Dark") : "Theme"}
    </button>
  );
}
