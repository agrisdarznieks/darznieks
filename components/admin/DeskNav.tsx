"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/case-studies", label: "Case studies" },
  { href: "/admin/themes", label: "Themes" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/questions", label: "Questions" },
  { href: "/admin/integrity", label: "Integrity" },
  { href: "/admin/studio", label: "Studio" },
];

function current(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DeskNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="border-b border-border lg:border-b-0 lg:border-r">
      <div className="flex items-center lg:hidden">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center px-4 font-sans text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          aria-expanded={open}
          aria-controls="desk-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <nav
        id="desk-nav"
        aria-label="Desk"
        className={cn("px-3 py-2 lg:px-4 lg:py-6", open ? "block" : "hidden lg:block")}
      >
        <ul className="flex flex-col">
          {ITEMS.map((item) => {
            const active = current(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center border-l-2 px-3 font-sans text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                    active
                      ? "border-accent font-semibold text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
