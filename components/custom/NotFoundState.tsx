"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToggleRow } from "@/components/custom/ToggleRow";
import { defaultLang, getDictionary, isLang } from "@/lib/i18n";

const textLinkClass =
  "mt-6 inline-flex min-h-11 items-center font-sans text-sm text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function NotFoundState() {
  const pathname = usePathname() || `/${defaultLang}`;
  const segment = pathname.split("/")[1] ?? "";
  const lang = isLang(segment) ? segment : defaultLang;
  const dict = getDictionary(lang);

  // notFound() under a dynamic root layout is served from Next's minimal error
  // document, which has no lang attribute. Set it before assistive tech reads
  // the hydrated page.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = dict.notFound.title;
  }, [lang, dict.notFound.title]);

  return (
    <div className="mx-auto max-w-[480px] px-4 py-12 md:py-16">
      <ToggleRow lang={lang} a11y={dict.a11y} />
      <main id="main-content">
        <h1 className="font-sans text-3xl font-bold">{dict.notFound.title}</h1>
        <p className="mt-3 font-serif text-base leading-[1.75] text-muted-foreground">
          {dict.notFound.body}
        </p>
        <Link href={`/${lang}`} className={textLinkClass}>
          {dict.notFound.home}
        </Link>
      </main>
    </div>
  );
}
