import test from "node:test";
import assert from "node:assert/strict";
import { LandingPage } from "../../src/screens/LandingPage.js";
import { HomePage } from "../../src/screens/HomePage.js";
import { LessonsPage } from "../../src/screens/LessonsPage.js";
import { LessonDetailPage } from "../../src/screens/LessonDetailPage.js";
import { FlashcardsPage } from "../../src/screens/FlashcardsPage.js";
import { QuizPage } from "../../src/screens/QuizPage.js";
import { GreekHumorPage } from "../../src/screens/GreekHumorPage.js";
import { AchievementsPage } from "../../src/screens/AchievementsPage.js";
import { ContentPage } from "../../src/screens/ContentPage.js";
import { getLessonsByModule } from "../../src/content/catalogData.js";
import { getQuizQuestionsByMode } from "../../src/content/quizData.js";
import { getModuleProgressKey } from "../../src/content/progress.js";
import { renderRoute, countClass } from "../support/renderRoute.js";

const greekLessonId = "gr_lesson_022";
const greekA1LessonId = "gr_lesson_001";
const greekA2LessonId = "gr_lesson_004";
const greekModuleId = "gr_b1_core_grammar";
const greekDailyLifeModuleId = "gr_b1_daily_life";
const cyprusModuleId = "cy_intro_identity";
const cyprusLessonId = "cy_lesson_008";

const emptyProgressProps = {
  completedLessonIds: [],
  reviewedModuleIds: [],
  passedModuleQuizIds: []
};

const greekDailyLifeA1LessonIds = getLessonsByModule(greekDailyLifeModuleId)
  .filter((lesson) => lesson.difficulty === "a1")
  .map((lesson) => lesson.id);
const greekDailyLifeA1ProgressKey = getModuleProgressKey(greekDailyLifeModuleId, "greek_b1", "a1");
const cyprusRetryQuestionId = getQuizQuestionsByMode("mode_cyprus_reality")[0]?.id ?? "quiz_cy_001";

test("LandingPage keeps the main dashboard scenario readable and leaves alternate entries secondary", () => {
  const markup = renderRoute({
    path: "/",
    url: "/",
    element: <LandingPage />
  });

  assert.match(markup, /Греческий язык и подготовка по Кипру в одном месте/);
  assert.match(markup, /Открыть дашборд/);
  assert.match(markup, /Я начинаю с нуля/);
  assert.match(markup, /Открыть программу по Кипру/);
  assert.match(markup, /Или выбери раздел/);
  assert.match(markup, /Два коротких пути/);
  assert.match(markup, /уроков/);
  assert.ok(countClass(markup, "primary-link-button") >= 1);
});

test("HomePage gives a clear next step for a new user and switches to review mode when quiz mistakes exist", () => {
  const newUserMarkup = renderRoute({
    path: "/dashboard",
    url: "/dashboard",
    element: <HomePage {...emptyProgressProps} quizProgress={{}} />
  });
  const reviewMarkup = renderRoute({
    path: "/dashboard",
    url: "/dashboard",
    element: (
      <HomePage
        completedLessonIds={["gr_lesson_022"]}
        reviewedModuleIds={[]}
        passedModuleQuizIds={[]}
        quizProgress={{
          mode_greek_a1: {
            attempts: 2,
            bestPercent: 60,
            lastPercent: 40,
            wrongQuestionIds: ["quiz_gr_012", "quiz_gr_014"],
            weakModules: [greekModuleId],
            weakSkills: ["grammar"]
          }
        }}
      />
    )
  });

  assert.match(newUserMarkup, /Ваш следующий шаг уже готов/);
  assert.match(newUserMarkup, /Новый старт/);
  assert.match(newUserMarkup, /Продолжить/);
  assert.match(newUserMarkup, /Открыть учёбу/);
  assert.match(newUserMarkup, /На повторении/);
  assert.match(newUserMarkup, /Что повторить сейчас/);
  assert.match(newUserMarkup, /Ближайшие уроки/);
  assert.doesNotMatch(newUserMarkup, /Альтернативные входы/);
  assert.doesNotMatch(newUserMarkup, /Что добавлено в программу/);
  assert.doesNotMatch(newUserMarkup, /Примеры вопросов/);

  assert.match(reviewMarkup, /Пора повторить/);
  assert.match(reviewMarkup, /Повторить/);
  assert.match(reviewMarkup, /Открыть проверку/);
  assert.match(reviewMarkup, /Слабая тема/);
});

