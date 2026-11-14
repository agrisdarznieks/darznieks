import { isEditableType } from "./doc";
import { normalizePlanKey } from "./model";
import type { EditorialType } from "./types";

export type SaveIntent = "save" | "publish" | "unpublish";

export interface ParsedEditor {
  type: EditorialType;
  intent: SaveIntent;
  confirmPublish: boolean;
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
  year: number | null;
  problemEn: string;
  problemLv: string;
  summaryEn: string;
  summaryLv: string;
  mayBePublic: "unknown" | "yes" | "no";
  imageClearance: "unknown" | "none" | "uncleared" | "cleared";
  confidentialityEn: string;
  confidentialityLv: string;
  planKey: "laaa" | "erenpreisa" | "";
  taglineEn: string;
  taglineLv: string;
  taglineApproval: "unapproved" | "approved";
  accentToken: string;
  introEn: string;
  owner: string;
  status: "draft" | "review";
  publishedAt: string;
  tags: string[];
  relatedPostIds: string[];
  relatedCaseStudyIds: string[];
  route: string;
  template: string;
  publicName: string;
  website: string;
  question: string;
  detail: string;
  questionStatus: "open" | "decided";
}

export interface FormParse {
  ok: boolean;
  message: string;
  fieldErrors: Record<string, string>;
  value: ParsedEditor | null;
}

