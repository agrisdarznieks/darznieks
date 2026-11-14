import { defineField, defineType } from "sanity";
import { editorialStatusField, ownerField } from "../fields/editorial";

export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (rule) =>
        rule.custom((value) => {
          const title = value as { en?: string } | undefined;
          if (!title?.en?.trim()) return "English title is required";
          return true;
        }),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title.en",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "route",
      title: "Route",
      type: "string",
      description: "Locale-less path, for example /about.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "template",
      title: "Template",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Work index", value: "work-index" },
          { title: "Case study", value: "case-study" },
          { title: "Writing index", value: "writing-index" },
          { title: "Article", value: "article" },
          { title: "Theme hub", value: "theme-hub" },
          { title: "About", value: "about" },
          { title: "Building", value: "building" },
          { title: "Work with me", value: "work-with-me" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "localeText",
      description: "A private note about the page. Not the public copy.",
    }),
    editorialStatusField,
    ownerField,
  ],
  preview: {
    select: { title: "title.en", subtitle: "route" },
  },
});
