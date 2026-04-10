import type { Metadata } from "next";
import { getLessonById } from "@/src/content/catalogData";
import indexableStaticRoutes from "./indexableStaticRoutes.json";

export const SITE_NAME = "Kypros Path";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aipavlo.github.io/kypros/";
export const DEFAULT_SOCIAL_IMAGE_PATH = "/social-preview.svg";
const parsedSiteUrl = new URL(SITE_URL);
export const SITE_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (parsedSiteUrl.pathname === "/" ? "" : parsedSiteUrl.pathname.replace(/\/$/, ""));
export const DEFAULT_TITLE = "Греческий и Cyprus Reality для жизни на Кипре";
export const DEFAULT_DESCRIPTION =
  "Уроки греческого, Cyprus Reality, маршруты, карточки и короткие проверки для жизни и подготовки по Кипру.";
const MAX_TITLE_LENGTH = 70;

export function getAbsoluteUrl(pathname = "/") {
  const normalizedPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "") || "";
  const basePath = SITE_BASE_PATH || "";
  const fullPath = `${basePath}${normalizedPath}` || "/";

  return new URL(fullPath, `${parsedSiteUrl.origin}/`).toString();
}

export function getAssetUrl(assetPath: string) {
  const normalizedAssetPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  return `${SITE_BASE_PATH}${normalizedAssetPath}`;
}

export function getSocialImageMetadata(imagePath = DEFAULT_SOCIAL_IMAGE_PATH) {
  return [
    {
      url: getAbsoluteUrl(imagePath),
      width: 1200,
      height: 630,
      alt: "Kypros Path"
    }
  ];
}

function trimForSnippet(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildDocumentTitle(title: string) {
  if (title.includes(SITE_NAME)) {
    return trimForSnippet(title, MAX_TITLE_LENGTH);
  }

  return trimForSnippet(`${title} | ${SITE_NAME}`, MAX_TITLE_LENGTH);
}

export type RouteSeoEntry = {
  canonicalPathname?: string;
  description: string;
  indexable: boolean;
  keywords: string[];
  title: string;
};

export const ROUTE_SEO: Record<string, RouteSeoEntry> = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Греческий язык, Cyprus Reality, маршруты, карточки и короткие проверки для жизни и подготовки на Кипре.",
    indexable: true,
    keywords: [
      "греческий язык",
      "история Кипра",
      "культура Кипра",
      "Cyprus Reality",
      "подготовка к экзамену Кипр"
    ]
  },
  "/welcome": {
    title: "О сервисе Kypros Path",
    description:
      "Как устроен Kypros Path: греческий язык, Cyprus Reality, маршруты, повторение карточками и мини-проверки в одном сервисе.",
    canonicalPathname: "/",
    indexable: false,
    keywords: [
      "сервис для изучения греческого",
      "курсы по Кипру",
      "уроки по истории Кипра"
    ]
  },
  "/dashboard": {
    title: "Дашборд обучения по греческому и Cyprus Reality",
    description:
      "Главный дашборд обучения: следующий урок по греческому языку, повторение, прогресс по модулям и короткие проверки по Кипру.",
    indexable: false,
    keywords: [
      "дашборд обучения греческому",
      "прогресс по урокам Кипр",
      "повторение греческого языка"
    ]
  },
  "/easy-start": {
    title: "Греческий с нуля на Кипре: лёгкий старт",
    description:
      "Стартовый путь по греческому с нуля: один короткий урок, карточки, мини-проверка и понятный следующий шаг без перегруза.",
    indexable: true,
    keywords: [
      "греческий язык для начинающих",
      "легкий старт греческий",
      "греческий на Кипре"
    ]
  },
  "/phrasebook": {
    title: "Практические фразы и бытовые сценарии на греческом",
    description:
      "Компактные бытовые сценарии по everyday Greek: приветствие, кафе, магазин, дорога, сервисы и документы с transliteration и short self-check.",
    indexable: true,
    keywords: [
      "греческие фразы для жизни на Кипре",
      "бытовые сценарии на греческом",
      "греческий phrasebook",
      "everyday greek cyprus"
    ]
  },
  "/lessons": {
    title: "Уроки греческого для жизни на Кипре",
    description:
      "Программа Greek Core: уроки от A1 до B2, дополнительный C1, карточки по модулям и мини-проверки для жизни на Кипре.",
    indexable: true,
    keywords: [
      "уроки греческого языка",
      "греческий язык на Кипре",
      "греческий язык A1 A2 B1 B2"
    ]
  },
  "/cyprus": {
    title: "Cyprus Reality: история и культура Кипра",
    description:
      "Программа по истории, институтам, культуре и общественной жизни Кипра для Cyprus Reality и экзаменационной подготовки.",
    indexable: true,
    keywords: [
      "история Кипра",
      "культура Кипра",
      "устройство Республики Кипр",
      "экзамен Cyprus Reality"
    ]
  },
  "/tracks": {
    title: "Программы и подборки",
    description:
      "Обзор программ и подборок Kypros Path: язык, Cyprus Reality, маршруты, подготовка к экзамену и греческий юмор.",
    indexable: false,
    keywords: [
      "программа по греческому языку",
      "программа Cyprus Reality",
      "маршруты подготовки Кипр"
    ]
  },
  "/trails": {
    title: "Маршруты по греческому и Cyprus Reality",
    description:
      "Готовые маршруты по разговору, сервисным ситуациям, Cyprus Reality и тематическому повторению без лишнего выбора.",
    indexable: true,
    keywords: [
      "маршруты обучения греческий",
      "сценарии подготовки Кипр",
      "повторение Cyprus Reality"
    ]
  },
  "/flashcards": {
    title: "Карточки для повторения",
    description:
      "Карточки для повторения слов, фраз, дат, институтов и ключевых фактов по греческому языку и Cyprus Reality.",
    indexable: false,
    keywords: [
      "карточки греческий язык",
      "карточки история Кипра",
      "повторение слов и фактов"
    ]
  },
  "/quiz": {
    title: "Мини-проверки по греческому и Cyprus Reality",
    description:
      "Короткие проверки по греческому, истории и культуре Кипра с повтором ошибок и быстрым self-check.",
    indexable: false,
    keywords: [
      "квиз по греческому языку",
      "проверка по истории Кипра",
      "мини проверка Cyprus Reality"
    ]
  },
  "/content": {
    title: "Библиотека уроков и маршрутов",
    description:
      "Библиотека учебного контента: уроки, Cyprus Reality, маршруты, модули, квизы и греческий юмор.",
    indexable: false,
    keywords: [
      "библиотека уроков греческий",
      "контент Cyprus Reality",
      "квизы и маршруты Кипр"
    ]
  },
  "/humor": {
    title: "Греческий юмор и мемы для изучения языка",
    description:
      "Греческий юмор, мемы и бытовые шутки с переводом и культурным контекстом для живого изучения языка.",
    indexable: true,
    keywords: [
      "греческий юмор",
      "греческие мемы",
      "анекдоты на греческом",
      "разговорный греческий"
    ]
  },
  "/achievements": {
    title: "Прогресс и достижения",
    description:
      "Прогресс по модулям греческого и Cyprus Reality, достижения, бейджи и следующий учебный шаг.",
    indexable: false,
    keywords: [
      "прогресс обучения греческий",
      "достижения Cyprus Reality",
      "разблокировка модулей"
    ]
  }
};

