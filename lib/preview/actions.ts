"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { readAdminLogin } from "@/lib/admin/session";

export async function exitPreview() {
  const login = await readAdminLogin();
  if (!login) redirect("/admin/login");
  const draft = await draftMode();
  draft.disable();
  redirect("/admin");
}
