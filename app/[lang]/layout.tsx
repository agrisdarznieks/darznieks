import type { Metadata } from "next";
import { Merriweather, Merriweather_Sans } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { ConsentBanner } from "@/components/custom/ConsentBanner";
import { getDictionary, isLang, languages } from "@/lib/i18n";
import { SITE_URL } from "@/lib/schema";
import { cn } from "@/lib/utils";
import "../globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Google Consent Mode v2 — default everything to denied BEFORE GTM loads, so no
// analytics/ads cookies are set until the visitor accepts. Returning visitors who
// already accepted get consent re-granted instantly from localStorage.
const CONSENT_DEFAULT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
gtag('set', 'ads_data_redaction', true);
try {
  if (localStorage.getItem('darznieks-consent') === 'granted') {
    gtag('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      security_storage: 'granted'
    });
    dataLayer.push({ event: 'consent_granted' });
  }
} catch (e) {}
`;

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Agris Dārznieks — Experience designer & Notion consultant",
  description:
    "Collector of knowledge, journeys, and life experiences. Book excerpts, UX design principles, and tips on Notion, Claude, and other digital tools.",
};

// This layout is the root layout: there is no app/layout.tsx above it, so it
// can read [lang] and set <html lang> at build time. Reading the locale from
// headers() instead made every page dynamic (Cache-Control: no-store).
export const revalidate = 60;

export function generateStaticParams() {
  return languages.map((lang) => ({ lang }));
}

// Do not set `dynamicParams = false` here. Next applies that flag to every
// segment under this layout, which would 404 a case study or post published
// after the build until the next deploy. Unknown locales still 404: middleware
// only lets `en` and `lv` through, and `isLang` below calls notFound().

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLang(langParam)) notFound();
  const dict = getDictionary(langParam);

  return (
    <html
      lang={langParam}
      suppressHydrationWarning
      className={cn(merriweather.variable, merriweatherSans.variable)}
    >
      <body className="min-h-dvh antialiased">
        {GTM_ID ? (
          <>
            {/* Consent Mode v2 defaults — runs at parse, before GTM initializes. */}
            <script
              id="consent-default"
              dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }}
            />
            <GoogleTagManager gtmId={GTM_ID} />
          </>
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only rounded-md bg-primary px-4 py-2 font-sans text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {dict.a11y.skipToContent}
          </a>
          {children}
          {GTM_ID ? <ConsentBanner strings={dict.consent} /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
