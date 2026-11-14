/**
 * Shared ISR window for Sanity fetches and Cache-Control.
 * Page and layout `export const revalidate` must be the literal `60` —
 * Next.js only accepts a statically analyzable number there, not this binding.
 * On-demand webhook revalidation can refresh sooner.
 */
export const REVALIDATE_SECONDS = 60;

/**
 * Cache tags for Sanity fetches. Values match document `_type` so a webhook
 * can revalidate the tag it receives without a lookup table.
 */
export const SANITY_TAGS = {
  siteSettings: "siteSettings",
  linkCard: "linkCard",
  post: "post",
  caseStudy: "caseStudy",
  theme: "theme",
  client: "client",
  page: "page",
  openQuestion: "openQuestion",
} as const;

export type SanityTag = (typeof SANITY_TAGS)[keyof typeof SANITY_TAGS];

export const SANITY_TAG_SET: ReadonlySet<string> = new Set(Object.values(SANITY_TAGS));
