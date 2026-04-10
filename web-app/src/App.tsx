import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/src/components/AppShell";
import { AnalyticsPageTracker } from "@/src/components/AnalyticsPageTracker";
import { ScrollToTop } from "@/src/components/ScrollToTop";
import { useLearningProgressState } from "@/src/hooks/useLearningProgressState";
import { ContentPage } from "@/src/screens/ContentPage";
import { TracksPage } from "@/src/screens/TracksPage";
import { GreekHumorPage } from "@/src/screens/GreekHumorPage";
import { LandingPage } from "@/src/screens/LandingPage";
import { HomePage } from "@/src/screens/HomePage";
import { LessonsPage } from "@/src/screens/LessonsPage";
import { LessonDetailPage } from "@/src/screens/LessonDetailPage";
import { EasyStartPage } from "@/src/screens/EasyStartPage";
import { PhrasebookPage } from "@/src/screens/PhrasebookPage";
import { TrailsPage } from "@/src/screens/TrailsPage";
import { FlashcardsPage } from "@/src/screens/FlashcardsPage";
import { QuizPage } from "@/src/screens/QuizPage";
import { AchievementsPage } from "@/src/screens/AchievementsPage";

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
      <AnalyticsPageTracker />
      <ScrollToTop />
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
    </AppShell>
  );
}
