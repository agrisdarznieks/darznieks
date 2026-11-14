import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { SANITY_TAG_SET } from "@/lib/cache";
import { revalidateContent } from "@/lib/revalidate-content";

interface WebhookBody {
  _type?: string;
  slug?: string | { current?: string | null } | null;
}

function readSlug(slug: WebhookBody["slug"]): string | null {
  if (typeof slug === "string" && slug.trim()) return slug.trim();
  if (slug && typeof slug === "object" && typeof slug.current === "string") {
    const current = slug.current.trim();
    return current || null;
  }
  return null;
}

/**
 * Sanity webhook target. Sanity signs the raw body with the webhook secret;
 * set that secret to SANITY_REVALIDATE_SECRET (Vercel env, never committed).
 *
 * Webhook: POST https://darznieks.com/api/revalidate
 * Trigger: create, update, delete
 * Filter: _type in ["post", "caseStudy", "theme", "client", "page", "siteSettings", "linkCard"]
 * Projection: {_type, "slug": slug.current}
 *
 * A full document payload is also accepted (`slug.current`).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<WebhookBody>(
    request,
    secret,
    false,
  );

  if (!isValidSignature || !body) {
    return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
  }

  const type = body._type;
  if (!type || !SANITY_TAG_SET.has(type)) {
    return NextResponse.json({ ok: true, ignored: type ?? null });
  }

  const slug = readSlug(body.slug);
  revalidateContent(type, slug);

  return NextResponse.json({ ok: true, revalidated: type, slug });
}
