import { defineField, defineType } from "sanity";

export const themeAccent = defineType({
  name: "themeAccent",
  title: "Accent tokens",
  type: "object",
  fields: [
    defineField({
      name: "token",
      title: "Token name",
      type: "string",
      description: "A short name for this accent, for example base.",
    }),
    defineField({
      name: "hex",
      title: "Accent colour",
      type: "string",
      description: "Hex colour for borders and marks. Not for small text.",
    }),
    defineField({
      name: "textHex",
      title: "Text colour",
      type: "string",
      description: "A darker hex that can be used as text on the paper ground.",
    }),
  ],
});
