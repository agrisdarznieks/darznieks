import { SANITY_TAGS } from "@/lib/cache";
import { asTags, mapCover, socialImageUrl, type CoverImage, type RawCover } from "@/lib/cms";
import { pickBlocks, pickLocaleOrNull, type LocaleValue } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import type { SanityImageSource } from "@/sanity/lib/image";
import {
  caseStudyBySlugQuery,
  caseStudiesQuery,
  caseStudySlugsQuery,
} from "@/sanity/lib/queries";

export interface RelatedWriting {
  slug: string;
  title: string;
}

export interface CaseStudySummary {
  slug: string;
  title: string;
  client: string | null;
  role: string | null;
  timeframe: string | null;
  summary: string | null;
  featured: boolean;
  tags: string[];
  cover: CoverImage | null;
  updatedAt: string | null;
}

export interface CaseStudy extends CaseStudySummary {
  problem: string | null;
  approach: unknown[] | null;
  outcomes: unknown[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  related: RelatedWriting[];
}

export interface ContentSlug {
  slug: string;
  updatedAt: string | null;
}

interface RawSeo {
  metaTitle?: LocaleValue;
  metaDescription?: LocaleValue;
  ogImage?: SanityImageSource;
}

interface RawCaseStudy {
  title?: LocaleValue;
  slug?: string | null;
  client?: LocaleValue;
  role?: LocaleValue;
  timeframe?: LocaleValue;
  summary?: LocaleValue;
  problem?: LocaleValue;
  approach?: { en?: unknown; lv?: unknown } | null;
  outcomes?: { en?: unknown; lv?: unknown } | null;
  featured?: boolean | null;
  tags?: unknown;
  year?: number | null;
  clientName?: string | null;
  clientPublicName?: string | null;
  facts?: { mayBePublic?: string | null } | null;
  relatedWriting?: { slug?: string | null; title?: LocaleValue }[] | null;
  coverImage?: RawCover | null;
  seo?: RawSeo | null;
  _updatedAt?: string | null;
}

function cleared(raw: RawCaseStudy): boolean {
  return !raw.facts || raw.facts.mayBePublic === "yes";
}

function mapSummary(raw: RawCaseStudy, lang: Lang): CaseStudySummary | null {
  const slug = raw.slug?.trim();
  const title = pickLocaleOrNull(raw.title, lang);
  if (!slug || !title) return null;
  const showFacts = cleared(raw);
  const client =
    raw.clientPublicName?.trim() ||
    raw.clientName?.trim() ||
    pickLocaleOrNull(raw.client, lang);
  const year = typeof raw.year === "number" ? String(raw.year) : null;
  return {
    slug,
    title,
    client: showFacts ? client : null,
    role: showFacts ? pickLocaleOrNull(raw.role, lang) : null,
    timeframe: showFacts ? year || pickLocaleOrNull(raw.timeframe, lang) : null,
    summary: pickLocaleOrNull(raw.summary, lang),
    featured: raw.featured === true,
    tags: asTags(raw.tags),
    cover: mapCover(raw.coverImage, lang, title),
    updatedAt: raw._updatedAt ?? null,
  };
}

export async function getCaseStudySlugs(): Promise<ContentSlug[]> {
  try {
    const rows = await sanityFetch<RawCaseStudy[] | null>(
      caseStudySlugsQuery,
      {},
      [SANITY_TAGS.caseStudy],
    );
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const slug = row.slug?.trim();
      return slug ? [{ slug, updatedAt: row._updatedAt ?? null }] : [];
    });
  } catch (error) {
    console.error("Sanity case study slugs failed.", error);
    return [];
  }
}

export async function getCaseStudies(lang: Lang): Promise<CaseStudySummary[]> {
  try {
    const rows = await sanityFetch<RawCaseStudy[] | null>(
      caseStudiesQuery,
      {},
      [SANITY_TAGS.caseStudy],
    );
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const mapped = mapSummary(row, lang);
      return mapped ? [mapped] : [];
    });
  } catch (error) {
    console.error("Sanity case studies failed.", error);
    return [];
  }
}

export async function getCaseStudy(
  lang: Lang,
  slug: string,
): Promise<CaseStudy | null> {
  const raw = await sanityFetch<RawCaseStudy | null>(
    caseStudyBySlugQuery,
    { slug },
    [SANITY_TAGS.caseStudy],
  );
  const summary = raw ? mapSummary(raw, lang) : null;
  if (!raw || !summary) return null;
  return {
    ...summary,
    problem: pickLocaleOrNull(raw.problem, lang),
    approach: pickBlocks(raw.approach, lang),
    outcomes: pickBlocks(raw.outcomes, lang),
    metaTitle: pickLocaleOrNull(raw.seo?.metaTitle, lang),
    metaDescription: pickLocaleOrNull(raw.seo?.metaDescription, lang),
    ogImageUrl:
      socialImageUrl(raw.seo?.ogImage) ?? socialImageUrl(raw.coverImage),
    related: (raw.relatedWriting ?? []).flatMap((item) => {
      const relatedSlug = item.slug?.trim();
      const relatedTitle = pickLocaleOrNull(item.title, lang);
      return relatedSlug && relatedTitle ? [{ slug: relatedSlug, title: relatedTitle }] : [];
    }),
  };
}
