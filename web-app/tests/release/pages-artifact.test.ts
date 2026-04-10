import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { lessons } from "../../src/content/catalogData.js";
import { getPageStructuredData } from "../../src/seo/pageSchema.js";
import { buildRobotsTxt, buildSitemapXml } from "../../src/seo/siteFiles.js";
import {
  ALL_STATIC_ROUTE_PATHS,
  INDEXABLE_STATIC_ROUTE_PATHS,
  getAbsoluteUrl,
  getRouteMetadataFromSlug,
  getRouteSeoEntry
} from "../../src/seo/siteMetadata.js";

const outDir = path.resolve(process.env.PAGES_OUT_DIR ?? "./out");
const requiredArtifacts = [
  "index.html",
  "easy-start/index.html",
  "phrasebook/index.html",
  "lessons/index.html",
  "lessons/gr_lesson_022/index.html",
  "lessons/cy_lesson_001/index.html",
  "cyprus/index.html",
  "trails/index.html",
  "humor/index.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "social-preview.svg",
  "googleb5479b34beac57bf.html"
];

function readArtifact(relativePath: string) {
  return readFileSync(path.join(outDir, relativePath), "utf8");
}

function getRouteArtifactPath(routePath: string) {
  return routePath === "/" ? "index.html" : `${routePath.replace(/^\/+/, "")}/index.html`;
}

function getSitemapUrls() {
  const sitemapXml = readArtifact("sitemap.xml");

  return Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

function normalizeSitemapXml(xml: string) {
  return Array.from(xml.matchAll(/<url>[\s\S]*?<\/url>/g), (match) => match[0].trim()).sort().join("\n");
}

function getResolvedTitle(metadata: { title?: unknown }) {
  if (typeof metadata.title === "string") {
    return metadata.title;
  }

  if (metadata.title && typeof metadata.title === "object" && "absolute" in metadata.title) {
    const absoluteTitle = (metadata.title as { absolute?: unknown }).absolute;
    return typeof absoluteTitle === "string" ? absoluteTitle : "";
  }

  return "";
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getJsonLdEntries(html: string) {
  return Array.from(html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), (match) =>
    JSON.parse(match[1]) as Record<string, unknown>
  );
}

function getInternalHrefs(html: string) {
  return Array.from(html.matchAll(/<a [^>]*href="([^"]+)"/g), (match) => match[1]).filter((href) =>
    href.startsWith("/")
  );
}

function sortStructuredEntries(entries: Array<Record<string, unknown>>) {
  return entries
    .map((entry) => JSON.stringify(entry))
    .sort()
    .map((entry) => JSON.parse(entry) as Record<string, unknown>);
}

test("pages export keeps release-critical artifacts in out/", () => {
  for (const relativePath of requiredArtifacts) {
    assert.equal(
      existsSync(path.join(outDir, relativePath)),
      true,
      `Expected exported artifact: ${relativePath}`
    );
  }
});

test("sitemap keeps indexable routes and lesson pages aligned with source route policy", () => {
  const sitemapUrls = getSitemapUrls();
  const expectedStaticUrls = INDEXABLE_STATIC_ROUTE_PATHS.map((routePath) => getAbsoluteUrl(routePath));
  const expectedLessonUrls = lessons.map((lesson) => getAbsoluteUrl(`/lessons/${lesson.id}`));

  for (const url of [...expectedStaticUrls, ...expectedLessonUrls]) {
    assert.ok(sitemapUrls.includes(url), `Expected sitemap URL: ${url}`);
  }

  for (const routePath of ALL_STATIC_ROUTE_PATHS.filter(
    (candidate) => !INDEXABLE_STATIC_ROUTE_PATHS.includes(candidate)
  )) {
    assert.equal(
      sitemapUrls.includes(getAbsoluteUrl(routePath)),
      false,
      `Sitemap should exclude noindex route: ${routePath}`
    );
  }
});

