import type { Metadata } from "next";
import { languages } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/schema";

export function localizedMetadata({
  lang,
  path,
  title,
  description,
  image,
  imageAlt,
  siteName = "Agris Dārznieks",
  type = "website",
}: {
  lang: Lang;
  /** Path after the locale. "" for the homepage, "/work", "/work/slug". */
  path: string;
  title: string;
  description: string;
  image?: string | null;
  imageAlt?: string;
  siteName?: string;
  type?: "website" | "article";
}): Metadata {
  const pathname = `/${lang}${path}`;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const languagesMap = Object.fromEntries(
    languages.map((code) => [code, `/${code}${path}`]),
  );

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: pathname,
      languages: { ...languagesMap, "x-default": `/en${path}` },
    },
    openGraph: {
      type,
      url: `${SITE_URL}${pathname}`,
      siteName,
      title,
      description,
      locale: lang === "lv" ? "lv_LV" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt || title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}
