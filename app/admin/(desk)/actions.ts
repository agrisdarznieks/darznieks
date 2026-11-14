"use server";

import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { revalidateContent } from "@/lib/revalidate-content";
import { adminWriteClient } from "@/sanity/lib/admin";
import { parseEditorForm, sanityPatch, type ParsedEditor } from "@/lib/admin/form";
import { requireAdmin } from "@/lib/admin/session";

export interface SaveState {
  message: string;
  fieldErrors: Record<string, string>;
  stamp: number;
  values: Record<string, string | string[]>;
}

function capture(data: FormData): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const key of new Set(data.keys())) {
    const all = data.getAll(key).filter((item): item is string => typeof item === "string");
    values[key] = all.length > 1 ? all : (all[0] ?? "");
  }
  return values;
}

function withoutSystem(doc: Record<string, unknown>): Record<string, unknown> {
  const next = Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined),
  );
  delete next._rev;
  delete next._createdAt;
  delete next._updatedAt;
  return next;
}

async function writeParsed(id: string, parsed: ParsedEditor): Promise<string | null> {
  const client = adminWriteClient();
  if (!client) {
    return "SANITY_API_WRITE_TOKEN is not set. Nothing was written.";
  }

  const draftId = `drafts.${id}`;
  const existingDraft = await client.getDocument(draftId);
  const existingPublished = await client.getDocument(id);
  const base = (existingDraft ?? existingPublished ?? {}) as Record<string, unknown>;
  const merged = withoutSystem({ ...base, ...sanityPatch(parsed), _type: parsed.type });

  if (parsed.intent === "publish") {
    const published: Record<string, unknown> = { ...merged, _id: id, status: "published" };
    if (parsed.type === "post" && !published.publishedAt) {
      published.publishedAt = new Date().toISOString();
    }
    const transaction = client.transaction().createOrReplace({
      ...published,
      _id: id,
      _type: parsed.type,
    });
    if (existingDraft) transaction.delete(draftId);
    await transaction.commit();
  } else {
    const status = parsed.intent === "unpublish" ? "draft" : parsed.status;
    await client.createOrReplace({
      ...merged,
      _id: draftId,
      _type: parsed.type,
      status,
    });
    if (parsed.intent === "unpublish" && existingPublished) {
      await client.patch(id).set({ status: "draft" }).commit();
    }
  }

  revalidateContent(parsed.type, parsed.slug || null);
  return null;
}

export async function saveDocument(_prev: SaveState, formData: FormData): Promise<SaveState> {
  await requireAdmin();
  const parsed = parseEditorForm(formData);
  const values = capture(formData);
  if (!parsed.ok || !parsed.value) {
    return {
      message: parsed.message,
      fieldErrors: parsed.fieldErrors,
      stamp: _prev.stamp + 1,
      values,
    };
  }

  const id = String(formData.get("id") || "").trim();
  if (!id || id.includes("/")) {
    return {
      message: "This draft has no id, so it was not saved.",
      fieldErrors: {},
      stamp: _prev.stamp + 1,
      values,
    };
  }

  try {
    const error = await writeParsed(id, parsed.value);
    if (error) {
      return { message: error, fieldErrors: {}, stamp: _prev.stamp + 1, values };
    }
  } catch (error) {
    console.error("Admin save failed.", error);
    return {
      message: "Sanity did not accept the save. Nothing was confirmed as written.",
      fieldErrors: {},
      stamp: _prev.stamp + 1,
      values,
    };
  }

  redirect(`/admin/content/${parsed.value.type}/${id}?saved=1`);
}

export async function openPreview(formData: FormData) {
  await requireAdmin();
  const path = String(formData.get("path") || "");
  if (!/^\/(en|lv)\/(writing|work)\/[^/]+$/.test(path)) {
    redirect("/admin?preview=invalid");
  }
  const draft = await draftMode();
  draft.enable();
  redirect(path);
}

export async function revalidateNow() {
  await requireAdmin();
  for (const type of ["post", "caseStudy", "theme", "client", "page", "siteSettings", "linkCard"]) {
    revalidateContent(type);
  }
  redirect("/admin?revalidated=1");
}
