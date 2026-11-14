import { describe, expect, it } from "vitest";
import { deskDoc } from "./doc";
import { populatedSnapshot } from "./fixtures";
import { themeHubs } from "./hubs";
import { findIntegrityIssues } from "./integrity";
import { caseReadiness } from "./readiness";
import { buildDeskView } from "./view";
import type { DeskDoc } from "./types";

function readyStudy(): DeskDoc {
  return deskDoc({
    id: "case-ready",
    type: "caseStudy",
    title: "A finished study",
    slug: "finished-study",
    status: "published",
    publishedStatus: "published",
    hasDraft: false,
    hasPublished: true,
    live: true,
    clientId: "client-1",
    role: "UX designer",
    year: 2024,
    hasStory: true,
    facts: {
      mayBePublic: "yes",
      role: "UX designer",
      year: 2024,
      images: "none",
      confidentiality: "No extra limits recorded by Agris.",
    },
    strings: [
      { field: "problem", value: "The problem, in his words." },
      { field: "summary", value: "What changed, without an invented metric." },
    ],
    refs: [{ field: "client", id: "client-1" }],
  });
}

describe("integrity checks", () => {
  it("flags every lost or broken relationship in the sample desk", () => {
    const issues = findIntegrityIssues(populatedSnapshot());
    const codes = new Set(issues.map((item) => item.code));
    expect(codes.has("post-without-theme")).toBe(true);
    expect(codes.has("empty-hub")).toBe(true);
    expect(codes.has("image-without-alt")).toBe(true);
    expect(codes.has("dangling-reference")).toBe(true);
    expect(codes.has("case-study-missing-facts")).toBe(true);
    expect(codes.has("orphan")).toBe(true);
    expect(codes.has("missing-status-or-owner")).toBe(true);

    expect(issues.some((item) => item.title === "Note without a theme")).toBe(true);
    expect(issues.some((item) => item.detail.includes("missing-theme"))).toBe(true);
    expect(issues.some((item) => item.title === "Unlinked client" && item.code === "orphan")).toBe(
      true,
    );
    expect(issues.some((item) => item.title === "Ērenpreisa" && item.detail.includes("No document"))).toBe(
      true,
    );
    expect(issues.some((item) => item.title === "Work" && item.code === "missing-status-or-owner")).toBe(
      true,
    );
  });

  it("does not treat a referenced client or a themed post as lost", () => {
    const issues = findIntegrityIssues(populatedSnapshot());
    expect(issues.some((item) => item.title === "Sample client" && item.code === "orphan")).toBe(
      false,
    );
    expect(issues.some((item) => item.title === "Sample note" && item.code === "post-without-theme")).toBe(
      false,
    );
  });

  it("keeps a hub with no published posts off the public route", () => {
    const hubs = themeHubs(populatedSnapshot().docs);
    const books = hubs.find((hub) => hub.slug === "books");
    const caballero = hubs.find((hub) => hub.slug === "caballero");
    const base = hubs.find((hub) => hub.slug === "base");
    expect(books?.publishedPostCount).toBe(0);
    expect(books?.routable).toBe(false);
    expect(caballero?.publishedPostCount).toBe(1);
    expect(caballero?.routable).toBe(true);
    expect(base?.routable).toBe(false);
  });

  it("counts a case study as live only when the fact inventory is complete", () => {
    const incomplete = caseReadiness(populatedSnapshot().docs);
    expect(incomplete.liveReadyCount).toBe(0);
    const laaa = incomplete.planned.find((item) => item.planKey === "laaa");
    expect(laaa?.docId).toBe("case-laaa");
    expect(laaa?.items.find((item) => item.id === "what may be public")?.ready).toBe(false);
    expect(laaa?.live).toBe(false);

    const complete = caseReadiness([
      readyStudy(),
      deskDoc({ id: "client-1", type: "client", title: "Client", slug: "client" }),
    ]);
    expect(complete.liveReadyCount).toBe(1);
    expect(complete.goal).toBe(2);
  });

  it("surfaces [TBD] text as an open question without inventing one", () => {
    const view = buildDeskView(populatedSnapshot());
    expect(view.questions.some((item) => item.source === "tbd" && item.detail?.includes("[TBD]"))).toBe(
      true,
    );
    expect(view.groups.find((group) => group.type === "post")?.published).toHaveLength(1);
    expect(view.groups.find((group) => group.type === "post")?.review).toHaveLength(1);
    expect(view.recent[0]?.id).toBe("case-laaa");
  });
});
