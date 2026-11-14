import { urlFor, type SanityImageSource } from "@/sanity/lib/image";
import { pickLocale, type LocaleValue } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";

export interface CoverImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface RawCover {
  alt?: LocaleValue;
  url?: string | null;
  width?: number | null;
  height?: number | null;
  asset?: SanityImageSource;
}

export function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (tag): tag is string => typeof tag === "string" && tag.trim().length > 0,
  );
}

export function mapCover(
  raw: RawCover | null | undefined,
  lang: Lang,
  altFallback: string,
): CoverImage | null {
  if (!raw?.url || !raw.width || !raw.height) return null;
  return {
    url: raw.url,
    width: raw.width,
    height: raw.height,
    alt: pickLocale(raw.alt, lang, altFallback),
  };
}

/** 1200×630 social image. Returns null when Sanity has no asset to crop. */
export function socialImageUrl(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  try {
    return urlFor(source as SanityImageSource).width(1200).height(630).fit("crop").url();
  } catch {
    return null;
  }
}

export function formatPublished(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "lv" ? "lv-LV" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
