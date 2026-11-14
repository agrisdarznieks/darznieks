import type { EditorialStatus, PlanKey } from "./types";

/** The five themes. Base is the default register and is not a public hub. */
export const THEMES = [
  { slug: "base", name: "Base", publicHub: false },
  { slug: "caballero", name: "Caballero", publicHub: true },
  { slug: "notion", name: "Notion", publicHub: true },
  { slug: "friends-of-figma", name: "Friends of Figma", publicHub: true },
  { slug: "books", name: "Books", publicHub: true },
] as const;

export const PLANNED_CASES: { planKey: PlanKey; label: string }[] = [
  { planKey: "laaa", label: "LAĀA" },
  { planKey: "erenpreisa", label: "Ērenpreisa" },
];

export const CASE_GOAL = 2;
export const CASE_GOAL_DATE = "2026-11-30";

/**
 * Concrete pages from the site map. Template routes (with a slug segment)
 * are not documents of their own.
 */
export const PAGE_MAP = [
  { route: "/", name: "Home", template: "home", concrete: true },
  { route: "/work", name: "Work", template: "work-index", concrete: true },
  { route: "/work/[slug]", name: "Case study", template: "case-study", concrete: false },
  { route: "/writing", name: "Writing", template: "writing-index", concrete: true },
  { route: "/writing/[slug]", name: "Article", template: "article", concrete: false },
  { route: "/about", name: "About", template: "about", concrete: true },
  { route: "/building", name: "What I'm building", template: "building", concrete: true },
  { route: "/work-with-me", name: "Work with me", template: "work-with-me", concrete: true },
] as const;

export const TYPE_LABELS: Record<string, string> = {
  post: "Posts",
  caseStudy: "Case studies",
  theme: "Themes",
  client: "Clients",
  page: "Pages",
  openQuestion: "Questions",
  siteSettings: "Site settings",
  linkCard: "Link cards",
};

export const TYPE_SINGULAR: Record<string, string> = {
  post: "post",
  caseStudy: "case study",
  theme: "theme",
  client: "client",
  page: "page",
  openQuestion: "question",
};

export function isPublicPost(input: {
  slug: string | null;
  status: EditorialStatus | null;
  publishedAt: string | null;
  now: number;
}): boolean {
  if (!input.slug || !input.publishedAt) return false;
  if (input.status === "draft" || input.status === "review" || input.status === "missing") {
    return false;
  }
  const time = Date.parse(input.publishedAt);
  return !Number.isNaN(time) && time <= input.now;
}

export function isPublicCaseStudy(input: {
  slug: string | null;
  status: EditorialStatus | null;
}): boolean {
  if (!input.slug) return false;
  if (input.status === "draft" || input.status === "review" || input.status === "missing") {
    return false;
  }
  return true;
}

export function normalizePlanKey(value: string | null | undefined): PlanKey | null {
  if (!value) return null;
  const key = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  if (key === "laaa") return "laaa";
  if (key === "erenpreisa") return "erenpreisa";
  return null;
}

export function docHref(type: string, id: string): string {
  return `/admin/content/${type}/${id}`;
}
