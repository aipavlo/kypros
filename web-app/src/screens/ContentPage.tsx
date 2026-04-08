import { Link } from "react-router-dom";
import learningPathsJson from "@content/05-seed-data/learning-paths.json";
import {
  getLessonsByModule,
  getModuleById,
  getModulesByTrack,
  lessons,
  modules,
  tracks
} from "@/src/content/catalogData";
import { getHumorItems } from "@/src/content/humorData";
import { getQuizHighlights } from "@/src/content/quizData";
import { getModuleStage, getTrackCountCopy, getTrackPresentation } from "@/src/content/presentation";

export function ContentPage() {
  const learningPaths = learningPathsJson as Array<{
    id: string;
    title: string;
    description: string;
    steps: string[];
  }>;
  const previewLessons = lessons.slice(0, 12);
  const previewQuizzes = getQuizHighlights(8);
  const humorItems = getHumorItems();
  const humorThemeMap = new Map<
    string,
    { count: number; title: string; description: string }
  >([
    [
      "theme:coffee",
      {
        count: 0,
        title: "Кофе и керасма",
        description: "Кофе как ритуал, social glue и повод для маленьких культурных шуток."
      }
    ],
    [
      "theme:family",
      {
        count: 0,
        title: "Семейный стол",
        description: "Семейная громкость, забота, добавка еды и тёплый бытовой хаос."
      }
    ],
    [
      "theme:paperwork",
      {
        count: 0,
        title: "Юмор про документы",
        description: "Очереди, формы, сервисы и бюрократический фольклор Греции и Кипра."
      }
    ],
    [
      "theme:learning",
      {
        count: 0,
        title: "Трудности греческого",
        description: "Мемы про fast native speech, “понял примерно” и учебный реализм."
      }
    ],
    [
      "theme:cyprus_expression",
      {
        count: 0,
        title: "Кипрские выражения",
        description: "Кипрские бытовые выражения, ирония и локальный разговорный колорит."
      }
    ],
    [
      "theme:idiom",
      {
        count: 0,
        title: "Идиомы и образный юмор",
        description: "Образные греческие идиомы, которые смешат уже самой картинкой."
      }
    ]
  ]);

  for (const item of humorItems) {
    for (const tag of item.tags) {
      const current = humorThemeMap.get(tag);
      if (current) {
        current.count += 1;
      }
    }
  }

  const humorThemeCards = [...humorThemeMap.values()].filter((item) => item.count > 0);
  const curatorCards = [
    {
      chip: "Самый простой вход",
      description: "Если не хочется выбирать вручную, начни с готовой учебной линии и двигайся по одному следующему шагу.",
      title: "Открыть программу по греческому",
      to: "/lessons?stage=a1&source=library",
      toneClass: "track-card-language"
    },
    {
      chip: "Под задачу",
      description: "Если нужен не каталог, а сценарий, переходи в маршруты: разговор, сервисы, история, тематический повтор.",
      title: "Выбрать готовый маршрут",
      to: "/trails",
      toneClass: "track-card"
    },
    {
      chip: "Быстрая проверка",
      description: "Если хочешь не читать всё подряд, а проверить, что уже держится в голове, открой квиз.",
      title: "Перейти к короткой проверке",
      to: "/quiz",
      toneClass: "track-card-history"
    }
  ];

  function getTrackLibraryLink(trackId: string) {
    if (trackId === "greek_b1") {
      return "/lessons?stage=a1&source=tracks";
    }

    if (trackId === "cyprus_reality") {
      return "/cyprus";
    }

    if (trackId === "exam_prep") {
      return "/quiz";
    }

    if (trackId === "greek_humor") {
      return "/humor";
    }

    if (trackId === "speaking_practice") {
      return "/trails#trail_no_english_pls";
    }

    if (trackId === "citizenship_strategy") {
      return "/trails#trail_kep_survival_mode";
    }

    return "/tracks";
  }

  function getModuleLibraryLink(moduleId: string, trackId: string) {
    if (trackId === "greek_b1") {
      return `/lessons?stage=${getModuleStage(moduleId)}&module=${moduleId}&source=library`;
    }

    return `/cyprus?module=${moduleId}&source=library`;
  }

  function getPathLibraryLink(pathId: string, steps: string[]) {
    if (pathId === "path_speaking_under_pressure") {
      return "/trails#trail_no_english_pls";
    }

    if (pathId === "path_courses_and_services") {
      return "/trails#trail_kep_survival_mode";
    }

    if (pathId === "path_cyprus_reality_by_topics") {
      return "/trails#trail_fact_not_panic";
    }

    const firstLessonStep = steps.find((step) => step.startsWith("gr_") || step.startsWith("cy_"));
    return firstLessonStep ? `/lessons/${firstLessonStep}` : "/trails";
  }

  return (
    <div className="stack">
      <section className="panel page-banner content-hero-panel">
        <p className="eyebrow">Библиотека</p>
        <h1>Библиотека контента</h1>
        <p className="section-copy">
          Это не страница “прочитай всё”. Здесь лучше выбрать один рабочий сценарий: программа,
          маршрут или проверка.
        </p>
      </section>

      <section className="panel content-curator-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Кураторский вход</p>
            <h2>Что открыть первым</h2>
            <p className="section-copy">
              Выбери один тип движения. Всё остальное ниже остаётся библиотекой, а не обязательным
              списком для просмотра.
            </p>
          </div>
        </div>

        <div className="grid spotlight-grid">
          {curatorCards.map((card) => (
            <Link className={`card card-link ${card.toneClass}`} key={card.title} to={card.to}>
              <p className="chip">{card.chip}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="action-link">Открыть</span>
            </Link>
          ))}
        </div>

        <div className="grid content-entry-grid">
          <Link className="card card-link track-card track-card-language" to="/lessons?stage=a1&source=library">
            <p className="chip">Язык</p>
            <h3>Программа по греческому</h3>
            <p>Уроки по уровням от A1 до B2.</p>
            <p className="muted">{getTrackCountCopy("greek_b1", tracks.find((track) => track.id === "greek_b1")?.moduleCount ?? 0, tracks.find((track) => track.id === "greek_b1")?.lessonCount ?? 0)}</p>
            <span className="action-link">Открыть программу</span>
          </Link>
          <Link className="card card-link track-card track-card-history" to="/cyprus">
            <p className="chip">Кипр</p>
            <h3>История и культура Кипра</h3>
            <p>Отдельная программа по стране и экзамену.</p>
            <p className="muted">{getTrackCountCopy("cyprus_reality", tracks.find((track) => track.id === "cyprus_reality")?.moduleCount ?? 0, tracks.find((track) => track.id === "cyprus_reality")?.lessonCount ?? 0)}</p>
            <span className="action-link">Открыть программу</span>
          </Link>
          <Link className="card card-link track-card" to="/quiz">
            <p className="chip">Проверка</p>
            <h3>Квиз: проверка знаний</h3>
            <p>Короткие проверки по языку и Кипру.</p>
            <p className="muted">Все режимы в одном разделе</p>
            <span className="action-link">Открыть квиз</span>
          </Link>
        </div>
      </section>

      <section className="panel content-library-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Обзор библиотеки</p>
            <h2>Готовые маршруты</h2>
            <p className="section-copy">
              Маршруты удобны, когда нужна цель, а не просто список материалов.
            </p>
          </div>
          <Link className="inline-link" to="/trails">
            Смотреть маршруты
          </Link>
        </div>

        <div className="grid">
          {learningPaths.map((path) => (
            <Link className="card card-link" key={path.id} to={getPathLibraryLink(path.id, path.steps)}>
              <p className="chip">Маршрут</p>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <p className="muted">{path.steps.length} шагов</p>
              <span className="action-link">Открыть маршрут</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel content-library-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Модули</p>
            <h2>Модули программы</h2>
            <p className="section-copy">
              Это слой для точечного входа, если уже понятно, какую тему нужно открыть.
            </p>
          </div>
          <Link className="inline-link" to="/lessons">
            Перейти к урокам
          </Link>
        </div>

        <div className="grid">
          {modules.map((module) => {
            const moduleLessons = getLessonsByModule(module.id);
            const presentation = getTrackPresentation(module.trackId);

            return (
              <Link
                className={`card card-link track-card ${presentation.themeClass === "track-language" ? "track-card-language" : presentation.themeClass === "track-history" ? "track-card-history" : ""}`}
                key={module.id}
                to={getModuleLibraryLink(module.id, module.trackId)}
              >
                <p className="chip">{presentation.shortLabel}</p>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <p className="muted">
                  {moduleLessons.length} уроков · порядок {module.order}
                </p>
                <span className="action-link">Открыть</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="panel content-library-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Уроки</p>
            <h2>Примеры уроков</h2>
            <p className="section-copy">
              Ниже только срез библиотеки, а не рекомендуемый порядок прохождения.
            </p>
          </div>
          <Link className="inline-link" to="/lessons">
            Смотреть все уроки
          </Link>
        </div>

        <div className="grid">
          {previewLessons.map((lesson) => (
            <Link className="card card-link" key={lesson.id} to={`/lessons/${lesson.id}`}>
              <p className="chip">
                {lesson.trackId === "cyprus_reality" ? "Cyprus Reality" : lesson.difficulty.toUpperCase()}
              </p>
              <h3>
                {lesson.order}. {lesson.title}
              </h3>
              <p>{lesson.objective}</p>
              <p className="muted">
                {lesson.estimatedMinutes} min · модуль {getModuleById(lesson.moduleId)?.title ?? lesson.moduleId}
              </p>
              <span className="action-link">Открыть урок</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel content-library-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Банк вопросов</p>
            <h2>Вопросы для проверки</h2>
            <p className="section-copy">
              Этот блок полезен, когда хочется быстро проверить себя, а не проходить маршрут целиком.
            </p>
          </div>
          <Link className="inline-link" to="/quiz">
            Открыть проверку
          </Link>
        </div>

        <div className="grid">
          {previewQuizzes.map((quiz) => (
            <Link className="card card-link" key={quiz.id} to="/quiz">
              <p className="chip">{quiz.difficulty.toUpperCase()}</p>
              <h3>{quiz.question}</h3>
              <p>{quiz.explanation}</p>
              <p className="muted">
                {quiz.trackId === "cyprus_reality" ? "Cyprus Reality" : "Подготовка к экзамену"}
              </p>
              <span className="action-link">Открыть квиз</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel content-library-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Юмор</p>
            <h2>Культурные подборки</h2>
            <p className="section-copy">
              Дополнительный слой для живого культурного контекста, а не основной маршрут старта.
            </p>
          </div>
          <Link className="inline-link" to="/humor">
            Открыть раздел
          </Link>
        </div>

        <div className="grid">
          {humorThemeCards.map((theme) => (
            <Link className="card card-link track-card track-card-language" key={theme.title} to="/humor">
              <p className="chip">Подборка</p>
              <h3>{theme.title}</h3>
              <p>{theme.description}</p>
              <p className="muted">{theme.count} материалов</p>
              <span className="action-link">Открыть</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
