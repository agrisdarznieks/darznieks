import { defineType, defineField } from "sanity";
import { coverImageField } from "../fields/coverImage";

export const caseStudy = defineType({
  name: "caseStudy",
  title: "Case study",
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
      name: "client",
      title: "Client",
      type: "localeString",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "localeString",
    }),
    defineField({
      name: "timeframe",
      title: "Timeframe / year",
      type: "localeString",
      description: 'Display label, for example "2024" or "2023–2024".',
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "localeText",
    }),
    coverImageField,
    defineField({
      name: "problem",
      title: "Problem",
      type: "localeText",
    }),
    defineField({
      name: "approach",
      title: "Approach",
      type: "localeBlockContent",
      description: "Sections of the approach. Use headings to split the story.",
    }),
    defineField({
      name: "outcomes",
      title: "Outcomes / results",
      type: "localeBlockContent",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Shared across languages.",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
      description: "Pins the study to the top of the work index.",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
      description: "Lower numbers appear first. Featured studies are sorted ahead of this.",
    }),
    defineField({
      name: "seo",
      title: "SEO & social sharing",
      type: "seo",
    }),
  ],
  orderings: [
    {
      title: "Featured, then order",
      name: "featuredOrder",
      by: [
        { field: "featured", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title.en",
      client: "client.en",
      media: "coverImage",
    },
    prepare: ({ title, client }) => ({
      title: title || "Untitled case study",
      subtitle: client,
    }),
  },
});
