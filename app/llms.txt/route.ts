import { REVALIDATE_SECONDS } from "@/lib/cache";
import { getHomeContent } from "@/lib/content";
import { getCaseStudies } from "@/lib/work";
import { getPosts } from "@/lib/writing";

// Served at /llms.txt — a Markdown guide for AI agents/LLMs. Generated from the
// same Sanity content as the site, so it stays in sync. Convention: answer.ai's
// llms.txt (H1 title, blockquote summary, then link sections).
export const revalidate = 60;

export async function GET() {
  const [home, studies, posts] = await Promise.all([
    getHomeContent("en"),
    getCaseStudies("en"),
    getPosts("en"),
  ]);

  const links = home.cards
    .filter((card) => !card.disabled && /^https?:\/\//.test(card.href))
    .map((card) => `- [${card.label}](${card.href})`)
    .join("\n");

  const studyLines = studies.length
    ? studies
        .map(
          (study) =>
            `- [${study.title}](https://darznieks.com/en/work/${study.slug})${study.summary ? `: ${study.summary}` : ""}`,
        )
        .join("\n")
    : "- None published yet.";

  const postLines = posts.length
    ? posts
        .map(
          (post) =>
            `- [${post.title}](https://darznieks.com/en/writing/${post.slug})${post.excerpt ? `: ${post.excerpt}` : ""}`,
        )
        .join("\n")
    : "- None published yet.";

  const body = `# ${home.name}

> ${home.tagline}. ${home.bio}

## Site
- [Home — English](https://darznieks.com/en): Personal link-in-bio and profile.
- [Sākums — Latviešu](https://darznieks.com/lv): Latvian version of the site.
- [Work — English](https://darznieks.com/en/work): Case studies.
- [Darbi — Latviešu](https://darznieks.com/lv/work): Case studies in Latvian.
- [Writing — English](https://darznieks.com/en/writing): Essays and notes.
- [Raksti — Latviešu](https://darznieks.com/lv/writing): Essays and notes in Latvian.

## Case studies
${studyLines}

## Writing
${postLines}

## Links & profiles
${links}

## Notes for agents
- Personal website of Agris Dārznieks — a UX / experience designer and Notion consultant based in Riga, Latvia. He experiments with AI engineering.
- Bilingual: English at /en (default), Latvian at /lv. The same slug is used in both languages.
- Machine-readable extras: schema.org Person JSON-LD on the homepage, Article / BlogPosting on published documents, sitemap at /sitemap.xml.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=3600`,
    },
  });
}
