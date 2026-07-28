import type { MetadataRoute } from "next";

const BASE = "https://darznieks.com";

// Served at /sitemap.xml. Both locale homepages, cross-linked via hreflang.
// When the blog ships, map published posts to `${BASE}/${lang}/blog/${slug}`.
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: `${BASE}/en`, lv: `${BASE}/lv` };
  return [
    {
      url: `${BASE}/en`,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${BASE}/lv`,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
  ];
}
