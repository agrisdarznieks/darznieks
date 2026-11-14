import { defineField, defineType } from "sanity";
import { editorialStatusField, ownerField } from "../fields/editorial";

export const client = defineType({
  name: "client",
  title: "Client",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Working name. This is not a promise that the legal name is public.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publicName",
      title: "Public name",
      type: "string",
      description: "What may appear on the site, once publication is allowed. Leave blank until then.",
    }),
    defineField({
      name: "mayBePublic",
      title: "May the name be public?",
      type: "string",
      options: {
        list: [
          { title: "Not decided", value: "unknown" },
          { title: "Yes", value: "yes" },
          { title: "No", value: "no" },
        ],
        layout: "radio",
      },
      initialValue: "unknown",
    }),
    defineField({
      name: "confidentiality",
      title: "Confidentiality",
      type: "localeText",
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
    }),
    editorialStatusField,
    ownerField,
  ],
  preview: {
    select: { title: "name", subtitle: "publicName" },
  },
});
