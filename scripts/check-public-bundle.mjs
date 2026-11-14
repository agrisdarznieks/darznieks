/**
 * Fail if a public page's browser chunks include the desk.
 * The RSC client-reference manifest lists every client module in the app,
 * including ones with an empty chunk list. Those are not downloaded.
 * Run after `npm run build`.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(".next");
const serverApp = path.join(root, "server", "app");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

try {
  await stat(serverApp);
} catch {
  console.error("No production build at .next. Run npm run build first.");
  process.exit(1);
}

const manifests = (await walk(serverApp)).filter((file) => {
  const rel = file.split(path.sep).join("/");
  return (
    file.endsWith("page_client-reference-manifest.js") &&
    !rel.includes("/admin/") &&
    !rel.includes("/preview/")
  );
});

const hits = [];
const seenChunks = new Set();

for (const manifest of manifests) {
  const text = await readFile(manifest, "utf8");
  const jsonStart = text.indexOf("{");
  const payload = text.slice(jsonStart);
  const modules = [...payload.matchAll(/"([^"]*(?:components\/admin|app\/admin)[^"]*)":\{[^}]*"chunks":(\[[^\]]*])/g)];
  for (const match of modules) {
    const chunks = JSON.parse(match[2]);
    if (chunks.length > 0) {
      hits.push(`${path.relative(root, manifest)} loads ${match[1]} via ${chunks.join(",")}`);
    }
  }
  for (const chunk of payload.matchAll(/static\/chunks\/[^"\\]+\.js/g)) {
    seenChunks.add(chunk[0]);
  }
}

for (const chunk of seenChunks) {
  const file = path.join(root, chunk);
  let text = "";
  try {
    text = await readFile(file, "utf8");
  } catch {
    continue;
  }
  if (text.includes("EditorForm") || text.includes("DeskNav") || text.includes("NextStudio")) {
    hits.push(`${chunk} contains desk code`);
  }
}

if (hits.length > 0) {
  console.error(hits.join("\n"));
  process.exit(1);
}

console.log(
  `Public pages reference ${seenChunks.size} browser chunks and do not load the desk.`,
);
