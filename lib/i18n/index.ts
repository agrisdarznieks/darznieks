import { en } from "./en";
import { lv } from "./lv";
import type { Dictionary, Lang } from "./types";

export const languages: Lang[] = ["en", "lv"];
export const defaultLang: Lang = "en";

const dictionaries: Record<Lang, Dictionary> = { en, lv };

export function isLang(value: string): value is Lang {
  return (languages as string[]).includes(value);
}

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export type LocaleValue =
  | { en?: string | null; lv?: string | null }
  | null
  | undefined;

function nonEmpty(value: string | null | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

/** Latvian falls back to English, then to the supplied fallback. */
export function pickLocale(value: LocaleValue, lang: Lang, fallback = ""): string {
  return nonEmpty(value?.[lang]) ?? nonEmpty(value?.en) ?? fallback;
}

export function pickLocaleOrNull(value: LocaleValue, lang: Lang): string | null {
  return nonEmpty(value?.[lang]) ?? nonEmpty(value?.en);
}

type LocaleBlocks = { en?: unknown; lv?: unknown } | null | undefined;

/** Empty Latvian rich text falls back to the English blocks. */
export function pickBlocks(value: LocaleBlocks, lang: Lang): unknown[] | null {
  const preferred = value?.[lang];
  const fallback = value?.en;
  const chosen =
    Array.isArray(preferred) && preferred.length > 0 ? preferred : fallback;
  if (!Array.isArray(chosen) || chosen.length === 0) return null;
  return chosen;
}
