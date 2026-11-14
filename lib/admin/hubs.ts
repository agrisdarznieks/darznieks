import { THEMES } from "./model";
import type { DeskDoc, HubRow } from "./types";

export function themeHubs(docs: DeskDoc[]): HubRow[] {
  return THEMES.map((theme) => {
    const doc = docs.find((item) => item.type === "theme" && item.slug === theme.slug) ?? null;
    const posts = docs.filter((item) => item.type === "post" && doc && item.themeId === doc.id);
    const published = posts.filter((item) => item.live);
    const routable = theme.publicHub && published.length > 0;
    let reason: string;
    if (!theme.publicHub) {
      reason = "Base stays off the public hub routes.";
    } else if (!doc) {
      reason = "No theme document yet, and there is no published post.";
    } else if (published.length === 0) {
      reason = "No published post, so this hub is not a public route.";
    } else {
      reason = `Public at /writing/${theme.slug}.`;
    }
    return {
      slug: theme.slug,
      name: theme.name,
      tagline: doc?.tagline ?? null,
      taglineApproval: doc?.taglineApproval ?? null,
      documentStatus: doc ? doc.status : "absent",
      postCount: posts.length,
      publishedPostCount: published.length,
      routable,
      reason,
      docId: doc?.id ?? null,
    };
  });
}
