import type { HomeContent } from "@/lib/content";
import type { Lang } from "@/lib/i18n/types";

export const SITE_URL = "https://darznieks.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/avatar.jpg`;

// Verified identity profiles (schema.org sameAs). Update if a handle changes.
export const SAME_AS = [
  "https://www.linkedin.com/in/agrisdarznieks",
  "https://www.threads.net/@agrisdarznieks",
  "https://x.com/agrisdarznieks",
  "https://agrisdarznieks.substack.com",
  "https://www.instagram.com/agrisdarznieks",
  "https://github.com/agrisdarznieks",
];

// Topics the entity is an authority on — kept focused (~12) so the signal
// stays strong. What Agris wants to be found for.
const KNOWS_ABOUT = [
  "UX design",
  "User research",
  "Information architecture",
  "Design systems",
  "Product design",
  "Notion",
  "No-code tools",
  "Workflow automation",
  "Webflow",
  "AI-driven web design",
  "Claude",
  "Prompt engineering",
];

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

// The schema.org graph. darznieks.com is the canonical source of the
// "Agris Dārznieks" Person entity (stable @id), cross-linked to profiles
// (sameAs) and founded ventures. Injected as JSON-LD on the homepage.
export function buildJsonLd(c: HomeContent, lang: Lang) {
  const image = c.avatarUrl || DEFAULT_OG_IMAGE;

  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: c.name,
    url: SITE_URL,
    image,
    jobTitle: c.tagline,
    description: c.bio,
    nationality: "Latvian",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Riga",
      addressCountry: "LV",
    },
    knowsLanguage: ["Latvian", "English"],
    knowsAbout: KNOWS_ABOUT,
    worksFor: {
      "@type": "Organization",
      name: "Caballero",
      url: "https://caballero.lv",
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "Independent — Notion, UX & AI-driven web design and systems solutions",
      occupationalCategory: "Design & digital consulting",
    },
    memberOf: {
      "@type": "Organization",
      name: "Notion",
      url: "https://www.notion.so",
      description: "Notion Ambassador",
    },
    sameAs: SAME_AS,
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: c.name,
    inLanguage: ["en", "lv"],
    publisher: { "@id": PERSON_ID },
  };

  const profilePage = {
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/${lang}`,
    url: `${SITE_URL}/${lang}`,
    name: c.name,
    inLanguage: lang,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
  };

  // Ventures Agris founded — modeled as Organizations whose founder is the
  // Person, so the knowledge graph connects them to the entity.
  const ventures = [
    {
      "@type": "Organization",
      "@id": "https://biznesabiblioteka.lv/#org",
      name: "Biznesa Bibliotēka",
      url: "https://biznesabiblioteka.lv",
      description: "A Latvian non-fiction business-book community for operators.",
      founder: { "@id": PERSON_ID },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#temturis`,
      name: "Tēmturis",
      description: "A Latvian-language catalogue of digital tools.",
      founder: { "@id": PERSON_ID },
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [person, website, profilePage, ...ventures],
  };
}
