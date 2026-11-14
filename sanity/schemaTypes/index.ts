import { localeString } from "./objects/localeString";
import { localeText } from "./objects/localeText";
import { localeBlockContent } from "./objects/localeBlockContent";
import { seo } from "./objects/seo";
import { siteSettings } from "./documents/siteSettings";
import { linkCard } from "./documents/linkCard";
import { post } from "./documents/post";
import { caseStudy } from "./documents/caseStudy";
import { theme } from "./documents/theme";
import { client } from "./documents/client";
import { page } from "./documents/page";
import { openQuestion } from "./documents/openQuestion";
import { caseFacts } from "./objects/caseFacts";
import { themeAccent } from "./objects/themeAccent";

export const schemaTypes = [
  // documents
  siteSettings,
  linkCard,
  post,
  caseStudy,
  theme,
  client,
  page,
  openQuestion,
  // objects
  localeString,
  localeText,
  localeBlockContent,
  seo,
  caseFacts,
  themeAccent,
];
