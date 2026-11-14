import Link from "next/link";
import { QuestionList, Warning } from "@/components/admin/Panels";
import { textLink } from "@/components/admin/styles";
import { loadDesk } from "@/lib/admin/load";
import { buildDeskView } from "@/lib/admin/view";

export default async function QuestionsPage() {
  const result = await loadDesk();
  if (!result.ok) {
    return (
      <div role="alert">
        <h1 className="font-serif text-3xl">Questions</h1>
        <p className="mt-3 font-serif text-base leading-7">{result.message}</p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-4xl">Questions</h1>
      <p className="mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
        Questions you write down, plus any [TBD] the desk finds in a field.
      </p>
      <Link href="/admin/content/new/openQuestion" className={textLink}>
        New question
      </Link>
      {result.snapshot.warning ? (
        <div className="mt-6">
          <Warning>{result.snapshot.warning}</Warning>
        </div>
      ) : null}
      <div className="mt-8">
        <QuestionList view={buildDeskView(result.snapshot)} />
      </div>
    </div>
  );
}
