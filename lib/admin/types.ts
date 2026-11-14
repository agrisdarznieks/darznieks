export const EDITORIAL_TYPES = [
  "post",
  "caseStudy",
  "theme",
  "client",
  "page",
  "openQuestion",
] as const;

export type EditorialType = (typeof EDITORIAL_TYPES)[number];

export type DeskDocType = EditorialType | "siteSettings" | "linkCard";

export type EditorialStatus = "draft" | "review" | "published" | "legacy" | "missing";

export type PlanKey = "laaa" | "erenpreisa";

export type MayBePublic = "unknown" | "yes" | "no";

export type ImageClearance = "unknown" | "none" | "uncleared" | "cleared";

export interface DeskImage {
  field: string;
  alt: string | null;
}

export interface DeskRef {
  field: string;
  id: string;
}

export interface DeskString {
  field: string;
  value: string;
}

export interface DeskFacts {
  mayBePublic: MayBePublic | null;
  role: string | null;
  year: number | null;
  images: ImageClearance | null;
  confidentiality: string | null;
}

export interface DeskDoc {
  id: string;
  type: DeskDocType;
  title: string;
  slug: string | null;
  /** Status of the copy being edited. A draft wins over the published copy. */
  status: EditorialStatus;
  /** Status stored on the published id, when that document exists. */
  publishedStatus: EditorialStatus | null;
  owner: string | null;
  updatedAt: string | null;
  publishedAt: string | null;
  hasDraft: boolean;
  hasPublished: boolean;
  /** True when the published id would render on the public site. */
  live: boolean;
  themeId: string | null;
  clientId: string | null;
  relatedPostIds: string[];
  relatedCaseStudyIds: string[];
  planKey: PlanKey | null;
  refs: DeskRef[];
  images: DeskImage[];
  strings: DeskString[];
  facts: DeskFacts | null;
  role: string | null;
  year: number | null;
  hasStory: boolean;
  route: string | null;
  template: string | null;
  tagline: string | null;
  taglineApproval: "unapproved" | "approved" | null;
  accentToken: string | null;
  question: string | null;
  questionStatus: "open" | "decided" | null;
}

export interface DeskAsset {
  id: string;
  filename: string | null;
  referenced: boolean;
}

export interface DeskSnapshot {
  docs: DeskDoc[];
  assets: DeskAsset[];
  source: "sanity" | "fixture";
  warning: string | null;
  fetchedAt: string;
}

export type IssueCode =
  | "post-without-theme"
  | "empty-hub"
  | "image-without-alt"
  | "dangling-reference"
  | "case-study-missing-facts"
  | "orphan"
  | "missing-status-or-owner";

export interface IntegrityIssue {
  code: IssueCode;
  docId: string | null;
  docType: string | null;
  title: string;
  detail: string;
  href: string | null;
}

export interface ReadinessItem {
  id: string;
  label: string;
  ready: boolean;
  detail: string;
}

export interface CaseReadiness {
  planKey: PlanKey | null;
  label: string;
  docId: string | null;
  items: ReadinessItem[];
  readyCount: number;
  total: number;
  live: boolean;
}

export interface HubRow {
  slug: string;
  name: string;
  tagline: string | null;
  taglineApproval: "unapproved" | "approved" | null;
  documentStatus: EditorialStatus | "absent";
  postCount: number;
  publishedPostCount: number;
  routable: boolean;
  reason: string;
  docId: string | null;
}

export interface QuestionItem {
  id: string;
  title: string;
  detail: string | null;
  source: "document" | "tbd";
  href: string | null;
}

export interface StatusGroup {
  type: EditorialType;
  label: string;
  draft: DeskDoc[];
  review: DeskDoc[];
  published: DeskDoc[];
}

export interface DeskView {
  groups: StatusGroup[];
  hubs: HubRow[];
  cases: CaseReadiness[];
  otherCases: CaseReadiness[];
  liveReadyCount: number;
  goal: number;
  goalDate: string;
  questions: QuestionItem[];
  recent: DeskDoc[];
  issues: IntegrityIssue[];
  issuesByCode: Record<IssueCode, IntegrityIssue[]>;
}
