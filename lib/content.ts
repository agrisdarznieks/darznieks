import { SANITY_TAGS } from "@/lib/cache";
import { socialImageUrl } from "@/lib/cms";
import { getDictionary, pickLocale, pickLocaleOrNull, type LocaleValue } from "@/lib/i18n";
import type { Dictionary, Lang } from "@/lib/i18n/types";
import { sanityFetch } from "@/sanity/lib/fetch";
import type { SanityImageSource } from "@/sanity/lib/image";
import { siteSettingsQuery, linkCardsQuery } from "@/sanity/lib/queries";

export interface HomeCard {
  label: string;
  href: string;
  icon: string;
  section: "building" | "findMe";
  external: boolean;
  disabled: boolean;
}

export interface HomeContent {
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string | null;
  buildingHeading: string;
  findMeHeading: string;
  footer: string;
  cards: HomeCard[];
  // SEO overrides (null when not set in Studio → the page uses its defaults).
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
}

// Code fallback — the current site content, so the page renders even before
// anything is entered in Sanity Studio.
function fallbackCards(dict: Dictionary): HomeCard[] {
  return [
    { label: dict.links.temturis, href: "#", icon: "Compass", section: "building", external: false, disabled: true },
    { label: dict.links.caballero, href: "https://caballero.lv", icon: "Briefcase", section: "building", external: true, disabled: false },
    { label: dict.links.bb, href: "https://biznesabiblioteka.lv", icon: "Books", section: "building", external: true, disabled: false },
    { label: dict.links.linkedin, href: "https://linkedin.com/in/agrisdarznieks", icon: "LinkedinLogo", section: "findMe", external: true, disabled: false },
    { label: dict.links.threads, href: "https://threads.net/@agrisdarznieks", icon: "ThreadsLogo", section: "findMe", external: true, disabled: false },
    { label: dict.links.x, href: "https://x.com/agrisdarznieks", icon: "XLogo", section: "findMe", external: true, disabled: false },
    { label: dict.links.substack, href: "https://agrisdarznieks.substack.com", icon: "EnvelopeSimple", section: "findMe", external: true, disabled: false },
    { label: dict.links.instagram, href: "https://instagram.com/agrisdarznieks", icon: "InstagramLogo", section: "findMe", external: true, disabled: false },
  ];
}

interface RawSeo {
  metaTitle?: LocaleValue;
  metaDescription?: LocaleValue;
  ogImage?: SanityImageSource;
}

interface RawSettings {
  name?: string;
  tagline?: LocaleValue;
  bio?: LocaleValue;
  avatarUrl?: string | null;
  buildingHeading?: LocaleValue;
  findMeHeading?: LocaleValue;
  footer?: LocaleValue;
  seo?: RawSeo;
}

interface RawCard {
  label?: LocaleValue;
  href?: string;
  icon?: string;
  section?: "building" | "findMe";
  external?: boolean;
  disabled?: boolean;
}

export async function getHomeContent(lang: Lang): Promise<HomeContent> {
  const dict = getDictionary(lang);

  let settings: RawSettings | null = null;
  let cards: RawCard[] = [];
  try {
    const [s, c] = await Promise.all([
      sanityFetch<RawSettings | null>(siteSettingsQuery, {}, [SANITY_TAGS.siteSettings]),
      sanityFetch<RawCard[] | null>(linkCardsQuery, {}, [SANITY_TAGS.linkCard]),
    ]);
    settings = s;
    cards = Array.isArray(c) ? c : [];
  } catch (error) {
    console.error("Sanity home content failed, using fallback copy.", error);
  }

  const mappedCards: HomeCard[] = cards.length
    ? cards.map((c) => ({
        label: pickLocale(c.label, lang, ""),
        href: c.href || "#",
        icon: c.icon || "GlobeSimple",
        section: c.section === "building" ? "building" : "findMe",
        external: c.external ?? true,
        disabled: c.disabled ?? false,
      }))
    : fallbackCards(dict);

  return {
    name: settings?.name || dict.name,
    tagline: pickLocale(settings?.tagline, lang, dict.tagline),
    bio: pickLocale(settings?.bio, lang, dict.bio),
    avatarUrl: settings?.avatarUrl || null,
    buildingHeading: pickLocale(settings?.buildingHeading, lang, dict.sections.building),
    findMeHeading: pickLocale(settings?.findMeHeading, lang, dict.sections.findMe),
    footer: pickLocale(settings?.footer, lang, dict.footer),
    cards: mappedCards,
    metaTitle: pickLocaleOrNull(settings?.seo?.metaTitle, lang),
    metaDescription: pickLocaleOrNull(settings?.seo?.metaDescription, lang),
    ogImageUrl: socialImageUrl(settings?.seo?.ogImage),
  };
}
