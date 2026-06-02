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
