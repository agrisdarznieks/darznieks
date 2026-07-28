import { defineType, defineField } from "sanity";

const ICONS = [
  "Compass",
  "Briefcase",
  "Books",
  "LinkedinLogo",
  "ThreadsLogo",
  "XLogo",
  "EnvelopeSimple",
  "InstagramLogo",
  "GlobeSimple",
  "YoutubeLogo",
  "GithubLogo",
];

export const linkCard = defineType({
  name: "linkCard",
  title: "Link card",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "localeString",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      validation: (r) =>
        r.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
    }),
    defineField({
      name: "icon",
      title: "Icon (Phosphor)",
      type: "string",
      options: { list: ICONS.map((i) => ({ title: i, value: i })) },
      initialValue: "GlobeSimple",
    }),
    defineField({
      name: "section",
      title: "Section",
      type: "string",
      options: {
        list: [
          { title: "Ko es veidoju / What I build", value: "building" },
          { title: "Atradiet mani / Find me", value: "findMe" },
        ],
        layout: "radio",
      },
      initialValue: "findMe",
    }),
    defineField({
      name: "external",
      title: "Opens in new tab",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "disabled",
      title: "Disabled (coming soon)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "label.en", section: "section" },
    prepare: ({ title, section }) => ({
      title: title || "Untitled link",
      subtitle: section,
    }),
  },
});
