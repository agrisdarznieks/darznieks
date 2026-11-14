/**
 * Create missing theme and page documents. Dry-run unless you pass --apply.
 *
 * This does not update or delete anything. It does not write case-study copy.
 * Taglines below are the unapproved drafts from the structure note. They stay
 * editable, and they are not approved.
 *
 *   node scripts/seed-content-model.mjs
 *   SEED_CONFIRM=create-missing-only node scripts/seed-content-model.mjs --apply --dataset production
 *
 * Requires SANITY_API_WRITE_TOKEN for --apply. Reads the project id and dataset
 * from the environment, with the public defaults as fallback.
 */

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "oqf42bbg";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";
const apply = process.argv.includes("--apply");
const datasetFlag = process.argv.includes("--dataset")
  ? process.argv[process.argv.indexOf("--dataset") + 1]
  : null;

const themes = [
  ["base", "Base", "Calm by default"],
  ["caballero", "Caballero", "The daylight job"],
  ["notion", "Notion", "Systems for thinking"],
  ["friends-of-figma", "Friends of Figma", "A chapter, written"],
  ["books", "Books", "Notes from a bibliography"],
];

const pages = [
  ["home", "Home", "/", "home"],
  ["work", "Work", "/work", "work-index"],
  ["writing", "Writing", "/writing", "writing-index"],
  ["about", "About", "/about", "about"],
  ["building", "What I'm building", "/building", "building"],
  ["work-with-me", "Work with me", "/work-with-me", "work-with-me"],
];

const documents = [
  ...themes.map(([slug, name, tagline]) => ({
    _id: `theme.${slug}`,
    _type: "theme",
    name: { _type: "localeString", en: name, lv: "" },
    slug: { _type: "slug", current: slug },
    tagline: { _type: "localeString", en: tagline, lv: "" },
    taglineApproval: "unapproved",
    status: "draft",
    owner: "Agris Dārznieks",
  })),
  ...pages.map(([slug, title, route, template]) => ({
    _id: `page.${slug}`,
    _type: "page",
    title: { _type: "localeString", en: title, lv: "" },
    slug: { _type: "slug", current: slug },
    route,
    template,
    status: "draft",
    owner: "Agris Dārznieks",
  })),
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (apply) {
  if (process.env.SEED_CONFIRM !== "create-missing-only") {
    fail("Refusing to write. Set SEED_CONFIRM=create-missing-only.");
  }
  if (datasetFlag !== dataset) {
    fail(`Refusing to write. Pass --dataset ${dataset} so the target is explicit.`);
  }
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    fail("Refusing to write. SANITY_API_WRITE_TOKEN is not set.");
  }
}

const token = process.env.SANITY_API_WRITE_TOKEN;
const client = token
  ? createClient({ projectId, dataset, apiVersion, token, useCdn: false })
  : null;

console.log(`${apply ? "Apply" : "Dry run"} · ${projectId} / ${dataset}`);
console.log("Creates missing documents only. Does not update or delete.");

let existing = new Set();
if (client) {
  const ids = await client.fetch(`*[_id in $ids]._id`, {
    ids: documents.map((doc) => doc._id),
  });
  existing = new Set(ids);
} else {
  console.log("No token, so existing documents were not checked.");
}

for (const doc of documents) {
  const state = existing.has(doc._id) ? "exists, skipped" : apply ? "creating" : "would create";
  console.log(`- ${state}: ${doc._id}`);
  if (apply && client && !existing.has(doc._id)) {
    await client.createIfNotExists(doc);
  }
}

if (!apply) {
  console.log("Dry run only. Nothing was written.");
}
