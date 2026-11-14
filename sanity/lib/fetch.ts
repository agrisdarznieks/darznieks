import type { QueryParams } from "next-sanity";
import { REVALIDATE_SECONDS } from "@/lib/cache";
import { client } from "./client";

/**
 * Sanity fetch that opts into Next's data cache.
 *
 * Next.js 15 defaults `fetch` to `no-store`. Passing `next.revalidate` and
 * `next.tags` caches the response and lets `revalidateTag` (the webhook route)
 * expire it. `perspective: "published"` is set on the client so this never
 * reads draft-mode cookies, which would force the route to be dynamic.
 */
export function sanityFetch<QueryResult>(
  query: string,
  params: QueryParams,
  tags: readonly string[],
): Promise<QueryResult> {
  return client.fetch<QueryResult>(query, params, {
    next: {
      revalidate: REVALIDATE_SECONDS,
      tags: [...tags],
    },
  });
}
