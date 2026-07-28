// Plain GROQ strings (no tag) — safe to pass straight to client.fetch.

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  name,
  tagline,
  bio,
  buildingHeading,
  findMeHeading,
  footer,
  "avatarUrl": avatar.asset->url
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

export const postsQuery = `*[_type == "post"] | order(publishedAt desc){
  title,
  "slug": slug.current,
  publishedAt,
  excerpt,
  "coverUrl": coverImage.asset->url
}`;
