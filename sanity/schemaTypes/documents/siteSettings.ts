import { defineType, defineField } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Link-in-Bio (Homepage)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "localeString" }),
    defineField({ name: "bio", title: "Bio", type: "localeText" }),
    defineField({
      name: "avatar",
      title: "Avatar",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "buildingHeading",
      title: "Section 1 heading (Ko es veidoju)",
      type: "localeString",
    }),
    defineField({
      name: "findMeHeading",
      title: "Section 2 heading (Atradiet mani)",
      type: "localeString",
    }),
    defineField({ name: "footer", title: "Footer", type: "localeString" }),
    defineField({ name: "seo", title: "SEO & social sharing", type: "seo" }),
  ],
  preview: {
    prepare: () => ({ title: "Link-in-Bio (Homepage)" }),
  },
});
