import { defineField, defineType } from "sanity";

/**
 * Fact inventory for a case study. Empty and "unknown" values stay empty:
 * the desk treats them as not ready, and the public page does not invent them.
 */
export const caseFacts = defineType({
  name: "caseFacts",
  title: "Facts and confidentiality",
  type: "object",
  fields: [
    defineField({
      name: "mayBePublic",
      title: "May this be public?",
      type: "string",
      options: {
        list: [
          { title: "Not decided", value: "unknown" },
          { title: "Yes", value: "yes" },
          { title: "No", value: "no" },
        ],
        layout: "radio",
      },
      initialValue: "unknown",
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "localeString",
      description: "Agris's role on this project. Leave blank until it is known.",
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "number",
      validation: (rule) => rule.min(1990).max(2100),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "string",
      options: {
        list: [
          { title: "Not reviewed", value: "unknown" },
          { title: "No images", value: "none" },
          { title: "Images exist, not cleared", value: "uncleared" },
          { title: "Cleared for the site", value: "cleared" },
        ],
        layout: "radio",
      },
      initialValue: "unknown",
    }),
    defineField({
      name: "confidentiality",
      title: "Confidentiality",
      type: "localeText",
      description:
        "What must stay off the public site. Leave this empty until it is known. Do not guess.",
    }),
  ],
});
