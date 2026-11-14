import Link from "next/link";
import { DocList, Warning } from "@/components/admin/Panels";
import { button, control, textLink } from "@/components/admin/styles";
import { loadDesk } from "@/lib/admin/load";
import { TYPE_LABELS, TYPE_SINGULAR } from "@/lib/admin/model";
import type { DeskDoc, EditorialType } from "@/lib/admin/types";

const TYPES: EditorialType[] = ["post", "caseStudy", "theme", "client", "page", "openQuestion"];

function matchesStatus(doc: DeskDoc, status: string): boolean {
  if (!status) return true;
  if (status === "review") return doc.status === "review";
  if (status === "published") return doc.status === "published" || doc.live;
  return doc.status !== "review" && doc.status !== "published" && !doc.live;
}

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>;
}) {
  const params = await searchParams;
  const result = await loadDesk();
  if (!result.ok) {
    return (
      <div role="alert">
        <h1 className="font-serif text-3xl">Content</h1>
        <p className="mt-3 font-serif text-base leading-7">{result.message}</p>
      </div>
    );
  }

  const q = params.q?.trim().toLowerCase() ?? "";
  const type = TYPES.includes(params.type as EditorialType) ? params.type : "";
  const status = params.status === "draft" || params.status === "review" || params.status === "published" ? params.status : "";
  const editorial = result.snapshot.docs.filter((doc) => TYPES.includes(doc.type as EditorialType));
  const docs = editorial.filter((doc) => {
    if (type && doc.type !== type) return false;
    if (!matchesStatus(doc, status)) return false;
    if (!q) return true;
    return `${doc.title} ${doc.slug ?? ""}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <h1 className="font-serif text-4xl">Content</h1>
      <p className="mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
        Search the desk, then open a draft. Rich text stays in Studio.
      </p>
      {result.snapshot.warning ? (
        <div className="mt-6">
          <Warning>{result.snapshot.warning}</Warning>
        </div>
      ) : null}
      <ul className="mt-6 flex flex-wrap gap-x-4">
        {TYPES.map((item) => (
          <li key={item}>
            <Link href={`/admin/content/new/${item}`} className={textLink}>
              New {TYPE_SINGULAR[item] ?? item}
            </Link>
          </li>
        ))}
      </ul>
      <form method="get" action="/admin/content" className="mt-6 grid gap-3 sm:grid-cols-[1fr_10rem_10rem_auto] sm:items-end">
        <div>
          <label htmlFor="q" className="font-sans text-sm font-semibold">
            Search
          </label>
          <input id="q" name="q" defaultValue={params.q ?? ""} className={control} />
        </div>
        <div>
          <label htmlFor="type" className="font-sans text-sm font-semibold">
            Type
          </label>
          <select id="type" name="type" defaultValue={type} className={control}>
            <option value="">All</option>
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {TYPE_LABELS[item]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="font-sans text-sm font-semibold">
            Status
          </label>
          <select id="status" name="status" defaultValue={status} className={control}>
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="review">In review</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className={button}>
          Apply
        </button>
      </form>
      <p role="status" className="mt-4 font-sans text-sm text-muted-foreground">
        {docs.length} {docs.length === 1 ? "item" : "items"}
      </p>
      <div className="mt-2">
        <DocList
          docs={docs}
          empty={
            editorial.length === 0
              ? "The desk has no posts, case studies, themes, clients, pages, or questions yet."
              : "Nothing matches that search."
          }
        />
      </div>
    </div>
  );
}
