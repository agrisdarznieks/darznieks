import { NextResponse } from "next/server";
import { readAdminLogin } from "@/lib/admin/session";
import { revalidateContent } from "@/lib/revalidate-content";

export async function POST() {
  const login = await readAdminLogin();
  if (!login) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  for (const type of ["post", "caseStudy", "theme", "client", "page", "siteSettings", "linkCard"]) {
    revalidateContent(type);
  }
  return NextResponse.json({ ok: true });
}
