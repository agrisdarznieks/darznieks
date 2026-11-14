import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { e2eAdminBypassEnabled, e2eCookieName, isAllowedLogin } from "./guard";

export function adminConfigGaps(): string[] {
  const gaps: string[] = [];
  if (!process.env.AUTH_SECRET) gaps.push("AUTH_SECRET");
  if (!process.env.AUTH_GITHUB_ID) gaps.push("AUTH_GITHUB_ID");
  if (!process.env.AUTH_GITHUB_SECRET) gaps.push("AUTH_GITHUB_SECRET");
  if (!process.env.ADMIN_GITHUB_LOGIN) gaps.push("ADMIN_GITHUB_LOGIN");
  return gaps;
}

export async function readAdminLogin(): Promise<string | null> {
  if (e2eAdminBypassEnabled()) {
    const jar = await cookies();
    const presented = jar.get(e2eCookieName())?.value;
    const expected = process.env.ADMIN_E2E_TOKEN;
    const login = process.env.ADMIN_GITHUB_LOGIN?.trim();
    if (presented && expected && presented === expected && login) return login;
  }

  if (!process.env.AUTH_SECRET || !process.env.ADMIN_GITHUB_LOGIN) return null;
  try {
    const session = await auth();
    const login = session?.user?.login;
    if (!isAllowedLogin(login, process.env.ADMIN_GITHUB_LOGIN)) return null;
    return login?.trim() ?? null;
  } catch (error) {
    console.error("Admin session could not be read.", error);
    return null;
  }
}

export async function requireAdmin(): Promise<string> {
  const login = await readAdminLogin();
  if (!login) redirect("/admin/login");
  return login;
}
