import { NextResponse, type NextRequest } from "next/server";
import { decideAccess, deskCredentialLogin, e2eCookieName, previewRewrite } from "@/lib/admin/guard";
import { defaultLang, isLang, languages } from "@/lib/i18n";

const DRAFT_COOKIE = "__prerender_bypass";

function detectLocale(request: NextRequest): string {
  const accept = request.headers.get("accept-language");
  if (!accept) return defaultLang;

  const preferred = accept
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());

  for (const code of preferred) {
    if (isLang(code)) return code;
  }
  return defaultLang;
}

function withRobots(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

function credentialLogin(request: NextRequest): string | null {
  return deskCredentialLogin({
    cookieNames: request.cookies.getAll().map((cookie) => cookie.name),
    e2eCookie: request.cookies.get(e2eCookieName())?.value,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const login = credentialLogin(request);
    const access = decideAccess({
      pathname,
      login,
      allowlist: process.env.ADMIN_GITHUB_LOGIN,
    });
    if (access.kind === "unauthorized") {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    if (access.kind === "redirect") {
      const target = new URL(access.to, request.url);
      return NextResponse.redirect(target);
    }
    return withRobots(NextResponse.next());
  }

  if (pathname.startsWith("/api")) return NextResponse.next();

  const previewPath = pathname.match(/^\/(en|lv)\/preview(\/|$)/);
  if (previewPath) {
    const login = credentialLogin(request);
    if (!login || !request.cookies.has(DRAFT_COOKIE)) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace("/preview", "") || `/${defaultLang}`;
      return NextResponse.redirect(url);
    }
    return withRobots(NextResponse.next());
  }

  if (request.cookies.has(DRAFT_COOKIE)) {
    const login = credentialLogin(request);
    const rewrite = login ? previewRewrite(pathname) : null;
    if (rewrite) {
      const url = request.nextUrl.clone();
      url.pathname = rewrite;
      return withRobots(NextResponse.rewrite(url));
    }
  }

  const segment = pathname.split("/")[1];
  if (!languages.includes(segment as never)) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
