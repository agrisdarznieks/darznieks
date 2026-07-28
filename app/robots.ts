import type { MetadataRoute } from "next";

// Served at /robots.txt. Allow every crawler (incl. AI answer-engine bots like
// OAI-SearchBot, PerplexityBot, Claude-SearchBot) — blocking them would remove
// the site from those engines' answers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://darznieks.com/sitemap.xml",
    host: "https://darznieks.com",
  };
}
