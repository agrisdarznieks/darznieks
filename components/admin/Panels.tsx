import Link from "next/link";
import { docHref } from "@/lib/admin/model";
import type { DeskDoc, DeskView, IntegrityIssue } from "@/lib/admin/types";
import { textLink } from "./styles";

const ISSUE_LABELS: { code: IntegrityIssue["code"]; label: string }[] = [
  { code: "post-without-theme", label: "Post without a theme" },
  { code: "empty-hub", label: "Empty hub" },
  { code: "image-without-alt", label: "Image without alt text" },
  { code: "dangling-reference", label: "Broken or dangling reference" },
  { code: "case-study-missing-facts", label: "Case study missing required facts" },
  { code: "orphan", label: "Orphan document" },
  { code: "missing-status-or-owner", label: "Page without a status or owner" },
];

function formatWhen(value: string | null): string {
  if (!value) return "No edit time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Riga",
  }).format(date);
}

function hrefFor(doc: DeskDoc): string {
  if (doc.type === "siteSettings" || doc.type === "linkCard") return "/admin/studio";
  return docHref(doc.type, doc.id);
}

function statusWord(doc: DeskDoc): string {
  if (doc.live && doc.status !== "published") return "Live, with unpublished edits";
  if (doc.status === "review") return "In review";
  if (doc.status === "published" || doc.live) return "Published";
  if (doc.status === "legacy" || doc.status === "missing") return "No status";
  return "Draft";
}

