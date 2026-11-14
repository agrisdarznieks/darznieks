import {
  CaseGoal,
  HubList,
  IntegrityList,
  QuestionList,
  RecentList,
  StatusOverview,
  Warning,
} from "@/components/admin/Panels";
import { buttonQuiet } from "@/components/admin/styles";
import { loadDesk } from "@/lib/admin/load";
import { buildDeskView } from "@/lib/admin/view";
import { revalidateNow } from "./actions";

export default async function DeskHome({
  searchParams,
}: {
  searchParams: Promise<{ revalidated?: string; preview?: string }>;
}) {
  const params = await searchParams;
  const result = await loadDesk();
  if (!result.ok) {
    return (
      <div role="alert">
        <h1 className="font-serif text-3xl">Overview</h1>
        <p className="mt-3 font-serif text-base leading-7">{result.message}</p>
      </div>
    );
  }
  const view = buildDeskView(result.snapshot);

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="font-serif text-4xl">Overview</h1>
        <p className="mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
          Drafts, the two case studies, theme hubs, and anything that would otherwise get lost.
        </p>
      </header>
      {params.revalidated ? (
        <p role="status" className="font-serif text-base">
          Revalidation was requested. Public pages will pick it up on the next visit.
        </p>
      ) : null}
      {params.preview === "invalid" ? (
        <p role="alert" className="font-serif text-base">
          That preview path is not a writing or work page.
        </p>
      ) : null}
      {result.snapshot.warning ? <Warning>{result.snapshot.warning}</Warning> : null}
      <form action={revalidateNow}>
        <button type="submit" className={buttonQuiet}>
          Revalidate the public site
        </button>
      </form>
      <StatusOverview view={view} />
      <CaseGoal view={view} />
      <HubList view={view} />
      <QuestionList view={view} />
      <RecentList view={view} />
      <IntegrityList view={view} />
    </div>
  );
}
