import { SANITY_TAGS } from "@/lib/cache";
import { asTags, mapCover, socialImageUrl, type CoverImage, type RawCover } from "@/lib/cms";
import { pickBlocks, pickLocale, pickLocaleOrNull, type LocaleValue } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import type { SanityImageSource } from "@/sanity/lib/image";
import { postBySlugQuery, postSlugsQuery, postsQuery } from "@/sanity/lib/queries";

export interface PostTheme {
  slug: string;
  name: string;
  routable: boolean;
}

export interface PostSummary {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string | null;
  tags: string[];
  cover: CoverImage | null;
  updatedAt: string | null;
  theme: PostTheme | null;
}

export interface Post extends PostSummary {
  body: unknown[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
}

export interface ContentSlug {
  slug: string;
  publishedAt: string | null;
  updatedAt: string | null;
}

interface RawSeo {
  metaTitle?: LocaleValue;
  metaDescription?: LocaleValue;
  ogImage?: SanityImageSource;
}

interface RawPost {
  title?: LocaleValue;
  slug?: string | null;
  publishedAt?: string | null;
  excerpt?: LocaleValue;
  body?: { en?: unknown; lv?: unknown } | null;
  tags?: unknown;
  theme?: { name?: LocaleValue; slug?: string | null } | null;
  themeRoutable?: boolean | null;
  coverImage?: RawCover | null;
  seo?: RawSeo | null;
  _updatedAt?: string | null;
}

function mapSummary(raw: RawPost, lang: Lang): PostSummary | null {
  const slug = raw.slug?.trim();
  const title = pickLocaleOrNull(raw.title, lang);
  if (!slug || !title || !raw.publishedAt) return null;
  return {
    slug,
    title,
    publishedAt: raw.publishedAt,
    excerpt: pickLocaleOrNull(raw.excerpt, lang),
    tags: asTags(raw.tags),
    cover: mapCover(raw.coverImage, lang, title),
    updatedAt: raw._updatedAt ?? null,
    theme: raw.theme?.slug
      ? {
          slug: raw.theme.slug,
          name: pickLocale(raw.theme.name, lang, raw.theme.slug),
          routable: raw.themeRoutable === true && raw.theme.slug !== "base",
        }
      : null,
  };
}

export async function getPostSlugs(): Promise<ContentSlug[]> {
  try {
    const rows = await sanityFetch<RawPost[] | null>(postSlugsQuery, {}, [
      SANITY_TAGS.post,
    ]);
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const slug = row.slug?.trim();
      return slug
        ? [{ slug, publishedAt: row.publishedAt ?? null, updatedAt: row._updatedAt ?? null }]
        : [];
    });
  } catch (error) {
    console.error("Sanity post slugs failed.", error);
    return [];
  }
}

export async function getPosts(lang: Lang): Promise<PostSummary[]> {
  try {
    const rows = await sanityFetch<RawPost[] | null>(postsQuery, {}, [
      SANITY_TAGS.post,
    ]);
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const mapped = mapSummary(row, lang);
      return mapped ? [mapped] : [];
    });
  } catch (error) {
    console.error("Sanity posts failed.", error);
    return [];
  }
}

export async function getPost(lang: Lang, slug: string): Promise<Post | null> {
  const raw = await sanityFetch<RawPost | null>(
    postBySlugQuery,
    { slug },
    [SANITY_TAGS.post],
  );
  const summary = raw ? mapSummary(raw, lang) : null;
  if (!raw || !summary) return null;
  return {
    ...summary,
    body: pickBlocks(raw.body, lang),
    metaTitle: pickLocaleOrNull(raw.seo?.metaTitle, lang),
    metaDescription: pickLocaleOrNull(raw.seo?.metaDescription, lang),
    ogImageUrl:
      socialImageUrl(raw.seo?.ogImage) ?? socialImageUrl(raw.coverImage),
  };
}
