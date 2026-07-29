"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/types";

const STORAGE_KEY = "darznieks-consent";

/**
 * Minimal GDPR consent gate for Google Consent Mode v2.
 *
 * On accept: flips `analytics_storage` to granted (GA4, routed through GTM, then
 * sets cookies) and pushes a `consent_granted` dataLayer event (the trigger that
 * fires the Clarity tag). On decline: consent stays at the denied default set in
 * app/layout.tsx, so GA4 sends only cookieless pings and Clarity never loads.
 */
export function ConsentBanner({ strings }: { strings: Dictionary["consent"] }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // localStorage unavailable (private mode) — show the banner, default denied.
      setVisible(true);
    }
  }, []);

  function persist(value: "granted" | "denied") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore — the denied default already applies for this session.
    }
    setVisible(false);
  }

  function accept() {
    window.gtag?.("consent", "update", {
      analytics_storage: "granted",
      functionality_storage: "granted",
      security_storage: "granted",
    });
    window.dataLayer?.push({ event: "consent_granted" });
    persist("granted");
  }

  if (!visible) return null;

  return (
    <aside
      aria-labelledby="consent-message"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-[480px] rounded-lg border border-border bg-card p-4 shadow-lg"
    >
      <p
        id="consent-message"
        className="font-sans text-sm leading-relaxed text-muted-foreground"
      >
        {strings.message}
      </p>
      <div className="mt-3 flex gap-2">
        <Button onClick={accept} className="h-11 flex-1">
          {strings.accept}
        </Button>
        <Button variant="ghost" onClick={() => persist("denied")} className="h-11 flex-1">
          {strings.decline}
        </Button>
      </div>
    </aside>
  );
}
