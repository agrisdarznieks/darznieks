import { defineField, defineType } from "sanity";
import { editorialStatusField, ownerField } from "../fields/editorial";
import { coverImageField } from "../fields/coverImage";

export const theme = defineType({
  name: "theme",
  title: "Theme",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "localeString",
      validation: (rule) =>
        rule.custom((value) => {
          const name = value as { en?: string } | undefined;
          if (!name?.en?.trim()) return "English name is required";
          return true;
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name.en",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "localeString",
      description:
        "Editable. A drafted tagline is not approved until Tagline approval is set to Approved.",
    }),
    defineField({
      name: "taglineApproval",
      title: "Tagline approval",
      type: "string",
      options: {
        list: [
          { title: "Not approved", value: "unapproved" },
          { title: "Approved", value: "approved" },
        ],
        layout: "radio",
      },
      initialValue: "unapproved",
    }),
    defineField({
      name: "intro",
      title: "Hub intro",
      type: "localeText",
      description: "Shown on the public hub only after this theme is published.",
    }),
    defineField({
      name: "accent",
      title: "Accent tokens",
      type: "themeAccent",
    }),
    coverImageField,
    editorialStatusField,
    ownerField,
  ],
  preview: {
    select: { title: "name.en", subtitle: "slug.current" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Untitled theme",
      subtitle,
    }),
  },
});
