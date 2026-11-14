import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/custom/CoverImage";
import { SiteFrame } from "@/components/custom/SiteFrame";
import { getDictionary, isLang } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/metadata";
import { getCaseStudies } from "@/lib/work";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const L = isLang(lang) ? lang : "en";
  const dict = getDictionary(L);
  return localizedMetadata({
    lang: L,
    path: "/work",
    title: `${dict.work.title} — Agris Dārznieks`,
    description: dict.work.description,
  });
}

function metaLine(parts: Array<string | null>): string | null {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length > 0 ? present.join(" · ") : null;
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const studies = await getCaseStudies(lang);

  return (
    <SiteFrame lang={lang}>
      <header>
        <h1 className="font-sans text-3xl font-bold">{dict.work.title}</h1>
        <p className="mt-3 font-serif text-base leading-[1.75] text-muted-foreground">
          {dict.work.description}
        </p>
      </header>
      <main id="main-content">
        {studies.length === 0 ? (
          <p className="mt-10 font-serif text-base leading-[1.75] text-muted-foreground">
            {dict.work.empty}
          </p>
        ) : (
          <ul className="mt-10 flex flex-col gap-10">
            {studies.map((study) => {
              const meta = metaLine([study.client, study.role, study.timeframe]);
              return (
                <li key={study.slug}>
                  <article>
                    {study.featured ? (
                      <p className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
                        {dict.work.featured}
                      </p>
                    ) : null}
                    <h2>
                      <Link
                        href={`/${lang}/work/${study.slug}`}
                        className="inline-flex min-h-11 items-center font-sans text-xl font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {study.title}
                      </Link>
                    </h2>
                    {meta ? (
                      <p className="font-sans text-sm text-muted-foreground">{meta}</p>
                    ) : null}
                    {study.summary ? (
                      <p className="mt-2 font-serif text-base leading-[1.75] text-muted-foreground">
                        {study.summary}
                      </p>
                    ) : null}
                    {study.cover ? <CoverImage cover={study.cover} /> : null}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </SiteFrame>
  );
}
