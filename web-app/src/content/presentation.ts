import { getLessonsByModule } from "@/src/content/catalogData";

export function getModuleStage(moduleId: string) {
  return getLessonsByModule(moduleId)[0]?.difficulty ?? "a1";
}

export function getTrackPresentation(trackId: string) {
  if (trackId === "greek_b1") {
    return {
      themeClass: "track-language",
      label: "Языковая программа",
      shortLabel: "Язык",
      focus: "Практический язык",
      summary:
        "Основная программа: фразы, бытовые ситуации, документы и повторение от A1 до B2; C1 остаётся дополнительным продвинутым блоком после основной линии."
    };
  }

  if (trackId === "cyprus_reality") {
    return {
      themeClass: "track-history",
      label: "Программа Cyprus Reality",
      shortLabel: "Кипр и экзамен",
      focus: "История, культура, институты",
      summary:
        "Самостоятельная программа по Кипру: государство, история, общество, даты, культура и тематическое повторение по блокам."
    };
  }

  if (trackId === "speaking_practice") {
    return {
      themeClass: "track-language",
      label: "Разговорные маршруты",
      shortLabel: "Разговор",
      focus: "Живая речь и понимание на слух",
      summary:
        "Короткие разговорные сценарии, понимание на слух и привычка не уходить в английский."
    };
  }

  if (trackId === "citizenship_strategy") {
    return {
      themeClass: "track-history",
      label: "Маршруты подготовки",
      shortLabel: "Подготовка",
      focus: "Сервисы, институты и стратегия",
      summary:
        "Готовые маршруты с минимальной неопределённостью: формы, КЕП, институты, изменяемые факты и тематическое повторение перед экзаменом."
    };
  }

  if (trackId === "greek_humor") {
    return {
      themeClass: "track-language",
      label: "Юмор и наблюдения",
      shortLabel: "Юмор",
      focus: "Мемы, шутки и живой тон",
      summary:
        "Лёгкая подборка мемов, бытовых шуток и анекдотов, которая возвращает в язык без перегруза."
    };
  }

  return {
    themeClass: "track-default",
    label: "Учебная программа",
    shortLabel: "Программа",
    focus: "Учебный контур",
    summary: "Тематический учебный контур."
  };
}

export function getTrackCountCopy(trackId: string, moduleCount: number, lessonCount: number) {
  if (trackId === "speaking_practice" || trackId === "citizenship_strategy") {
    return `${moduleCount} маршрута, ${lessonCount} шагов`;
  }

  if (trackId === "greek_humor") {
    return `${moduleCount} подборки, ${lessonCount} сюжетов`;
  }

  return `${moduleCount} модулей, ${lessonCount} уроков`;
}
