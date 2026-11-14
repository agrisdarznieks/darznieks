import { defineField } from "sanity";

/** Alt text on an image field. English is required once an asset is set. */
export const imageAltField = defineField({
  name: "alt",
  title: "Alt text",
  type: "localeString",
  description:
    "Describe the image for screen readers. English is required when an image is set, and it is the fallback when Latvian is empty.",
  validation: (rule) =>
    rule.custom((value, context) => {
      const parent = context.parent as { asset?: unknown } | undefined;
      const alt = value as { en?: string } | undefined;
      if (parent?.asset && !alt?.en?.trim()) {
        return "English alt text is required when an image is set";
      }
      return true;
    }),
});
