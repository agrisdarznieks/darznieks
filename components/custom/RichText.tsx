import Image from "next/image";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "next-sanity";
import { pickLocale, type LocaleValue } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/types";
import { urlFor, type SanityImageSource } from "@/sanity/lib/image";

const linkClass =
  "underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function componentsFor(lang: Lang, imageFallback: string): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => (
        <p className="font-serif text-base leading-[1.75] text-foreground">{children}</p>
      ),
      h2: ({ children }) => (
        <h2 className="mt-8 font-sans text-xl font-bold text-foreground">{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className="mt-4 font-sans text-base font-semibold text-foreground">{children}</h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className="border-l-2 border-border pl-4 font-serif text-base leading-[1.75] text-muted-foreground">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc space-y-1 pl-5 font-serif text-base leading-[1.75]">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal space-y-1 pl-5 font-serif text-base leading-[1.75]">{children}</ol>
      ),
    },
    marks: {
      link: ({ children, value }) => {
        const href = typeof value?.href === "string" ? value.href : "";
        if (!href) return <>{children}</>;
        const external = /^https?:\/\//.test(href);
        if (!external) {
          return (
            <Link href={href} className={linkClass}>
              {children}
            </Link>
          );
        }
        return (
          <a href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        );
      },
    },
    types: {
      image: ({ value }) => {
        const source = value as SanityImageSource & {
          alt?: LocaleValue;
          asset?: { _ref?: string };
        };
        const size = source.asset?._ref?.match(/-(\d+)x(\d+)-/);
        const width = size ? Number(size[1]) : null;
        const height = size ? Number(size[2]) : null;
        if (!width || !height) return null;
        let src: string;
        try {
          src = urlFor(source).width(1200).fit("max").url();
        } catch {
          return null;
        }
        const alt = pickLocale(source.alt, lang, imageFallback);
        return (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes="480px"
            className="mt-2 h-auto w-full rounded-md"
          />
        );
      },
    },
  };
}

export function RichText({
  value,
  lang,
  imageFallback,
}: {
  value: unknown[] | null;
  lang: Lang;
  imageFallback: string;
}) {
  if (!value || value.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-4">
      <PortableText
        value={value as Parameters<typeof PortableText>[0]["value"]}
        components={componentsFor(lang, imageFallback)}
      />
    </div>
  );
}
