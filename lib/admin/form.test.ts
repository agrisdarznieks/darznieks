import { describe, expect, it } from "vitest";
import { parseEditorForm, sanityPatch, slugify } from "./form";

function form(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
}

describe("editor form", () => {
  it("refuses to publish without the confirmation", () => {
    const result = parseEditorForm(
      form({
        type: "post",
        intent: "publish",
        titleEn: "A note",
        slug: "a-note",
        themeId: "theme-base",
        owner: "Agris Dārznieks",
      }),
    );
    expect(result.ok).toBe(false);
    expect(result.fieldErrors.confirmPublish).toMatch(/confirmation/i);
  });

  it("saves a draft post against one theme reference", () => {
    const result = parseEditorForm(
      form({
        type: "post",
        intent: "save",
        titleEn: "A note",
        themeId: "theme-base",
        owner: "Agris Dārznieks",
        status: "draft",
      }),
    );
    expect(result.ok).toBe(true);
    const patch = sanityPatch(result.value!);
    expect(patch.status).toBe("draft");
    expect(patch.theme).toEqual({ _type: "reference", _ref: "theme-base" });
    expect(patch.slug).toEqual({ _type: "slug", current: "a-note" });
  });

  it("requires a client reference before a case study can be published", () => {
    const missing = parseEditorForm(
      form({
        type: "caseStudy",
        intent: "publish",
        confirmPublish: "yes",
        titleEn: "LAĀA",
        owner: "Agris Dārznieks",
      }),
    );
    expect(missing.ok).toBe(false);
    expect(missing.fieldErrors.clientId).toBeTruthy();

    const ready = parseEditorForm(
      form({
        type: "caseStudy",
        intent: "publish",
        confirmPublish: "yes",
        titleEn: "LAĀA",
        planKey: "laaa",
        clientId: "client-1",
        owner: "Agris Dārznieks",
        mayBePublic: "unknown",
      }),
    );
    expect(ready.ok).toBe(true);
    const patch = sanityPatch(ready.value!);
    expect(patch.status).toBe("published");
    expect(patch.clientRef).toEqual({ _type: "reference", _ref: "client-1" });
    expect(patch.planKey).toBe("laaa");
    expect(patch.facts).toMatchObject({ mayBePublic: "unknown" });
  });

  it("slugifies Latvian letters without inventing words", () => {
    expect(slugify("Ērenpreisa")).toBe("erenpreisa");
    expect(slugify("LAĀA")).toBe("laaa");
  });
});
