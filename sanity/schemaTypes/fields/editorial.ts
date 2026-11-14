import { defineField } from "sanity";

export const editorialStatusField = defineField({
  name: "status",
  title: "Status",
  type: "string",
  options: {
    list: [
      { title: "Draft", value: "draft" },
      { title: "In review", value: "review" },
      { title: "Published", value: "published" },
    ],
    layout: "radio",
  },
  initialValue: "draft",
  validation: (rule) => rule.required(),
});

export const ownerField = defineField({
  name: "owner",
  title: "Owner",
  type: "string",
  description: "Who is responsible for this document.",
  validation: (rule) => rule.required().error("An owner is required"),
});
