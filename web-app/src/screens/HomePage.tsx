import { Link } from "react-router-dom";
import {
  getLessonsByTrack,
  getLessonsByTrackAndDifficulty,
  getModuleById,
  getModulesByTrack,
  tracks
} from "@/src/content/catalogData";
import { getModuleStage } from "@/src/content/presentation";
import { getReviewPlan, getReviewSummaries, type StoredQuizProgress } from "@/src/content/review";
import {
  getModuleNextLearningAction,
  getTrackCycleSummary,
  isModuleCompleted
} from "@/src/content/progress";
import { LessonPreviewCard, StatCard } from "@/src/components/shared-ui";

function getStepDurationLabel(
  kind: "lesson" | "flashcards" | "quiz" | "next_module" | "done",
  isReview = false
) {
  if (isReview) {
    return "5-7 минут";
  }

  switch (kind) {
    case "flashcards":
      return "6 минут";
    case "quiz":
      return "4-6 минут";
    case "next_module":
      return "8-10 минут";
    case "done":
      return "Маршрут собран";
    case "lesson":
    default:
      return "7-10 минут";
  }
}

function getStepResultLabel(
  kind: "lesson" | "flashcards" | "quiz" | "next_module" | "done",
  isReview = false
) {
  if (isReview) {
    return "Вернёшься в слабую тему без ручного поиска";
  }

  switch (kind) {
    case "flashcards":
      return "Закрепишь ключевые слова и фразы модуля";
    case "quiz":
      return "Поймёшь, что уже запомнилось, а что стоит повторить";
    case "next_module":
      return "Откроешь следующий обязательный шаг программы";
    case "done":
      return "Этот цикл уже закрыт, можно переходить к следующему уровню";
    case "lesson":
    default:
      return "Пройдёшь урок и увидишь следующий обязательный шаг";
  }
}

function getCurrentLevelLabel(completedGreekA1Lessons: number, nextGreekModuleId?: string) {
  if (completedGreekA1Lessons === 0) {
    return "A0 -> A1-start";
  }

  if (completedGreekA1Lessons < 12) {
    return "A1-start";
  }

  if (nextGreekModuleId) {
    return getModuleStage(nextGreekModuleId).toUpperCase();
  }

  return "A1 завершён";
}

type HomePageProps = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  quizProgress: StoredQuizProgress;
};

