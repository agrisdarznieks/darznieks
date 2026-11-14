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

  // Unprefixed paths (including "/") redirect to a locale. Accept-Language
  // picks Latvian when it is listed, otherwise English.
  if (!languages.includes(segment as never)) {
    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Locale is read from the [lang] route param in the layout. Forwarding it
  // through a request header would call headers() during render and force
  // every page to be dynamic.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|studio|favicon.ico|.*\\..*).*)"],
};
