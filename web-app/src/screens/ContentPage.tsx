import { Link } from "react-router-dom";
import learningPathsJson from "@content/05-seed-data/learning-paths.json";
import {
  getLessonsByModule,
  getModuleById,
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
  const previewPaths = learningPaths.slice(0, 4);
  const previewModules = modules.slice(0, 4);
  const previewHumorThemes = humorThemeCards.slice(0, 4);
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
      chip: "Быстрые фразы",
      description: "Если нужен practical entry без длинного урока, открой бытовые сценарии с transliteration и short self-check.",
      title: "Открыть phrasebook-сценарии",
      to: "/phrasebook",
      toneClass: "track-card-language"
    },
    {
      chip: "Быстрая проверка",
      description: "Если хочешь не читать всё подряд, а проверить, что уже держится в голове, открой квиз.",
      title: "Перейти к короткой проверке",
      to: "/quiz",
      toneClass: "track-card-history"
    }
  ];

  const libraryShelves = [
    {
      chip: "Маршруты",
      description: "Готовые сценарии под разговор, сервисы, Cyprus Reality и бытовые задачи.",
      title: "Открыть guided catalog",
      to: "/trails",
      toneClass: "track-card",
      meta: `${learningPaths.length} готовых входов`
    },
    {
      chip: "Фразы",
      description: "Компактные бытовые intents: приветствие, кафе, магазин, дорога, документы и короткие сервисные сценарии.",
      title: "Открыть practical scenarios",
      to: "/phrasebook",
      toneClass: "track-card-language",
      meta: "12 сценариев"
    },
    {
      chip: "Модули",
      description: "Точечный вход, если уже известно, какую тему или уровень нужно открыть.",
      title: "Перейти к модулям программы",
      to: "/lessons",
      toneClass: "track-card-language",
      meta: `${modules.length} модулей в библиотеке`
    },
    {
      chip: "Проверка",
      description: "Короткая самопроверка после учебного шага без долгого просмотра каталога.",
      title: "Открыть банк вопросов",
      to: "/quiz",
      toneClass: "track-card-history",
      meta: `${previewQuizzes.length}+ быстрых вопросов`
    },
    {
      chip: "Культура",
      description: "Лёгкий дополнительный слой: юмор, разговорные наблюдения и культурные заметки.",
      title: "Открыть культурные подборки",
      to: "/humor",
      toneClass: "track-card-language",
      meta: `${humorThemeCards.length} тематических подборок`
    }
  ];

  function getTrailLibraryLink(trailId: string) {
    return `/trails?trail=${trailId}`;
  }

  function getModuleLibraryLink(moduleId: string, trackId: string) {
    if (trackId === "greek_b1") {
      return `/lessons?stage=${getModuleStage(moduleId)}&module=${moduleId}&source=library`;
    }

    return `/cyprus?module=${moduleId}&source=library`;
  }

  function getPathLibraryLink(pathId: string, steps: string[]) {
    if (pathId === "path_home_setup_no_drama") {
      return getTrailLibraryLink("trail_home_setup_no_drama");
    }

    if (pathId === "path_doctor_pharmacy_follow_up") {
      return getTrailLibraryLink("trail_doctor_pharmacy_follow_up");
    }

    if (pathId === "path_kep_to_resolution") {
      return getTrailLibraryLink("trail_kep_to_resolution");
    }

    if (pathId === "path_quick_orders_and_prices") {
      return getTrailLibraryLink("trail_taverna_ninja");
    }

    if (pathId === "path_speaking_under_pressure") {
      return getTrailLibraryLink("trail_no_english_pls");
    }

    if (pathId === "path_courses_and_services") {
      return getTrailLibraryLink("trail_kep_survival_mode");
    }

    if (pathId === "path_cyprus_reality_by_topics") {
      return getTrailLibraryLink("trail_fact_not_panic");
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
          Начни с одного рабочего входа: программа, маршрут или проверка. Остальная библиотека ниже
          остаётся вторичным каталогом, а не обязательным полотном.
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

      <section className="panel content-library-map-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Вторичные разделы</p>
            <h2>Что открыть, если главный вход уже понятен</h2>
            <p className="section-copy">
              Ниже не полный каталог на первом экране, а четыре понятных направления для точечного
              перехода.
            </p>
          </div>
        </div>

        <div className="grid content-entry-grid">
          {libraryShelves.map((card) => (
            <Link className={`card card-link ${card.toneClass}`} key={card.title} to={card.to}>
              <p className="chip">{card.chip}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <p className="muted">{card.meta}</p>
              <span className="action-link">Открыть</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel content-preview-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Быстрый просмотр</p>
            <h2>Разверни только тот слой библиотеки, который нужен сейчас</h2>
            <p className="section-copy">
              Примеры и превью оставлены on-demand, чтобы страница не превращалась в длинный
              inventory-scroll.
            </p>
          </div>
        </div>

        <div className="content-disclosure-list">
          <details className="content-disclosure">
            <summary>Показать примеры маршрутов</summary>
            <div className="content-disclosure-body grid">
              {previewPaths.map((path) => (
                <Link className="card card-link" key={path.id} to={getPathLibraryLink(path.id, path.steps)}>
                  <p className="chip">Маршрут</p>
                  <h3>{path.title}</h3>
                  <p>{path.description}</p>
                  <p className="muted">{path.steps.length} шагов</p>
                  <span className="action-link">Открыть маршрут</span>
                </Link>
              ))}
            </div>
          </details>

          <details className="content-disclosure">
            <summary>Показать модули программы</summary>
            <div className="content-disclosure-body grid">
              {previewModules.map((module) => {
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
          </details>

          <details className="content-disclosure">
            <summary>Показать примеры уроков и проверок</summary>
            <div className="content-disclosure-body stack">
              <div className="grid">
                {previewLessons.slice(0, 4).map((lesson) => (
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
              <div className="grid">
                {previewQuizzes.slice(0, 4).map((quiz) => (
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
            </div>
          </details>

          <details className="content-disclosure">
            <summary>Показать культурные подборки</summary>
            <div className="content-disclosure-body grid">
              {previewHumorThemes.map((theme) => (
                <Link className="card card-link track-card track-card-language" key={theme.title} to="/humor">
                  <p className="chip">Подборка</p>
                  <h3>{theme.title}</h3>
                  <p>{theme.description}</p>
                  <p className="muted">{theme.count} материалов</p>
                  <span className="action-link">Открыть</span>
                </Link>
              ))}
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
