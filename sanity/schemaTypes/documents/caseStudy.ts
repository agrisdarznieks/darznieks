import { defineType, defineField } from "sanity";
import { coverImageField } from "../fields/coverImage";
import { imageAltField } from "../fields/imageAlt";
import { editorialStatusField, ownerField } from "../fields/editorial";

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
      name: "planKey",
      title: "Planned study",
      type: "string",
      options: {
        list: [
          { title: "LAĀA", value: "laaa" },
          { title: "Ērenpreisa", value: "erenpreisa" },
        ],
      },
      description: "Marks one of the two studies planned for the end of November 2026.",
    }),
    defineField({
      name: "clientRef",
      title: "Client",
      type: "reference",
      to: [{ type: "client" }],
      description: "The client document. A published study needs this reference.",
      validation: (rule) =>
        rule.custom((value, context) => {
          const status = (context.document as { status?: string } | undefined)?.status;
          if (status === "published" && !value) return "A published case study needs a client";
          return true;
        }),
    }),
    defineField({
      name: "client",
      title: "Client (legacy text)",
      type: "localeString",
      description: "Kept so older text is not lost. New studies use the client reference.",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "localeString",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.min(1990).max(2100),
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
      name: "images",
      title: "Images",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [imageAltField],
        },
      ],
    }),
    defineField({
      name: "facts",
      title: "Facts and confidentiality",
      type: "caseFacts",
    }),
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
      name: "relatedPosts",
      title: "Related posts",
      type: "array",
      of: [{ type: "reference", to: [{ type: "post" }] }],
      validation: (rule) => rule.unique(),
    }),
    editorialStatusField,
    ownerField,
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