test("LessonsPage renders one main CTA per visible program and keeps cyprus banner clean", () => {
  const lessonsMarkup = renderRoute({
    path: "/lessons",
    url: `/lessons?stage=a1&module=${greekModuleId}`,
    element: <LessonsPage {...emptyProgressProps} />
  });
  const cyprusMarkup = renderRoute({
    path: "/cyprus",
    url: `/cyprus?module=${cyprusModuleId}`,
    element: <LessonsPage {...emptyProgressProps} forcedTrackId="cyprus_reality" />
  });

  assert.match(lessonsMarkup, /Языковая программа Greek Core/);
  assert.match(lessonsMarkup, /Активный модуль/);
  assert.match(lessonsMarkup, /Открыть урок:/);
  assert.equal(countClass(lessonsMarkup, "primary-link-button"), 1);

  assert.match(cyprusMarkup, /Программа Cyprus Reality/);
  assert.doesNotMatch(cyprusMarkup, /Линейная языковая траектория/);
  assert.equal(countClass(cyprusMarkup, "primary-link-button"), 1);
});

test("LessonDetailPage shows one current CTA and only reveals post-study actions after completion", () => {
  const initialMarkup = renderRoute({
    path: "/lessons/:lessonId",
    url: `/lessons/${greekLessonId}`,
    element: (
      <LessonDetailPage
        {...emptyProgressProps}
        onToggleCompleted={() => undefined}
      />
    )
  });
  const completedMarkup = renderRoute({
    path: "/lessons/:lessonId",
    url: `/lessons/${greekLessonId}?source=easy_start`,
    element: (
      <LessonDetailPage
        completedLessonIds={[greekLessonId]}
        reviewedModuleIds={[]}
        passedModuleQuizIds={[]}
        onToggleCompleted={() => undefined}
      />
    )
  });
  const missingMarkup = renderRoute({
    path: "/lessons/:lessonId",
    url: "/lessons/missing-lesson",
    element: (
      <LessonDetailPage
        {...emptyProgressProps}
        onToggleCompleted={() => undefined}
      />
    )
  });

  assert.match(initialMarkup, /Материал изучен/);
  assert.equal(countClass(initialMarkup, "primary-link-button"), 0);
  assert.equal(countClass(initialMarkup, "primary-button"), 1);

  assert.match(completedMarkup, /Лёгкий старт/);
  assert.match(completedMarkup, /Открыть карточки урока/);
  assert.equal(countClass(completedMarkup, "primary-link-button"), 2);

  assert.match(missingMarkup, /Урок не найден/);
});

test("AchievementsPage keeps a completed module badge accessible instead of showing it as locked", () => {
  const markup = renderRoute({
    path: "/achievements",
    url: "/achievements",
    element: (
      <AchievementsPage
        completedLessonIds={greekDailyLifeA1LessonIds}
        reviewedModuleIds={[greekDailyLifeA1ProgressKey]}
        passedModuleQuizIds={[greekDailyLifeA1ProgressKey]}
      />
    )
  });

  assert.match(markup, /Повседневная жизнь Badge/);
  assert.match(markup, /Бейдж получен/);
  assert.doesNotMatch(markup, /Повседневная жизнь Badge[\s\S]{0,120}Пока заблокирован/);
  assert.doesNotMatch(
    markup,
    new RegExp(`/lessons\\?stage=a1&amp;module=${greekDailyLifeModuleId}&amp;source=achievements`)
  );
});

