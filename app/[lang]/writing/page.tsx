import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/custom/CoverImage";
import { SiteFrame } from "@/components/custom/SiteFrame";
import { formatPublished } from "@/lib/cms";
import { getDictionary, isLang } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/metadata";
import { getRoutableThemes } from "@/lib/themes";
import { getPosts } from "@/lib/writing";

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
    path: "/writing",
    title: `${dict.writing.title} — Agris Dārznieks`,
    description: dict.writing.description,
  });
}

export default async function WritingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang);
  const [posts, themes] = await Promise.all([getPosts(lang), getRoutableThemes(lang)]);

  return (
    <SiteFrame lang={lang}>
      <header>
        <h1 className="font-sans text-3xl font-bold">{dict.writing.title}</h1>
        <p className="mt-3 font-serif text-base leading-[1.75] text-muted-foreground">
          {dict.writing.description}
        </p>
      </header>
      <main id="main-content">
        {themes.length > 0 ? (
          <nav aria-label={dict.writing.themes} className="mt-8">
            <ul className="flex flex-col">
              {themes.map((theme) => (
                <li key={theme.slug}>
                  <Link
                    href={`/${lang}/writing/${theme.slug}`}
                    className="inline-flex min-h-11 items-center font-sans text-base text-foreground underline decoration-border underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {theme.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        {posts.length === 0 ? (
          <p className="mt-10 font-serif text-base leading-[1.75] text-muted-foreground">
            {dict.writing.empty}
          </p>
        ) : (
          <ul className="mt-10 flex flex-col gap-10">
            {posts.map((post) => (
              <li key={post.slug}>
                <article>
                  <h2>
                    <Link
                      href={`/${lang}/writing/${post.slug}`}
                      className="inline-flex min-h-11 items-center font-sans text-xl font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <time
                    dateTime={post.publishedAt}
                    className="font-sans text-sm text-muted-foreground"
                  >
                    {formatPublished(post.publishedAt, lang)}
                  </time>
                  {post.excerpt ? (
                    <p className="mt-2 font-serif text-base leading-[1.75] text-muted-foreground">
                      {post.excerpt}
                    </p>
                  ) : null}
                  {post.cover ? <CoverImage cover={post.cover} /> : null}
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </SiteFrame>
  );
}
