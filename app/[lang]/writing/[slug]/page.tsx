import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/custom/CoverImage";
import { RichText } from "@/components/custom/RichText";
import { SiteFrame } from "@/components/custom/SiteFrame";
import { formatPublished } from "@/lib/cms";
import { getDictionary, isLang } from "@/lib/i18n";
import { localizedMetadata } from "@/lib/metadata";
import { SITE_URL } from "@/lib/schema";
import { getPost, getPostSlugs } from "@/lib/writing";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPostSlugs();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const L = isLang(lang) ? lang : "en";
  const post = await getPost(L, slug);
  const dict = getDictionary(L);
  if (!post) return { title: dict.notFound.title };
  return localizedMetadata({
    lang: L,
    path: `/writing/${post.slug}`,
    title: post.metaTitle || `${post.title} — Agris Dārznieks`,
    description: post.metaDescription || post.excerpt || dict.writing.description,
    image: post.ogImageUrl || post.cover?.url,
    imageAlt: post.cover?.alt || post.title,
    type: "article",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const post = await getPost(lang, slug);
  if (!post) notFound();
  const dict = getDictionary(lang);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    inLanguage: lang,
    url: `${SITE_URL}/${lang}/writing/${post.slug}`,
    image: post.cover?.url,
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
          href={`/${lang}/writing`}
          className="inline-flex min-h-11 items-center font-sans text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {dict.writing.back}
        </Link>
        <h1 className="mt-2 font-sans text-3xl font-bold">{post.title}</h1>
        <time
          dateTime={post.publishedAt}
          className="mt-2 block font-sans text-sm text-muted-foreground"
        >
          {formatPublished(post.publishedAt, lang)}
        </time>
        {post.excerpt ? (
          <p className="mt-4 font-serif text-base leading-[1.75] text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
        {post.cover ? <CoverImage cover={post.cover} priority /> : null}
        <RichText value={post.body} lang={lang} imageFallback={dict.a11y.image} />
        {post.tags.length > 0 ? (
          <ul aria-label={dict.writing.tags} className="mt-10 flex flex-wrap gap-x-3 gap-y-1">
            {post.tags.map((tag) => (
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
