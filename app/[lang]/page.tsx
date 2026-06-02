import Image from "next/image";
import type { Metadata } from "next";
import {
  Books,
  Briefcase,
  Compass,
  EnvelopeSimple,
  InstagramLogo,
  LinkedinLogo,
  ThreadsLogo,
  XLogo,
} from "@phosphor-icons/react/dist/ssr";
import { LinkCard } from "@/components/custom/LinkCard";
import { ToggleRow } from "@/components/custom/ToggleRow";
import { getDictionary, isLang } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.name} — ${dict.tagline}`,
    description: dict.bio,
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDictionary(isLang(lang) ? lang : "en");

  return (
    <div className="max-w-[480px] mx-auto px-4 py-12 md:py-16">
      <header>
        <ToggleRow lang={isLang(lang) ? lang : "en"} a11y={dict.a11y} />

        <Image
          src="/images/avatar.jpg"
          alt={dict.name}
          width={96}
          height={96}
          priority
          className="size-24 rounded-full object-cover"
        />

        <h1 className="mt-4 font-sans text-3xl font-bold">{dict.name}</h1>
        <p className="mt-1 font-sans text-lg text-muted-foreground">
          {dict.tagline}
        </p>
        <p className="mt-3 font-serif text-base leading-[1.75] text-muted-foreground">
          {dict.bio}
        </p>
      </header>

      <main id="main-content">
        <section aria-labelledby="section-building" className="mt-10">
          <h2
            id="section-building"
            className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
          >
            {dict.sections.building}
          </h2>
          <div className="flex flex-col gap-3 mt-4">
            <LinkCard
              href="#"
              label={dict.links.temturis}
              icon={Compass}
              disabled
            />
            <LinkCard
              href="https://caballero.lv"
              label={dict.links.caballero}
              icon={Briefcase}
              external
            />
            <LinkCard
              href="https://biznesabiblioteka.lv"
              label={dict.links.bb}
              icon={Books}
              external
            />
          </div>
        </section>

        <section aria-labelledby="section-find-me" className="mt-8">
          <h2
            id="section-find-me"
            className="font-sans text-xs uppercase tracking-widest text-muted-foreground"
          >
            {dict.sections.findMe}
          </h2>
          <div className="flex flex-col gap-3 mt-4">
            <LinkCard
              href="https://linkedin.com/in/agrisdarznieks"
              label={dict.links.linkedin}
              icon={LinkedinLogo}
              external
            />
            <LinkCard
              href="https://threads.net/@agrisdarznieks"
              label={dict.links.threads}
              icon={ThreadsLogo}
              external
            />
            <LinkCard
              href="https://x.com/agrisdarznieks"
              label={dict.links.x}
              icon={XLogo}
              external
            />
            <LinkCard
              href="https://agrisdarznieks.substack.com"
              label={dict.links.substack}
              icon={EnvelopeSimple}
              external
            />
            <LinkCard
              href="https://instagram.com/agrisdarznieks"
              label={dict.links.instagram}
              icon={InstagramLogo}
              external
            />
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-xs text-muted-foreground">
        {dict.footer}
      </footer>
    </div>
  );
}
