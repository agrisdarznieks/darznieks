"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import type { Dictionary, Lang } from "@/lib/i18n/types";

interface ToggleRowProps {
  lang: Lang;
  a11y: Dictionary["a11y"];
}

function swapLangInPath(pathname: string, target: Lang): string {
  const segments = pathname.split("/");
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}

function LanguageSwitcher({ lang, a11y }: ToggleRowProps) {
  const pathname = usePathname();

  const options: { code: Lang; label: string; aria: string }[] = [
    { code: "en", label: "EN", aria: a11y.switchToEn },
    { code: "lv", label: "LV", aria: a11y.switchToLv },
  ];

  return (
    <nav className="flex items-center gap-1" aria-label="Language">
      {options.map((option, index) => {
        const active = option.code === lang;
        return (
          <span key={option.code} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-muted-foreground">
                |
              </span>
            )}
            {active ? (
              <span
                aria-current="true"
                className="inline-flex min-h-[44px] items-center px-2 font-sans text-sm font-semibold text-foreground"
              >
                {option.label}
              </span>
            ) : (
              <Link
                href={swapLangInPath(pathname, option.code)}
                aria-label={option.aria}
                className="inline-flex min-h-[44px] items-center rounded-md px-2 font-sans text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {option.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function ThemeToggle({ a11y }: { a11y: Dictionary["a11y"] }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const label = isDark ? a11y.switchLight : a11y.switchDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-md text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {mounted ? (
        isDark ? (
          <Sun size={20} weight="bold" aria-hidden="true" />
        ) : (
          <Moon size={20} weight="bold" aria-hidden="true" />
        )
      ) : (
        <span className="size-5" aria-hidden="true" />
      )}
    </button>
  );
}

export function ToggleRow({ lang, a11y }: ToggleRowProps) {
  return (
    <div className={cn("flex items-center justify-end gap-3 mb-8")}>
      <LanguageSwitcher lang={lang} a11y={a11y} />
      <ThemeToggle a11y={a11y} />
    </div>
  );
}
