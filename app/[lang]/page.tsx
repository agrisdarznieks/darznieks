import Image from "next/image";
import type { Metadata } from "next";
import { LinkCard } from "@/components/custom/LinkCard";
import { ToggleRow } from "@/components/custom/ToggleRow";
import { getDictionary, isLang } from "@/lib/i18n";
import { getHomeContent, type HomeCard } from "@/lib/content";
import { resolveIcon } from "@/lib/icons";

const SITE_URL = "https://darznieks.com";
const DEFAULT_OG = `${SITE_URL}/images/avatar.jpg`;

// Canonical identity links for the JSON-LD Person entity (AI / search
// discoverability). Stable — update if a profile handle changes.
const SAME_AS = [
  "https://www.linkedin.com/in/agrisdarznieks",
  "https://www.threads.net/@agrisdarznieks",
  "https://x.com/agrisdarznieks",
  "https://agrisdarznieks.substack.com",
  "https://www.instagram.com/agrisdarznieks",
];

// ISR — re-fetch Sanity content at most once a minute.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const L = isLang(lang) ? lang : "en";
  const c = await getHomeContent(L);

  const title = c.metaTitle || `${c.name} — ${c.tagline}`;
  const description = c.metaDescription || c.bio;
  const ogImage = c.ogImageUrl || c.avatarUrl || DEFAULT_OG;

  return {
    title,
    description,
    alternates: {
      canonical: `/${L}`,
      languages: { en: "/en", lv: "/lv", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${L}`,
      siteName: c.name,
      title,
      description,
      locale: L === "lv" ? "lv_LV" : "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: c.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function CardList({ cards }: { cards: HomeCard[] }) {
  return (
    <div className="flex flex-col gap-3 mt-4">
      {cards.map((card, i) => (
        <LinkCard
          key={`${card.href}-${i}`}
          href={card.href}
          label={card.label}
          icon={resolveIcon(card.icon)}
          disabled={card.disabled}
          external={card.external}
        />
      ))}
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const L = isLang(lang) ? lang : "en";
  const dict = getDictionary(L);
  const c = await getHomeContent(L);

  const building = c.cards.filter((x) => x.section === "building");
  const findMe = c.cards.filter((x) => x.section === "findMe");

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.name,
    url: SITE_URL,
    image: c.avatarUrl || DEFAULT_OG,
    jobTitle: c.tagline,
    sameAs: SAME_AS,
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />

      <header>
        <ToggleRow lang={L} a11y={dict.a11y} />

        <Image
          src={c.avatarUrl || "/images/avatar.jpg"}
          alt={c.name}
          width={96}
          height={96}
          priority
          className="size-24 rounded-full object-cover"
        />

        <h1 className="mt-4 font-sans text-3xl font-bold">{c.name}</h1>
        <p className="mt-1 font-sans text-lg text-muted-foreground">
          {c.tagline}
        </p>
        <p className="mt-3 font-serif text-base leading-[1.75] text-muted-foreground">
          {c.bio}
        </p>
      </header>

      <main id="main-content">
        <section aria-labelledby="section-building" className="mt-10">
          <h2
            id="section-building"
            className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
          >
            {c.buildingHeading}
          </h2>
          <CardList cards={building} />
        </section>

        <section aria-labelledby="section-find-me" className="mt-8">
          <h2
            id="section-find-me"
            className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
          >
            {c.findMeHeading}
          </h2>
          <CardList cards={findMe} />
        </section>
      </main>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        {c.footer}
      </footer>
    </div>
  );
}
