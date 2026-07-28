import { client } from "@/sanity/lib/client";
import { siteSettingsQuery, linkCardsQuery } from "@/sanity/lib/queries";
import { getDictionary } from "@/lib/i18n";
import type { Dictionary, Lang } from "@/lib/i18n/types";

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
}

type Locale = { en?: string; lv?: string } | null | undefined;

function pick(value: Locale, lang: Lang, fallback: string): string {
  return (value && (value[lang] ?? value.en)) || fallback;
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

interface RawSettings {
  name?: string;
  tagline?: Locale;
  bio?: Locale;
  avatarUrl?: string | null;
  buildingHeading?: Locale;
  findMeHeading?: Locale;
  footer?: Locale;
}

interface RawCard {
  label?: Locale;
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
      client.fetch<RawSettings | null>(siteSettingsQuery),
      client.fetch<RawCard[] | null>(linkCardsQuery),
    ]);
    settings = s;
    cards = Array.isArray(c) ? c : [];
  } catch {
    // Sanity unreachable or empty — fall back to code content.
  }

  const mappedCards: HomeCard[] = cards.length
    ? cards.map((c) => ({
        label: pick(c.label, lang, ""),
        href: c.href || "#",
        icon: c.icon || "GlobeSimple",
        section: c.section === "building" ? "building" : "findMe",
        external: c.external ?? true,
        disabled: c.disabled ?? false,
      }))
    : fallbackCards(dict);

  return {
    name: settings?.name || dict.name,
    tagline: pick(settings?.tagline, lang, dict.tagline),
    bio: pick(settings?.bio, lang, dict.bio),
    avatarUrl: settings?.avatarUrl || null,
    buildingHeading: pick(settings?.buildingHeading, lang, dict.sections.building),
    findMeHeading: pick(settings?.findMeHeading, lang, dict.sections.findMe),
    footer: pick(settings?.footer, lang, dict.footer),
    cards: mappedCards,
  };
}
