import type { RawDoc } from "./normalize";
import type { EditorialType } from "./types";

export interface EditorDefaults {
  titleEn: string;
  titleLv: string;
  name: string;
  slug: string;
  excerptEn: string;
  excerptLv: string;
  themeId: string;
  clientId: string;
  roleEn: string;
  roleLv: string;
  year: string;
  problemEn: string;
  problemLv: string;
  summaryEn: string;
  summaryLv: string;
  mayBePublic: string;
  imageClearance: string;
  confidentialityEn: string;
  confidentialityLv: string;
  planKey: string;
  taglineEn: string;
  taglineLv: string;
  taglineApproval: string;
  accentToken: string;
  introEn: string;
  owner: string;
  status: string;
  publishedAt: string;
  tags: string;
  relatedPostIds: string[];
  relatedCaseStudyIds: string[];
  route: string;
  template: string;
  publicName: string;
  website: string;
  question: string;
  detail: string;
  questionStatus: string;
}

function en(value: { en?: string | null } | string | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en ?? "";
}

function lv(
  value: { en?: string | null; lv?: string | null } | null | undefined,
): string {
  if (!value || typeof value === "string") return "";
  return value.lv ?? "";
}

function slug(value: RawDoc["slug"]): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.current ?? "";
}

export function emptyDefaults(type: EditorialType): EditorDefaults {
  return defaultsFromRaw(type, null, true);
}

export function defaultsFromRaw(
  type: EditorialType,
  raw: RawDoc | null,
  creating = false,
): EditorDefaults {
  const refs = (value: RawDoc["relatedPosts"]) =>
    (value ?? []).flatMap((item) => (item?._ref ? [item._ref.replace(/^drafts\./, "")] : []));
  return {
    titleEn: en(raw?.title),
    titleLv: lv(raw?.title && typeof raw.title === "object" ? raw.title : null),
    name: en(raw?.name) || (typeof raw?.name === "string" ? raw.name : ""),
    slug: slug(raw?.slug),
    excerptEn: en(raw?.excerpt),
    excerptLv: lv(raw?.excerpt),
    themeId: raw?.theme?._ref?.replace(/^drafts\./, "") ?? "",
    clientId: raw?.clientRef?._ref?.replace(/^drafts\./, "") ?? "",
    roleEn: en(raw?.role) || en(raw?.facts?.role),
    roleLv: lv(raw?.role) || lv(raw?.facts?.role),
    year: raw?.year != null ? String(raw.year) : raw?.facts?.year != null ? String(raw.facts.year) : "",
    problemEn: en(raw?.problem),
    problemLv: lv(raw?.problem),
    summaryEn: en(raw?.summary),
    summaryLv: lv(raw?.summary),
    mayBePublic: raw?.facts?.mayBePublic || "unknown",
    imageClearance: raw?.facts?.images || "unknown",
    confidentialityEn: en(raw?.facts?.confidentiality),
    confidentialityLv: lv(raw?.facts?.confidentiality),
    planKey: raw?.planKey ?? "",
    taglineEn: en(raw?.tagline),
    taglineLv: lv(raw?.tagline),
    taglineApproval: raw?.taglineApproval === "approved" ? "approved" : "unapproved",
    accentToken: raw?.accent?.token ?? "",
    introEn: en(raw?.intro),
    owner: raw?.owner ?? (creating ? "Agris Dārznieks" : ""),
    status: raw?.status === "review" ? "review" : "draft",
    publishedAt: raw?.publishedAt ?? "",
    tags: Array.isArray(raw?.tags) ? raw.tags.filter((tag) => typeof tag === "string").join(", ") : "",
    relatedPostIds: refs(raw?.relatedPosts),
    relatedCaseStudyIds: refs(raw?.relatedCaseStudies),
    route: raw?.route ?? "",
    template: raw?.template ?? (type === "page" ? "home" : ""),
    publicName: raw?.publicName ?? "",
    website: raw?.website ?? "",
    question: raw?.question ?? "",
    detail: raw?.detail ?? "",
    questionStatus: raw?.questionStatus === "decided" ? "decided" : "open",
  };
}
