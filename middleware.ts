import { NextResponse, type NextRequest } from "next/server";
import { defaultLang, isLang, languages } from "@/lib/i18n";

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  // Root path: detect language and redirect to a locale-prefixed route.
  if (!languages.includes(segment as never)) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Locale-prefixed path: forward the active locale to the root layout.
  const headers = new Headers(request.headers);
  headers.set("x-locale", segment);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