test("robots.txt points to the exported sitemap on the canonical host", () => {
  const robotsTxt = readArtifact("robots.txt");

  assert.match(robotsTxt, /^User-agent: \*/m);
  assert.match(robotsTxt, /^Allow: \//m);
  assert.match(
    robotsTxt,
    new RegExp(`^Sitemap: ${getAbsoluteUrl("/sitemap.xml").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m")
  );
});

test("published robots.txt and sitemap.xml stay byte-equal to source builders", () => {
  assert.equal(readArtifact("robots.txt"), buildRobotsTxt());
  assert.equal(normalizeSitemapXml(readArtifact("sitemap.xml")), normalizeSitemapXml(buildSitemapXml()));
});

test("public export pages keep canonical and social metadata in the HTML artifact", () => {
  const samples = [
    {
      routePath: "/",
      expectedCopy: "Греческий и Cyprus Reality для жизни на Кипре",
      expectedTitle: "Греческий и Cyprus Reality для жизни на Кипре | Kypros Path"
    },
    {
      routePath: "/easy-start",
      expectedCopy: "Греческий с нуля на Кипре: лёгкий старт",
      expectedTitle: "Греческий с нуля на Кипре: лёгкий старт | Kypros Path"
    },
    {
      routePath: "/trails",
      expectedCopy: "Маршруты по греческому и Cyprus Reality",
      expectedTitle: "Маршруты по греческому и Cyprus Reality | Kypros Path"
    },
    {
      routePath: "/lessons/gr_lesson_022",
      expectedCopy: lessons.find((lesson) => lesson.id === "gr_lesson_022")?.title ?? "gr_lesson_022",
      expectedTitle: "Личные местоимения и глагол είμαι | Greek A1 | Kypros Path"
    }
  ];

  for (const sample of samples) {
    const html = readArtifact(getRouteArtifactPath(sample.routePath));
    const seoEntry =
      sample.routePath.startsWith("/lessons/") ? null : getRouteSeoEntry(sample.routePath);
    const canonicalUrl = getAbsoluteUrl(sample.routePath);

    assert.match(html, /<title>/);
    assert.match(
      html,
      new RegExp(`<title>${sample.expectedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\/title>`)
    );
    assert.match(html, new RegExp(sample.expectedCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="${canonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?"`)
    );
    assert.match(html, /<meta property="og:image" content="https:\/\/aipavlo\.github\.io\/kypros\/social-preview\.svg"/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/aipavlo\.github\.io\/kypros\/social-preview\.svg"/);
    assert.match(html, /<script type="application\/ld\+json">/);

    if (seoEntry?.indexable) {
      assert.match(html, /<meta name="robots" content="index, follow"/);
      assert.match(
        html,
        new RegExp(
          `<meta name="description" content="${escapeHtmlAttribute(seoEntry.description).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`
        )
      );
    }
  }
});

test("published structured data stays aligned with source builders without extra schema blocks", () => {
  const publicRouteSlugs = [
    [],
    ["easy-start"],
    ["phrasebook"],
    ["lessons"],
    ["cyprus"],
    ["trails"],
    ["humor"],
    ["lessons", "gr_lesson_022"],
    ["lessons", "cy_lesson_001"]
  ];

  for (const slug of publicRouteSlugs) {
    const routePath = `/${slug.join("/")}`.replace(/^\/$/, "/");
    const html = readArtifact(getRouteArtifactPath(routePath));
    const structuredData = getJsonLdEntries(html);
    const routeStructuredData = getPageStructuredData(slug);
    const routeSchemaTypes = routeStructuredData.map((entry) => entry["@type"]);
    const publishedRouteStructuredData = structuredData.slice(2);

    assert.equal(structuredData[0]?.["@type"], "WebSite");
    assert.equal(structuredData[1]?.["@type"], "Organization");
    assert.deepEqual(
      sortStructuredEntries(publishedRouteStructuredData),
      sortStructuredEntries(routeStructuredData)
    );
    assert.equal(
      routeSchemaTypes.filter((type) => type === "BreadcrumbList").length <= 1,
      true,
      `Too many breadcrumbs for ${routePath}`
    );
    assert.equal(
      routeSchemaTypes.filter((type) => ["WebPage", "Course", "CollectionPage", "LearningResource"].includes(String(type))).length <= 1,
      true,
      `Too many primary schema entities for ${routePath}`
    );
    assert.equal(routeStructuredData.some((entry) => "mainEntity" in entry), false);
  }
});

test("published artifacts keep route metadata, snippets and social-preview fields aligned with source builders", () => {
  const staticRouteSlugs = ALL_STATIC_ROUTE_PATHS.map((routePath) =>
    routePath === "/" ? [] : routePath.slice(1).split("/")
  );
  const lessonSlugs = [
    ["lessons", "gr_lesson_001"],
    ["lessons", "gr_lesson_022"],
    ["lessons", "cy_lesson_001"]
  ];

  for (const slug of [...staticRouteSlugs, ...lessonSlugs]) {
    const routePath = `/${slug.join("/")}`.replace(/^\/$/, "/");
    const html = readArtifact(getRouteArtifactPath(routePath));
    const metadata = getRouteMetadataFromSlug(slug);
    const title = getResolvedTitle(metadata);
    const description = metadata.description ?? "";
    const canonical = String(metadata.alternates?.canonical ?? "");
    const ogUrl = String(metadata.openGraph?.url ?? "");
    const ogTitle = String(metadata.openGraph?.title ?? "");
    const ogDescription = String(metadata.openGraph?.description ?? "");
    const twitterTitle = String((metadata.twitter as { title?: string } | undefined)?.title ?? "");
    const twitterDescription = String((metadata.twitter as { description?: string } | undefined)?.description ?? "");
    const twitterCard = String((metadata.twitter as { card?: string } | undefined)?.card ?? "");

    assert.match(html, new RegExp(`<title>${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}<\\/title>`));
    assert.match(
      html,
      new RegExp(
        `<meta name="description" content="${escapeHtmlAttribute(description).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`
      )
    );
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="${canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?"`)
    );
    assert.match(
      html,
      new RegExp(`<meta property="og:title" content="${ogTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`)
    );
    assert.match(
      html,
      new RegExp(
        `<meta property="og:description" content="${escapeHtmlAttribute(ogDescription).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`
      )
    );
    assert.match(
      html,
      new RegExp(`<meta property="og:url" content="${ogUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?"`)
    );
    assert.match(
      html,
      new RegExp(`<meta name="twitter:title" content="${twitterTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`)
    );
    assert.match(
      html,
      new RegExp(
        `<meta name="twitter:description" content="${escapeHtmlAttribute(twitterDescription).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`
      )
    );
    assert.match(
      html,
      new RegExp(`<meta name="twitter:card" content="${twitterCard.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`)
    );
    assert.match(html, /<meta property="og:image" content="https:\/\/aipavlo\.github\.io\/kypros\/social-preview\.svg"/);
    assert.match(html, /<meta name="twitter:image" content="https:\/\/aipavlo\.github\.io\/kypros\/social-preview\.svg"/);
  }
});

test("published utility and public titles stay compact and avoid brand duplication", () => {
  const samples = [
    {
      artifactPath: "welcome/index.html",
      expectedTitle: "О сервисе Kypros Path"
    },
    {
      artifactPath: "phrasebook/index.html",
      expectedTitle: "Практические фразы и бытовые сценарии на греческом | Kypros Path"
    }
  ];

  for (const sample of samples) {
    const html = readArtifact(sample.artifactPath);
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch?.[1] ?? "";

    assert.equal(title, sample.expectedTitle);
    assert.ok(title.length <= 70, `artifact title too long for ${sample.artifactPath}: ${title.length}`);
    assert.equal(title.includes("Kypros Path | Kypros Path"), false);
  }
});

test("public export pages include crawlable snapshot HTML before client hydration", () => {
  const samples = [
    {
      routePath: "/",
      expectedHeading: "Греческий и Cyprus Reality для жизни на Кипре"
    },
    {
      routePath: "/easy-start",
      expectedHeading: "Греческий с нуля на Кипре: лёгкий старт"
    },
    {
      routePath: "/lessons/gr_lesson_022",
      expectedHeading: lessons.find((lesson) => lesson.id === "gr_lesson_022")?.title ?? "gr_lesson_022"
    }
  ];

  for (const sample of samples) {
    const html = readArtifact(getRouteArtifactPath(sample.routePath));

    assert.match(
      html,
      new RegExp(`<main class="seo-route-snapshot"[^>]*data-seo-route="${sample.routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`)
    );
    assert.match(
      html,
      new RegExp(`<h1>${sample.expectedHeading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</h1>`)
    );
  }
});

test("high-intent public snapshots keep crawlable links to related hubs and representative lessons", () => {
  const samples = [
    {
      routePath: "/",
      requiredLinks: ["/easy-start", "/phrasebook", "/lessons", "/cyprus", "/trails", "/humor", "/lessons/gr_lesson_001", "/lessons/cy_lesson_001"]
    },
    {
      routePath: "/easy-start",
      requiredLinks: ["/lessons/gr_lesson_001", "/phrasebook", "/trails", "/lessons", "/lessons/cy_lesson_001"]
    },
    {
      routePath: "/phrasebook",
      requiredLinks: ["/easy-start", "/lessons", "/trails", "/humor", "/lessons/gr_lesson_001"]
    },
    {
      routePath: "/lessons",
      requiredLinks: ["/easy-start", "/phrasebook", "/trails", "/cyprus", "/lessons/gr_lesson_001"]
    },
    {
      routePath: "/cyprus",
      requiredLinks: ["/trails", "/lessons", "/humor", "/lessons/cy_lesson_001"]
    },
    {
      routePath: "/trails",
      requiredLinks: ["/easy-start", "/phrasebook", "/lessons", "/cyprus", "/lessons/gr_lesson_001", "/lessons/cy_lesson_001"]
    },
    {
      routePath: "/humor",
      requiredLinks: ["/lessons", "/trails", "/phrasebook", "/easy-start"]
    }
  ];

  for (const sample of samples) {
    const html = readArtifact(getRouteArtifactPath(sample.routePath));
    const hrefs = getInternalHrefs(html);

    for (const href of sample.requiredLinks) {
      assert.ok(hrefs.includes(href), `Expected crawl link ${href} in ${sample.routePath}`);
    }
  }
});

test("representative lesson snapshots keep backlinks and onward crawl paths", () => {
  const samples = [
    {
      routePath: "/lessons/gr_lesson_022",
      requiredLinks: ["/", "/lessons", "/easy-start", "/phrasebook", "/trails", "/lessons/gr_lesson_011", "/lessons/cy_lesson_001"]
    },
    {
      routePath: "/lessons/cy_lesson_001",
      requiredLinks: ["/", "/cyprus", "/trails", "/lessons", "/lessons/cy_lesson_008", "/lessons/gr_lesson_001"]
    }
  ];

  for (const sample of samples) {
    const html = readArtifact(getRouteArtifactPath(sample.routePath));
    const hrefs = getInternalHrefs(html);

    for (const href of sample.requiredLinks) {
      assert.ok(hrefs.includes(href), `Expected lesson crawl link ${href} in ${sample.routePath}`);
    }
  }
});

test("noindex utility pages stay out of sitemap but keep noindex metadata in the artifact", () => {
  const sitemapUrls = getSitemapUrls();
  const utilitySamples = [
    {
      routePath: "/dashboard"
    },
    {
      routePath: "/welcome",
      expectedCanonicalPath: "/"
    },
    {
      routePath: "/tracks"
    },
    {
      routePath: "/flashcards"
    },
    {
      routePath: "/quiz"
    },
    {
      routePath: "/content"
    },
    {
      routePath: "/achievements"
    }
  ];

  for (const sample of utilitySamples) {
    const html = readArtifact(getRouteArtifactPath(sample.routePath));
    const expectedCanonicalUrl = getAbsoluteUrl(sample.expectedCanonicalPath ?? sample.routePath);

    assert.match(html, /<meta name="robots" content="noindex, follow"/);
    assert.match(
      html,
      new RegExp(`<link rel="canonical" href="${expectedCanonicalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?"`)
    );
    assert.equal(
      sitemapUrls.includes(getAbsoluteUrl(sample.routePath)),
      false,
      `Sitemap should exclude noindex utility route: ${sample.routePath}`
    );
    assert.deepEqual(
      getJsonLdEntries(html).map((entry) => entry["@type"]),
      ["WebSite", "Organization"]
    );
  }
});
