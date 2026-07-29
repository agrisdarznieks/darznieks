import type { Metadata } from "next";
import { headers } from "next/headers";
import { Merriweather, Merriweather_Sans } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ConsentBanner } from "@/components/custom/ConsentBanner";
import { getDictionary, isLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import "./globals.css";

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
  metadataBase: new URL("https://darznieks.com"),
  title: "Agris Dārznieks — Experience designer & Notion consultant",
  description:
    "Collector of knowledge, journeys, and life experiences. Book excerpts, UX design principles, and tips on Notion, Claude, and other digital tools.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localeHeader = (await headers()).get("x-locale") ?? "en";
  const lang = isLang(localeHeader) ? localeHeader : "en";
  const dict = getDictionary(lang);

  return (
    <html
      lang={lang}
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
          {children}
          {GTM_ID ? <ConsentBanner strings={dict.consent} /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
