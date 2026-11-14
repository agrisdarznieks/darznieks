import Link from "next/link";
import { HubList, Warning } from "@/components/admin/Panels";
import { textLink } from "@/components/admin/styles";
import { loadDesk } from "@/lib/admin/load";
import { buildDeskView } from "@/lib/admin/view";

export default async function ThemesPage() {
  const result = await loadDesk();
  if (!result.ok) {
    return (
      <div role="alert">
        <h1 className="font-serif text-3xl">Themes</h1>
        <p className="mt-3 font-serif text-base leading-7">{result.message}</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-4xl">Themes</h1>
      <Link href="/admin/content/new/theme" className={textLink}>
        New theme
      </Link>
      {result.snapshot.warning ? (
        <div className="mt-6">
          <Warning>{result.snapshot.warning}</Warning>
        </div>
      ) : null}
      <div className="mt-8">
        <HubList view={buildDeskView(result.snapshot)} />
      </div>
    </div>
  );
}
