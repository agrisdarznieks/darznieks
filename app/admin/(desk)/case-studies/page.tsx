import Link from "next/link";
import { CaseGoal, Warning } from "@/components/admin/Panels";
import { textLink } from "@/components/admin/styles";
import { loadDesk } from "@/lib/admin/load";
import { buildDeskView } from "@/lib/admin/view";

export default async function CaseStudiesPage() {
  const result = await loadDesk();
  if (!result.ok) {
    return (
      <div role="alert">
        <h1 className="font-serif text-3xl">Case studies</h1>
        <p className="mt-3 font-serif text-base leading-7">{result.message}</p>
      </div>
    );
  }
  const view = buildDeskView(result.snapshot);
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-4xl">Case studies</h1>
        <p className="mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
          Readiness is a checklist of facts. Empty means unknown, not a guess.
        </p>
        <Link href="/admin/content/new/caseStudy" className={textLink}>
          New case study
        </Link>
      </header>
      {result.snapshot.warning ? <Warning>{result.snapshot.warning}</Warning> : null}
      <CaseGoal view={view} />
      {view.otherCases.length > 0 ? (
        <section aria-labelledby="other-cases">
          <h2 id="other-cases" className="font-sans text-xl font-semibold">
            Other studies
          </h2>
          <ul className="mt-3">
            {view.otherCases.map((study) => (
              <li key={study.docId ?? study.label} className="font-serif text-base leading-7">
                {study.label}: {study.readyCount} of {study.total}, {study.live ? "live" : "not live"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
