import { isPublicCaseStudy, isPublicPost, normalizePlanKey } from "./model";
import type {
  DeskDoc,
  DeskFacts,
  DeskImage,
  DeskRef,
  DeskString,
  EditorialStatus,
  ImageClearance,
  MayBePublic,
} from "./types";

export interface RawImage {
  alt?: { en?: string | null; lv?: string | null } | null;
  asset?: { _ref?: string | null } | null;
}

export interface RawDoc {
  _id: string;
  _type: string;
  _updatedAt?: string | null;
  title?: { en?: string | null; lv?: string | null } | string | null;
  name?: { en?: string | null; lv?: string | null } | string | null;
  label?: { en?: string | null } | string | null;
  slug?: string | { current?: string | null } | null;
  status?: string | null;
  owner?: string | null;
  publishedAt?: string | null;
  theme?: { _ref?: string | null } | null;
  clientRef?: { _ref?: string | null } | null;
  relatedPosts?: ({ _ref?: string | null } | null)[] | null;
  relatedCaseStudies?: ({ _ref?: string | null } | null)[] | null;
  planKey?: string | null;
  coverImage?: RawImage | null;
  images?: RawImage[] | null;
  facts?: {
    mayBePublic?: string | null;
    role?: { en?: string | null; lv?: string | null } | null;
    year?: number | null;
    images?: string | null;
    confidentiality?: { en?: string | null; lv?: string | null } | null;
  } | null;
  role?: { en?: string | null; lv?: string | null } | null;
  year?: number | null;
  excerpt?: { en?: string | null; lv?: string | null } | null;
  problem?: { en?: string | null; lv?: string | null } | null;
  summary?: { en?: string | null; lv?: string | null } | null;
  body?: unknown;
  approach?: unknown;
  outcomes?: unknown;
  tagline?: { en?: string | null; lv?: string | null } | null;
  taglineApproval?: string | null;
  accent?: { token?: string | null } | null;
  intro?: { en?: string | null } | null;
  question?: string | null;
  detail?: string | null;
  questionStatus?: string | null;
  route?: string | null;
  template?: string | null;
  publicName?: string | null;
  confidentiality?: { en?: string | null } | null;
  website?: string | null;
  tags?: unknown;
  client?: { en?: string | null } | null;
}

export function publishedId(id: string): string {
  return id.startsWith("drafts.") ? id.slice("drafts.".length) : id;
}

export function collapseDrafts(docs: RawDoc[]): { draft?: RawDoc; published?: RawDoc }[] {
  const pairs = new Map<string, { draft?: RawDoc; published?: RawDoc }>();
  for (const doc of docs) {
    const id = publishedId(doc._id);
    const pair = pairs.get(id) ?? {};
    if (doc._id.startsWith("drafts.")) pair.draft = doc;
    else pair.published = doc;
    pairs.set(id, pair);
  }
  return [...pairs.values()];
}

function asStatus(value: string | null | undefined): EditorialStatus {
  if (value === "draft" || value === "review" || value === "published") return value;
  if (!value) return "legacy";
  return "missing";
}

function text(value: { en?: string | null; lv?: string | null } | string | null | undefined): string | null {
  if (!value) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }
  const en = value.en?.trim();
  return en || null;
}

function slugOf(value: RawDoc["slug"]): string | null {
  if (!value) return null;
  if (typeof value === "string") return value.trim() || null;
  return value.current?.trim() || null;
}

function refsOf(value: ({ _ref?: string | null } | null)[] | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const id = item?._ref?.trim();
    return id ? [publishedId(id)] : [];
  });
}

function pushString(strings: DeskString[], field: string, value: string | null) {
  if (value) strings.push({ field, value });
}

function walkUnknown(strings: DeskString[], field: string, value: unknown) {
  if (typeof value === "string") {
    pushString(strings, field, value.trim() || null);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkUnknown(strings, `${field}.${index}`, item));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key === "_type" || key === "_key") continue;
      walkUnknown(strings, `${field}.${key}`, child);
    }
  }
}

function imageOf(field: string, image: RawImage | null | undefined): DeskImage | null {
  const asset = image?.asset?._ref;
  if (!asset) return null;
  return { field, alt: text(image?.alt) };
}

function clearance(value: string | null | undefined): ImageClearance | null {
  if (value === "unknown" || value === "none" || value === "uncleared" || value === "cleared") {
    return value;
  }
  return null;
}

function mayBe(value: string | null | undefined): MayBePublic | null {
  if (value === "unknown" || value === "yes" || value === "no") return value;
  return null;
}

function titleOf(doc: RawDoc): string {
  return (
    text(doc.title) ||
    text(doc.name) ||
    text(doc.label) ||
    text(doc.question) ||
    "Untitled"
  );
}

function hasBlocks(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") {
    const record = value as { en?: unknown; lv?: unknown };
    return hasBlocks(record.en) || hasBlocks(record.lv);
  }
  return false;
}

