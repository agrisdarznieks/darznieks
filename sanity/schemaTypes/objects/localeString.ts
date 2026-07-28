import { defineType } from "sanity";

export const localeString = defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: [
    { name: "en", title: "English", type: "string" },
    { name: "lv", title: "Latviešu", type: "string" },
  ],
});
