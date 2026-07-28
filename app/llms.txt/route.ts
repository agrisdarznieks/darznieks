import { getHomeContent } from "@/lib/content";

// Served at /llms.txt — a Markdown guide for AI agents/LLMs. Generated from the
// same Sanity content as the site, so it stays in sync. Convention: answer.ai's
// llms.txt (H1 title, blockquote summary, then link sections).
export const revalidate = 60;

export async function GET() {
  const c = await getHomeContent("en");

  const links = c.cards
    .filter((card) => !card.disabled && /^https?:\/\//.test(card.href))
    .map((card) => `- [${card.label}](${card.href})`)
    .join("\n");

  const body = `# ${c.name}

> ${c.tagline}. ${c.bio}

## Site
- [Home — English](https://darznieks.com/en): Personal link-in-bio and profile.
- [Sākums — Latviešu](https://darznieks.com/lv): Latvian version of the site.

## Links & profiles
${links}

## Notes for agents
- Personal website of Agris Dārznieks — a UX / experience designer and Notion consultant based in Riga, Latvia.
- Bilingual: English at /en, Latvian at /lv.
- Machine-readable extras: schema.org Person JSON-LD on the homepage, sitemap at /sitemap.xml.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=3600",
    },
  });
}
