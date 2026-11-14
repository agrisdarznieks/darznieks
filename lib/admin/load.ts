import "server-only";

import { cookies } from "next/headers";
import { e2eAdminBypassEnabled } from "./guard";
import { fixtureSnapshot } from "./fixtures";
import { normalizeDocs, type RawDoc } from "./normalize";
import type { DeskSnapshot } from "./types";
import { adminReadClient, adminReadToken } from "@/sanity/lib/admin";

const PROJECTION = `{
  _id,
  _type,
  _updatedAt,
  title,
  name,
  label,
  slug,
  status,
  owner,
  publishedAt,
  theme,
  clientRef,
  relatedPosts,
  relatedCaseStudies,
  planKey,
  coverImage{ alt, asset },
  images[]{ alt, asset },
  facts,
  role,
  year,
  excerpt,
  problem,
  summary,
  body,
  approach,
  outcomes,
  tagline,
  taglineApproval,
  accent,
  intro,
  question,
  detail,
  questionStatus,
  route,
  template,
  publicName,
  confidentiality,
  website,
  tags,
  client
}`;

const DESK_QUERY = `*[_type in $types]${PROJECTION}`;
const ONE_QUERY = `*[_id in [$id, $draft]]${PROJECTION}`;

const ASSET_QUERY = `*[_type == "sanity.imageAsset"]{
  _id,
  originalFilename,
  "referenced": count(*[references(^._id)]) > 0
}`;

interface RawAsset {
  _id: string;
  originalFilename?: string | null;
  referenced?: boolean;
}

const TYPES = [
  "post",
  "caseStudy",
  "theme",
  "client",
  "page",
  "openQuestion",
  "siteSettings",
  "linkCard",
];

export type DeskResult =
  | { ok: true; snapshot: DeskSnapshot }
  | { ok: false; message: string };

async function fixtureFromCookie(): Promise<DeskSnapshot | null> {
  if (!e2eAdminBypassEnabled() || process.env.ADMIN_E2E_FIXTURES !== "1") return null;
  const jar = await cookies();
  return fixtureSnapshot(jar.get("darznieks_admin_fixture")?.value);
}

export async function loadEditorDocument(id: string): Promise<RawDoc | null> {
  const fixture = await fixtureFromCookie();
  if (fixture) {
    const doc = fixture.docs.find((item) => item.id === id);
    if (!doc) return null;
    return {
      _id: doc.id,
      _type: doc.type,
      _updatedAt: doc.updatedAt,
      title: { en: doc.title === "Untitled" ? "" : doc.title },
      name: doc.title,
      slug: doc.slug,
      status: doc.status === "legacy" || doc.status === "missing" ? null : doc.status,
      owner: doc.owner,
      publishedAt: doc.publishedAt,
      theme: doc.themeId ? { _ref: doc.themeId } : null,
      clientRef: doc.clientId ? { _ref: doc.clientId } : null,
      planKey: doc.planKey,
      facts: doc.facts
        ? {
            mayBePublic: doc.facts.mayBePublic,
            role: doc.facts.role ? { en: doc.facts.role } : null,
            year: doc.facts.year,
            images: doc.facts.images,
            confidentiality: doc.facts.confidentiality
              ? { en: doc.facts.confidentiality }
              : null,
          }
        : null,
      role: doc.role ? { en: doc.role } : null,
      year: doc.year,
      tagline: doc.tagline ? { en: doc.tagline } : null,
      taglineApproval: doc.taglineApproval,
      accent: doc.accentToken ? { token: doc.accentToken } : null,
      route: doc.route,
      template: doc.template,
      question: doc.question,
      questionStatus: doc.questionStatus,
      relatedPosts: doc.relatedPostIds.map((ref) => ({ _ref: ref })),
      relatedCaseStudies: doc.relatedCaseStudyIds.map((ref) => ({ _ref: ref })),
    };
  }

  const client = adminReadClient();
  const docs = await client.fetch<RawDoc[]>(ONE_QUERY, {
    id,
    draft: `drafts.${id}`,
  });
  if (!Array.isArray(docs) || docs.length === 0) return null;
  return docs.find((doc) => doc._id.startsWith("drafts.")) ?? docs[0];
}

export async function loadDesk(): Promise<DeskResult> {
  const fixture = await fixtureFromCookie();
  if (fixture) return { ok: true, snapshot: fixture };

  try {
    const client = adminReadClient();
    const [docs, assets] = await Promise.all([
      client.fetch<RawDoc[]>(DESK_QUERY, { types: TYPES }),
      client.fetch<RawAsset[] | null>(ASSET_QUERY).catch(() => []),
    ]);
    const warning = adminReadToken()
      ? null
      : "No Sanity read token is set, so drafts are hidden. Published documents are still listed.";
    return {
      ok: true,
      snapshot: {
        docs: normalizeDocs(Array.isArray(docs) ? docs : []),
        assets: Array.isArray(assets)
          ? assets.map((asset) => ({
              id: asset._id,
              filename: asset.originalFilename ?? null,
              referenced: asset.referenced === true,
            }))
          : [],
        source: "sanity",
        warning,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Admin desk failed to read Sanity.", error);
    return {
      ok: false,
      message: "The desk could not read Sanity. Check the project id, dataset, and token.",
    };
  }
}
