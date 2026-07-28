import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localeBlockContent } from "./objects/localeBlockContent";
import { siteSettings } from "./documents/siteSettings";
import { linkCard } from "./documents/linkCard";
import { post } from "./documents/post";

export const schemaTypes = [
  // documents
  siteSettings,
  linkCard,
  post,
  // objects
  localeString,
  localeText,
  localeBlockContent,
];
