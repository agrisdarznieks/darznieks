import { notFound } from "next/navigation";
import { DocumentScreen } from "@/components/admin/DocumentScreen";
import { emptyDefaults } from "@/lib/admin/defaults";
import { isEditableType } from "@/lib/admin/doc";
import { loadDesk } from "@/lib/admin/load";
import { TYPE_SINGULAR } from "@/lib/admin/model";

export default async function NewDocumentPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isEditableType(type)) notFound();
  const result = await loadDesk();
  const docs = result.ok ? result.snapshot.docs : [];
  const label = TYPE_SINGULAR[type] ?? type;

  return (
    <div>
      <h1 className="font-serif text-4xl">New {label.toLowerCase()}</h1>
      <p className="mt-3 max-w-xl font-serif text-base leading-7 text-muted-foreground">
        This starts a draft. It does not appear on the public site until you publish it.
      </p>
      {!result.ok ? (
        <p role="alert" className="mt-4 font-serif text-base leading-7">
          {result.message} You can still fill the form, and saving will fail until Sanity answers.
        </p>
      ) : null}
      <div className="mt-8">
        <DocumentScreen
          type={type}
          id={crypto.randomUUID()}
          defaults={emptyDefaults(type)}
          docs={docs}
          previewPath={null}
          published={false}
        />
      </div>
    </div>
  );
}
