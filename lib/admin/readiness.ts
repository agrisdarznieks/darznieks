import { caseFactGaps } from "./integrity";
import { CASE_GOAL, PLANNED_CASES } from "./model";
import type { CaseReadiness, DeskDoc, PlanKey, ReadinessItem } from "./types";

const LABELS: Record<string, string> = {
  title: "Title",
  slug: "Slug",
  client: "Client",
  role: "Role",
  year: "Year",
  "what may be public": "What may be public",
  confidentiality: "Confidentiality",
  images: "Images",
  "images marked none while files are attached": "Images match the clearance note",
  "image alt text": "Alt text on every image",
  problem: "Problem",
  "what changed": "What changed",
  "fields marked TBD": "No [TBD] left in the text",
};

function itemsFor(doc: DeskDoc | null): ReadinessItem[] {
  const gaps = new Set(doc ? caseFactGaps(doc) : Object.keys(LABELS));
  return Object.entries(LABELS).map(([id, label]) => ({
    id,
    label,
    ready: doc ? !gaps.has(id) : false,
    detail: doc ? (gaps.has(id) ? "Still open." : "Recorded.") : "No document yet.",
  }));
}

function readiness(label: string, planKey: PlanKey | null, doc: DeskDoc | null): CaseReadiness {
  const items = itemsFor(doc);
  return {
    planKey,
    label,
    docId: doc?.id ?? null,
    items,
    readyCount: items.filter((item) => item.ready).length,
    total: items.length,
    live: Boolean(doc?.live) && items.every((item) => item.ready),
  };
}

export function caseReadiness(docs: DeskDoc[]): {
  planned: CaseReadiness[];
  others: CaseReadiness[];
  liveReadyCount: number;
  goal: number;
} {
  const studies = docs.filter((doc) => doc.type === "caseStudy");
  const used = new Set<string>();
  const planned = PLANNED_CASES.map((plan) => {
    const doc = studies.find((item) => item.planKey === plan.planKey) ?? null;
    if (doc) used.add(doc.id);
    return readiness(plan.label, plan.planKey, doc);
  });
  const others = studies
    .filter((doc) => !used.has(doc.id))
    .map((doc) => readiness(doc.title, doc.planKey, doc));
  const liveReadyCount = [...planned, ...others].filter((item) => item.live).length;
  return { planned, others, liveReadyCount, goal: CASE_GOAL };
}