export function toDeskDoc(
  pair: { draft?: RawDoc; published?: RawDoc },
  now = Date.now(),
): DeskDoc | null {
  const source = pair.draft ?? pair.published;
  if (!source) return null;
  const id = publishedId(source._id);
  const type = source._type;
  if (
    type !== "post" &&
    type !== "caseStudy" &&
    type !== "theme" &&
    type !== "client" &&
    type !== "page" &&
    type !== "openQuestion" &&
    type !== "siteSettings" &&
    type !== "linkCard"
  ) {
    return null;
  }

  const published = pair.published;
  const publishedStatus = published ? asStatus(published.status) : null;
  const strings: DeskString[] = [];
  const refs: DeskRef[] = [];

  const themeId = source.theme?._ref ? publishedId(source.theme._ref) : null;
  if (themeId) refs.push({ field: "theme", id: themeId });
  const clientId = source.clientRef?._ref ? publishedId(source.clientRef._ref) : null;
  if (clientId) refs.push({ field: "client", id: clientId });
  const relatedPostIds = refsOf(source.relatedPosts);
  for (const related of relatedPostIds) refs.push({ field: "relatedPosts", id: related });
  const relatedCaseStudyIds = refsOf(source.relatedCaseStudies);
  for (const related of relatedCaseStudyIds) refs.push({ field: "relatedCaseStudies", id: related });

  pushString(strings, "title", text(source.title));
  pushString(strings, "name", text(source.name));
  pushString(strings, "excerpt", text(source.excerpt));
  pushString(strings, "problem", text(source.problem));
  pushString(strings, "summary", text(source.summary));
  pushString(strings, "tagline", text(source.tagline));
  pushString(strings, "intro", text(source.intro));
  pushString(strings, "role", text(source.role) || text(source.facts?.role));
  pushString(strings, "confidentiality", text(source.facts?.confidentiality) || text(source.confidentiality));
  pushString(strings, "question", text(source.question));
  pushString(strings, "detail", text(source.detail));
  pushString(strings, "publicName", text(source.publicName));
  pushString(strings, "client", text(source.client));
  if (Array.isArray(source.tags)) {
    source.tags.forEach((tag, index) => {
      if (typeof tag === "string") pushString(strings, `tags.${index}`, tag.trim() || null);
    });
  }
  walkUnknown(strings, "body", source.body);
  walkUnknown(strings, "approach", source.approach);
  walkUnknown(strings, "outcomes", source.outcomes);

  const images = [imageOf("coverImage", source.coverImage), ...(source.images ?? []).map((image, index) => imageOf(`images.${index}`, image))].filter(
    (image): image is DeskImage => image !== null,
  );

  const facts: DeskFacts | null = source.facts
    ? {
        mayBePublic: mayBe(source.facts.mayBePublic),
        role: text(source.facts.role),
        year: typeof source.facts.year === "number" ? source.facts.year : null,
        images: clearance(source.facts.images),
        confidentiality: text(source.facts.confidentiality),
      }
    : null;

  const slug = slugOf(source.slug);
  const publishedSlug = published ? slugOf(published.slug) : null;
  const live =
    type === "post"
      ? isPublicPost({
          slug: publishedSlug,
          status: publishedStatus,
          publishedAt: published?.publishedAt ?? null,
          now,
        })
      : type === "caseStudy"
        ? isPublicCaseStudy({ slug: publishedSlug, status: publishedStatus })
        : false;

  const planKey =
    normalizePlanKey(source.planKey) ||
    normalizePlanKey(text(source.title)) ||
    normalizePlanKey(text(source.client)) ||
    normalizePlanKey(slug);

  return {
    id,
    type,
    title: titleOf(source),
    slug,
    status: type === "openQuestion" ? "legacy" : asStatus(source.status),
    publishedStatus,
    owner: source.owner?.trim() || null,
    updatedAt: source._updatedAt ?? published?._updatedAt ?? null,
    publishedAt: published?.publishedAt ?? source.publishedAt ?? null,
    hasDraft: Boolean(pair.draft),
    hasPublished: Boolean(pair.published),
    live,
    themeId,
    clientId,
    relatedPostIds,
    relatedCaseStudyIds,
    planKey: type === "caseStudy" ? planKey : null,
    refs,
    images,
    strings,
    facts,
    role: text(source.role) || text(source.facts?.role),
    year: typeof source.year === "number" ? source.year : facts?.year ?? null,
    hasStory: Boolean(text(source.problem) || text(source.summary) || hasBlocks(source.outcomes) || hasBlocks(source.approach)),
    route: source.route?.trim() || null,
    template: source.template?.trim() || null,
    tagline: text(source.tagline),
    taglineApproval:
      source.taglineApproval === "approved" || source.taglineApproval === "unapproved"
        ? source.taglineApproval
        : null,
    accentToken: source.accent?.token?.trim() || null,
    question: text(source.question),
    questionStatus:
      source.questionStatus === "open" || source.questionStatus === "decided"
        ? source.questionStatus
        : null,
  };
}

export function normalizeDocs(raw: RawDoc[], now = Date.now()): DeskDoc[] {
  return collapseDrafts(raw).flatMap((pair) => {
    const doc = toDeskDoc(pair, now);
    return doc ? [doc] : [];
  });
}
