import "server-only";

import { pickBlocks, pickLocaleOrNull, type LocaleValue } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";
import { adminReadClient, adminReadToken } from "@/sanity/lib/admin";

export interface DraftPreview {
  title: string;
  slug: string;
  text: string | null;
  body: unknown[] | null;
}

const QUERY = `*[_type == $type && slug.current == $slug] | order(_updatedAt desc)[0]{
  title,
  "slug": slug.current,
  excerpt,
  summary,
  problem,
  body,
  approach
}`;

export async function loadDraftPreview(
  type: "post" | "caseStudy",
  lang: Lang,
  slug: string,
): Promise<{ missingToken: true } | { missingToken: false; doc: DraftPreview | null }> {
  if (!adminReadToken()) return { missingToken: true };
  const client = adminReadClient().withConfig({ perspective: "drafts" });
  const raw = await client.fetch<{
    title?: LocaleValue;
    slug?: string | null;
    excerpt?: LocaleValue;
    summary?: LocaleValue;
    problem?: LocaleValue;
    body?: { en?: unknown; lv?: unknown } | null;
    approach?: { en?: unknown; lv?: unknown } | null;
  } | null>(QUERY, { type, slug });
  const title = pickLocaleOrNull(raw?.title, lang);
  const found = raw?.slug?.trim();
  if (!raw || !title || !found) return { missingToken: false, doc: null };
  return {
    missingToken: false,
    doc: {
      title,
      slug: found,
      text: pickLocaleOrNull(raw.excerpt, lang) || pickLocaleOrNull(raw.summary, lang) || pickLocaleOrNull(raw.problem, lang),
      body: pickBlocks(type === "post" ? raw.body : raw.approach, lang),
    },
  };
}
