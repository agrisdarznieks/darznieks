"use client";

import { useActionState } from "react";
import { openPreview, saveDocument, type SaveState } from "@/app/admin/(desk)/actions";

const initialSaveState: SaveState = {
  message: "",
  fieldErrors: {},
  stamp: 0,
  values: {},
};
import type { EditorDefaults } from "@/lib/admin/defaults";
import type { EditorialType } from "@/lib/admin/types";
import { button, buttonQuiet, control, textLink } from "./styles";

interface Option {
  id: string;
  label: string;
}

function valueOf(state: SaveState, name: string, fallback: string): string {
  const found = state.values[name];
  if (Array.isArray(found)) return found[0] ?? fallback;
  return found ?? fallback;
}

function checked(state: SaveState, name: string, id: string, initial: string[]): boolean {
  if (state.stamp === 0) return initial.includes(id);
  const found = state.values[name];
  if (Array.isArray(found)) return found.includes(id);
  return found === id;
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-sans text-sm font-semibold">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="font-sans text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 font-sans text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function EditorForm({
  type,
  id,
  defaults,
  themes,
  clients,
  posts,
  studies,
  studioHref,
  previewPath,
  writeEnabled,
  published,
}: {
  type: EditorialType;
  id: string;
  defaults: EditorDefaults;
  themes: Option[];
  clients: Option[];
  posts: Option[];
  studies: Option[];
  studioHref: string;
  previewPath: string | null;
  writeEnabled: boolean;
  published: boolean;
}) {
  const [state, action, pending] = useActionState(saveDocument, initialSaveState);
  const error = (name: string) => state.fieldErrors[name];
  const described = (name: string, hint = false) =>
    [hint ? `${name}-hint` : null, error(name) ? `${name}-error` : null].filter(Boolean).join(" ") ||
    undefined;
  const val = (name: keyof EditorDefaults, fallback?: string) =>
    valueOf(state, name, fallback ?? String(defaults[name] ?? ""));

  return (
    <div className="flex flex-col gap-8">
      {!writeEnabled ? (
        <p role="status" className="border-l-2 border-accent py-1 pl-3 font-serif text-base leading-7">
          SANITY_API_WRITE_TOKEN is not set, so this form cannot save yet. You can still read it.
        </p>
      ) : null}
      {state.message ? (
        <div role="alert" className="border border-destructive px-3 py-3">
          <p className="font-sans text-sm font-semibold">The draft was not saved.</p>
          <p className="mt-1 font-serif text-base leading-7">{state.message}</p>
          {Object.keys(state.fieldErrors).length > 0 ? (
            <ul className="mt-2 list-disc pl-5 font-sans text-sm">
              {Object.entries(state.fieldErrors).map(([name, message]) => (
                <li key={name}>
                  <a href={`#${name}`} className={textLink}>
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form key={state.stamp} action={action} className="flex max-w-xl flex-col gap-5">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />

        {type === "post" || type === "caseStudy" || type === "page" ? (
          <>
            <Field id="titleEn" label="Title, English" error={error("titleEn")}>
              <input
                id="titleEn"
                name="titleEn"
                defaultValue={val("titleEn")}
                className={control}
                aria-invalid={Boolean(error("titleEn"))}
                aria-describedby={described("titleEn")}
                required={type === "post" || type === "caseStudy" || type === "page"}
              />
            </Field>
            <Field id="titleLv" label="Title, Latvian" hint="Leave blank to fall back to English.">
              <input id="titleLv" name="titleLv" defaultValue={val("titleLv")} className={control} aria-describedby="titleLv-hint" />
            </Field>
          </>
        ) : null}

        {type === "theme" || type === "client" ? (
          <Field id="name" label={type === "client" ? "Name" : "Name, English"} error={error("name")}>
            <input
              id="name"
              name="name"
              defaultValue={val("name")}
              className={control}
              aria-invalid={Boolean(error("name"))}
              aria-describedby={described("name")}
              required
            />
          </Field>
        ) : null}

        {type === "openQuestion" ? (
          <>
            <Field id="question" label="Question" error={error("question")}>
              <input
                id="question"
                name="question"
                defaultValue={val("question")}
                className={control}
                aria-invalid={Boolean(error("question"))}
                aria-describedby={described("question")}
                required
              />
            </Field>
            <Field id="detail" label="Detail">
              <textarea id="detail" name="detail" defaultValue={val("detail")} rows={4} className={control} />
            </Field>
            <fieldset className="flex flex-col gap-2">
              <legend className="font-sans text-sm font-semibold">Status</legend>
              {(["open", "decided"] as const).map((item) => (
                <label key={item} className="flex min-h-11 items-center gap-3 font-sans text-base">
                  <input
                    type="radio"
                    name="questionStatus"
                    value={item}
                    defaultChecked={val("questionStatus") === item}
                    className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                  {item === "open" ? "Open" : "Decided"}
                </label>
              ))}
            </fieldset>
          </>
        ) : (
          <Field id="slug" label="Slug" error={error("slug")} hint="Lowercase, shared by English and Latvian.">
            <input
              id="slug"
              name="slug"
              defaultValue={val("slug")}
              className={control}
              aria-invalid={Boolean(error("slug"))}
              aria-describedby={described("slug", true)}
            />
          </Field>
        )}

        {type === "post" ? (
          <>
            <Field id="excerptEn" label="Excerpt, English">
              <textarea id="excerptEn" name="excerptEn" defaultValue={val("excerptEn")} rows={3} className={control} />
            </Field>
            <Field id="themeId" label="Theme" error={error("themeId")} hint="Exactly one. The body itself is edited in Studio.">
              <select
                id="themeId"
                name="themeId"
                defaultValue={val("themeId")}
                className={control}
                aria-invalid={Boolean(error("themeId"))}
                aria-describedby={described("themeId", true)}
                required
              >
                <option value="">Choose a theme</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="tags" label="Tags" hint="Comma separated. Shared across languages.">
              <input id="tags" name="tags" defaultValue={val("tags")} className={control} aria-describedby="tags-hint" />
            </Field>
          </>
        ) : null}

        {type === "caseStudy" ? (
          <>
            <Field id="planKey" label="Planned study" hint="Only for LAĀA or Ērenpreisa. Leave blank for any other study.">
              <select id="planKey" name="planKey" defaultValue={val("planKey")} className={control} aria-describedby="planKey-hint">
                <option value="">Not one of the planned two</option>
                <option value="laaa">LAĀA</option>
                <option value="erenpreisa">Ērenpreisa</option>
              </select>
            </Field>
            <Field id="clientId" label="Client" error={error("clientId")}>
              <select
                id="clientId"
                name="clientId"
                defaultValue={val("clientId")}
                className={control}
                aria-invalid={Boolean(error("clientId"))}
                aria-describedby={described("clientId")}
              >
                <option value="">No client yet</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="roleEn" label="Role">
              <input id="roleEn" name="roleEn" defaultValue={val("roleEn")} className={control} />
            </Field>
            <Field id="year" label="Year" error={error("year")}>
              <input
                id="year"
                name="year"
                inputMode="numeric"
                defaultValue={val("year")}
                className={control}
                aria-invalid={Boolean(error("year"))}
                aria-describedby={described("year")}
              />
            </Field>
            <Field id="problemEn" label="Problem">
              <textarea id="problemEn" name="problemEn" defaultValue={val("problemEn")} rows={4} className={control} />
            </Field>
            <Field id="summaryEn" label="What changed">
              <textarea id="summaryEn" name="summaryEn" defaultValue={val("summaryEn")} rows={4} className={control} />
            </Field>
            <fieldset className="flex flex-col gap-2">
              <legend className="font-sans text-sm font-semibold">May this be public?</legend>
              {(
                [
                  ["unknown", "Not decided"],
                  ["yes", "Yes"],
                  ["no", "No"],
                ] as const
              ).map(([item, label]) => (
                <label key={item} className="flex min-h-11 items-center gap-3 font-sans text-base">
                  <input
                    type="radio"
                    name="mayBePublic"
                    value={item}
                    defaultChecked={val("mayBePublic", "unknown") === item}
                    className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="font-sans text-sm font-semibold">Images</legend>
              {(
                [
                  ["unknown", "Not reviewed"],
                  ["none", "No images"],
                  ["uncleared", "Not cleared"],
                  ["cleared", "Cleared"],
                ] as const
              ).map(([item, label]) => (
                <label key={item} className="flex min-h-11 items-center gap-3 font-sans text-base">
                  <input
                    type="radio"
                    name="imageClearance"
                    value={item}
                    defaultChecked={val("imageClearance", "unknown") === item}
                    className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <Field
              id="confidentialityEn"
              label="Confidentiality"
              hint="What must stay off the site. Leave this empty until you know."
            >
              <textarea
                id="confidentialityEn"
                name="confidentialityEn"
                defaultValue={val("confidentialityEn")}
                rows={3}
                className={control}
                aria-describedby="confidentialityEn-hint"
              />
            </Field>
          </>
        ) : null}

        {type === "theme" ? (
          <>
            <Field id="taglineEn" label="Tagline" hint="A drafted tagline is not approved, and it is not shown on the public hub.">
              <input id="taglineEn" name="taglineEn" defaultValue={val("taglineEn")} className={control} aria-describedby="taglineEn-hint" />
            </Field>
            <fieldset className="flex flex-col gap-2">
              <legend className="font-sans text-sm font-semibold">Tagline approval</legend>
              {(
                [
                  ["unapproved", "Not approved"],
                  ["approved", "Approved"],
                ] as const
              ).map(([item, label]) => (
                <label key={item} className="flex min-h-11 items-center gap-3 font-sans text-base">
                  <input
                    type="radio"
                    name="taglineApproval"
                    value={item}
                    defaultChecked={val("taglineApproval", "unapproved") === item}
                    className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <Field id="accentToken" label="Accent token" hint="A name only. Colours for the public site stay in the design system until you set them.">
              <input id="accentToken" name="accentToken" defaultValue={val("accentToken")} className={control} aria-describedby="accentToken-hint" />
            </Field>
            <Field id="introEn" label="Hub intro" hint="Shown publicly only after this theme is published.">
              <textarea id="introEn" name="introEn" defaultValue={val("introEn")} rows={4} className={control} aria-describedby="introEn-hint" />
            </Field>
          </>
        ) : null}

        {type === "client" ? (
          <>
            <Field id="publicName" label="Public name" hint="Leave blank until the name is allowed on the site.">
              <input id="publicName" name="publicName" defaultValue={val("publicName")} className={control} aria-describedby="publicName-hint" />
            </Field>
            <Field id="website" label="Website">
              <input id="website" name="website" type="url" defaultValue={val("website")} className={control} />
            </Field>
          </>
        ) : null}

        {type === "page" ? (
          <>
            <Field id="route" label="Route" error={error("route")} hint="Without the language, for example /about.">
              <input
                id="route"
                name="route"
                defaultValue={val("route")}
                className={control}
                aria-invalid={Boolean(error("route"))}
                aria-describedby={described("route", true)}
                required
              />
            </Field>
            <Field id="template" label="Template">
              <input id="template" name="template" defaultValue={val("template")} className={control} />
            </Field>
            <Field id="summaryEn" label="Private note">
              <textarea id="summaryEn" name="summaryEn" defaultValue={val("summaryEn")} rows={3} className={control} />
            </Field>
          </>
        ) : null}

        {type === "post" && studies.length > 0 ? (
          <fieldset>
            <legend className="font-sans text-sm font-semibold">Related case studies</legend>
            <ul className="mt-2">
              {studies.map((study) => (
                <li key={study.id}>
                  <label className="flex min-h-11 items-center gap-3 font-sans text-base">
                    <input
                      type="checkbox"
                      name="relatedCaseStudyIds"
                      value={study.id}
                      defaultChecked={checked(state, "relatedCaseStudyIds", study.id, defaults.relatedCaseStudyIds)}
                      className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    />
                    {study.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        {type === "caseStudy" && posts.length > 0 ? (
          <fieldset>
            <legend className="font-sans text-sm font-semibold">Related posts</legend>
            <ul className="mt-2">
              {posts.map((post) => (
                <li key={post.id}>
                  <label className="flex min-h-11 items-center gap-3 font-sans text-base">
                    <input
                      type="checkbox"
                      name="relatedPostIds"
                      value={post.id}
                      defaultChecked={checked(state, "relatedPostIds", post.id, defaults.relatedPostIds)}
                      className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                    />
                    {post.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ) : null}

        {type !== "openQuestion" ? (
          <>
            <Field id="owner" label="Owner" error={error("owner")}>
              <input
                id="owner"
                name="owner"
                defaultValue={val("owner")}
                className={control}
                aria-invalid={Boolean(error("owner"))}
                aria-describedby={described("owner")}
                required
              />
            </Field>
            <fieldset className="flex flex-col gap-2">
              <legend className="font-sans text-sm font-semibold">Status</legend>
              <p className="font-sans text-sm text-muted-foreground">
                {published ? "The published copy is on the site." : "This is not on the public site."}{" "}
                Publishing uses the confirmation below.
              </p>
              {(
                [
                  ["draft", "Draft"],
                  ["review", "In review"],
                ] as const
              ).map(([item, label]) => (
                <label key={item} className="flex min-h-11 items-center gap-3 font-sans text-base">
                  <input
                    type="radio"
                    name="status"
                    value={item}
                    defaultChecked={val("status", "draft") === item}
                    className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          </>
        ) : (
          <Field id="owner" label="Owner">
            <input id="owner" name="owner" defaultValue={val("owner")} className={control} />
          </Field>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" name="intent" value="save" className={button} disabled={pending || !writeEnabled}>
            {pending ? "Saving…" : "Save draft"}
          </button>
          {published ? (
            <button type="submit" name="intent" value="unpublish" className={buttonQuiet} disabled={pending || !writeEnabled}>
              Move back to draft
            </button>
          ) : null}
        </div>

        <details className="border border-border px-3 py-2">
          <summary className="flex min-h-11 cursor-pointer items-center font-sans text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
            Publish…
          </summary>
          <div className="flex flex-col gap-3 pb-2">
            <p className="font-serif text-base leading-7">
              Publishing copies this draft onto the public site. It still has to pass the public
              rules: a post needs a date that has arrived, and a hub needs a published post.
            </p>
            <label className="flex min-h-11 items-center gap-3 font-sans text-base">
              <input
                id="confirmPublish"
                type="checkbox"
                name="confirmPublish"
                value="yes"
                className="size-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                aria-invalid={Boolean(error("confirmPublish"))}
                aria-describedby={error("confirmPublish") ? "confirmPublish-error" : undefined}
              />
              I confirm this should be public.
            </label>
            {error("confirmPublish") ? (
              <p id="confirmPublish-error" className="font-sans text-sm text-destructive">
                {error("confirmPublish")}
              </p>
            ) : null}
            <button type="submit" name="intent" value="publish" className={button} disabled={pending || !writeEnabled}>
              Publish
            </button>
          </div>
        </details>
      </form>

      <div className="flex flex-wrap gap-4">
        <a href={studioHref} className={textLink} target="_blank" rel="noopener noreferrer">
          Edit the rich text in Studio
        </a>
        {previewPath ? (
          <form action={openPreview}>
            <input type="hidden" name="path" value={previewPath} />
            <button type="submit" className={buttonQuiet}>
              Preview draft
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
