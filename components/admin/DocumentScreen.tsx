import { EditorForm } from "./EditorForm";
import type { EditorDefaults } from "@/lib/admin/defaults";
import { adminWriteToken } from "@/sanity/lib/admin";
import type { DeskDoc, EditorialType } from "@/lib/admin/types";

function options(docs: DeskDoc[], type: DeskDoc["type"]) {
  return docs
    .filter((doc) => doc.type === type)
    .map((doc) => ({ id: doc.id, label: doc.title }));
}

export function DocumentScreen({
  type,
  id,
  defaults,
  docs,
  previewPath,
  published,
}: {
  type: EditorialType;
  id: string;
  defaults: EditorDefaults;
  docs: DeskDoc[];
  previewPath: string | null;
  published: boolean;
}) {
  return (
    <EditorForm
      type={type}
      id={id}
      defaults={defaults}
      themes={options(docs, "theme")}
      clients={options(docs, "client")}
      posts={options(docs, "post")}
      studies={options(docs, "caseStudy")}
      studioHref={`https://darznieks.sanity.studio/intent/edit/id=${encodeURIComponent(id)};type=${type}`}
      previewPath={previewPath}
      writeEnabled={Boolean(adminWriteToken())}
      published={published}
    />
  );
}
