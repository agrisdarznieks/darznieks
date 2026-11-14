import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { RichText } from "@/components/custom/RichText";
import { SiteFrame } from "@/components/custom/SiteFrame";
import { buttonQuiet } from "@/components/admin/styles";
import { readAdminLogin } from "@/lib/admin/session";
import { getDictionary, isLang } from "@/lib/i18n";
import { exitPreview } from "@/lib/preview/actions";
import { loadDraftPreview } from "@/lib/preview/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Draft preview",
};

export default async function PreviewWorkPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const login = await readAdminLogin();
  if (!login) notFound();
  const draft = await draftMode();
  if (!draft.isEnabled) notFound();
  const dict = getDictionary(lang);
  const result = await loadDraftPreview("caseStudy", lang, slug);

  return (
    <>
      <div className="border-b border-accent bg-card">
        <form action={exitPreview} className="mx-auto flex max-w-[480px] items-center justify-between gap-3 px-4 py-2">
          <p className="font-sans text-sm">Draft preview. This page is not public.</p>
          <button type="submit" className={buttonQuiet}>
            Exit preview
          </button>
        </form>
      </div>
      <SiteFrame lang={lang}>
        <main id="main-content">
          {result.missingToken ? (
            <p role="alert" className="font-serif text-base leading-[1.75]">
              A Sanity read token is required before a draft can be previewed.
            </p>
          ) : result.doc ? (
            <>
              <h1 className="font-sans text-3xl font-bold">{result.doc.title}</h1>
              {result.doc.text ? (
                <p className="mt-4 font-serif text-base leading-[1.75]">{result.doc.text}</p>
              ) : null}
              <RichText value={result.doc.body} lang={lang} imageFallback={dict.a11y.image} />
            </>
          ) : (
            <p className="font-serif text-base leading-[1.75]">This draft could not be found.</p>
          )}
        </main>
      </SiteFrame>
    </>
  );
}
