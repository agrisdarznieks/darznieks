import { defineField, defineType } from "sanity";

export const openQuestion = defineType({
  name: "openQuestion",
  title: "Open question",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "questionStatus",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Decided", value: "decided" },
        ],
        layout: "radio",
      },
      initialValue: "open",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "owner",
      title: "Owner",
      type: "string",
    }),
  ],
  preview: {
    select: { title: "question", subtitle: "questionStatus" },
  },
});
