import { defineType, defineField } from "sanity";

// Reusable SEO / social-sharing block. Attach to any document (siteSettings,
// post, …). Every field is optional — blank fields fall back to the page's
// own title / description / avatar in code (see lib/content.ts + page.tsx).
export const seo = defineType({
  name: "seo",
  title: "SEO & social sharing",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title (override)",
      type: "localeString",
      description:
        "Overrides the browser-tab + search-result title. ~50–60 characters. Leave blank to use the page's default (name — tagline).",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "localeText",
      description:
        "The search-result / social snippet. ~150–160 characters. Leave blank to use the bio (or a post's excerpt).",
    }),
    defineField({
      name: "ogImage",
      title: "Social share image",
      type: "image",
      description:
        "Shown when the link is shared on LinkedIn, X, Threads, etc. Ideal size 1200×630px. Leave blank to fall back to the avatar.",
      options: { hotspot: true },
    }),
  ],
});
