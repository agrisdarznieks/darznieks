import { docHref, PAGE_MAP, PLANNED_CASES, THEMES } from "./model";
import { tbdFields } from "./tbd";
import type { DeskDoc, DeskSnapshot, IntegrityIssue, IssueCode } from "./types";

function issue(partial: IntegrityIssue): IntegrityIssue {
  return partial;
}

export function caseFactGaps(doc: DeskDoc): string[] {
  const gaps: string[] = [];
  if (!doc.title.trim() || doc.title === "Untitled") gaps.push("title");
  if (!doc.slug) gaps.push("slug");
  if (!doc.clientId) gaps.push("client");
  if (!doc.role) gaps.push("role");
  if (doc.year == null && doc.facts?.year == null) gaps.push("year");
  if (doc.facts?.mayBePublic !== "yes") gaps.push("what may be public");
  if (!doc.facts?.confidentiality) gaps.push("confidentiality");
  const clearance = doc.facts?.images;
  if (clearance !== "none" && clearance !== "cleared") gaps.push("images");
  if (clearance === "none" && doc.images.length > 0) gaps.push("images marked none while files are attached");
  if (clearance === "cleared" && doc.images.some((image) => !image.alt)) gaps.push("image alt text");
  if (!doc.strings.some((item) => item.field === "problem")) gaps.push("problem");
  if (!doc.hasStory) gaps.push("what changed");
  if (tbdFields(doc.strings).length > 0) gaps.push("fields marked TBD");
  return gaps;
}

export function findIntegrityIssues(snapshot: Pick<DeskSnapshot, "docs" | "assets">): IntegrityIssue[] {
  const docs = snapshot.docs;
  const ids = new Set(docs.map((doc) => doc.id));
  const issues: IntegrityIssue[] = [];

  for (const doc of docs) {
    if (doc.type === "post" && !doc.themeId) {
      issues.push(
        issue({
          code: "post-without-theme",
          docId: doc.id,
          docType: doc.type,
          title: doc.title,
          detail: "This post has no theme, so it cannot sit in a hub.",
          href: docHref(doc.type, doc.id),
        }),
      );
    }

    for (const image of doc.images) {
      if (!image.alt) {
        issues.push(
          issue({
            code: "image-without-alt",
            docId: doc.id,
            docType: doc.type,
            title: doc.title,
            detail: `${image.field} has a file and no English alt text.`,
            href: docHref(doc.type, doc.id),
          }),
        );
      }
    }

    for (const ref of doc.refs) {
      if (!ids.has(ref.id)) {
        issues.push(
          issue({
            code: "dangling-reference",
            docId: doc.id,
            docType: doc.type,
            title: doc.title,
            detail: `${ref.field} points at ${ref.id}, and that document is missing.`,
            href: docHref(doc.type, doc.id),
          }),
        );
      } else {
        const target = docs.find((item) => item.id === ref.id);
        const expected =
          ref.field === "theme"
            ? "theme"
            : ref.field === "client"
              ? "client"
              : ref.field === "relatedPosts"
                ? "post"
                : ref.field === "relatedCaseStudies"
                  ? "caseStudy"
                  : null;
        if (target && expected && target.type !== expected) {
          issues.push(
            issue({
              code: "dangling-reference",
              docId: doc.id,
              docType: doc.type,
              title: doc.title,
              detail: `${ref.field} points at a ${target.type}, not a ${expected}.`,
              href: docHref(doc.type, doc.id),
            }),
          );
        }
      }
    }

    if (doc.type === "caseStudy") {
      const gaps = caseFactGaps(doc);
      if (gaps.length > 0) {
        issues.push(
          issue({
            code: "case-study-missing-facts",
            docId: doc.id,
            docType: doc.type,
            title: doc.title,
            detail: `Missing: ${gaps.join(", ")}.`,
            href: docHref(doc.type, doc.id),
          }),
        );
      }
    }

    if (doc.type === "client") {
      const used = docs.some((item) => item.type === "caseStudy" && item.clientId === doc.id);
      if (!used) {
        issues.push(
          issue({
            code: "orphan",
            docId: doc.id,
            docType: doc.type,
            title: doc.title,
            detail: "No case study references this client.",
            href: docHref(doc.type, doc.id),
          }),
        );
      }
    }

    const needsEditorial = doc.type === "page" || doc.type === "post" || doc.type === "caseStudy" || doc.type === "theme";
    if (needsEditorial && (doc.status === "legacy" || doc.status === "missing" || !doc.owner)) {
      const missing = [
        doc.status === "legacy" || doc.status === "missing" ? "status" : null,
        !doc.owner ? "owner" : null,
      ].filter(Boolean);
      issues.push(
        issue({
          code: "missing-status-or-owner",
          docId: doc.id,
          docType: doc.type,
          title: doc.title,
          detail: `Missing ${missing.join(" and ")}.`,
          href: docHref(doc.type, doc.id),
        }),
      );
    }
  }

  for (const theme of THEMES) {
    const doc = docs.find((item) => item.type === "theme" && item.slug === theme.slug);
    const posts = docs.filter(
      (item) => item.type === "post" && item.live && doc && item.themeId === doc.id,
    );
    if (posts.length === 0) {
      issues.push(
        issue({
          code: "empty-hub",
          docId: doc?.id ?? null,
          docType: "theme",
          title: theme.name,
          detail: theme.publicHub
            ? "No published post uses this theme, so the hub is not a public route."
            : "No published post uses Base. Base is not a public hub.",
          href: doc ? docHref("theme", doc.id) : "/admin/themes",
        }),
      );
    }
  }

  for (const planned of PLANNED_CASES) {
    const doc = docs.find((item) => item.type === "caseStudy" && item.planKey === planned.planKey);
    if (!doc) {
      issues.push(
        issue({
          code: "case-study-missing-facts",
          docId: null,
          docType: "caseStudy",
          title: planned.label,
          detail: "No document yet, so the fact inventory has not been started.",
          href: "/admin/case-studies",
        }),
      );
    }
  }

  for (const page of PAGE_MAP) {
    if (!page.concrete) continue;
    const doc = docs.find((item) => item.type === "page" && item.route === page.route);
    if (!doc) {
      issues.push(
        issue({
          code: "missing-status-or-owner",
          docId: null,
          docType: "page",
          title: page.name,
          detail: `${page.route} has no page document, so it has no status or owner.`,
          href: "/admin/content/new/page",
        }),
      );
    }
  }

  for (const asset of snapshot.assets) {
    if (!asset.referenced) {
      issues.push(
        issue({
          code: "orphan",
          docId: asset.id,
          docType: "sanity.imageAsset",
          title: asset.filename || "Unused image",
          detail: "No document references this image.",
          href: "/admin/studio",
        }),
      );
    }
  }

  return issues;
}

export function issuesByCode(issues: IntegrityIssue[]): Record<IssueCode, IntegrityIssue[]> {
  const grouped: Record<IssueCode, IntegrityIssue[]> = {
    "post-without-theme": [],
    "empty-hub": [],
    "image-without-alt": [],
    "dangling-reference": [],
    "case-study-missing-facts": [],
    orphan: [],
    "missing-status-or-owner": [],
  };
  for (const item of issues) grouped[item.code].push(item);
  return grouped;
}
