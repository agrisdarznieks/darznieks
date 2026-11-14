import "server-only";

import { createClient, type SanityClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export function adminReadToken(): string | null {
  return process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN || null;
}

export function adminWriteToken(): string | null {
  return process.env.SANITY_API_WRITE_TOKEN || null;
}

export function adminReadClient(): SanityClient {
  const token = adminReadToken();
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: token ? "raw" : "published",
    token: token ?? undefined,
  });
}

export function adminWriteClient(): SanityClient | null {
  const token = adminWriteToken();
  if (!token) return null;
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    perspective: "raw",
    token,
  });
}
