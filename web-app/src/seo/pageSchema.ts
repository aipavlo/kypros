import { getLessonById } from "@/src/content/catalogData";
import { absoluteUrl } from "@/src/lib/url";
import {
  SITE_NAME,
  getRouteSeoEntry
} from "@/src/seo/siteMetadata";

type StructuredData = Record<string, unknown>;

function buildBreadcrumbList(items: Array<{ name: string; pathname: string }>): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname)
    }))
  };
}

function getPagePathname(slug: string[] = []) {
  return slug.length === 0 ? "/" : `/${slug.join("/")}`;
}

function buildWebPageSchema(
  pathname: string,
  name: string,
  description: string,
  extra: StructuredData = {}
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: absoluteUrl(pathname),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/")
    },
    ...extra
  };
}

function buildCollectionPageSchema(
  pathname: string,
  name: string,
  description: string,
  extra: StructuredData = {}
): StructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(pathname),
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: absoluteUrl("/")
    },
    ...extra
  };
}

export function getPageStructuredData(slug: string[] = []): StructuredData[] {
  const pathname = getPagePathname(slug);
  const routeSeo = getRouteSeoEntry(pathname);

  if (pathname === "/") {
    return [
      buildWebPageSchema(pathname, routeSeo.title, routeSeo.description, {
        about: [
          "Greek language learning",
          "Cyprus Reality",
          "Cyprus history and culture"
        ]
      })
    ];
  }

  if (slug[0] === "lessons" && slug[1]) {
    const lesson = getLessonById(slug[1]);

    if (!lesson) {
      return [];
    }

    const parentPath = lesson.trackId === "cyprus_reality" ? "/cyprus" : "/lessons";
    const parentName =
      lesson.trackId === "cyprus_reality"
        ? "Cyprus Reality"
        : "Греческий язык для жизни на Кипре";

    return [
      buildBreadcrumbList([
        { name: "Kypros Path", pathname: "/" },
        { name: parentName, pathname: parentPath },
        { name: lesson.title, pathname }
      ]),
      {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        name: lesson.title,
        description: lesson.objective,
        url: absoluteUrl(pathname),
        inLanguage: lesson.trackId === "cyprus_reality" ? "ru" : "el",
        learningResourceType: "Lesson",
        educationalLevel: lesson.difficulty.toUpperCase(),
        isPartOf: {
          "@type": "Course",
          name: parentName,
          url: absoluteUrl(parentPath)
        }
      }
    ];
  }

  if (!routeSeo.indexable) {
    return [];
  }

  const breadcrumb = buildBreadcrumbList([
    { name: "Kypros Path", pathname: "/" },
    { name: routeSeo.title, pathname }
  ]);

  if (pathname === "/lessons") {
    return [
      breadcrumb,
      buildCollectionPageSchema(
        pathname,
        "Greek Core: греческий язык для жизни на Кипре",
        routeSeo.description,
        {
          about: ["бытовой греческий", "сервисные ситуации", "чтение", "разговорная практика"],
          inLanguage: ["ru", "el"]
        }
      )
    ];
  }

  if (pathname === "/easy-start") {
    return [
      breadcrumb,
      buildCollectionPageSchema(
        pathname,
        "Лёгкий старт: греческий язык с нуля на Кипре",
        routeSeo.description,
        {
          about: ["первый бытовой греческий", "представление", "простые вопросы", "базовые диалоги"]
        }
      )
    ];
  }

  if (pathname === "/phrasebook") {
    return [
      breadcrumb,
      buildCollectionPageSchema(pathname, routeSeo.title, routeSeo.description)
    ];
  }

  if (pathname === "/cyprus") {
    return [
      breadcrumb,
      buildCollectionPageSchema(
        pathname,
        "Cyprus Reality: история, культура и устройство Кипра",
        routeSeo.description,
        {
          about: ["история Кипра", "институты", "культура", "подготовка к экзамену"]
        }
      )
    ];
  }

  if (pathname === "/trails") {
    return [
      breadcrumb,
      buildCollectionPageSchema(pathname, routeSeo.title, routeSeo.description)
    ];
  }

  if (pathname === "/sitemap") {
    return [
      breadcrumb,
      buildCollectionPageSchema(pathname, routeSeo.title, routeSeo.description)
    ];
  }

  if (pathname === "/humor") {
    return [
      breadcrumb,
      buildCollectionPageSchema(pathname, routeSeo.title, routeSeo.description)
    ];
  }

  return [breadcrumb];
}
