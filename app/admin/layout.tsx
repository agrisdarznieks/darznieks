import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { merriweather, merriweatherSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Desk", template: "%s — Desk" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(merriweather.variable, merriweatherSans.variable)}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main-content"
            className="sr-only rounded-md bg-primary px-4 py-2 font-sans text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Skip to content
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