test("AchievementsPage keeps the next milestone visible for a new learner instead of collapsing into an empty trophy wall", () => {
  const markup = renderRoute({
    path: "/achievements",
    url: "/achievements",
    element: <AchievementsPage {...emptyProgressProps} />
  });

  assert.match(markup, /Следующая цель/);
  assert.match(markup, /A1 Starter/);
  assert.match(markup, /Нужен первый завершённый урок A1\./);
  assert.match(markup, /Продолжить к следующему бейджу/);
  assert.match(markup, /Бейдж за каждый модуль/);
});

test("LessonDetailPage adds soft english transliteration for beginner greek lessons only", () => {
  const beginnerMarkup = renderRoute({
    path: "/lessons/:lessonId",
    url: `/lessons/${greekA1LessonId}`,
    element: (
      <LessonDetailPage
        {...emptyProgressProps}
        onToggleCompleted={() => undefined}
      />
    )
  });
  const nonBeginnerMarkup = renderRoute({
    path: "/lessons/:lessonId",
    url: `/lessons/${greekA2LessonId}`,
    element: (
      <LessonDetailPage
        {...emptyProgressProps}
        onToggleCompleted={() => undefined}
      />
    )
  });

  assert.match(beginnerMarkup, /Καλημέρα/);
  assert.match(beginnerMarkup, /Kalimera/);
  assert.match(beginnerMarkup, /class="muted"/);
  assert.doesNotMatch(nonBeginnerMarkup, /Kalimera/);
});

test("FlashcardsPage keeps lesson context and exposes the lesson-flow actions", () => {
  const lessonFlowMarkup = renderRoute({
    path: "/flashcards",
    url: `/flashcards?track=greek_b1&module=${greekModuleId}&lesson=${greekLessonId}&source=lesson&returnTo=${greekLessonId}`,
    element: (
      <FlashcardsPage
        {...emptyProgressProps}
        onMarkModuleReviewed={() => undefined}
      />
    )
  });
  assert.match(lessonFlowMarkup, /Вы в шаге урока/);
  assert.match(lessonFlowMarkup, /Назад к уроку/);
  assert.match(lessonFlowMarkup, /Шаг 3\. Мини-проверка урока/);
  assert.equal(countClass(lessonFlowMarkup, "primary-button"), 2);
});

test("QuizPage keeps lesson context in active state and shows stored progress context", () => {
  const activeMarkup = renderRoute({
    path: "/quiz",
    url: `/quiz?mode=mode_greek_a1&module=${greekModuleId}&lesson=${greekLessonId}&source=lesson`,
    element: (
      <QuizPage
        {...emptyProgressProps}
        quizProgress={{}}
        onMarkModuleQuizPassed={() => undefined}
        onQuizProgressChange={() => undefined}
      />
    )
  });
  const progressAwareMarkup = renderRoute({
    path: "/quiz",
    url: `/quiz?mode=mode_greek_a1&module=${greekModuleId}&lesson=${greekLessonId}&source=lesson`,
    element: (
      <QuizPage
        completedLessonIds={[greekLessonId]}
        reviewedModuleIds={[`${greekModuleId}::a1`]}
        passedModuleQuizIds={[]}
        quizProgress={{
          mode_greek_a1: {
            attempts: 1,
            bestPercent: 80,
            lastPercent: 80,
            wrongQuestionIds: ["quiz_cy_001"],
            weakModules: [greekModuleId],
            weakSkills: ["grammar"]
          }
        }}
        onMarkModuleQuizPassed={() => undefined}
        onQuizProgressChange={() => undefined}
      />
    )
  });

  assert.match(activeMarkup, /Вы в шаге урока/);
  assert.match(activeMarkup, /Греческий A1/);
  assert.match(activeMarkup, /Текущий счёт: 0/);
  assert.match(activeMarkup, /Как переводится форма/);
  assert.match(activeMarkup, /Назад к уроку/);

  assert.match(progressAwareMarkup, /Последний результат/);
  assert.match(progressAwareMarkup, /80% · 1 попыток всего/);
  assert.match(progressAwareMarkup, /Повтор ошибок/);
});

