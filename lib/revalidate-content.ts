import { revalidatePath, revalidateTag } from "next/cache";
import { SANITY_TAG_SET } from "@/lib/cache";
import { languages } from "@/lib/i18n";

export function revalidateContent(type: string, slug?: string | null): { ignored: boolean } {
  if (!SANITY_TAG_SET.has(type)) return { ignored: true };

  revalidateTag(type);
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");

  const clean = slug?.trim() || null;
  if (type === "siteSettings" || type === "linkCard" || type === "page") {
    for (const lang of languages) revalidatePath(`/${lang}`);
  }
  if (type === "post" || type === "theme") {
    for (const lang of languages) {
      revalidatePath(`/${lang}/writing`);
      if (clean && type === "post") revalidatePath(`/${lang}/writing/${clean}`);
      if (clean && type === "theme" && clean !== "base") {
        revalidatePath(`/${lang}/writing/${clean}`);
      }
    }
  }
  if (type === "caseStudy" || type === "client") {
    for (const lang of languages) {
      revalidatePath(`/${lang}/work`);
      if (clean && type === "caseStudy") revalidatePath(`/${lang}/work/${clean}`);
    }
  }
  return { ignored: false };
}
