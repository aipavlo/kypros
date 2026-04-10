import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { GOOGLE_TAG_ID } from "@/src/analytics/googleAnalytics";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE_PATH,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  getAbsoluteUrl,
  getAssetUrl,
  getSocialImageMetadata
} from "@/src/seo/siteMetadata";
import "../src/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  category: "education",
  manifest: getAssetUrl("/site.webmanifest"),
  icons: {
    icon: getAssetUrl("/icon.svg"),
    shortcut: getAssetUrl("/icon.svg"),
    apple: getAssetUrl("/icon.svg")
  },
  keywords: [
    "греческий язык",
    "история Кипра",
    "культура Кипра",
    "Cyprus Reality",
    "подготовка к экзамену Кипр"
  ],
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    images: getSocialImageMetadata()
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [getAbsoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH)]
  },
  alternates: {
    canonical: SITE_URL
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "ru",
    about: [
      "Greek language learning",
      "Cyprus history and culture",
      "Cyprus Reality exam preparation"
    ]
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: getAbsoluteUrl("/icon.svg"),
    description: DEFAULT_DESCRIPTION
  };

  return (
    <html lang="ru">
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GOOGLE_TAG_ID}', { send_page_view: false });
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
