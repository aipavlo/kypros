import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  SITE_URL,
  absoluteUrl,
  assetUrl
} from "@/src/lib/url";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_SOCIAL_IMAGE_PATH,
  DEFAULT_TITLE,
  SITE_NAME,
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
  manifest: assetUrl("/site.webmanifest"),
  icons: {
    icon: assetUrl("/icon.svg"),
    shortcut: assetUrl("/icon.svg"),
    apple: assetUrl("/icon.svg")
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
    url: absoluteUrl("/"),
    images: getSocialImageMetadata()
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(DEFAULT_SOCIAL_IMAGE_PATH)]
  },
  alternates: {
    canonical: absoluteUrl("/")
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
    logo: absoluteUrl("/icon.svg"),
    description: DEFAULT_DESCRIPTION
  };

  return (
    <html lang="ru">
      <body>
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
