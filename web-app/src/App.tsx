import { Suspense, lazy, type ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/src/components/AppShell";
import { RouteLoading } from "@/src/components/RouteLoading";
import { ScrollToTop } from "@/src/components/ScrollToTop";
import { useLearningProgressState } from "@/src/hooks/useLearningProgressState";

function loadPageComponent(
  pageLoader: () => Promise<Record<string, unknown>>,
  exportName: string
) {
  return lazy(() =>
    pageLoader().then((pageModule) => ({ default: pageModule[exportName] as ComponentType<any> }))
  );
}

const ContentPage = loadPageComponent(() => import("@/src/screens/ContentPage"), "ContentPage");
const TracksPage = loadPageComponent(() => import("@/src/screens/TracksPage"), "TracksPage");
const GreekHumorPage = loadPageComponent(() => import("@/src/screens/GreekHumorPage"), "GreekHumorPage");
const LandingPage = loadPageComponent(() => import("@/src/screens/LandingPage"), "LandingPage");
const HomePage = loadPageComponent(() => import("@/src/screens/HomePage"), "HomePage");
const LessonsPage = loadPageComponent(() => import("@/src/screens/LessonsPage"), "LessonsPage");
const LessonDetailPage = loadPageComponent(() => import("@/src/screens/LessonDetailPage"), "LessonDetailPage");
const EasyStartPage = loadPageComponent(() => import("@/src/screens/EasyStartPage"), "EasyStartPage");
const TrailsPage = loadPageComponent(() => import("@/src/screens/TrailsPage"), "TrailsPage");
const FlashcardsPage = loadPageComponent(() => import("@/src/screens/FlashcardsPage"), "FlashcardsPage");
const QuizPage = loadPageComponent(() => import("@/src/screens/QuizPage"), "QuizPage");
const AchievementsPage = loadPageComponent(() => import("@/src/screens/AchievementsPage"), "AchievementsPage");

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
          <Route path="/trails" element={<TrailsPage completedLessonIds={completedLessonIds} />} />
          <Route path="/tracks" element={<TracksPage />} />
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
