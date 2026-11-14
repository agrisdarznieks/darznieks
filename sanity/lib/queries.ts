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

const publishedPostFilter = `_type == "post" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()`;

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
  ${coverProjection}
}`;

export const postBySlugQuery = `*[${publishedPostFilter} && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  body,
  tags,
  ${coverProjection},
  ${seoProjection}
}`;

const caseStudyFilter = `_type == "caseStudy" && defined(slug.current)`;

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
  ${coverProjection},
  ${seoProjection}
}`;
