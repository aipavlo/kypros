import type { Metadata } from "next";
import { getLessonById } from "@/src/content/catalogData";

export const SITE_NAME = "Kypros Path";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kyprospath.app";
const parsedSiteUrl = new URL(SITE_URL);
export const SITE_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (parsedSiteUrl.pathname === "/" ? "" : parsedSiteUrl.pathname.replace(/\/$/, ""));
export const DEFAULT_TITLE = "Греческий язык и Cyprus Reality для подготовки к экзамену";
export const DEFAULT_DESCRIPTION =
  "Сайт для изучения греческого языка, истории и культуры Кипра: уроки, карточки, маршруты, мини-проверки и подготовка к Cyprus Reality.";

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

type RouteSeoEntry = {
  description: string;
  keywords: string[];
  title: string;
};

const ROUTE_SEO: Record<string, RouteSeoEntry> = {
  "/": {
    title: DEFAULT_TITLE,
    description:
      "Изучение греческого языка и подготовка к экзамену по истории и культуре Кипра: уроки, маршруты, карточки, мини-проверки и Cyprus Reality.",
    keywords: [
      "греческий язык",
      "история Кипра",
      "культура Кипра",
      "Cyprus Reality",
      "подготовка к экзамену Кипр"
    ]
  },
  "/welcome": {
    title: "О сервисе для греческого языка и Cyprus Reality",
    description:
      "Как устроен Kypros Path: дашборд, уроки по греческому языку, программа Cyprus Reality, повторение карточками и мини-проверки.",
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
    keywords: [
      "дашборд обучения греческому",
      "прогресс по урокам Кипр",
      "повторение греческого языка"
    ]
  },
  "/easy-start": {
    title: "Лёгкий старт по греческому языку на Кипре",
    description:
      "Пошаговый старт для изучения греческого языка на Кипре: первые уроки без лишнего выбора, понятный порядок тем и быстрый переход к повторению.",
    keywords: [
      "греческий язык для начинающих",
      "легкий старт греческий",
      "греческий на Кипре"
    ]
  },
  "/lessons": {
    title: "Уроки по греческому языку и Cyprus Reality",
    description:
      "Каталог уроков по греческому языку от A1 до C1 и отдельная программа Cyprus Reality по истории, культуре и государственному устройству Кипра.",
    keywords: [
      "уроки греческого языка",
      "уроки Cyprus Reality",
      "история и культура Кипра уроки"
    ]
  },
  "/cyprus": {
    title: "История, культура и устройство Кипра: Cyprus Reality",
    description:
      "Программа Cyprus Reality: история Кипра, государственное устройство, праздники, культура, общественная жизнь и подготовка к экзамену.",
    keywords: [
      "история Кипра",
      "культура Кипра",
      "устройство Республики Кипр",
      "экзамен Cyprus Reality"
    ]
  },
  "/tracks": {
    title: "Программы обучения: греческий язык и Кипр",
    description:
      "Все программы Kypros Path: греческий язык по уровням, Cyprus Reality, разговорные маршруты, подготовка к экзамену и греческий юмор.",
    keywords: [
      "программа по греческому языку",
      "программа Cyprus Reality",
      "маршруты подготовки Кипр"
    ]
  },
  "/trails": {
    title: "Маршруты обучения по греческому и Кипру",
    description:
      "Готовые маршруты по греческому языку, сервисным ситуациям, истории Кипра и тематическому повторению перед экзаменом.",
    keywords: [
      "маршруты обучения греческий",
      "сценарии подготовки Кипр",
      "повторение Cyprus Reality"
    ]
  },
  "/flashcards": {
    title: "Карточки для повторения греческого и Кипра",
    description:
      "Карточки для повторения слов, фраз, дат, институтов и ключевых фактов по греческому языку и Cyprus Reality.",
    keywords: [
      "карточки греческий язык",
      "карточки история Кипра",
      "повторение слов и фактов"
    ]
  },
  "/quiz": {
    title: "Мини-проверки по греческому языку и Cyprus Reality",
    description:
      "Мини-проверки, повтор ошибок и короткие квизы по греческому языку, истории и культуре Кипра.",
    keywords: [
      "квиз по греческому языку",
      "проверка по истории Кипра",
      "мини проверка Cyprus Reality"
    ]
  },
  "/content": {
    title: "Библиотека уроков, квизов и маршрутов",
    description:
      "Библиотека учебного контента: уроки по греческому языку, программа Cyprus Reality, маршруты, модули, квизы и греческий юмор.",
    keywords: [
      "библиотека уроков греческий",
      "контент Cyprus Reality",
      "квизы и маршруты Кипр"
    ]
  },
  "/humor": {
    title: "Греческий юмор, мемы и анекдоты для изучения языка",
    description:
      "Греческий юмор, мемы, бытовые шутки и анекдоты с пояснениями, переводом и культурным контекстом для изучения языка.",
    keywords: [
      "греческий юмор",
      "греческие мемы",
      "анекдоты на греческом",
      "разговорный греческий"
    ]
  },
  "/achievements": {
    title: "Прогресс, достижения и разблокировки",
    description:
      "Прогресс по модулям греческого языка и Cyprus Reality, достижения, бейджи и следующий учебный шаг.",
    keywords: [
      "прогресс обучения греческий",
      "достижения Cyprus Reality",
      "разблокировка модулей"
    ]
  }
};

function getMetadataForLesson(lessonId: string): Metadata | null {
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return null;
  }

  const trackLabel =
    lesson.trackId === "cyprus_reality"
      ? "Cyprus Reality: история и культура Кипра"
      : `Урок греческого языка ${lesson.difficulty.toUpperCase()}`;

  const title = `${lesson.title} | ${trackLabel}`;
  const description = `${lesson.objective} Урок входит в программу ${trackLabel.toLowerCase()} и ведёт к карточкам и мини-проверке.`;
  const pathname = `/lessons/${lessonId}`;

  return {
    title,
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
      type: "website",
      url: getAbsoluteUrl(pathname)
    },
    twitter: {
      card: "summary",
      title,
      description
    },
    alternates: {
      canonical: getAbsoluteUrl(pathname)
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

  const routeSeo = ROUTE_SEO[pathname] ?? ROUTE_SEO["/"];

  return {
    title: routeSeo.title,
    description: routeSeo.description,
    keywords: routeSeo.keywords,
    openGraph: {
      title: routeSeo.title,
      description: routeSeo.description,
      type: "website",
      url: getAbsoluteUrl(pathname)
    },
    twitter: {
      card: "summary",
      title: routeSeo.title,
      description: routeSeo.description
    },
    alternates: {
      canonical: getAbsoluteUrl(pathname)
    }
  };
}
