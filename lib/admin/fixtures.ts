import { deskDoc } from "./doc";
import type { DeskSnapshot } from "./types";

const now = "2026-11-14T18:00:00.000Z";

function snapshot(docs: DeskSnapshot["docs"], source: DeskSnapshot["source"]): DeskSnapshot {
  return {
    docs,
    assets: [],
    source,
    warning: source === "fixture" ? "Sample records for review. They are not in Sanity." : null,
    fetchedAt: now,
  };
}

/** A desk with the shape of an empty production dataset: settings and link cards only. */
export function emptySnapshot(): DeskSnapshot {
  return snapshot(
    [
      deskDoc({
        id: "siteSettings",
        type: "siteSettings",
        title: "Agris Dārznieks",
        status: "legacy",
        owner: null,
        hasDraft: false,
        hasPublished: true,
        updatedAt: now,
      }),
    ],
    "fixture",
  );
}

/**
 * Sample records for screenshots and accessibility checks.
 * Titles are labels, not case-study copy.
 */
export function populatedSnapshot(): DeskSnapshot {
  const caballero = "theme-caballero";
  const notion = "theme-notion";
  const books = "theme-books";
  const base = "theme-base";
  const figma = "theme-friends";
  const client = "client-sample";
  return snapshot(
    [
      deskDoc({
        id: base,
        type: "theme",
        title: "Base",
        slug: "base",
        status: "draft",
        tagline: "Calm by default",
        taglineApproval: "unapproved",
        updatedAt: "2026-11-14T12:00:00.000Z",
      }),
      deskDoc({
        id: caballero,
        type: "theme",
        title: "Caballero",
        slug: "caballero",
        status: "published",
        hasDraft: false,
        hasPublished: true,
        publishedStatus: "published",
        tagline: "The daylight job",
        taglineApproval: "unapproved",
        updatedAt: "2026-11-13T12:00:00.000Z",
      }),
      deskDoc({
        id: notion,
        type: "theme",
        title: "Notion",
        slug: "notion",
        status: "draft",
        tagline: "Systems for thinking",
        taglineApproval: "unapproved",
        updatedAt: "2026-11-12T12:00:00.000Z",
      }),
      deskDoc({
        id: figma,
        type: "theme",
        title: "Friends of Figma",
        slug: "friends-of-figma",
        status: "draft",
        tagline: "A chapter, written",
        taglineApproval: "unapproved",
        updatedAt: "2026-11-11T12:00:00.000Z",
      }),
      deskDoc({
        id: books,
        type: "theme",
        title: "Books",
        slug: "books",
        status: "draft",
        tagline: "Notes from a bibliography",
        taglineApproval: "unapproved",
        updatedAt: "2026-11-10T12:00:00.000Z",
      }),
      deskDoc({
        id: "post-live",
        type: "post",
        title: "Sample note",
        slug: "sample-note",
        status: "published",
        publishedStatus: "published",
        hasDraft: false,
        hasPublished: true,
        live: true,
        themeId: caballero,
        publishedAt: "2026-11-01T00:00:00.000Z",
        updatedAt: "2026-11-14T16:00:00.000Z",
        refs: [{ field: "theme", id: caballero }],
        strings: [{ field: "excerpt", value: "A sample excerpt for the desk." }],
      }),
      deskDoc({
        id: "post-review",
        type: "post",
        title: "Note in review",
        slug: "note-in-review",
        status: "review",
        themeId: notion,
        updatedAt: "2026-11-14T15:00:00.000Z",
        refs: [{ field: "theme", id: notion }],
      }),
      deskDoc({
        id: "post-lost",
        type: "post",
        title: "Note without a theme",
        slug: "note-without-a-theme",
        status: "draft",
        owner: null,
        updatedAt: "2026-11-09T12:00:00.000Z",
        images: [{ field: "coverImage", alt: null }],
        strings: [{ field: "excerpt", value: "The skill is still [TBD]." }],
      }),
      deskDoc({
        id: "post-dangling",
        type: "post",
        title: "Note with a broken theme",
        slug: "broken-theme",
        status: "draft",
        themeId: "missing-theme",
        updatedAt: "2026-11-08T12:00:00.000Z",
        refs: [{ field: "theme", id: "missing-theme" }],
      }),
      deskDoc({
        id: client,
        type: "client",
        title: "Sample client",
        slug: "sample-client",
        status: "draft",
        updatedAt: "2026-11-07T12:00:00.000Z",
      }),
      deskDoc({
        id: "client-orphan",
        type: "client",
        title: "Unlinked client",
        slug: "unlinked-client",
        status: "draft",
        updatedAt: "2026-11-06T12:00:00.000Z",
      }),
      deskDoc({
        id: "case-laaa",
        type: "caseStudy",
        title: "LAĀA",
        slug: "laaa",
        planKey: "laaa",
        status: "draft",
        clientId: client,
        updatedAt: "2026-11-14T17:00:00.000Z",
        refs: [{ field: "client", id: client }],
        facts: {
          mayBePublic: "unknown",
          role: null,
          year: null,
          images: "unknown",
          confidentiality: null,
        },
      }),
      deskDoc({
        id: "page-home",
        type: "page",
        title: "Home",
        slug: "home",
        route: "/",
        template: "home",
        status: "draft",
        updatedAt: "2026-11-05T12:00:00.000Z",
      }),
      deskDoc({
        id: "page-bare",
        type: "page",
        title: "About",
        slug: "about",
        route: "/about",
        template: "about",
        status: "legacy",
        owner: null,
        updatedAt: "2026-11-04T12:00:00.000Z",
      }),
      deskDoc({
        id: "question-1",
        type: "openQuestion",
        title: "Which positioning line should the homepage use?",
        question: "Which positioning line should the homepage use?",
        questionStatus: "open",
        status: "legacy",
        owner: "Agris Dārznieks",
        updatedAt: "2026-11-03T12:00:00.000Z",
      }),
    ],
    "fixture",
  );
}

export function fixtureSnapshot(name: string | null | undefined): DeskSnapshot | null {
  if (name === "empty") return emptySnapshot();
  if (name === "populated" || name === "integrity") return populatedSnapshot();
  return null;
}
