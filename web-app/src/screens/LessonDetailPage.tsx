import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  getLessonById,
  getModuleById,
  getLessonsByModule,
  getNextLesson
} from "@/src/content/catalogData";
import {
  getFlashcardsByLesson,
  getFlashcardsByModule
} from "@/src/content/flashcardData";
import {
  getQuizQuestionsByLesson,
  getQuizQuestionsByModule,
  getRecommendedQuizModeForLesson
} from "@/src/content/quizData";
import { transliterateGreekToLatin } from "@/src/content/transliteration";
import { easyStartLessonIds } from "@/src/content/trails";
import { getModuleCycleStatus } from "@/src/content/progress";
import { LessonPreviewCard } from "@/src/components/shared-ui";

const MODULE_QUIZ_PASS_THRESHOLD = 60;
const FEEDBACK_EMAIL = "feedback@kyprospath.app";

type LessonDetailPageProps = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  onToggleCompleted: (lessonId: string) => void;
};

type LessonFlowStep = "study" | "flashcards" | "quiz" | "next_lesson" | "done";

function renderBlockTitle(blockType: string) {
  const titles: Record<string, string> = {
    phrase_set: "Фразы",
    vocabulary: "Словарь",
    grammar_table: "Грамматика",
    micro_text: "Текст",
    micro_dialogue: "Диалог",
    fact_list: "Факты",
    city_list: "Города",
    micro_timeline: "Ключевые даты",
    institution_notes: "Институты",
    holiday_list: "Праздники",
    checkpoint_list: "Что запомнить",
    guided_practice: "Практика",
    production_task: "Итоговое задание",
    exam_tip: "Комментарий",
    self_check: "Проверь себя"
  };

  return titles[blockType] ?? blockType;
}

function isBeginnerLesson(difficulty: string) {
  return difficulty === "a0" || difficulty === "a1";
}

function renderGreekPhrase(value: string, showPronunciation: boolean) {
  const pronunciation = showPronunciation ? transliterateGreekToLatin(value) : null;

  return (
    <>
      <strong>{value}</strong>
      {pronunciation ? <span className="muted">{pronunciation}</span> : null}
    </>
  );
}

function renderBlockItem(item: Record<string, string>, showPronunciation: boolean) {
  if (item.el && item.ru) {
    return (
      <>
        {renderGreekPhrase(item.el, showPronunciation)}
        <span>{item.ru}</span>
      </>
    );
  }

  if (item.title && item.text) {
    return (
      <>
        <strong>{item.title}</strong>
        <span>{item.text}</span>
      </>
    );
  }

  if (item.date && item.text) {
    return (
      <>
        <strong>{item.date}</strong>
        <span>{item.text}</span>
      </>
    );
  }

  if (item.date && item.title) {
    return (
      <>
        <strong>{item.date}</strong>
        <span>{item.title}</span>
      </>
    );
  }

  if (item.name && item.ru) {
    return (
      <>
        <strong>{item.name}</strong>
        <span>{item.ru}</span>
      </>
    );
  }

  if (item.text) {
    return <span>{item.text}</span>;
  }

  return <span>{Object.values(item).join(" · ")}</span>;
}

function getLessonFlowStep(
  isLessonCompleted: boolean,
  isReviewDone: boolean,
  isQuizDone: boolean,
  hasNextLesson: boolean
): LessonFlowStep {
  if (!isLessonCompleted) {
    return "study";
  }

  if (!isReviewDone) {
    return "flashcards";
  }

  if (!isQuizDone) {
    return "quiz";
  }

  if (hasNextLesson) {
    return "next_lesson";
  }

  return "done";
}

