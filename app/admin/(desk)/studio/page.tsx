export default function StudioPage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-4xl">Studio</h1>
      <p className="mt-4 font-serif text-base leading-7">
        Rich text, images, and the bilingual body stay in Sanity Studio. The desk edits the
        structure around them: status, theme, client, facts, and owner. Studio is not embedded in
        this site, because the current Next.js build cannot compile Sanity Studio’s React hooks.
      </p>
      <p className="mt-4 font-serif text-base leading-7">
        <a
          href="https://darznieks.sanity.studio"
          className="inline-flex min-h-11 items-center underline decoration-border underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the hosted Studio
        </a>
      </p>
      <p className="mt-4 font-serif text-base leading-7 text-muted-foreground">
        Locally, <span className="font-sans text-sm">npx sanity dev</span> runs the same schema.
        Deploy schema changes with <span className="font-sans text-sm">npx sanity deploy</span> when
        you mean to. Add this site’s origin to Sanity’s CORS list, with credentials, before signing
        in there from a browser.
      </p>
    </div>
  );
}
