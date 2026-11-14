import type { MetadataRoute } from "next";
import { languages } from "@/lib/i18n";
import { getRoutableThemes } from "@/lib/themes";
import { getCaseStudySlugs } from "@/lib/work";
import { getPostSlugs } from "@/lib/writing";

export const revalidate = 60;

const BASE = "https://darznieks.com";

function localized(
  path: string,
  priority: number,
  changeFrequency: "monthly" | "weekly",
  lastModified?: string | null,
): MetadataRoute.Sitemap {
  const alternates = Object.fromEntries(
    languages.map((code) => [code, `${BASE}/${code}${path}`]),
  );
  return languages.map((lang) => ({
    url: `${BASE}/${lang}${path}`,
    lastModified: lastModified ? new Date(lastModified) : undefined,
    changeFrequency,
    priority,
    alternates: { languages: alternates },
  }));
}

// Served at /sitemap.xml. Locale homepages, work, writing, and each published
// slug. Documents added in Sanity appear after the webhook or the ISR window.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, studies, themes] = await Promise.all([
    getPostSlugs(),
    getCaseStudySlugs(),
    getRoutableThemes("en"),
  ]);

  return [
    ...localized("", 1, "monthly"),
    ...localized("/work", 0.8, "weekly"),
    ...localized("/writing", 0.8, "weekly"),
    ...studies.flatMap((study) =>
      localized(`/work/${study.slug}`, 0.6, "monthly", study.updatedAt),
    ),
    ...themes.flatMap((theme) => localized(`/writing/${theme.slug}`, 0.5, "weekly")),
    ...posts.flatMap((post) =>
      localized(
        `/writing/${post.slug}`,
        0.6,
        "monthly",
        post.updatedAt || post.publishedAt,
      ),
    ),
  ];
}