export function HomePage(props: HomePageProps) {
  const greekTrack = tracks.find((track) => track.id === "greek_b1");
  const cyprusTrack = tracks.find((track) => track.id === "cyprus_reality");
  const greekModules = getModulesByTrack("greek_b1");
  const cyprusModules = getModulesByTrack("cyprus_reality");
  const greekLessons = getLessonsByTrack("greek_b1");
  const cyprusLessons = getLessonsByTrack("cyprus_reality");
  const greekA1Lessons = getLessonsByTrackAndDifficulty("greek_b1", "a1");
  const completedGreekLessons = greekLessons.filter((lesson) =>
    props.completedLessonIds.includes(lesson.id)
  ).length;
  const completedGreekA1Lessons = greekA1Lessons.filter((lesson) =>
    props.completedLessonIds.includes(lesson.id)
  ).length;
  const greekProgressPercent =
    greekLessons.length > 0 ? Math.round((completedGreekLessons / greekLessons.length) * 100) : 0;
  const reviewSummaries = getReviewSummaries(props.quizProgress);
  const reviewPlan = getReviewPlan(props.quizProgress, 3);
  const topReviewSummary = reviewSummaries[0];
  const topWeakModules = [...new Set(reviewSummaries.flatMap((item) => item.weakModules))].slice(0, 3);
  const topWeakSkills = [...new Set(reviewSummaries.flatMap((item) => item.weakSkills))].slice(0, 3);
  const totalWrongQuestions = reviewSummaries.reduce(
    (sum, item) => sum + item.wrongQuestionIds.length,
    0
  );
  const greekTrackCycleSummary = getTrackCycleSummary(
    greekModules,
    props.completedLessonIds,
    props.reviewedModuleIds,
    props.passedModuleQuizIds,
    "greek_b1"
  );
  const cyprusTrackCycleSummary = getTrackCycleSummary(
    cyprusModules,
    props.completedLessonIds,
    props.reviewedModuleIds,
    props.passedModuleQuizIds,
    "cyprus_reality"
  );
  const nextGreekModule = greekModules.find(
    (module) =>
      !isModuleCompleted(
        module.id,
        props.completedLessonIds,
        props.reviewedModuleIds,
        props.passedModuleQuizIds,
        "greek_b1",
        getModuleStage(module.id)
      )
  );
  const continueGreekLesson =
    greekLessons.find((lesson) => !props.completedLessonIds.includes(lesson.id)) ?? greekLessons[0];
  const continueA1Lesson =
    greekA1Lessons.find((lesson) => !props.completedLessonIds.includes(lesson.id)) ?? greekA1Lessons[0];
  const nextCyprusLesson =
    cyprusLessons.find((lesson) => !props.completedLessonIds.includes(lesson.id)) ?? cyprusLessons[0];
  const nextGreekAction = nextGreekModule
    ? getModuleNextLearningAction(
        nextGreekModule.id,
        props.completedLessonIds,
        props.reviewedModuleIds,
        props.passedModuleQuizIds,
        "greek_b1",
        getModuleStage(nextGreekModule.id)
      )
    : null;
  const isNewUser =
    props.completedLessonIds.length === 0 &&
    props.reviewedModuleIds.length === 0 &&
    props.passedModuleQuizIds.length === 0 &&
    reviewSummaries.length === 0;
  const currentLevelLabel = getCurrentLevelLabel(completedGreekA1Lessons, nextGreekModule?.id);
  const nextCheckpointLessons =
    completedGreekA1Lessons < 6
      ? Math.max(6 - completedGreekA1Lessons, 0)
      : Math.max(12 - completedGreekA1Lessons, 0);
  const nextStepCard = isNewUser
    ? {
        status: "Новый старт",
        title: continueA1Lesson ? `${continueA1Lesson.order}. ${continueA1Lesson.title}` : "Первый шаг",
        description:
          "Начни с одного короткого урока, а дальше маршрут сам поведёт к карточкам и мини-проверке.",
        duration: `${continueA1Lesson?.estimatedMinutes ?? 7} минут`,
        level: "Для новичка",
        result: "После шага появится понятный следующий переход",
        ctaLabel: "Продолжить",
        ctaTo: continueA1Lesson ? `/lessons/${continueA1Lesson.id}` : "/easy-start",
        secondaryLabel: "Открыть учёбу",
        secondaryTo: "/lessons"
      }
    : topWeakModules[0] && reviewPlan[0]
      ? {
          status: "Пора повторить",
          title: reviewPlan[0].moduleTitle ?? topReviewSummary?.title ?? "Повторение ошибок",
          description:
            "Здесь уже собран короткий путь назад в слабую тему: урок, карточки и повтор ошибок.",
          duration: getStepDurationLabel("quiz", true),
          level: "Повторение",
          result: `${totalWrongQuestions} вопросов ждут повтора`,
          ctaLabel: "Повторить",
          ctaTo: reviewPlan[0].lessonLink ?? reviewPlan[0].retryLink,
          secondaryLabel: "Открыть проверку",
          secondaryTo: topReviewSummary ? `/quiz?mode=${topReviewSummary.modeId}` : "/quiz"
        }
      : nextGreekAction
        ? {
            status: completedGreekLessons > 0 ? "Продолжить" : "Следующий шаг",
            title: nextGreekAction.title,
            description: nextGreekAction.description,
            duration: getStepDurationLabel(nextGreekAction.kind),
            level: nextGreekModule ? getModuleStage(nextGreekModule.id).toUpperCase() : "Учёба",
            result: getStepResultLabel(nextGreekAction.kind),
            ctaLabel: "Продолжить",
            ctaTo: nextGreekAction.to,
            secondaryLabel: "Открыть учёбу",
            secondaryTo: "/lessons"
          }
        : continueGreekLesson
          ? {
              status: "Продолжить",
              title: `${continueGreekLesson.order}. ${continueGreekLesson.title}`,
              description: continueGreekLesson.objective,
              duration: `${continueGreekLesson.estimatedMinutes} минут`,
              level: continueGreekLesson.difficulty.toUpperCase(),
              result: getStepResultLabel("lesson"),
              ctaLabel: "Продолжить",
              ctaTo: `/lessons/${continueGreekLesson.id}`,
              secondaryLabel: "Открыть учёбу",
              secondaryTo: "/lessons"
            }
          : null;
  const upcomingLessons = [
    ...greekLessons
      .filter((lesson) => !props.completedLessonIds.includes(lesson.id))
      .slice(0, 3)
      .map((lesson) => ({ lesson, meta: "Учёба" })),
    ...cyprusLessons
      .filter((lesson) => !props.completedLessonIds.includes(lesson.id))
      .slice(0, 1)
      .map((lesson) => ({ lesson, meta: "Cyprus Reality" }))
  ].slice(0, 4);

  return (
    <div className="stack">
      <section className="hero-panel dashboard-hero">
        <div className="hero-copy">
          <p className="eyebrow">Дашборд</p>
          <h1>Ваш следующий шаг уже готов</h1>
          <p className="lead">
            Сначала сделай одно ближайшее действие. Прогресс, повторение и следующие уроки остаются
            ниже, чтобы не спорить с главным шагом.
          </p>
          <div className="actions-row">
            {nextStepCard ? (
              <Link className="primary-link-button" to={nextStepCard.ctaTo}>
                {nextStepCard.ctaLabel}
              </Link>
            ) : null}
            {nextStepCard ? (
              <Link className="secondary-link-button" to={nextStepCard.secondaryTo}>
                {nextStepCard.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="hero-sidebar dashboard-hero-sidebar">
          <div className="hero-badge">
            <span className="hero-step-status">{nextStepCard?.status ?? "Учёба"}</span>
            <strong>{nextStepCard?.title ?? "Открой программу"}</strong>
            <p>{nextStepCard?.description ?? "Здесь появится ближайшее рекомендуемое действие."}</p>
            <div className="hero-step-meta">
              <span className="badge-chip">{nextStepCard?.duration ?? "7 минут"}</span>
              <span className="badge-chip">{nextStepCard?.level ?? currentLevelLabel}</span>
            </div>
            <div className="progress-rail progress-rail-hero">
              <span className="progress-fill" style={{ width: `${greekProgressPercent}%` }} />
            </div>
            <div className="hero-gamification">
              <div className="hero-gamification-card">
                <span className="hero-gamification-label">Пройдено</span>
                <strong>
                  {completedGreekLessons} / {greekLessons.length}
                </strong>
              </div>
              <div className="hero-gamification-card">
                <span className="hero-gamification-label">На повторении</span>
                <strong>{totalWrongQuestions}</strong>
              </div>
            </div>
            <div className="hero-goal-block">
              <span className="hero-gamification-label">После шага</span>
              <p className="hero-goal-text">{nextStepCard?.result ?? "Открой следующий учебный шаг"}</p>
            </div>
            {nextStepCard ? (
              <Link className="text-link-button dashboard-hero-link" to={nextStepCard.secondaryTo}>
                {nextStepCard.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="stats-grid dashboard-stats-grid">
        <StatCard
          label="Текущий уровень"
          value={currentLevelLabel}
          to="/lessons?stage=a1&source=dashboard"
          hint="Открыть актуальный учебный модуль"
        />
        <StatCard
          label="Сегодня"
          value={nextStepCard?.duration ?? "1 следующий шаг"}
          to={nextStepCard?.ctaTo ?? "/lessons"}
          hint="Продолжить с ближайшего действия"
        />
        <StatCard
          label="На повторении"
          value={totalWrongQuestions > 0 ? `${totalWrongQuestions} вопросов` : "Пока пусто"}
          to={topReviewSummary ? `/quiz?mode=${topReviewSummary.modeId}&retry=mistakes` : "/flashcards"}
          hint={totalWrongQuestions > 0 ? "Повторить ошибки" : "Сначала пройди урок и мини-проверку"}
        />
        <StatCard
          label="До рубежа"
          value={nextCheckpointLessons > 0 ? `${nextCheckpointLessons} урока` : "Следующий уровень"}
          to="/lessons?stage=a1&source=dashboard"
          hint={nextCheckpointLessons > 0 ? "Осталось до следующего рубежа" : "A1-линия уже собрана"}
        />
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Прогресс</p>
            <h2>Что уже собрано по полному циклу</h2>
            <p className="section-copy">
              Здесь только короткий срез по двум программам, без полного каталога и без длинного маршрута.
            </p>
          </div>
        </div>

        <div className="quiz-review-grid">
          <article className="trail-helper-card">
            <strong>{greekTrack?.title}</strong>
            <p>
              Закрыто {greekTrackCycleSummary.completedModules} из {greekTrackCycleSummary.totalModules} модулей.
              В работе: {greekTrackCycleSummary.startedModules}.
            </p>
            <div className="actions-row">
              <Link className="secondary-link-button" to="/lessons">
                Открыть
              </Link>
            </div>
          </article>

          <article className="trail-helper-card">
            <strong>{cyprusTrack?.title}</strong>
            <p>
              Закрыто {cyprusTrackCycleSummary.completedModules} из {cyprusTrackCycleSummary.totalModules} модулей.
              В работе: {cyprusTrackCycleSummary.startedModules}.
            </p>
            <div className="actions-row">
              <Link className="secondary-link-button" to="/cyprus">
                Открыть
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Повторение</p>
            <h2>Что повторить сейчас</h2>
            <p className="section-copy">
              Только ближайшие слабые темы и прямой возврат в нужный контент без ручного поиска.
            </p>
          </div>
        </div>

        {reviewSummaries.length > 0 ? (
          <div className="quiz-review-grid">
            {topReviewSummary ? (
              <article className="trail-helper-card">
                <strong>Главный повтор</strong>
                <p>
                  {topReviewSummary.title}: {topReviewSummary.lastPercent}% последний результат,{" "}
                  {topReviewSummary.wrongQuestionIds.length} ошибок для повтора.
                </p>
                <div className="actions-row">
                  <Link className="primary-link-button" to={reviewPlan[0]?.lessonLink ?? `/quiz?mode=${topReviewSummary.modeId}&retry=mistakes`}>
                    Повторить
                  </Link>
                  <Link className="secondary-link-button" to={`/quiz?mode=${topReviewSummary.modeId}`}>
                    Открыть
                  </Link>
                </div>
              </article>
            ) : null}

            {reviewPlan[0]?.moduleTitle ? (
              <article className="trail-helper-card">
                <strong>Слабая тема</strong>
                <p>{reviewPlan[0].moduleTitle}</p>
                <div className="actions-row">
                  <Link className="secondary-link-button" to={reviewPlan[0].lessonLink ?? "/lessons"}>
                    Открыть
                  </Link>
                </div>
              </article>
            ) : null}

            <article className="trail-helper-card">
              <strong>Общий сигнал</strong>
              <p>
                {totalWrongQuestions} вопросов сохранено для повтора
                {topWeakSkills.length > 0 ? ` · слабые навыки: ${topWeakSkills.join(" · ")}` : "."}
              </p>
              {topWeakModules.length > 0 ? (
                <div className="module-step-pills">
                  {topWeakModules.map((moduleId) => (
                    <span className="badge-chip" key={moduleId}>
                      {getModuleById(moduleId)?.title ?? moduleId}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        ) : (
          <div className="quiz-review-grid">
            <article className="trail-helper-card">
              <strong>Пока пусто</strong>
              <p>Когда появятся первые ошибки в мини-проверках, здесь соберётся короткий путь назад в нужную тему.</p>
              <div className="actions-row">
                <Link className="secondary-link-button" to="/quiz">
                  Открыть
                </Link>
              </div>
            </article>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Ближайшие уроки</p>
            <h2>Что открыть после текущего шага</h2>
            <p className="section-copy">
              Здесь только ближайшие уроки по языку и один ближайший шаг по Cyprus Reality.
            </p>
          </div>
          <Link className="inline-link" to="/lessons">
            Открыть
          </Link>
        </div>

        <div className="lesson-preview-grid">
          {upcomingLessons.map(({ lesson, meta }) => (
            <LessonPreviewCard
              completed={props.completedLessonIds.includes(lesson.id)}
              difficulty={lesson.difficulty}
              estimatedMinutes={lesson.estimatedMinutes}
              id={lesson.id}
              key={lesson.id}
              meta={meta}
              objective={lesson.objective}
              order={lesson.order}
              title={lesson.title}
            />
          ))}
        </div>

        <div className="quiz-review-grid">
          <article className="trail-helper-card">
            <strong>Учёба по уровням</strong>
            <p>Полная языковая программа живёт отдельно от дашборда.</p>
            <div className="actions-row">
              <Link className="secondary-link-button" to="/lessons">
                Открыть
              </Link>
            </div>
          </article>
          <article className="trail-helper-card">
            <strong>Cyprus Reality</strong>
            <p>
              Следующий урок по Кипру: {nextCyprusLesson ? `${nextCyprusLesson.order}. ${nextCyprusLesson.title}` : "открой программу"}.
            </p>
            <div className="actions-row">
              <Link className="secondary-link-button" to={nextCyprusLesson ? `/lessons/${nextCyprusLesson.id}` : "/cyprus"}>
                Открыть
              </Link>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
