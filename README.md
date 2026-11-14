# darznieks.com

Personal site of Agris Dārznieks. Bilingual (English and Latvian) link-in-bio, with case studies at `/work` and writing at `/writing`. Content is edited in Sanity and the site is statically rendered, then refreshed on a short interval or when Sanity calls the revalidation webhook.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, next-themes, Sanity v6. Hosted on Vercel, which deploys `main`. Studio schemas live in this repo; the hosted Studio is separate.

## Scripts

```bash
npm run dev        # local site
npm run build      # production build
npm run start      # serve the production build
npm run lint
npm run typecheck
```

Studio, when you need it locally: `npx sanity dev`. Deploying the Studio (`npx sanity deploy`) publishes schema changes to the hosted Studio. Do that on purpose. Do not write to the production dataset from scripts.

## Environment

Copy `.env.example` to `.env.local`. The Sanity project id and dataset have public defaults. `NEXT_PUBLIC_GTM_ID` turns on Google Tag Manager and the consent banner. `SANITY_REVALIDATE_SECRET` signs the webhook that calls `POST /api/revalidate`.

Webhook (create, update, and delete):

- URL: `https://darznieks.com/api/revalidate`
- Secret: the same value as `SANITY_REVALIDATE_SECRET`
- Filter: `_type in ["post", "caseStudy", "siteSettings", "linkCard"]`
- Projection: `{_type, "slug": slug.current}`

## Routes

| Path | What it is |
| --- | --- |
| `/` | Redirects to `/en` or `/lv` from `Accept-Language` |
| `/[lang]` | Homepage |
| `/[lang]/work` and `/[lang]/work/[slug]` | Case studies |
| `/[lang]/writing` and `/[lang]/writing/[slug]` | Posts with a publish date |
| `/llms.txt`, `/robots.txt`, `/sitemap.xml` | Machine-readable extras |

`[lang]` is `en` (default) or `lv`. Pages are generated at build time and revalidated about once a minute, or immediately when the webhook runs.

Conventions, accessibility, and things not to change are in [AGENTS.md](./AGENTS.md).
