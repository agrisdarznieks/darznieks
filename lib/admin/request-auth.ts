import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { e2eAdminBypassEnabled, e2eCookieName, isAllowedLogin } from "./guard";

export async function loginFromRequest(request: NextRequest): Promise<string | null> {
  if (e2eAdminBypassEnabled()) {
    const presented = request.cookies.get(e2eCookieName())?.value;
    const expected = process.env.ADMIN_E2E_TOKEN;
    const login = process.env.ADMIN_GITHUB_LOGIN?.trim();
    if (presented && expected && presented === expected && login) return login;
  }

  if (!process.env.AUTH_SECRET) return null;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  });
  const login = typeof token?.login === "string" ? token.login : null;
  if (!isAllowedLogin(login, process.env.ADMIN_GITHUB_LOGIN)) return null;
  return login;
}
