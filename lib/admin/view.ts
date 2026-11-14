import { themeHubs } from "./hubs";
import { findIntegrityIssues, issuesByCode } from "./integrity";
import { CASE_GOAL_DATE, TYPE_LABELS } from "./model";
import { caseReadiness } from "./readiness";
import { containsTbd } from "./tbd";
import type { DeskDoc, DeskSnapshot, DeskView, EditorialType, QuestionItem, StatusGroup } from "./types";

const GROUP_TYPES: EditorialType[] = ["post", "caseStudy", "theme", "client", "page", "openQuestion"];

function bucket(docs: DeskDoc[]): Pick<StatusGroup, "draft" | "review" | "published"> {
  const draft: DeskDoc[] = [];
  const review: DeskDoc[] = [];
  const published: DeskDoc[] = [];
  for (const doc of docs) {
    if (doc.type === "openQuestion") continue;
    if (doc.status === "review") review.push(doc);
    else if (doc.status === "published" || doc.live) published.push(doc);
    else draft.push(doc);
  }
  return { draft, review, published };
}

function questions(docs: DeskDoc[]): QuestionItem[] {
  const items: QuestionItem[] = [];
  for (const doc of docs) {
    if (doc.type === "openQuestion" && doc.questionStatus !== "decided") {
      items.push({
        id: doc.id,
        title: doc.question || doc.title,
        detail: doc.strings.find((item) => item.field === "detail")?.value ?? null,
        source: "document",
        href: `/admin/content/openQuestion/${doc.id}`,
      });
    }
    for (const field of doc.strings) {
      if (!containsTbd(field.value)) continue;
      items.push({
        id: `${doc.id}:${field.field}`,
        title: `${doc.title} · ${field.field}`,
        detail: field.value,
        source: "tbd",
        href: doc.type === "linkCard" || doc.type === "siteSettings" ? "/admin/studio" : `/admin/content/${doc.type}/${doc.id}`,
      });
    }
  }
  return items;
}

export function buildDeskView(snapshot: DeskSnapshot): DeskView {
  const docs = snapshot.docs;
  const groups: StatusGroup[] = GROUP_TYPES.map((type) => ({
    type,
    label: TYPE_LABELS[type] ?? type,
    ...bucket(docs.filter((doc) => doc.type === type)),
  }));
  const cases = caseReadiness(docs);
  const issues = findIntegrityIssues(snapshot);
  const recent = [...docs]
    .filter((doc) => doc.updatedAt)
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    .slice(0, 8);

  return {
    groups,
    hubs: themeHubs(docs),
    cases: cases.planned,
    otherCases: cases.others,
    liveReadyCount: cases.liveReadyCount,
    goal: cases.goal,
    goalDate: CASE_GOAL_DATE,
    questions: questions(docs),
    recent,
    issues,
    issuesByCode: issuesByCode(issues),
  };
}
