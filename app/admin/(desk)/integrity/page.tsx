import { IntegrityList, Warning } from "@/components/admin/Panels";
import { loadDesk } from "@/lib/admin/load";
import { buildDeskView } from "@/lib/admin/view";

export default async function IntegrityPage() {
  const result = await loadDesk();
  if (!result.ok) {
    return (
      <div role="alert">
        <h1 className="font-serif text-3xl">Integrity</h1>
        <p className="mt-3 font-serif text-base leading-7">{result.message}</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-4xl">Integrity</h1>
      <p className="mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
        Posts without a theme, empty hubs, missing alt text, broken references, unfinished facts,
        orphans, and pages with no status or owner.
      </p>
      {result.snapshot.warning ? (
        <div className="mt-6">
          <Warning>{result.snapshot.warning}</Warning>
        </div>
      ) : null}
      <div className="mt-8">
        <IntegrityList view={buildDeskView(result.snapshot)} />
      </div>
    </div>
  );
}
