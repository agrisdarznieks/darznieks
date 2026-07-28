import type { StructureResolver } from "sanity/structure";

// siteSettings is a singleton — one editable "Link-in-Bio" document.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Link-in-Bio (Homepage)")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("linkCard").title("Link cards"),
      S.documentTypeListItem("post").title("Blog posts"),
    ]);
