export type Access =
  | { kind: "public" }
  | { kind: "allow" }
  | { kind: "redirect"; to: string }
  | { kind: "unauthorized" };

const E2E_COOKIE = "darznieks_admin_e2e";

/** Auth.js session cookie names. Middleware only checks that one is present. */
export const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function e2eCookieName(): string {
  return E2E_COOKIE;
}

/**
 * Local Playwright sessions only. Vercel always sets VERCEL, so this cannot
 * open the desk in production even if the other variables are copied there.
 */
export function e2eAdminBypassEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  if (env.VERCEL || env.VERCEL_ENV) return false;
  if (env.ADMIN_E2E !== "1") return false;
  const token = env.ADMIN_E2E_TOKEN;
  return typeof token === "string" && token.length >= 24;
}

/**
 * Edge-safe gate. A matching test cookie is trusted here because it never
 * works when VERCEL is set. A session cookie is only a signal: the Node
 * layout still verifies the JWT and the allowlist. Decrypting the JWT in
 * middleware pulls Auth.js into the edge runtime, which Vercel rejects.
 */
export function deskCredentialLogin(input: {
  cookieNames: readonly string[];
  e2eCookie: string | undefined;
  env?: Record<string, string | undefined>;
}): string | null {
  const env = input.env ?? process.env;
  if (e2eAdminBypassEnabled(env)) {
    const expected = env.ADMIN_E2E_TOKEN;
    const login = env.ADMIN_GITHUB_LOGIN?.trim();
    if (input.e2eCookie && expected && input.e2eCookie === expected && login) return login;
  }
  const allowlist = env.ADMIN_GITHUB_LOGIN?.trim();
  if (allowlist && input.cookieNames.some((name) => SESSION_COOKIE_NAMES.includes(name))) {
    return allowlist;
  }
  return null;
}

export function isAllowedLogin(
  login: string | null | undefined,
  allowlist: string | undefined,
): boolean {
  const allowed = allowlist?.trim().toLowerCase();
  const name = login?.trim().toLowerCase();
  if (!allowed || !name) return false;
  return name === allowed;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function isAdminApiPath(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

export function decideAccess(input: {
  pathname: string;
  login: string | null;
  allowlist: string | undefined;
}): Access {
  const path = input.pathname;
  if (path.startsWith("/api/auth")) return { kind: "public" };
  if (path === "/admin/login" || path.startsWith("/admin/login/")) return { kind: "public" };

  const gated = isAdminPath(path) || isAdminApiPath(path);
  if (!gated) return { kind: "public" };

  if (!isAllowedLogin(input.login, input.allowlist)) {
    if (path.startsWith("/api/")) return { kind: "unauthorized" };
    const callback = encodeURIComponent(path);
    return { kind: "redirect", to: `/admin/login?callbackUrl=${callback}` };
  }
  return { kind: "allow" };
}

/** Public article and case-study paths that a draft preview may rewrite. */
export function previewRewrite(pathname: string): string | null {
  const match = pathname.match(/^\/(en|lv)\/(writing|work)\/([^/]+)$/);
  if (!match) return null;
  const [, lang, section, slug] = match;
  if (slug === "preview") return null;
  return `/${lang}/preview/${section}/${slug}`;
}
