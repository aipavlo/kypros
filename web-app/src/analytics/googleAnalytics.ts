export const GOOGLE_TAG_ID = "G-GB58LPJ8P2";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackPageView(pagePath: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_path: pagePath,
    page_location: window.location.href
  });
}
