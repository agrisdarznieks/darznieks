import { defineType, defineField } from "sanity";
import { coverImageField } from "../fields/coverImage";
import { editorialStatusField, ownerField } from "../fields/editorial";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title.en",
        maxLength: 96,
        // Enforce a globally-unique slug across all posts.
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      description:
        "The site lists a post only once this time has passed. Leave it empty to keep the post unpublished.",
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "localeText" }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "reference",
      to: [{ type: "theme" }],
      description: "Exactly one theme. Base is the default register, not a public hub.",
      validation: (rule) => rule.required().error("A post needs one theme"),
    }),
    coverImageField,
    defineField({ name: "body", title: "Body", type: "localeBlockContent" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
      description: "Shared across languages.",
    }),
    defineField({
      name: "relatedCaseStudies",
      title: "Related case studies",
      type: "array",
      of: [{ type: "reference", to: [{ type: "caseStudy" }] }],
      validation: (rule) => rule.unique(),
    }),
    editorialStatusField,
    ownerField,
    defineField({ name: "seo", title: "SEO & social sharing", type: "seo" }),
  ],
  orderings: [
    {
      title: "Published (newest)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title.en", subtitle: "publishedAt" },
  },
});