test("QuizPage can reopen in retry mistakes mode without losing the focused retry state", () => {
  const markup = renderRoute({
    path: "/quiz",
    url: "/quiz?mode=mode_cyprus_reality&retry=mistakes",
    element: (
      <QuizPage
        {...emptyProgressProps}
        quizProgress={{
          mode_cyprus_reality: {
            attempts: 2,
            bestPercent: 80,
            lastPercent: 50,
            wrongQuestionIds: [cyprusRetryQuestionId],
            weakModules: ["cy_intro_identity"],
            weakSkills: ["facts"]
          }
        }}
        onMarkModuleQuizPassed={() => undefined}
        onQuizProgressChange={() => undefined}
      />
    )
  });

  assert.match(markup, /Повтор ошибок/);
  assert.match(markup, /1 \/ 83|1 \/ 20|1 \/ 1/);
  assert.match(markup, /Последний результат/);
  assert.match(markup, /Открыть только ошибки/);
});

test("QuizPage shows a soft pronunciation hint for greek text inside quiz prompts", () => {
  const markup = renderRoute({
    path: "/quiz",
    url: "/quiz?mode=mode_greek_a1",
    element: (
      <QuizPage
        {...emptyProgressProps}
        quizProgress={{}}
        onMarkModuleQuizPassed={() => undefined}
        onQuizProgressChange={() => undefined}
      />
    )
  });

  assert.match(markup, /Как переводится слово &#x27;διαβατήριο&#x27;\?/);
  assert.match(markup, /Как читать:/);
  assert.match(markup, /diavati/);
});

test("QuizPage uses lesson-specific questions first in cyprus lesson-flow instead of repeating module-wide prompts", () => {
  const markup = renderRoute({
    path: "/quiz",
    url: `/quiz?mode=mode_cyprus_reality&module=${cyprusModuleId}&lesson=${cyprusLessonId}&source=lesson`,
    element: (
      <QuizPage
        {...emptyProgressProps}
        quizProgress={{}}
        onMarkModuleQuizPassed={() => undefined}
        onQuizProgressChange={() => undefined}
      />
    )
  });

  assert.match(markup, /1 \/ 1/);
  assert.match(markup, /Какие языки считаются официальными в Республике Кипр\?/);
  assert.doesNotMatch(markup, /Что из этого лучше всего показывает базовую государственную идентичность Кипра\?/);
});

test("lesson to flashcards to quiz smoke flow keeps module and lesson context stable", () => {
  const lessonMarkup = renderRoute({
    path: "/lessons/:lessonId",
    url: `/lessons/${greekLessonId}`,
    element: (
      <LessonDetailPage
        completedLessonIds={[greekLessonId]}
        reviewedModuleIds={[]}
        passedModuleQuizIds={[]}
        onToggleCompleted={() => undefined}
      />
    )
  });
  const flashcardsMarkup = renderRoute({
    path: "/flashcards",
    url: `/flashcards?track=greek_b1&module=${greekModuleId}&lesson=${greekLessonId}&source=lesson&returnTo=${greekLessonId}`,
    element: (
      <FlashcardsPage
        completedLessonIds={[greekLessonId]}
        reviewedModuleIds={[]}
        passedModuleQuizIds={[]}
        onMarkModuleReviewed={() => undefined}
      />
    )
  });
  const quizMarkup = renderRoute({
    path: "/quiz",
    url: `/quiz?mode=mode_greek_a1&module=${greekModuleId}&lesson=${greekLessonId}&source=lesson`,
    element: (
      <QuizPage
        completedLessonIds={[greekLessonId]}
        reviewedModuleIds={[`${greekModuleId}::a1`]}
        passedModuleQuizIds={[]}
        quizProgress={{}}
        onMarkModuleQuizPassed={() => undefined}
        onQuizProgressChange={() => undefined}
      />
    )
  });

  assert.match(lessonMarkup, new RegExp(`/flashcards\\?track=greek_b1&amp;lesson=${greekLessonId}&amp;source=lesson&amp;returnTo=${greekLessonId}`));
  assert.match(flashcardsMarkup, new RegExp(`/quiz\\?mode=mode_greek_a1&amp;module=${greekModuleId}&amp;lesson=${greekLessonId}&amp;source=lesson`));
  assert.match(flashcardsMarkup, new RegExp(`/lessons/${greekLessonId}\\?source=lesson`));
  assert.match(quizMarkup, new RegExp(`/lessons/${greekLessonId}\\?source=lesson`));
});

test("GreekHumorPage keeps one focused material with compact filters and study actions", () => {
  const markup = renderRoute({
    path: "/humor",
    url: "/humor",
    element: <GreekHumorPage />
  });

  assert.match(markup, /Мемы, шутки и анекдоты как короткая учебная практика/);
  assert.match(markup, /Открыть следующий материал/);
  assert.match(markup, /Все/);
  assert.match(markup, /Популярное/);
  assert.match(markup, /Короткое/);
  assert.match(markup, /Подборка для разбора/);
  assert.match(markup, /В повторение/);
  assert.match(markup, /Отметить как разобранное/);
  assert.match(markup, /Открыть похожее/);
  assert.match(markup, /Следующий материал/);
  assert.match(markup, /Почему это смешно/);
  assert.doesNotMatch(markup, /Живой язык/);

  const saveActionIndex = markup.indexOf("В повторение");
  const whyFunnyIndex = markup.indexOf("Почему это смешно");

  assert.ok(saveActionIndex >= 0 && whyFunnyIndex >= 0 && saveActionIndex < whyFunnyIndex);
});

test("ContentPage leads with one curated decision before dropping into the wider library", () => {
  const markup = renderRoute({
    path: "/content",
    url: "/content",
    element: <ContentPage />
  });

  assert.match(markup, /Библиотека контента/);
  assert.match(markup, /Что открыть первым/);
  assert.match(markup, /Открыть программу по греческому/);
  assert.match(markup, /Выбрать готовый маршрут/);
  assert.match(markup, /Перейти к короткой проверке/);
  assert.match(markup, /Готовые маршруты/);
  assert.match(markup, /Модули программы/);

  const curatedEntryIndex = markup.indexOf("Что открыть первым");
  const libraryIndex = markup.indexOf("Готовые маршруты");

  assert.ok(curatedEntryIndex >= 0 && libraryIndex >= 0 && curatedEntryIndex < libraryIndex);
});

test("HomePage keeps review-heavy and non-empty learner state readable without losing the main next step", () => {
  const markup = renderRoute({
    path: "/dashboard",
    url: "/dashboard",
    element: (
      <HomePage
        completedLessonIds={["gr_lesson_001", "gr_lesson_002", "gr_lesson_003", "gr_lesson_022"]}
        reviewedModuleIds={[]}
        passedModuleQuizIds={[]}
        quizProgress={{
          mode_greek_a1: {
            attempts: 3,
            bestPercent: 70,
            lastPercent: 40,
            wrongQuestionIds: ["quiz_gr_012", "quiz_gr_014"],
            weakModules: [greekModuleId],
            weakSkills: ["grammar"]
          },
          mode_cyprus_reality: {
            attempts: 1,
            bestPercent: 50,
            lastPercent: 50,
            wrongQuestionIds: ["quiz_cy_001"],
            weakModules: [cyprusModuleId],
            weakSkills: ["facts"]
          }
        }}
      />
    )
  });

  assert.match(markup, /Пора повторить/);
  assert.match(markup, /Повторить/);
  assert.match(markup, /Пройдено/);
  assert.match(markup, />4 \/ \d+</);
  assert.match(markup, /На повторении/);
  assert.match(markup, /3 вопросов/);
  assert.match(markup, /Главный повтор/);
  assert.match(markup, /Общий сигнал/);
  assert.match(markup, /Что уже собрано по полному циклу/);
});
