# Agents

This file is the source of truth for how to change darznieks.com. [CLAUDE.md](./CLAUDE.md) points here.

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS v4 (`app/globals.css`) and shadcn/ui (`components/ui`)
- next-themes for the light / dark / system toggle
- Custom i18n: `middleware.ts` plus `lib/i18n` (`en` and `lv`). No `next-intl`
- Sanity v6, project `oqf42bbg`, dataset `production`. Schemas: `linkCard`, `post`, `caseStudy`, `theme`, `client`, `page`, `openQuestion`, `siteSettings`, and the locale objects. Posts reference one theme. Case studies reference a client.
- Vercel deploys `main`. Do not change hosting or DNS from a code change

## How the site renders

`app/[lang]/layout.tsx` is the root layout. It owns `<html>` and `<body>`, and it sets `lang` from the route param. There is no `app/layout.tsx`.

That is deliberate. The previous root layout called `headers()` to read an `x-locale` header set by middleware. In Next.js 15 that opts the whole tree into dynamic rendering (`Cache-Control: no-store`), even when a page exports `revalidate` and `generateStaticParams`. Middleware still redirects unprefixed paths. It does not forward the locale.

Sanity reads go through `sanityFetch` in `sanity/lib/fetch.ts`, which passes `next: { revalidate, tags }`. The client uses `perspective: "published"` so a fetch never touches draft cookies. Document `_type` is the cache tag (`post`, `caseStudy`, `siteSettings`, `linkCard`).

`POST /api/revalidate` checks the Sanity webhook signature against `SANITY_REVALIDATE_SECRET` and calls `revalidateTag`. The secret is an environment variable. Never commit it. Pages also revalidate on a 60 second window if the webhook does not fire. `useCdn: true` means a webhook can occasionally refresh a page a moment before the Sanity CDN drops the previous response; the timed window covers that.

`generateStaticParams` prerenders `en` and `lv`. Do not set `dynamicParams = false` on the `[lang]` layout: Next applies it to every child segment, so a case study or post created after the build would 404 until the next deploy. Middleware only admits `en` and `lv`, and the layout calls `notFound()` for anything else. Document slugs are prerendered when they exist at build time. A slug published later is rendered on the first request and then cached. An unknown slug calls `notFound()`.

## i18n

- English is the default. Latvian is a full mirror, not a partial translation
- Every visitor-facing string lives in both `lib/i18n/en.ts` and `lib/i18n/lv.ts`, typed by `lib/i18n/types.ts`
- Localized Sanity fields use `localeString`, `localeText`, and `localeBlockContent`. Read them with `pickLocale` / `pickBlocks`. Empty Latvian falls back to English
- Slugs are a single field, sourced from the English title, and shared by both locales. The language switcher only replaces the first path segment, so `/en/work/slug` and `/lv/work/slug` are the same document
- `html lang` comes from the `[lang]` param

## Sanity

- Schema code only, unless Agris has asked to change content. Do not mutate the production dataset, and do not deploy the Studio as a side effect of a code change
- New document types go in `sanity/schemaTypes/documents`, get registered in `sanity/schemaTypes/index.ts`, and get a desk item in `sanity/structure.ts`
- Queries stay as plain GROQ in `sanity/lib/queries.ts`
- Posts are public only when `publishedAt` is set and not in the future, and `status` is `published` or missing (legacy). Case studies are public when they have a slug and the same status rule. `featured` and `order` only affect the work index
- A theme hub is public only at `/[lang]/writing/[slug]` when the slug is not `base` and at least one published post references that theme. Do not link to an empty hub
- `/admin` is Agris's desk. Protect it on the server. Do not import `components/admin` or the Sanity write client from a public page. Draft preview lives under `/[lang]/preview` and is rewritten only for an allowlisted session with the draft-mode cookie
- Cover images carry localized alt text. English alt is required when an asset is set
- `dist/` is the Studio production build. `.sanity/` is the local `sanity dev` runtime. Both are gitignored

## Code conventions

- Server Components by default. Client components are for the theme toggle, the language switcher, and the consent banner
- Compose pages from `components/custom` and `components/ui`. Do not invent a parallel styling system
- Design tokens live in `app/globals.css`. Use the semantic colors (`background`, `foreground`, `primary`, `muted`, `border`, `ring`). Do not hardcode the palette in components
- Keep commits focused and describe why the change exists

## Non-negotiables

- WCAG 2.1 AA minimum: text contrast at least 4.5:1, visible focus, semantic headings and landmarks, 44px targets, and `prefers-reduced-motion`
- Core Web Vitals: LCP under 2.5s, INP under 200ms, CLS under 0.1. Give images width and height
- English default and a full Latvian mirror
- No merge to `main` without Agris reviewing it
- Tokens, from `app/globals.css`: charcoal `#36454F`, teal `#A3C0C4`, terracotta `#D65738`, background `#F7F4F0`, dark background `#1C2B32`, Merriweather and Merriweather Sans
- Terracotta is the accent. It is about 3.63:1 on `#F7F4F0`, so it is never used for small body text. It can mark a border or an icon-sized control. Body text uses `foreground` or `muted-foreground`

## Owner follow-ups this foundation does not do

- Set `SANITY_REVALIDATE_SECRET` in Vercel and create the Sanity webhook described in the README
- Deploy the Studio so `caseStudy`, post tags, and image alt show up in the editor