export function LessonDetailPage(props: LessonDetailPageProps) {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const lesson = params.lessonId ? getLessonById(params.lessonId) : undefined;
  const source = searchParams.get("source");
  const isEasyStartSource = source === "easy_start";

  if (!lesson) {
    return (
      <section className="panel">
        <p className="eyebrow">Урок</p>
        <h1>Урок не найден</h1>
        <p className="section-copy">
          Возможно, id урока изменился или этот урок пока не подключён.
        </p>
        <Link className="inline-link" to="/lessons">
          Вернуться к урокам
        </Link>
      </section>
    );
  }

  const module = getModuleById(lesson.moduleId);
  const siblingLessons = getLessonsByModule(lesson.moduleId).filter(
    (item) => item.id !== lesson.id
  );
  const lessonId = lesson.id;
  const nextLesson = getNextLesson(lesson.id);
  const isCompleted = props.completedLessonIds.includes(lesson.id);
  const showLessonPronunciation = isBeginnerLesson(lesson.difficulty);
  const easyStartLessonIndex = easyStartLessonIds.indexOf(lesson.id as (typeof easyStartLessonIds)[number]);
  const nextEasyStartLessonId =
    easyStartLessonIndex >= 0 ? easyStartLessonIds[easyStartLessonIndex + 1] : undefined;
  const nextEasyStartLesson = nextEasyStartLessonId ? getLessonById(nextEasyStartLessonId) : undefined;
  const relatedLessonFlashcards = getFlashcardsByLesson(lesson.id);
  const relatedModuleFlashcards = getFlashcardsByModule(lesson.moduleId, lesson.difficulty);
  const relatedFlashcards =
    relatedLessonFlashcards.length > 0 ? relatedLessonFlashcards : relatedModuleFlashcards;
  const relatedLessonQuizQuestions = getQuizQuestionsByLesson(lesson.id, lesson.difficulty);
  const relatedModuleQuizQuestions = getQuizQuestionsByModule(lesson.moduleId, lesson.difficulty);
  const relatedQuizQuestions =
    relatedLessonQuizQuestions.length > 0 ? relatedLessonQuizQuestions : relatedModuleQuizQuestions;
  const recommendedQuizMode = getRecommendedQuizModeForLesson(lesson.id);
  const flashcardsLink =
    relatedLessonFlashcards.length > 0
      ? `/flashcards?track=${lesson.trackId}&lesson=${lesson.id}&source=lesson&returnTo=${lesson.id}`
      : `/flashcards?track=${lesson.trackId}&module=${lesson.moduleId}&lesson=${lesson.id}&source=lesson&returnTo=${lesson.id}`;
  const quizLink = recommendedQuizMode
    ? `/quiz?mode=${recommendedQuizMode.id}&module=${lesson.moduleId}&lesson=${lesson.id}&source=lesson`
    : `/quiz?lesson=${lesson.id}&source=lesson`;
  const moduleCycleStatus = module
    ? getModuleCycleStatus(
        module.id,
        props.completedLessonIds,
        props.reviewedModuleIds,
        props.passedModuleQuizIds,
        lesson.trackId,
        lesson.trackId === "greek_b1" ? lesson.difficulty : undefined
      )
    : null;
  const isReviewDone = moduleCycleStatus?.reviewDone ?? false;
  const isQuizDone = moduleCycleStatus?.quizDone ?? false;
  const lessonFlowStep = getLessonFlowStep(isCompleted, isReviewDone, isQuizDone, Boolean(nextLesson));
  const returnToEasyStartLink = "/easy-start";
  const backToScenarioLink = isEasyStartSource ? returnToEasyStartLink : "/lessons";
  const nextEasyStartStepLink = nextEasyStartLesson
    ? `/lessons/${nextEasyStartLesson.id}?source=easy_start`
    : returnToEasyStartLink;
  const nextContextLesson = isEasyStartSource ? nextEasyStartLesson : nextLesson;
  const feedbackSubject = `Kypros Path: обратная связь по уроку ${lesson.order}. ${lesson.title}`;
  const feedbackBody = [
    "Здравствуйте!",
    "",
    "Хочу сообщить о несостыковке на этой странице.",
    "",
    `Урок: ${lesson.title}`,
    `Lesson ID: ${lesson.id}`,
    `Модуль: ${module?.title ?? lesson.moduleId}`,
    `Страница: /lessons/${lesson.id}`,
    "",
    "Что именно не совпадает:",
    "",
    "Как, по моему мнению, должно быть:"
  ].join("\n");
  const feedbackHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(feedbackSubject)}&body=${encodeURIComponent(feedbackBody)}`;

  const flowStepStates = [
    {
      done: isCompleted,
      label: "Шаг 1. Материал урока"
    },
    {
      done: isReviewDone,
      label: "Шаг 2. Карточки урока"
    },
    {
      done: isQuizDone,
      label: "Шаг 3. Мини-проверка урока"
    }
  ];

  const flowStatusCopy =
    lessonFlowStep === "study"
      ? "Материал изучается. После этого открой карточки урока."
      : lessonFlowStep === "flashcards"
        ? "Материал изучен. Карточки урока ещё не завершены."
        : lessonFlowStep === "quiz"
          ? "Карточки завершены. Мини-проверка урока ещё не начата."
          : lessonFlowStep === "next_lesson"
            ? "Шаг завершён. Можно переходить к следующему уроку."
            : "Шаг завершён полностью.";

  const primaryAction =
    lessonFlowStep === "study"
      ? {
          kind: "button" as const,
          label: "Материал изучен",
          onClick: () => props.onToggleCompleted(lessonId)
        }
      : lessonFlowStep === "flashcards"
        ? {
            kind: "link" as const,
            label: "Шаг 2. Карточки урока",
            to: flashcardsLink
          }
        : lessonFlowStep === "quiz"
          ? {
              kind: "link" as const,
              label: "Шаг 3. Мини-проверка урока",
              to: quizLink
            }
          : lessonFlowStep === "next_lesson"
            ? {
                kind: "link" as const,
                label: isEasyStartSource ? "Следующий шаг Лёгкого старта" : "Следующий урок",
                to: isEasyStartSource ? nextEasyStartStepLink : `/lessons/${nextContextLesson?.id}`
              }
            : {
                kind: "link" as const,
                label: isEasyStartSource ? "Вернуться в Лёгкий старт" : "Вернуться к учебе",
                to: backToScenarioLink
              };

  function handleToggleCompleted() {
    props.onToggleCompleted(lessonId);
  }

  return (
    <div className="stack">
      <section className="lesson-detail-hero">
        <div className="lesson-detail-copy">
          {isEasyStartSource ? (
            <div className="lesson-context-breadcrumb">
              <Link className="inline-link" to={returnToEasyStartLink}>
                Лёгкий старт
              </Link>
              <span>→</span>
              <span>Урок</span>
            </div>
          ) : null}
          <p className="eyebrow">Урок</p>
          <h1>{lesson.title}</h1>
          <p className="lead">{lesson.objective}</p>

          <div className="detail-meta-row">
            <span className="lesson-order-badge lesson-order-badge-large">{lesson.order}</span>
            <span className="meta-pill">{lesson.difficulty.toUpperCase()}</span>
            <span className="meta-pill">{lesson.estimatedMinutes} min</span>
            {module ? <span className="meta-pill">{module.title}</span> : null}
          </div>

          <div className="lesson-flow-strip">
            {flowStepStates.map((item) => (
              <span className={item.done ? "badge-chip badge-chip-earned" : "badge-chip"} key={item.label}>
                {item.label}
              </span>
            ))}
          </div>
          <p className="lesson-flow-status">{flowStatusCopy}</p>

          <div className="hero-actions lesson-primary-actions">
            {primaryAction.kind === "button" ? (
              <button className="primary-button" onClick={primaryAction.onClick} type="button">
                {primaryAction.label}
              </button>
            ) : (
              <Link className="primary-link-button" to={primaryAction.to}>
                {primaryAction.label}
              </Link>
            )}
          </div>

          <div className="lesson-utility-links">
            <Link className="inline-link" to={backToScenarioLink}>
              {isEasyStartSource ? "← Вернуться в Лёгкий старт" : "Все уроки"}
            </Link>
            {isCompleted ? (
              <button className="lesson-utility-button" onClick={handleToggleCompleted} type="button">
                Снять отметку материала
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Материал</p>
            <h2>Материал урока</h2>
          </div>
        </div>

        <div className="content-block-list">
          {lesson.contentBlocks.map((block, index) => (
            <details className="lesson-content-section" key={`${lesson.id}-${block.type}-${index}`} open={index < 2}>
              <summary className="lesson-content-summary">
                <span>{renderBlockTitle(block.type)}</span>
              </summary>
              <div className="content-item-list lesson-content-items">
                {block.items.map((item, itemIndex) => (
                  <div className="content-item" key={`${lesson.id}-${block.type}-${itemIndex}`}>
                    {renderBlockItem(item, showLessonPronunciation)}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {isCompleted ? (
        <section className="panel lesson-after-study-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Следующий шаг</p>
              <h2>Продолжай этот учебный шаг</h2>
              <p className="section-copy">
                После материала маршрут всегда один: карточки урока, потом мини-проверка, потом следующий урок.
              </p>
            </div>
          </div>

          <div className="lesson-next-step-grid">
            <article className={isReviewDone ? "card lesson-next-step-card lesson-next-step-card-complete" : "card lesson-next-step-card lesson-next-step-card-current"}>
              <p className="eyebrow">Шаг 2</p>
              <h3>Карточки урока</h3>
              <p>
                {relatedFlashcards.length > 0
                  ? `${relatedFlashcards.length} карточек для закрепления ключевых слов и формулировок.`
                  : "Для этого шага пока нет отдельного набора карточек."}
              </p>
              <div className="lesson-next-step-footer">
                <span>{isReviewDone ? "Завершено" : "Текущий следующий шаг"}</span>
                {!isReviewDone ? (
                  <Link className="primary-link-button" to={flashcardsLink}>
                    Открыть карточки урока
                  </Link>
                ) : null}
              </div>
            </article>

            <article className={isQuizDone ? "card lesson-next-step-card lesson-next-step-card-complete" : "card lesson-next-step-card"}>
              <p className="eyebrow">Шаг 3</p>
              <h3>Мини-проверка урока</h3>
              <p>
                {relatedQuizQuestions.length > 0
                  ? `${relatedQuizQuestions.length} вопроса для быстрой проверки понимания.`
                  : `Если отдельного набора нет, используй режим ${recommendedQuizMode?.title ?? "проверки"}.`}
              </p>
              <div className="lesson-next-step-footer">
                <span>{isQuizDone ? "Завершено" : `Для зачёта нужен результат от ${MODULE_QUIZ_PASS_THRESHOLD}%`}</span>
                {isReviewDone && !isQuizDone ? (
                  <Link className="primary-link-button" to={quizLink}>
                    Открыть мини-проверку урока
                  </Link>
                ) : null}
              </div>
            </article>
          </div>

          {lessonFlowStep === "next_lesson" || lessonFlowStep === "done" ? (
            <div className="lesson-completion-strip">
              <strong>Шаг завершён</strong>
              <p>
                {nextContextLesson
                  ? "Карточки и мини-проверка закрыты. Можно переходить дальше по маршруту."
                  : "Текущий учебный шаг закрыт полностью."}
              </p>
              {nextContextLesson ? (
                <Link
                  className="primary-link-button"
                  to={isEasyStartSource ? nextEasyStartStepLink : `/lessons/${nextContextLesson.id}`}
                >
                  {isEasyStartSource ? "Следующий шаг Лёгкого старта" : "Открыть следующий урок"}
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {isCompleted && siblingLessons.length > 0 ? (
        <section className="panel lesson-secondary-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Модуль</p>
              <h2>Другие уроки этого модуля</h2>
            </div>
          </div>

          <div className="lesson-preview-grid">
            {siblingLessons.map((item) => (
              <LessonPreviewCard
                difficulty={item.difficulty}
                estimatedMinutes={item.estimatedMinutes}
                id={item.id}
                key={item.id}
                order={item.order}
                completed={props.completedLessonIds.includes(item.id)}
                objective={item.objective}
                title={item.title}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel lesson-secondary-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Обратная связь</p>
            <h2>Сообщить о неточности</h2>
          </div>
        </div>

        <aside className="detail-feedback-card">
          <strong>Нашли несостыковку?</strong>
          <p>
            Можно сразу отправить письмо именно по этому уроку, если заметили ошибку,
            неточность или странную формулировку.
          </p>
          <a className="detail-feedback-link" href={feedbackHref}>
            Отправить обратную связь
          </a>
        </aside>
      </section>
    </div>
  );
}
