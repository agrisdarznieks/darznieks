import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/custom/CoverImage";
import { RichText } from "@/components/custom/RichText";
import { SiteFrame } from "@/components/custom/SiteFrame";
import { getDictionary, isLang } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/schema";
import { getCaseStudy, getCaseStudySlugs } from "@/lib/work";

export const revalidate = 60;

// Known slugs are prerendered. A slug published later is generated on the
// first request and cached. A slug Sanity does not have calls notFound().
export async function generateStaticParams() {
  const studies = await getCaseStudySlugs();
  return studies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const L = isLang(lang) ? lang : "en";
  const study = await getCaseStudy(L, slug);
  const dict = getDictionary(L);
  if (!study) {
    return { title: dict.notFound.title };
  }
  return localizedMetadata({
    lang: L,
    path: `/work/${study.slug}`,
    title: study.metaTitle || `${study.title} — Agris Dārznieks`,
    description: study.metaDescription || study.summary || dict.work.description,
    image: study.ogImageUrl || study.cover?.url,
    imageAlt: study.cover?.alt || study.title,
    type: "article",
  });
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const study = await getCaseStudy(lang, slug);
  if (!study) notFound();
  const dict = getDictionary(lang);

  const facts = [
    { label: dict.work.client, value: study.client },
    { label: dict.work.role, value: study.role },
    { label: dict.work.timeframe, value: study.timeframe },
  ].filter((fact) => fact.value);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.title,
    description: study.summary,
    inLanguage: lang,
    url: `${SITE_URL}/${lang}/work/${study.slug}`,
    image: study.cover?.url,
    author: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <SiteFrame lang={lang}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main-content">
        <Link
          href={`/${lang}/work`}
          className="inline-flex min-h-11 items-center font-sans text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {dict.work.back}
        </Link>
        <h1 className="mt-2 font-sans text-3xl font-bold">{study.title}</h1>
        {facts.length > 0 ? (
          <dl className="mt-4 flex flex-col gap-1">
            {facts.map((fact) => (
              <div key={fact.label} className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="font-sans text-sm text-muted-foreground">{fact.label}</dt>
                <dd className="font-sans text-sm text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {study.summary ? (
          <p className="mt-4 font-serif text-base leading-[1.75] text-muted-foreground">
            {study.summary}
          </p>
        ) : null}
        {study.cover ? <CoverImage cover={study.cover} priority /> : null}
        {study.problem ? (
          <section aria-labelledby="case-problem" className="mt-10">
            <h2
              id="case-problem"
              className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
            >
              {dict.work.problem}
            </h2>
            <p className="mt-3 whitespace-pre-line font-serif text-base leading-[1.75]">
              {study.problem}
            </p>
          </section>
        ) : null}
        {study.approach ? (
          <section aria-labelledby="case-approach" className="mt-10">
            <h2
              id="case-approach"
              className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
            >
              {dict.work.approach}
            </h2>
            <RichText value={study.approach} lang={lang} imageFallback={dict.a11y.image} />
          </section>
        ) : null}
        {study.outcomes ? (
          <section aria-labelledby="case-outcomes" className="mt-10">
            <h2
              id="case-outcomes"
              className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
            >
              {dict.work.outcomes}
            </h2>
            <RichText value={study.outcomes} lang={lang} imageFallback={dict.a11y.image} />
          </section>
        ) : null}
        {study.related.length > 0 ? (
          <section aria-labelledby="related-writing" className="mt-10">
            <h2
              id="related-writing"
              className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
            >
              {dict.work.related}
            </h2>
            <ul className="mt-2">
              {study.related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/${lang}/writing/${item.slug}`}
                    className="inline-flex min-h-11 items-center font-sans text-base underline decoration-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {study.tags.length > 0 ? (
          <ul aria-label={dict.work.tags} className="mt-10 flex flex-wrap gap-x-3 gap-y-1">
            {study.tags.map((tag) => (
              <li
                key={tag}
                className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </SiteFrame>
  );
}