export const ALL_STATIC_ROUTE_PATHS = Object.keys(ROUTE_SEO) as Array<keyof typeof ROUTE_SEO>;
export const INDEXABLE_STATIC_ROUTE_PATHS = (
  indexableStaticRoutes as Array<{ pathname: string }>
).map((entry) => entry.pathname);

export function getRouteSeoEntry(pathname: string) {
  return ROUTE_SEO[pathname] ?? ROUTE_SEO["/"];
}

function getMetadataForLesson(lessonId: string): Metadata | null {
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return null;
  }

  const trackLabel =
    lesson.trackId === "cyprus_reality"
      ? "Cyprus Reality"
      : `Greek ${lesson.difficulty.toUpperCase()}`;
  const title = trimForSnippet(`${lesson.title} | ${trackLabel}`, MAX_TITLE_LENGTH);
  const description = trimForSnippet(
    `${lesson.objective} ${lesson.estimatedMinutes} минут, затем карточки и мини-проверка.`,
    160
  );
  const pathname = `/lessons/${lessonId}`;

  return {
    title: {
      absolute: buildDocumentTitle(title)
    },
    description,
    keywords: [
      lesson.title,
      trackLabel,
      lesson.trackId === "cyprus_reality" ? "история и культура Кипра" : "греческий язык",
      "урок",
      "подготовка к экзамену Кипр"
    ],
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      type: "website",
      url: getAbsoluteUrl(pathname),
      images: getSocialImageMetadata()
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: getSocialImageMetadata().map((image) => image.url)
    },
    alternates: {
      canonical: getAbsoluteUrl(pathname)
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export function getRouteMetadataFromSlug(slug: string[] = []): Metadata {
  const pathname = slug.length === 0 ? "/" : `/${slug.join("/")}`;

  if (slug[0] === "lessons" && slug[1]) {
    const lessonMetadata = getMetadataForLesson(slug[1]);

    if (lessonMetadata) {
      return lessonMetadata;
    }
  }

  const routeSeo = getRouteSeoEntry(pathname);
  const canonicalPathname = routeSeo.canonicalPathname ?? pathname;

  return {
    title: {
      absolute: buildDocumentTitle(routeSeo.title)
    },
    description: routeSeo.description,
    keywords: routeSeo.keywords,
    openGraph: {
      title: routeSeo.title,
      description: routeSeo.description,
      siteName: SITE_NAME,
      type: "website",
      url: getAbsoluteUrl(canonicalPathname),
      images: getSocialImageMetadata()
    },
    twitter: {
      card: "summary_large_image",
      title: routeSeo.title,
      description: routeSeo.description,
      images: getSocialImageMetadata().map((image) => image.url)
    },
    alternates: {
      canonical: getAbsoluteUrl(canonicalPathname)
    },
    robots: {
      index: routeSeo.indexable,
      follow: true
    }
  };
}