function field(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function many(data: FormData, name: string): string[] {
  return data
    .getAll(name)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function choice<T extends string>(value: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function parseEditorForm(data: FormData): FormParse {
  const typeValue = field(data, "type");
  const errors: Record<string, string> = {};
  if (!isEditableType(typeValue)) {
    return { ok: false, message: "That document type is not editable here.", fieldErrors: { type: "Choose a document type." }, value: null };
  }
  const type = typeValue;
  const intentValue = field(data, "intent");
  const intent: SaveIntent =
    intentValue === "publish" || intentValue === "unpublish" ? intentValue : "save";
  const confirmPublish = field(data, "confirmPublish") === "yes";

  const titleEn = field(data, "titleEn");
  const name = field(data, "name") || titleEn;
  const slugInput = field(data, "slug");
  const slug = slugInput || slugify(titleEn || name || field(data, "question"));

  if (intent === "publish" && !confirmPublish) {
    errors.confirmPublish = "Publishing needs an explicit confirmation.";
  }

  if ((type === "post" || type === "caseStudy" || type === "page") && !titleEn) {
    errors.titleEn = "Please add an English title.";
  }
  if (type === "theme" && !field(data, "name") && !titleEn) {
    errors.name = "Please add an English name.";
  }
  if (type === "client" && !name) {
    errors.name = "Please add the client name.";
  }
  if (type === "openQuestion" && !field(data, "question")) {
    errors.question = "Please write the question.";
  }
  if (type !== "openQuestion" && !slug) {
    errors.slug = "Please add a slug.";
  } else if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    errors.slug = "Use lowercase letters, numbers, and hyphens.";
  }
  if (type === "post" && intent !== "unpublish" && !field(data, "themeId")) {
    errors.themeId = "Choose one theme.";
  }
  if (type === "caseStudy" && intent === "publish" && !field(data, "clientId")) {
    errors.clientId = "A published case study needs a client.";
  }
  if (type === "page" && !field(data, "route")) {
    errors.route = "Please add the route.";
  }
  const owner = field(data, "owner");
  if (type !== "openQuestion" && !owner) {
    errors.owner = "Please name an owner.";
  }

  const yearText = field(data, "year");
  let year: number | null = null;
  if (yearText) {
    const parsed = Number(yearText);
    if (!Number.isInteger(parsed) || parsed < 1990 || parsed > 2100) {
      errors.year = "Enter a year, or leave it blank.";
    } else {
      year = parsed;
    }
  }

  if (Object.keys(errors).length > 0) {
    const message =
      errors.confirmPublish ??
      "Please check the fields marked below. Nothing was saved.";
    return { ok: false, message, fieldErrors: errors, value: null };
  }

  const value: ParsedEditor = {
    type,
    intent,
    confirmPublish,
    titleEn,
    titleLv: field(data, "titleLv"),
    name: field(data, "name") || titleEn,
    slug,
    excerptEn: field(data, "excerptEn"),
    excerptLv: field(data, "excerptLv"),
    themeId: field(data, "themeId"),
    clientId: field(data, "clientId"),
    roleEn: field(data, "roleEn"),
    roleLv: field(data, "roleLv"),
    year,
    problemEn: field(data, "problemEn"),
    problemLv: field(data, "problemLv"),
    summaryEn: field(data, "summaryEn"),
    summaryLv: field(data, "summaryLv"),
    mayBePublic: choice(field(data, "mayBePublic"), ["unknown", "yes", "no"] as const, "unknown"),
    imageClearance: choice(
      field(data, "imageClearance"),
      ["unknown", "none", "uncleared", "cleared"] as const,
      "unknown",
    ),
    confidentialityEn: field(data, "confidentialityEn"),
    confidentialityLv: field(data, "confidentialityLv"),
    planKey: normalizePlanKey(field(data, "planKey")) ?? "",
    taglineEn: field(data, "taglineEn"),
    taglineLv: field(data, "taglineLv"),
    taglineApproval: choice(field(data, "taglineApproval"), ["unapproved", "approved"] as const, "unapproved"),
    accentToken: field(data, "accentToken"),
    introEn: field(data, "introEn"),
    owner,
    status: choice(field(data, "status"), ["draft", "review"] as const, "draft"),
    publishedAt: field(data, "publishedAt"),
    tags: field(data, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    relatedPostIds: many(data, "relatedPostIds"),
    relatedCaseStudyIds: many(data, "relatedCaseStudyIds"),
    route: field(data, "route"),
    template: field(data, "template"),
    publicName: field(data, "publicName"),
    website: field(data, "website"),
    question: field(data, "question"),
    detail: field(data, "detail"),
    questionStatus: choice(field(data, "questionStatus"), ["open", "decided"] as const, "open"),
  };

  return { ok: true, message: "", fieldErrors: {}, value };
}

export function sanityPatch(value: ParsedEditor): Record<string, unknown> {
  const locale = (en: string, lv: string) => ({
    _type: "localeString",
    en,
    lv,
  });
  const localeText = (en: string, lv: string) => ({
    _type: "localeText",
    en,
    lv,
  });
  const reference = (id: string) => ({ _type: "reference", _ref: id });
  const status = value.intent === "publish" ? "published" : value.intent === "unpublish" ? "draft" : value.status;

  const patch: Record<string, unknown> = {
    _type: value.type,
    status,
    owner: value.owner,
  };

  if (value.type === "post" || value.type === "caseStudy" || value.type === "page") {
    patch.title = locale(value.titleEn || value.name, value.titleLv);
  }
  if (value.type !== "openQuestion") {
    patch.slug = { _type: "slug", current: value.slug };
  }

  if (value.type === "post") {
    patch.excerpt = localeText(value.excerptEn, value.excerptLv);
    patch.theme = value.themeId ? reference(value.themeId) : undefined;
    patch.tags = value.tags;
    patch.relatedCaseStudies = value.relatedCaseStudyIds.map(reference);
    if (value.publishedAt) patch.publishedAt = value.publishedAt;
  }

  if (value.type === "caseStudy") {
    patch.planKey = value.planKey || undefined;
    patch.clientRef = value.clientId ? reference(value.clientId) : undefined;
    patch.role = locale(value.roleEn, value.roleLv);
    patch.year = value.year ?? undefined;
    patch.summary = localeText(value.summaryEn, value.summaryLv);
    patch.problem = localeText(value.problemEn, value.problemLv);
    patch.relatedPosts = value.relatedPostIds.map(reference);
    patch.facts = {
      _type: "caseFacts",
      mayBePublic: value.mayBePublic,
      role: locale(value.roleEn, value.roleLv),
      year: value.year ?? undefined,
      images: value.imageClearance,
      confidentiality: localeText(value.confidentialityEn, value.confidentialityLv),
    };
  }

  if (value.type === "theme") {
    patch.name = locale(value.name || value.titleEn, value.titleLv);
    patch.tagline = locale(value.taglineEn, value.taglineLv);
    patch.taglineApproval = value.taglineApproval;
    patch.intro = localeText(value.introEn, "");
    patch.accent = value.accentToken ? { _type: "themeAccent", token: value.accentToken } : undefined;
  }

  if (value.type === "client") {
    patch.name = value.name;
    patch.publicName = value.publicName;
    patch.mayBePublic = value.mayBePublic;
    patch.confidentiality = localeText(value.confidentialityEn, value.confidentialityLv);
    patch.website = value.website || undefined;
    delete patch.title;
  }

  if (value.type === "page") {
    patch.route = value.route;
    patch.template = value.template || "home";
    patch.summary = localeText(value.summaryEn, "");
  }

  if (value.type === "openQuestion") {
    patch.question = value.question;
    patch.detail = value.detail;
    patch.questionStatus = value.questionStatus;
    patch.owner = value.owner;
    delete patch.status;
    delete patch.slug;
    delete patch.title;
  }

  return patch;
}
