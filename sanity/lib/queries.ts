// Plain GROQ strings (no tag) — safe to pass straight to client.fetch.
// Image projections keep the asset so urlFor can build sized URLs, plus the
// CDN url and dimensions for next/image (width and height avoid layout shift).

const coverProjection = `coverImage{
  alt,
  asset,
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height
}`;

const seoProjection = `seo{
  metaTitle,
  metaDescription,
  ogImage
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  name,
  tagline,
  bio,
  buildingHeading,
  findMeHeading,
  footer,
  "avatarUrl": avatar.asset->url,
  ${seoProjection}
}`;

export const linkCardsQuery = `*[_type == "linkCard"] | order(order asc){
  label,
  href,
  icon,
  section,
  external,
  disabled,
  order
}`;

// A missing status is legacy content and stays public. Draft and review never do.
const publishedPostFilter = `_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now() && (!defined(status) || status == "published")`;

export const postSlugsQuery = `*[${publishedPostFilter}]{
  "slug": slug.current,
  publishedAt,
  _updatedAt
}`;

export const postsQuery = `*[${publishedPostFilter}] | order(publishedAt desc){
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  tags,
  theme->{ name, "slug": slug.current },
  ${coverProjection}
}`;

export const postBySlugQuery = `*[${publishedPostFilter} && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  body,
  tags,
  theme->{ name, "slug": slug.current },
  "themeRoutable": theme->slug.current != "base" && count(*[${publishedPostFilter} && theme._ref == ^.theme._ref]) > 0,
  ${coverProjection},
  ${seoProjection}
}`;

const caseStudyFilter = `_type == "caseStudy" && defined(slug.current) && (!defined(status) || status == "published")`;

export const caseStudySlugsQuery = `*[${caseStudyFilter}]{
  "slug": slug.current,
  _updatedAt
}`;

export const caseStudiesQuery = `*[${caseStudyFilter}] | order(featured desc, order asc){
  title,
  "slug": slug.current,
  client,
  role,
  timeframe,
  year,
  "clientName": clientRef->name,
  "clientPublicName": clientRef->publicName,
  facts{ mayBePublic },
  summary,
  featured,
  tags,
  ${coverProjection}
}`;

export const caseStudyBySlugQuery = `*[${caseStudyFilter} && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  client,
  role,
  timeframe,
  summary,
  problem,
  approach,
  outcomes,
  featured,
  tags,
  year,
  "clientName": clientRef->name,
  "clientPublicName": clientRef->publicName,
  facts{ mayBePublic },
  "relatedWriting": *[_type == "post" && _id in ^.relatedPosts[]._ref && defined(slug.current) && defined(publishedAt) && publishedAt <= now() && (!defined(status) || status == "published")]{
    title,
    "slug": slug.current,
    publishedAt
  },
  ${coverProjection},
  ${seoProjection}
}`;

export const routableThemesQuery = `*[_type == "theme" && slug.current != "base" && count(*[${publishedPostFilter} && theme._ref == ^._id]) > 0]{
  _id,
  name,
  "slug": slug.current,
  tagline,
  taglineApproval,
  intro,
  status,
  _updatedAt,
  ${coverProjection}
}`;

export const themeBySlugQuery = `*[_type == "theme" && slug.current == $slug && slug.current != "base"][0]{
  _id,
  name,
  "slug": slug.current,
  tagline,
  taglineApproval,
  intro,
  status,
  ${coverProjection}
}`;
