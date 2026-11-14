import { defineType } from "sanity";
import { imageAltField } from "../fields/imageAlt";

const richText = {
  type: "array" as const,
  of: [
    { type: "block" },
    {
      type: "image",
      options: { hotspot: true },
      fields: [imageAltField],
    },
  ],
};

export const localeBlockContent = defineType({
  name: "localeBlockContent",
  title: "Localized rich text",
  type: "object",
  fields: [
    { name: "en", title: "English", ...richText },
    { name: "lv", title: "Latviešu", ...richText },
  ],
});
