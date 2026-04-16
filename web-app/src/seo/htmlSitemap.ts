import { getLessonsByTrack } from "@/src/content/catalogData";

export type HtmlSitemapLink = {
  description?: string;
  href: string;
  label: string;
};

export type HtmlSitemapSection = {
  description: string;
  links: HtmlSitemapLink[];
  title: string;
};

export function getHtmlSitemapSections(): HtmlSitemapSection[] {
  const greekLessons = getLessonsByTrack("greek_b1");
  const cyprusLessons = getLessonsByTrack("cyprus_reality");

  return [
    {
      title: "Главные входы",
      description: "Короткие indexable entry pages, с которых обычно начинается маршрут по сайту.",
      links: [
        {
          href: "/",
          label: "Главная",
          description: "Общий вход в Kypros Path с быстрым выбором первого шага."
        },
        {
          href: "/easy-start",
          label: "Лёгкий старт",
          description: "Самый короткий путь в первый урок, карточки и мини-проверку."
        },
        {
          href: "/lessons",
          label: "Уроки Greek Core",
          description: "Полная языковая программа для жизни на Кипре."
        },
        {
          href: "/cyprus",
          label: "Cyprus Reality",
          description: "История, культура и устройство страны как отдельный учебный трек."
        },
        {
          href: "/phrasebook",
          label: "Phrasebook",
          description: "Everyday Greek для бытовых и сервисных сценариев."
        },
        {
          href: "/trails",
          label: "Маршруты",
          description: "Guided paths по разговору, повторению и Cyprus-oriented задачам."
        },
        {
          href: "/humor",
          label: "Юмор",
          description: "Лёгкий культурный слой для short reading practice."
        }
      ]
    },
    {
      title: "Первые уроки Greek Core",
      description: "Стартовые уроки языковой программы, чтобы быстро открыть рабочий учебный шаг.",
      links: greekLessons.slice(0, 12).map((lesson) => ({
        href: `/lessons/${lesson.id}`,
        label: `${lesson.order}. ${lesson.title}`,
        description: lesson.objective
      }))
    },
    {
      title: "Cyprus Reality: стартовые темы",
      description: "Первые уроки по стране, институтам, культуре и базовым exam-oriented темам.",
      links: cyprusLessons.slice(0, 12).map((lesson) => ({
        href: `/lessons/${lesson.id}`,
        label: `${lesson.order}. ${lesson.title}`,
        description: lesson.objective
      }))
    }
  ];
}
