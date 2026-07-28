import { defineType } from "sanity";

export const localeText = defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    { name: "en", title: "English", type: "text", rows: 4 },
    { name: "lv", title: "Latviešu", type: "text", rows: 4 },
  ],
});
