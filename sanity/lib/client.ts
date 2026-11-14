import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  // Published only. An implicit draft perspective would read cookies and opt
  // every page that fetches content out of static rendering.
  perspective: "published",
});