export function DocList({ docs, empty }: { docs: DeskDoc[]; empty: string }) {
  if (docs.length === 0) {
    return <p className="font-serif text-base leading-7 text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-border border-y border-border">
      {docs.map((doc) => (
        <li key={`${doc.type}-${doc.id}`} className="py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <Link href={hrefFor(doc)} className={textLink}>
              {doc.title}
            </Link>
            <span className="font-sans text-sm text-muted-foreground">{statusWord(doc)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function StatusOverview({ view }: { view: DeskView }) {
  return (
    <section aria-labelledby="status-heading">
      <h2 id="status-heading" className="font-sans text-xl font-semibold">
        Status
      </h2>
      <ul className="mt-4 flex flex-col gap-6">
        {view.groups.map((group) => (
          <li key={group.type}>
            <h3 className="font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </h3>
            <p className="mt-1 font-serif text-base">
              {group.draft.length} draft · {group.review.length} in review · {group.published.length}{" "}
              published
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CaseGoal({ view }: { view: DeskView }) {
  return (
    <section aria-labelledby="case-heading">
      <h2 id="case-heading" className="font-sans text-xl font-semibold">
        Case studies
      </h2>
      <p id="case-goal" className="mt-3 font-serif text-base leading-7">
        <span className="font-sans font-semibold text-accent-text">
          {view.liveReadyCount} of {view.goal}
        </span>{" "}
        are live on /work with a complete fact inventory. The goal is {view.goal} by 30 November
        2026. LAĀA and Ērenpreisa are the planned first two. Their stories are not invented here.
      </p>
      <ul className="mt-6 flex flex-col gap-8">
        {view.cases.map((study) => (
          <li key={study.planKey ?? study.label} className="border-t border-border pt-4">
            <h3 className="font-sans text-lg font-semibold">{study.label}</h3>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              {study.readyCount} of {study.total} checks · {study.live ? "Live" : "Not live"}
            </p>
            {study.docId ? (
              <Link href={docHref("caseStudy", study.docId)} className={textLink}>
                Open the draft
              </Link>
            ) : (
              <Link href="/admin/content/new/caseStudy" className={textLink}>
                Start an empty draft
              </Link>
            )}
            <ul className="mt-3 flex flex-col gap-1">
              {study.items.map((item) => (
                <li key={item.id} className="font-sans text-sm">
                  <span className="inline-block w-16 text-muted-foreground">
                    {item.ready ? "Done" : "Open"}
                  </span>
                  {item.label}
                  <span className="sr-only">. {item.detail}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HubList({ view }: { view: DeskView }) {
  return (
    <section aria-labelledby="hub-heading">
      <h2 id="hub-heading" className="font-sans text-xl font-semibold">
        Theme hubs
      </h2>
      <p className="mt-3 font-serif text-base leading-7 text-muted-foreground">
        A hub with no published post is not a public route. Taglines stay editable, and an
        unapproved tagline is not shown on the site.
      </p>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {view.hubs.map((hub) => (
          <li key={hub.slug} className="py-4">
            <h3 className="font-sans text-base font-semibold">{hub.name}</h3>
            <p className="mt-1 font-sans text-sm text-muted-foreground">
              {hub.postCount} {hub.postCount === 1 ? "post" : "posts"} · {hub.publishedPostCount}{" "}
              published · {hub.routable ? "Public route" : "Not public"}
            </p>
            {hub.tagline ? (
              <p className="mt-2 font-serif text-base leading-7">
                {hub.tagline}
                {hub.taglineApproval !== "approved" ? " · tagline not approved" : ""}
              </p>
            ) : (
              <p className="mt-2 font-serif text-base leading-7 text-muted-foreground">
                No tagline yet.
              </p>
            )}
            <p className="mt-1 font-sans text-sm text-muted-foreground">{hub.reason}</p>
            {hub.docId ? (
              <Link href={docHref("theme", hub.docId)} className={textLink}>
                Edit theme
              </Link>
            ) : (
              <Link href="/admin/content/new/theme" className={textLink}>
                Create this theme
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function QuestionList({ view }: { view: DeskView }) {
  return (
    <section aria-labelledby="question-heading">
      <h2 id="question-heading" className="font-sans text-xl font-semibold">
        Open questions
      </h2>
      {view.questions.length === 0 ? (
        <p className="mt-3 font-serif text-base leading-7 text-muted-foreground">
          No open questions, and no [TBD] markers in the content that the desk can read.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {view.questions.map((item) => (
            <li key={item.id} className="py-3">
              <p className="font-sans text-sm uppercase tracking-widest text-muted-foreground">
                {item.source === "tbd" ? "TBD in content" : "Question"}
              </p>
              {item.href ? (
                <Link href={item.href} className={textLink}>
                  {item.title}
                </Link>
              ) : (
                <p className="font-sans text-base">{item.title}</p>
              )}
              {item.detail ? (
                <p className="font-serif text-base leading-7 text-muted-foreground">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function RecentList({ view }: { view: DeskView }) {
  return (
    <section aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="font-sans text-xl font-semibold">
        Recently edited
      </h2>
      {view.recent.length === 0 ? (
        <p className="mt-3 font-serif text-base leading-7 text-muted-foreground">
          Nothing has an edit time yet.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {view.recent.map((doc) => (
            <li key={doc.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
              <Link href={hrefFor(doc)} className={textLink}>
                {doc.title}
              </Link>
              <time dateTime={doc.updatedAt ?? undefined} className="font-sans text-sm text-muted-foreground">
                {formatWhen(doc.updatedAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function IntegrityList({ view }: { view: DeskView }) {
  return (
    <section aria-labelledby="integrity-heading">
      <h2 id="integrity-heading" className="font-sans text-xl font-semibold">
        Integrity
      </h2>
      {view.issues.length === 0 ? (
        <p className="mt-3 font-serif text-base leading-7 text-muted-foreground">
          Nothing is lost. Themes, references, alt text, facts, and page owners are in place.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-8">
          <p className="font-serif text-base leading-7">
            {view.issues.length} {view.issues.length === 1 ? "item needs" : "items need"} a look.
          </p>
          {ISSUE_LABELS.map((group) => {
            const items = view.issuesByCode[group.code];
            return (
              <section key={group.code} aria-labelledby={`issue-${group.code}`}>
                <h3 id={`issue-${group.code}`} className="font-sans text-base font-semibold">
                  {group.label}
                  <span className="ml-2 font-normal text-muted-foreground">{items.length}</span>
                </h3>
                {items.length === 0 ? (
                  <p className="mt-2 font-serif text-base text-muted-foreground">None.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-3">
                    {items.map((item, index) => (
                      <li key={`${item.code}-${item.docId ?? index}`}>
                        {item.href ? (
                          <Link href={item.href} className={textLink}>
                            {item.title}
                          </Link>
                        ) : (
                          <p className="font-sans text-base">{item.title}</p>
                        )}
                        <p className="font-serif text-base leading-7 text-muted-foreground">
                          {item.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

export function Warning({ children }: { children: string }) {
  return (
    <p role="status" className="border-l-2 border-accent py-1 pl-3 font-serif text-base leading-7">
      {children}
    </p>
  );
}
