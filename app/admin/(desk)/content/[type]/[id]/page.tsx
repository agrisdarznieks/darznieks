import Link from "next/link";
import { notFound } from "next/navigation";
import { DocumentScreen } from "@/components/admin/DocumentScreen";
import { textLink } from "@/components/admin/styles";
import { defaultsFromRaw } from "@/lib/admin/defaults";
import { isEditableType } from "@/lib/admin/doc";
import { loadDesk, loadEditorDocument } from "@/lib/admin/load";
import { TYPE_LABELS } from "@/lib/admin/model";

export default async function EditDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { type, id } = await params;
  const query = await searchParams;
  if (!isEditableType(type) || !id || id.includes("..")) notFound();

  const [result, raw] = await Promise.all([loadDesk(), loadEditorDocument(id)]);
  if (!raw || raw._type !== type) {
    return (
      <div>
        <h1 className="font-serif text-4xl">Not in the desk</h1>
        <p className="mt-3 font-serif text-base leading-7 text-muted-foreground">
          There is no {TYPE_LABELS[type]?.toLowerCase() ?? type} with this id.
        </p>
        <Link href="/admin/content" className={textLink}>
          Back to content
        </Link>
      </div>
    );
  }

  const doc = result.ok ? result.snapshot.docs.find((item) => item.id === id && item.type === type) : null;
  const slug = typeof raw.slug === "string" ? raw.slug : raw.slug?.current;
  const previewPath =
    slug && type === "post"
      ? `/en/writing/${slug}`
      : slug && type === "caseStudy"
        ? `/en/work/${slug}`
        : null;

  return (
    <div>
      <h1 className="font-serif text-4xl">{defaultsFromRaw(type, raw).titleEn || defaultsFromRaw(type, raw).name || "Untitled"}</h1>
      {query.saved ? (
        <p role="status" className="mt-3 font-serif text-base">
          Saved.
        </p>
      ) : null}
      <div className="mt-8">
        <DocumentScreen
          type={type}
          id={id}
          defaults={defaultsFromRaw(type, raw)}
          docs={result.ok ? result.snapshot.docs : []}
          previewPath={previewPath}
          published={Boolean(doc?.live || doc?.publishedStatus === "published")}
        />
      </div>
    </div>
  );
}
