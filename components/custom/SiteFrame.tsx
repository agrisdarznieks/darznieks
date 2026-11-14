import { ToggleRow } from "@/components/custom/ToggleRow";
import { getDictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";

/** The homepage column: same width, type, and toggle row. No new visual system. */
export function SiteFrame({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  const dict = getDictionary(lang);
  return (
    <div className="mx-auto max-w-[480px] px-4 py-12 md:py-16">
      <ToggleRow lang={lang} a11y={dict.a11y} />
      {children}
    </div>
  );
}
