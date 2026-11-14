import { defineField } from "sanity";
import { imageAltField } from "./imageAlt";

export const coverImageField = defineField({
  name: "coverImage",
  title: "Cover image",
  type: "image",
  options: { hotspot: true },
  fields: [imageAltField],
});
