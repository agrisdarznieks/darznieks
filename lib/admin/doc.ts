import type { DeskDoc, DeskDocType } from "./types";

export function deskDoc(partial: Partial<DeskDoc> & Pick<DeskDoc, "id" | "type" | "title">): DeskDoc {
  return {
    slug: null,
    status: "draft",
    publishedStatus: null,
    owner: "Agris Dārznieks",
    updatedAt: null,
    publishedAt: null,
    hasDraft: true,
    hasPublished: false,
    live: false,
    themeId: null,
    clientId: null,
    relatedPostIds: [],
    relatedCaseStudyIds: [],
    planKey: null,
    refs: [],
    images: [],
    strings: [],
    facts: null,
    role: null,
    year: null,
    hasStory: false,
    route: null,
    template: null,
    tagline: null,
    taglineApproval: null,
    accentToken: null,
    question: null,
    questionStatus: null,
    ...partial,
  };
}

export function isEditableType(value: string): value is Exclude<DeskDocType, "siteSettings" | "linkCard"> {
  return (
    value === "post" ||
    value === "caseStudy" ||
    value === "theme" ||
    value === "client" ||
    value === "page" ||
    value === "openQuestion"
  );
}
