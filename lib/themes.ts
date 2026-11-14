import { SANITY_TAGS } from "@/lib/cache";
import { mapCover, type CoverImage, type RawCover } from "@/lib/cms";
import { pickLocale, pickLocaleOrNull, type LocaleValue } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";
import { getPosts } from "@/lib/writing";
import type { PostSummary } from "@/lib/writing";
import { sanityFetch } from "@/sanity/lib/fetch";
import { routableThemesQuery, themeBySlugQuery } from "@/sanity/lib/queries";

export interface ThemeLink {
  slug: string;
  name: string;
}

export interface ThemeHub {
  slug: string;
  name: string;
  tagline: string | null;
  intro: string | null;
  cover: CoverImage | null;
  posts: PostSummary[];
  updatedAt: string | null;
}

interface RawTheme {
  _id?: string;
  name?: LocaleValue;
  slug?: string | null;
  tagline?: LocaleValue;
  taglineApproval?: string | null;
  intro?: LocaleValue;
  status?: string | null;
  _updatedAt?: string | null;
  coverImage?: RawCover | null;
}

function mapTheme(raw: RawTheme, lang: Lang, posts: PostSummary[]): ThemeHub | null {
  const slug = raw.slug?.trim();
  const name = pickLocaleOrNull(raw.name, lang);
  if (!slug || slug === "base" || !name || posts.length === 0) return null;
  return {
    slug,
    name,
    tagline: raw.taglineApproval === "approved" ? pickLocaleOrNull(raw.tagline, lang) : null,
    intro: raw.status === "published" ? pickLocaleOrNull(raw.intro, lang) : null,
    cover: mapCover(raw.coverImage, lang, name),
    posts,
    updatedAt: raw._updatedAt ?? null,
  };
}

export async function getRoutableThemes(lang: Lang): Promise<ThemeLink[]> {
  try {
    const rows = await sanityFetch<RawTheme[] | null>(routableThemesQuery, {}, [
      SANITY_TAGS.theme,
      SANITY_TAGS.post,
    ]);
    if (!Array.isArray(rows)) return [];
    return rows.flatMap((row) => {
      const slug = row.slug?.trim();
      const name = slug ? pickLocale(row.name, lang, slug) : null;
      return slug && name && slug !== "base" ? [{ slug, name }] : [];
    });
  } catch (error) {
    console.error("Sanity themes failed.", error);
    return [];
  }
}

export async function getThemeHub(lang: Lang, slug: string): Promise<ThemeHub | null> {
  if (!slug || slug === "base") return null;
  const raw = await sanityFetch<RawTheme | null>(themeBySlugQuery, { slug }, [
    SANITY_TAGS.theme,
    SANITY_TAGS.post,
  ]);
  if (!raw?._id) return null;
  const posts = (await getPosts(lang)).filter((post) => post.theme?.slug === slug);
  return mapTheme(raw, lang, posts);
}
