import { defineType, defineField } from "sanity";

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
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "localeText" }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({ name: "body", title: "Body", type: "localeBlockContent" }),
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
