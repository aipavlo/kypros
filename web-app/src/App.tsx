import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/src/components/AppShell";
import { RouteLoading } from "@/src/components/RouteLoading";
import { ScrollToTop } from "@/src/components/ScrollToTop";
import { useLearningProgressState } from "@/src/hooks/useLearningProgressState";

const LandingPage = lazy(() => import("@/src/screens/LandingPage").then((module) => ({ default: module.LandingPage })));
const HomePage = lazy(() => import("@/src/screens/HomePage").then((module) => ({ default: module.HomePage })));
const EasyStartPage = lazy(() => import("@/src/screens/EasyStartPage").then((module) => ({ default: module.EasyStartPage })));
const PhrasebookPage = lazy(() => import("@/src/screens/PhrasebookPage").then((module) => ({ default: module.PhrasebookPage })));
const TrailsPage = lazy(() => import("@/src/screens/TrailsPage").then((module) => ({ default: module.TrailsPage })));
const TracksPage = lazy(() => import("@/src/screens/TracksPage").then((module) => ({ default: module.TracksPage })));
const HtmlSitemapPage = lazy(() => import("@/src/screens/HtmlSitemapPage").then((module) => ({ default: module.HtmlSitemapPage })));
const GreekHumorPage = lazy(() => import("@/src/screens/GreekHumorPage").then((module) => ({ default: module.GreekHumorPage })));
const AchievementsPage = lazy(() => import("@/src/screens/AchievementsPage").then((module) => ({ default: module.AchievementsPage })));
const LessonsPage = lazy(() => import("@/src/screens/LessonsPage").then((module) => ({ default: module.LessonsPage })));
const LessonDetailPage = lazy(() => import("@/src/screens/LessonDetailPage").then((module) => ({ default: module.LessonDetailPage })));
const FlashcardsPage = lazy(() => import("@/src/screens/FlashcardsPage").then((module) => ({ default: module.FlashcardsPage })));
const QuizPage = lazy(() => import("@/src/screens/QuizPage").then((module) => ({ default: module.QuizPage })));
const ContentPage = lazy(() => import("@/src/screens/ContentPage").then((module) => ({ default: module.ContentPage })));

export function App() {
  const {
    completedLessonIds,
    reviewedModuleIds,
    passedModuleQuizIds,
    quizProgress,
    setQuizProgress,
    toggleCompletedLesson,
    markModuleReviewed,
    markModuleQuizPassed
  } = useLearningProgressState();

  return (
    <AppShell>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <HomePage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
                quizProgress={quizProgress}
              />
            }
          />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/easy-start" element={<EasyStartPage completedLessonIds={completedLessonIds} />} />
          <Route path="/phrasebook" element={<PhrasebookPage />} />
          <Route path="/trails" element={<TrailsPage completedLessonIds={completedLessonIds} />} />
          <Route path="/tracks" element={<TracksPage />} />
          <Route path="/sitemap" element={<HtmlSitemapPage />} />
          <Route path="/humor" element={<GreekHumorPage />} />
          <Route
            path="/achievements"
            element={
              <AchievementsPage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
              />
            }
          />
          <Route
            path="/lessons"
            element={
              <LessonsPage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
              />
            }
          />
          <Route
            path="/cyprus"
            element={
              <LessonsPage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
                forcedTrackId="cyprus_reality"
              />
            }
          />
          <Route
            path="/lessons/:lessonId"
            element={
              <LessonDetailPage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
                onToggleCompleted={toggleCompletedLesson}
              />
            }
          />
          <Route
            path="/flashcards"
            element={
              <FlashcardsPage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
                onMarkModuleReviewed={markModuleReviewed}
              />
            }
          />
          <Route
            path="/quiz"
            element={
              <QuizPage
                completedLessonIds={completedLessonIds}
                reviewedModuleIds={reviewedModuleIds}
                passedModuleQuizIds={passedModuleQuizIds}
                onMarkModuleQuizPassed={markModuleQuizPassed}
                quizProgress={quizProgress}
                onQuizProgressChange={setQuizProgress}
              />
            }
          />
          <Route path="/content" element={<ContentPage />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
