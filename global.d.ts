// Ambient types for the Google Consent Mode v2 gtag stub + GTM dataLayer.
// The stub is defined inline in app/layout.tsx before GTM loads.
export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
