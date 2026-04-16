import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getLessonById,
  getModuleById,
  getMutableCyprusFacts
} from "@/src/content/catalogData";
import {
  getQuizModeById,
  getQuizQuestionsByLesson,
  getQuizQuestionsByMode,
  quizModes
} from "@/src/content/quizData";
import {
  getCompactRetryQuestionIds,
  getReviewPlan,
  getRetrySelfCheckItems,
  type StoredQuizProgress
} from "@/src/content/review";
import { transliterateGreekToLatinWithStress } from "@/src/content/transliteration";
import {
  getModuleNextLearningAction,
  getModuleProgressKey,
  hasModuleProgress
} from "@/src/content/progress";
import { getModuleStage } from "@/src/content/presentation";

const MODULE_QUIZ_PASS_THRESHOLD = 60;
const GREEK_FRAGMENT_PATTERN = /[Α-Ωα-ωΆ-Ώά-ώΈέΉήΊίΌόΎύΏώϊϋΐΰς]+(?:[\s,.;:!?'"«»()\-–—]+[Α-Ωα-ωΆ-Ώά-ώΈέΉήΊίΌόΎύΏώϊϋΐΰς]+)*/g;

function getQuestionTagValue(tags: string[], prefix: string) {
  return tags.find((tag) => tag.startsWith(prefix))?.replace(prefix, "");
}

function getTopTagValues(questions: Array<{ tags: string[] }>, prefix: string, limit = 3) {
  const counts = new Map<string, number>();

  questions.forEach((question) => {
    const value = getQuestionTagValue(question.tags, prefix);

    if (!value) {
      return;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function getGreekPronunciationHints(value: string) {
  const matches = value.match(GREEK_FRAGMENT_PATTERN) ?? [];
  const normalizedMatches = [...new Set(matches.map((match) => match.trim()).filter(Boolean))];

  if (normalizedMatches.length === 0) {
    return [];
  }

  return normalizedMatches.map((fragment) => transliterateGreekToLatinWithStress(fragment));
}

function renderTextWithPronunciation(value: string) {
  const hints = getGreekPronunciationHints(value);

  return (
    <span className="quiz-text-with-pronunciation">
      <span>{value}</span>
      {hints.length > 0 ? (
        <span className="quiz-inline-pronunciation muted">Как читать: {hints.join(" · ")}</span>
      ) : null}
    </span>
  );
}

type QuizPageProps = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  onMarkModuleQuizPassed: (moduleId: string) => void;
  quizProgress: StoredQuizProgress;
  onQuizProgressChange: (
    updater: (current: StoredQuizProgress) => StoredQuizProgress
  ) => void;
};

export function QuizPage(props: QuizPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedModeId = searchParams.get("mode") ?? "mode_mixed_summary";
  const requestedModuleId = searchParams.get("module");
  const requestedLessonId = searchParams.get("lesson");
  const requestedSource = searchParams.get("source");
  const requestedTrailId = searchParams.get("trail");
  const shouldRetryMistakes = searchParams.get("retry") === "mistakes";
  const shouldShowRetrySelfCheck = searchParams.get("self_check") !== "off";
  const activeMode = getQuizModeById(requestedModeId) ?? quizModes[0];
  const storedModeProgress = props.quizProgress[activeMode.id];
  const initialRetryQuestionIds = shouldRetryMistakes
    ? getCompactRetryQuestionIds(
        storedModeProgress?.wrongQuestionIds ?? [],
        getQuizQuestionsByMode(activeMode.id)
      )
    : null;
  const [retryQuestionIds, setRetryQuestionIds] = useState<string[] | null>(initialRetryQuestionIds);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);
  const requestedLesson = requestedLessonId ? getLessonById(requestedLessonId) : undefined;
  const mutableCyprusFacts = getMutableCyprusFacts();
  const activeQuestions = useMemo(() => {
    const questions = getQuizQuestionsByMode(activeMode?.id ?? "mode_mixed_summary");
    const retryQuestions = retryQuestionIds
      ? retryQuestionIds
          .map((questionId) => questions.find((question) => question.id === questionId))
          .filter((question): question is NonNullable<(typeof questions)[number]> => Boolean(question))
      : [];

    if (retryQuestions.length > 0) {
      return retryQuestions;
    }

    if (requestedLessonId) {
      const focusedLessonQuestions = getQuizQuestionsByLesson(requestedLessonId, requestedLesson?.difficulty);

      if (focusedLessonQuestions.length > 0) {
        return focusedLessonQuestions;
      }
    }

    if (!requestedModuleId) {
      return questions;
    }

    const focusedQuestions = questions.filter((question) =>
      question.tags.includes(`module:${requestedModuleId}`)
    );

    return focusedQuestions.length > 0 ? focusedQuestions : questions;
  }, [activeMode, requestedLesson?.difficulty, requestedLessonId, requestedModuleId, retryQuestionIds]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setWrongQuestionIds([]);
    setRetryQuestionIds(initialRetryQuestionIds);
  }, [activeMode?.id, requestedModuleId, shouldRetryMistakes, initialRetryQuestionIds]);

  const activeQuiz = activeQuestions[activeIndex];
  const isAnswered = selectedAnswer !== null;
  const isFinished = activeIndex >= activeQuestions.length;
  const isRetryMode = retryQuestionIds !== null;
  const retrySelfCheckItems = isRetryMode
    ? getRetrySelfCheckItems(
        storedModeProgress?.wrongQuestionIds ?? wrongQuestionIds,
        getQuizQuestionsByMode(activeMode.id)
      )
    : [];
  const requestedModule = requestedModuleId ? getModuleById(requestedModuleId) : undefined;
  const isLessonFlow = requestedSource === "lesson" && Boolean(requestedLessonId);
  const requestedModuleStageId =
    requestedModuleId && requestedModule?.trackId === "greek_b1"
      ? getModuleStage(requestedModuleId)
      : undefined;
  const requestedModuleProgressId =
    requestedModuleId && requestedModule
      ? getModuleProgressKey(requestedModuleId, requestedModule.trackId, requestedModuleStageId)
      : null;
  const recommendedModeIds = useMemo(() => {
    if (requestedModule?.trackId === "cyprus_reality") {
      return ["mode_cyprus_reality", "mode_cyprus_summary", "mode_mixed_summary"];
    }

    if (requestedModule?.trackId === "greek_b1") {
      const focusedGreekModeId = requestedModuleStageId
        ? `mode_greek_${requestedModuleStageId}`
        : activeMode.id;

      return [focusedGreekModeId, "mode_greek_summary", "mode_mixed_summary"];
    }

    if (requestedLesson?.trackId === "cyprus_reality") {
      return ["mode_cyprus_reality", "mode_cyprus_summary", "mode_mixed_summary"];
    }

    if (requestedLesson?.trackId === "greek_b1") {
      const focusedGreekModeId = `mode_greek_${requestedLesson.difficulty}`;
      return [focusedGreekModeId, "mode_greek_summary", "mode_mixed_summary"];
    }

    return ["mode_mixed_summary", "mode_greek_summary", "mode_cyprus_summary"];
  }, [activeMode.id, requestedLesson, requestedModule?.trackId, requestedModuleStageId]);
  const recommendedModes = recommendedModeIds
    .map((modeId) => getQuizModeById(modeId))
    .filter((mode, index, current): mode is NonNullable<typeof mode> =>
      Boolean(mode) && current.findIndex((item) => item?.id === mode?.id) === index
    );
  const remainingModes = quizModes.filter(
    (mode) => !recommendedModes.some((recommendedMode) => recommendedMode.id === mode.id)
  );
  const isModuleQuizPassed =
    requestedModuleId && requestedModule
      ? hasModuleProgress(
          props.passedModuleQuizIds,
          requestedModuleId,
          requestedModule.trackId,
          requestedModuleStageId
        )
      : false;
  const currentReviewPlan = storedModeProgress
    ? getReviewPlan(props.quizProgress, 2).find((item) => item.modeId === activeMode.id) ??
      getReviewPlan(props.quizProgress, 2)[0] ??
      null
    : null;
  const shouldShowFullModeCatalog = !isLessonFlow;

  const progressLabel = useMemo(() => {
    return `${Math.min(activeIndex + 1, activeQuestions.length)} / ${activeQuestions.length}`;
  }, [activeIndex, activeQuestions.length]);
  const lessonBackLink = requestedLessonId
    ? `/lessons/${requestedLessonId}?${new URLSearchParams(
        Object.fromEntries(
          [
            requestedSource ? ["source", requestedSource] : null,
            requestedTrailId ? ["trail", requestedTrailId] : null
          ].filter((entry): entry is [string, string] => Boolean(entry))
        )
      ).toString()}`
    : "/lessons";

  function selectMode(modeId: string) {
    setRetryQuestionIds(null);
    setSearchParams({ mode: modeId });
  }

  function saveQuizResult() {
    const percent = Math.round((score / activeQuestions.length) * 100);
    const wrongQuestions = activeQuestions.filter((question) => wrongQuestionIds.includes(question.id));
    const weakModules = getTopTagValues(wrongQuestions, "module:");
    const weakSkills = getTopTagValues(wrongQuestions, "skill:");

    if (requestedModuleProgressId && !isRetryMode && percent >= MODULE_QUIZ_PASS_THRESHOLD) {
      props.onMarkModuleQuizPassed(requestedModuleProgressId);
    }

    props.onQuizProgressChange((current) => {
      const previous = current[activeMode.id] ?? {
        attempts: 0,
        bestPercent: 0,
        lastPercent: 0,
        wrongQuestionIds: [],
        weakModules: [],
        weakSkills: []
      };

      return {
        ...current,
        [activeMode.id]: {
          attempts: previous.attempts + 1,
          bestPercent: Math.max(previous.bestPercent, percent),
          lastPercent: percent,
          wrongQuestionIds,
          weakModules,
          weakSkills
        }
      };
    });
  }

  function submitAnswer(option: string) {
    if (isAnswered || isFinished || !activeQuiz) {
      return;
    }

    setSelectedAnswer(option);

    if (option === activeQuiz.correctAnswer) {
      setScore((prev) => prev + 1);
      return;
    }

    setWrongQuestionIds((current) =>
      current.includes(activeQuiz.id) ? current : [...current, activeQuiz.id]
    );
  }

  function goNextQuestion() {
    if (activeIndex === activeQuestions.length - 1) {
      saveQuizResult();
      setActiveIndex(activeQuestions.length);
      return;
    }

    setActiveIndex((prev) => prev + 1);
    setSelectedAnswer(null);
  }

  function restartQuiz() {
    setActiveIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setWrongQuestionIds([]);
    setRetryQuestionIds(null);
  }

  function retryMistakes() {
    const questionIds =
      wrongQuestionIds.length > 0 ? wrongQuestionIds : storedModeProgress?.wrongQuestionIds ?? [];

    if (questionIds.length === 0) {
      return;
    }

    setRetryQuestionIds(getCompactRetryQuestionIds(questionIds, getQuizQuestionsByMode(activeMode.id)));
    setActiveIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setWrongQuestionIds([]);
  }

  if (!activeMode || activeQuestions.length === 0) {
    return (
      <section className="panel page-banner">
        <p className="eyebrow">Проверка</p>
        <h2>Режим пока пустой</h2>
        <p className="section-copy">
          Для этого режима пока не хватает вопросов. Можно выбрать другой режим.
        </p>
      </section>
    );
  }

  if (isFinished) {
    const percent = Math.round((score / activeQuestions.length) * 100);
    const effectivePassedModuleQuizIds =
      requestedModuleProgressId && percent >= MODULE_QUIZ_PASS_THRESHOLD && !isRetryMode
        ? props.passedModuleQuizIds.includes(requestedModuleProgressId)
          ? props.passedModuleQuizIds
          : [...props.passedModuleQuizIds, requestedModuleProgressId]
        : props.passedModuleQuizIds;
    const moduleLoopAction = requestedModuleId
      ? getModuleNextLearningAction(
          requestedModuleId,
          props.completedLessonIds,
          props.reviewedModuleIds,
          effectivePassedModuleQuizIds,
          requestedModule?.trackId ?? "greek_b1",
          requestedModuleStageId
        )
      : null;
    const reviewPlan = getReviewPlan(
      {
        ...props.quizProgress,
        [activeMode.id]: {
          attempts: (storedModeProgress?.attempts ?? 0) + 1,
          bestPercent: Math.max(storedModeProgress?.bestPercent ?? 0, percent),
          lastPercent: percent,
          wrongQuestionIds,
          weakModules: getTopTagValues(
            activeQuestions.filter((question) => wrongQuestionIds.includes(question.id)),
            "module:"
          ),
          weakSkills: getTopTagValues(
            activeQuestions.filter((question) => wrongQuestionIds.includes(question.id)),
            "skill:"
          )
        }
      },
      2
    );
    const activeReviewPlan = reviewPlan.find((item) => item.modeId === activeMode.id) ?? reviewPlan[0];

    return (
      <div className="stack">
        <section className="panel page-banner">
          <div className="section-head">
            <div>
              <p className="eyebrow">{isRetryMode ? "Коррекция" : "Режим"}</p>
              <h2>{isRetryMode ? "Коррекция завершена" : activeMode.title}</h2>
              <p className="section-copy">
                {isRetryMode
                  ? "Это был короткий повтор только по слабым местам, без полного прохода режима."
                  : activeMode.description}
              </p>
            </div>
            <span className="meta-pill">{activeQuestions.length} вопросов</span>
          </div>

          <div className="quiz-mode-grid">
            {quizModes.map((mode) => {
              const modeQuestions = getQuizQuestionsByMode(mode.id);
              const isCurrent = mode.id === activeMode.id;

              return (
                <button
                  className={`quiz-mode-card ${isCurrent ? "quiz-mode-card-active" : ""}`}
                  key={mode.id}
                  onClick={() => selectMode(mode.id)}
                  type="button"
                >
                  <div>
                    <p className="chip">{mode.title}</p>
                    <h3>{mode.uiHints.recommendedQuestionCount} вопросов за сессию</h3>
                  </div>
                  <p>{mode.description}</p>
                  <span className="muted">{modeQuestions.length} доступно в банке</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">{isRetryMode ? "Коррекция" : "Готово"}</p>
          <h2>{isRetryMode ? "Повтор слабых мест" : "Результат"}</h2>
          <p className="lead">
            {isRetryMode
              ? `Это короткий повтор только по слабым вопросам: ${score} из ${activeQuestions.length} правильных.`
              : `Правильных ответов: ${score} из ${activeQuestions.length}.`}
          </p>
          <p className="result-score">{percent}%</p>
          {requestedModuleId || storedModeProgress ? (
            <div className="quiz-review-grid">
              {requestedModuleId ? (
                <article className="trail-helper-card">
                  <strong>Шаг модуля: мини-проверка</strong>
                  <p>
                    {isModuleQuizPassed || percent >= MODULE_QUIZ_PASS_THRESHOLD
                      ? `Шаг проверки для модуля ${getModuleById(requestedModuleId)?.title ?? requestedModuleId} засчитан.`
                      : `Для зачёта нужно набрать от ${MODULE_QUIZ_PASS_THRESHOLD}%.`}
                  </p>
                </article>
              ) : null}
              {!isLessonFlow && storedModeProgress?.weakModules.length ? (
                <article className="trail-helper-card">
                  <strong>Слабые модули</strong>
                  <p>
                    {storedModeProgress.weakModules
                      .map((moduleId) => getModuleById(moduleId)?.title ?? moduleId)
                      .join(" · ")}
                  </p>
                </article>
              ) : null}
              {!isLessonFlow && storedModeProgress?.weakSkills.length ? (
                <article className="trail-helper-card">
                  <strong>Слабые навыки</strong>
                  <p>{storedModeProgress.weakSkills.join(" · ")}</p>
                </article>
              ) : null}
              {!isLessonFlow && storedModeProgress ? (
                <article className="trail-helper-card">
                  <strong>Лучшая / последняя коррекция</strong>
                  <p>
                    {storedModeProgress.bestPercent}% лучший · {storedModeProgress.lastPercent}% последний
                  </p>
                </article>
              ) : null}
              {requestedModuleId && moduleLoopAction ? (
                <article className="trail-helper-card">
                  <strong>Следующий шаг</strong>
                  <p>{moduleLoopAction.description}</p>
                </article>
              ) : null}
            </div>
          ) : null}
          {!isLessonFlow && activeReviewPlan ? (
            <section className="remediation-family-panel">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Recovery family</p>
                  <h3>Как возвращаться без лишнего полного круга</h3>
                  <p className="section-copy">{activeReviewPlan.packSummary}</p>
                </div>
              </div>

              <div className="remediation-family-grid">
                <article className="remediation-step-card remediation-step-card-entry">
                  <p className="eyebrow">Remediation entry</p>
                  <h4>{activeReviewPlan.selfCheckTitle}</h4>
                  <p>{activeReviewPlan.selfCheckDescription}</p>
                  <Link className="secondary-link-button" to={activeReviewPlan.selfCheckLink}>
                    Открыть remediation-entry
                  </Link>
                </article>

                <article className="remediation-step-card remediation-step-card-quick">
                  <p className="eyebrow">Быстрый возврат</p>
                  <h4>{activeReviewPlan.quickReturnTitle}</h4>
                  <p>{activeReviewPlan.quickReturnDescription}</p>
                  <Link className="primary-link-button" to={activeReviewPlan.retryLink}>
                    Открыть quick return
                  </Link>
                </article>

                <article className="remediation-step-card remediation-step-card-deep">
                  <p className="eyebrow">Глубокий возврат</p>
                  <h4>{activeReviewPlan.fullLessonTitle}</h4>
                  <p>{activeReviewPlan.fullLessonDescription}</p>
                  <div className="actions-row">
                    {activeReviewPlan.lessonLink ? (
                      <Link className="secondary-link-button" to={activeReviewPlan.lessonLink}>
                        Открыть full lesson
                      </Link>
                    ) : null}
                    {activeReviewPlan.flashcardsLink ? (
                      <Link className="secondary-link-button" to={activeReviewPlan.flashcardsLink}>
                        Открыть карточки темы
                      </Link>
                    ) : null}
                  </div>
                </article>
              </div>
            </section>
          ) : null}
          {isLessonFlow ? (
            <section className="remediation-family-panel remediation-family-panel-lesson-end">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Lesson end</p>
                  <h3>Сейчас важнее не потерять lesson context</h3>
                  <p className="section-copy">
                    Этот экран завершает только lesson-linked self-check. Главный следующий шаг —
                    вернуться в урок и закрыть маршрут. Quick return и full lesson нужны позже,
                    только если correction loop отдельно покажет, что тема всё ещё просела.
                  </p>
                </div>
              </div>
            </section>
          ) : null}
          <div className="actions-row">
            {isLessonFlow ? (
              requestedLesson ? (
                <Link className="primary-link-button" to={lessonBackLink}>
                  {moduleLoopAction?.kind === "next_module" || moduleLoopAction?.kind === "done"
                    ? "Вернуться к уроку и продолжить"
                    : "Назад к уроку"}
                </Link>
              ) : (
                <button className="primary-button" onClick={restartQuiz} type="button">
                  Пройти ещё раз
                </button>
              )
            ) : (
              <button className="primary-button" onClick={restartQuiz} type="button">
                Пройти ещё раз
              </button>
            )}
            {!isLessonFlow && storedModeProgress?.wrongQuestionIds?.length && !activeReviewPlan ? (
              <button className="secondary-button" onClick={retryMistakes} type="button">
                Открыть quick return
              </button>
            ) : null}
            {requestedModuleId && moduleLoopAction?.kind === "next_module" ? (
              <Link className="secondary-link-button" to={moduleLoopAction.to}>
                Открыть следующий модуль
              </Link>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="stack">
      <section className="study-layout quiz-layout">
        <section className="panel page-banner study-main-panel quiz-overview-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Проверка</p>
              <h2>{activeMode.title}</h2>
              <p className="section-copy">{activeMode.description}</p>
              {isLessonFlow && requestedLesson ? (
                <p className="trail-note">
                  Вы в шаге урока {requestedLesson.order}: <strong>{requestedLesson.title}</strong>.
                </p>
              ) : null}
              {requestedModuleId ? (
                <p className="trail-note">
                  Сейчас проверка сфокусирована на модуле <strong>{getModuleById(requestedModuleId)?.title ?? requestedModuleId}</strong>.
                </p>
              ) : null}
            </div>
            <span className="meta-pill">{progressLabel}</span>
          </div>

          {(activeMode.id === "mode_cyprus_reality" || activeMode.id === "mode_cyprus_summary") &&
          mutableCyprusFacts.length > 0 ? (
            <article className="info-note-card">
              <p className="eyebrow">Изменяемые факты</p>
              <h3>Перед запуском по Cyprus Reality перепроверь изменяемые данные</h3>
              <p>
                В этом режиме есть темы, где часть данных может меняться со временем.
              </p>
              <div className="module-step-pills">
                {mutableCyprusFacts.map((fact) => (
                  <span className="badge-chip" key={fact.id}>
                    {fact.title}
                  </span>
                ))}
              </div>
            </article>
          ) : null}

          <div className="meta-inline">
            <span className="meta-pill">Рекомендуемо: {activeMode.uiHints.recommendedQuestionCount} вопросов</span>
            <span className="meta-pill">{activeQuestions.length} доступно в банке</span>
            {isRetryMode ? <span className="meta-pill meta-pill-success">Коррекция</span> : null}
          </div>

          {storedModeProgress ? (
            <div className="quiz-review-grid">
              <article className="trail-helper-card">
                <strong>Correction loop</strong>
                <p>
                  {storedModeProgress.lastPercent}% последний результат · {storedModeProgress.attempts} попыток.
                  Сначала короткая self-check, потом quick return и только потом full lesson.
                </p>
                {storedModeProgress.wrongQuestionIds.length > 0 ? (
                  <div className="actions-row">
                    <Link
                      className="secondary-link-button"
                      to={`/quiz?mode=${activeMode.id}&retry=mistakes`}
                    >
                      Открыть self-check и quick return
                    </Link>
                  </div>
                ) : null}
              </article>
              {storedModeProgress.weakModules.length > 0 ? (
                <article className="trail-helper-card">
                  <strong>Слабые темы</strong>
                  <p>
                    {storedModeProgress.weakModules
                      .map((moduleId) => getModuleById(moduleId)?.title ?? moduleId)
                      .join(" · ")}
                  </p>
                </article>
              ) : null}
            </div>
          ) : null}

          {isLessonFlow ? (
            <div className="lesson-utility-links">
              <Link className="inline-link" to={lessonBackLink}>
                Назад к уроку
              </Link>
            </div>
          ) : null}

          <section className="quiz-modes-shell">
            {!shouldShowFullModeCatalog ? (
              <article className="info-note-card">
                <p className="eyebrow">Lesson-linked self-check</p>
                <h3>Здесь важнее закончить текущую проверку, чем выбирать режим</h3>
                <p>
                  Эта мини-проверка встроена в маршрут урока. Сначала закрой текущий question flow,
                  а к полному каталогу режимов возвращайся уже вне lesson path.
                </p>
              </article>
            ) : null}
            {shouldShowFullModeCatalog ? (
              <>
            <div className="section-head">
              <div>
                <p className="eyebrow">Рекомендовано</p>
                <h2>Что открыть первым</h2>
                <p className="section-copy">
                  Сначала выбери один подходящий тип проверки. Полный каталог режимов остаётся ниже,
                  если нужен более точный сценарий.
                </p>
              </div>
            </div>

            <div className="quiz-mode-grid quiz-mode-grid-recommended">
              {recommendedModes.map((mode) => {
                const modeQuestions = getQuizQuestionsByMode(mode.id);
                const progress = props.quizProgress[mode.id];
                const isCurrent = mode.id === activeMode.id;

                return (
                  <button
                    className={`quiz-mode-card quiz-mode-card-recommended ${isCurrent ? "quiz-mode-card-active" : ""}`}
                    key={mode.id}
                    onClick={() => selectMode(mode.id)}
                    type="button"
                  >
                    <div className="quiz-mode-card-top">
                      <p className="chip">{mode.title}</p>
                      <span className="meta-pill">{mode.uiHints.recommendedQuestionCount} вопросов</span>
                    </div>
                    <h3>{mode.uiHints.recommendedFor}</h3>
                    <p>{mode.description}</p>
                    {progress ? (
                      <span className="muted">
                        {progress.bestPercent}% лучший · {progress.attempts} попыток
                      </span>
                    ) : (
                      <span className="muted">Ещё не запускался</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="quiz-entry-actions">
            {storedModeProgress?.wrongQuestionIds.length ? (
              <Link className="action-card" to={`/quiz?mode=${activeMode.id}&retry=mistakes`}>
                <p className="chip">Quick return</p>
                <h3>Открыть compact retry</h3>
                <p>
                  {Math.min(storedModeProgress.wrongQuestionIds.length, 3)} слабых вопроса соберутся в короткий self-check,
                  а не в полный дубль всей сессии.
                </p>
                <span className="action-link">Открыть коррекцию</span>
              </Link>
            ) : null}
            {!isLessonFlow && currentReviewPlan?.lessonLink ? (
              <Link className="action-card" to={currentReviewPlan.lessonLink}>
                <p className="chip">Full lesson</p>
                <h3>Открыть full lesson revisit</h3>
                <p>{currentReviewPlan.fullLessonDescription}</p>
                <span className="action-link">Открыть тему целиком</span>
              </Link>
            ) : null}
            {isLessonFlow ? (
              <Link className="action-card" to={lessonBackLink}>
                <p className="chip">Маршрут урока</p>
                  <h3>Вернуться к уроку</h3>
                  <p>Проверка встроена в flow урока, поэтому назад возвращаться тоже должно быть легко.</p>
                  <span className="action-link">Открыть урок</span>
                </Link>
              ) : null}
              {!isLessonFlow && activeMode.id !== "mode_mixed_summary" ? (
                <button className="action-card quiz-action-card" onClick={() => selectMode("mode_mixed_summary")} type="button">
                  <p className="chip">Общий срез</p>
                  <h3>Открыть смешанную сессию</h3>
                  <p>Подходит, когда нужен один общий прогон вместо узкого режима по теме.</p>
                  <span className="action-link">Переключиться</span>
                </button>
              ) : null}
            </div>

            <div className="section-head quiz-catalog-head">
              <div>
                <p className="eyebrow">Все режимы</p>
                <h2>Полный каталог проверок</h2>
                <p className="section-copy">
                  Этот блок нужен, если рекомендованный слой выше не подошёл или нужна точная
                  проверка по уровню.
                </p>
              </div>
            </div>

            <div className="quiz-mode-grid quiz-mode-grid-secondary">
              {remainingModes.map((mode) => {
                const modeQuestions = getQuizQuestionsByMode(mode.id);
                const isCurrent = mode.id === activeMode.id;

                return (
                  <button
                    className={`quiz-mode-card ${isCurrent ? "quiz-mode-card-active" : ""}`}
                    key={mode.id}
                    onClick={() => selectMode(mode.id)}
                    type="button"
                  >
                    <div className="quiz-mode-card-top">
                      <p className="chip">{mode.title}</p>
                      <span className="meta-pill">{modeQuestions.length} в банке</span>
                    </div>
                    <h3>{mode.uiHints.recommendedFor}</h3>
                    <p>{mode.description}</p>
                    <span className="muted">{modeQuestions.length} в банке</span>
                  </button>
                );
              })}
            </div>
              </>
            ) : null}
          </section>
        </section>

        <aside className="panel study-sticky-panel quiz-question-panel">
          <div className="progress-rail progress-rail-inline">
            <span
              className="progress-fill"
              style={{
                width: `${(Math.min(activeIndex + 1, activeQuestions.length) / activeQuestions.length) * 100}%`
              }}
            />
          </div>

          <p className="eyebrow">Текущий вопрос</p>
          {isRetryMode && shouldShowRetrySelfCheck && retrySelfCheckItems.length > 0 ? (
            <article className="info-note-card quiz-self-check-card">
              <p className="eyebrow">Self-check</p>
              <h3>Self-check before retry</h3>
              <p>
                Этот суженный повтор держится на {retrySelfCheckItems.length} слабых вопросах и
                меняет ритм: сначала вспоминаешь правильную опору, потом проходишь коррекцию.
              </p>
              <div className="quiz-review-grid">
                {retrySelfCheckItems.map((item) => (
                  <article className="trail-helper-card" key={item.questionId}>
                    <strong>{item.question}</strong>
                    <p>Опора: {renderTextWithPronunciation(item.correctAnswer)}</p>
                    <p>{renderTextWithPronunciation(item.explanation)}</p>
                    {item.weakModuleTitle ? <p>Тема: {item.weakModuleTitle}</p> : null}
                    {item.weakSkills.length > 0 ? <p>Навык: {item.weakSkills.join(" · ")}</p> : null}
                  </article>
                ))}
              </div>
            </article>
          ) : null}
          <h2>{renderTextWithPronunciation(activeQuiz.question)}</h2>

          <div className="option-list">
            {activeQuiz.options.map((option) => {
              const isCorrect = option === activeQuiz.correctAnswer;
              const isSelected = option === selectedAnswer;

              let className = "option-button";

              if (isAnswered && isCorrect) {
                className += " option-correct";
              } else if (isAnswered && isSelected) {
                className += " option-wrong";
              }

              return (
                <button
                  className={className}
                  key={option}
                  onClick={() => submitAnswer(option)}
                  type="button"
                >
                  {renderTextWithPronunciation(option)}
                </button>
              );
            })}
          </div>

          {isAnswered ? (
            <div className="feedback-box">
              <p>
                <strong>Правильный ответ:</strong> {renderTextWithPronunciation(activeQuiz.correctAnswer)}
              </p>
              <p>{renderTextWithPronunciation(activeQuiz.explanation)}</p>
            </div>
          ) : null}

          <div className="actions-row">
            <span className="muted">Текущий счёт: {score}</span>
            {isRetryMode ? (
              <span className="muted">
                Суженный повтор: {activeQuestions.length} {activeQuestions.length === 1 ? "вопрос" : activeQuestions.length < 5 ? "вопроса" : "вопросов"}
              </span>
            ) : null}
            <button
              className="primary-button"
              disabled={!isAnswered}
              onClick={goNextQuestion}
              type="button"
            >
              {activeIndex === activeQuestions.length - 1 ? "Завершить" : "Следующий вопрос"}
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
