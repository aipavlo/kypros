import { Link } from "react-router-dom";
import {
  getLessonsByTrackAndDifficulty,
  getModulesByTrack,
  getModulesByTrackAndDifficulty
} from "@/src/content/catalogData";
import { getModuleStage } from "@/src/content/presentation";
import {
  getCompletedCount,
  getModuleCycleStatus,
  getModuleRemainingCopy,
  getNextIncompleteLesson,
  getUnlockedModuleIds,
  isModuleCompleted
} from "@/src/content/progress";
import { StatCard } from "@/src/components/shared-ui";

function getModuleBadgeLabel(moduleTitle: string) {
  return `${moduleTitle} Badge`;
}

type AchievementsPageProps = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
};

export function AchievementsPage(props: AchievementsPageProps) {
  const greekA1Lessons = getLessonsByTrackAndDifficulty("greek_b1", "a1");
  const greekA1Modules = getModulesByTrackAndDifficulty("greek_b1", "a1");
  const greekModules = getModulesByTrack("greek_b1");
  const cyprusModules = getModulesByTrack("cyprus_reality");
  const completedGreekA1Lessons = getCompletedCount(greekA1Lessons, props.completedLessonIds);
  const completedA1Modules = greekA1Modules.filter((module) =>
    isModuleCompleted(
      module.id,
      props.completedLessonIds,
      props.reviewedModuleIds,
      props.passedModuleQuizIds,
      "greek_b1",
      "a1"
    )
  );
  const unlockedModules = getUnlockedModuleIds(
    greekA1Modules,
    props.completedLessonIds,
    props.reviewedModuleIds,
    props.passedModuleQuizIds,
    "greek_b1",
    "a1"
  );
  const totalXp = props.completedLessonIds.length * 10;
  const totalGreekCompletedModules = greekModules.filter((module) =>
    isModuleCompleted(
      module.id,
      props.completedLessonIds,
      props.reviewedModuleIds,
      props.passedModuleQuizIds,
      "greek_b1",
      getModuleStage(module.id)
    )
  ).length;
  const totalCyprusCompletedModules = cyprusModules.filter((module) =>
    isModuleCompleted(
      module.id,
      props.completedLessonIds,
      props.reviewedModuleIds,
      props.passedModuleQuizIds,
      "cyprus_reality"
    )
  ).length;
  const milestoneBadges = [
    { id: "starter", title: "A1 Starter", earned: completedGreekA1Lessons >= 1 },
    { id: "builder", title: "A1 Builder", earned: completedGreekA1Lessons >= 6 },
    { id: "explorer", title: "A1 Explorer", earned: completedGreekA1Lessons >= 12 },
    { id: "finisher", title: "A1 Finisher", earned: completedGreekA1Lessons >= greekA1Lessons.length }
  ];
  const nextA1Lesson = getNextIncompleteLesson(greekA1Lessons, props.completedLessonIds);

  return (
    <div className="stack">
      <section className="panel page-banner">
        <p className="eyebrow">Achievements</p>
        <h1>Достижения и разблокировки</h1>
        <p className="section-copy">
          Здесь видно, как растёт прогресс по греческому языку и Cyprus Reality:
          завершённые уроки, открытые модули, бейджи и следующий учебный шаг.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard label="XP" value={totalXp} />
        <StatCard label="Уроки A1" value={`${completedGreekA1Lessons}/${greekA1Lessons.length}`} />
        <StatCard label="Бейджи модулей" value={completedA1Modules.length} />
        <StatCard label="Открытые модули" value={unlockedModules.length} />
        <StatCard label="Закрыто модулей Greek" value={totalGreekCompletedModules} />
        <StatCard label="Закрыто модулей Cyprus" value={totalCyprusCompletedModules} />
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Этапы</p>
            <h2>Основные бейджи пути</h2>
          </div>
        </div>

        <div className="achievement-grid">
          {milestoneBadges.map((badge) => (
            <Link
              className={
                badge.earned
                  ? "achievement-badge achievement-badge-earned achievement-link-card"
                  : "achievement-badge achievement-link-card"
              }
              key={badge.id}
              to={nextA1Lesson ? `/lessons/${nextA1Lesson.id}` : "/lessons?stage=a1&source=achievements"}
            >
              <span className="achievement-label">Этап</span>
              <h3>{badge.title}</h3>
              <p>{badge.earned ? "Заработано" : "Ещё не заработано"}</p>
              <span className="achievement-action">
                {badge.earned ? "Открыть следующий шаг" : "Перейти к нужным урокам"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Бейджи модулей</p>
            <h2>Бейдж за каждый модуль</h2>
          </div>
        </div>

        <div className="achievement-grid">
          {greekA1Modules.map((module, index) => {
            const moduleCycleStatus = getModuleCycleStatus(
              module.id,
              props.completedLessonIds,
              props.reviewedModuleIds,
              props.passedModuleQuizIds,
              "greek_b1",
              "a1"
            );
            const earned = moduleCycleStatus.completed;
            const unlocked = unlockedModules.includes(module.id);
            const previousUnlockedModuleId =
              index > 0 ? greekA1Modules[index - 1]?.id : module.id;
            const targetModuleId = unlocked ? module.id : previousUnlockedModuleId;

            return (
              <Link
                className={
                  earned
                    ? "achievement-badge achievement-badge-earned achievement-link-card"
                    : unlocked
                      ? "achievement-badge achievement-link-card"
                      : "achievement-badge achievement-badge-locked achievement-link-card"
                }
                key={module.id}
                to={`/lessons?stage=a1&module=${targetModuleId}&source=achievements`}
              >
                <span className="achievement-label">Шаг {index + 1}</span>
                <h3>{getModuleBadgeLabel(module.title)}</h3>
                <p>
                  {earned
                    ? "Бейдж получен"
                    : unlocked
                      ? getModuleRemainingCopy(moduleCycleStatus)
                      : "Пока заблокирован"}
                </p>
                <span className="achievement-action">
                  {earned
                    ? "Открыть модуль"
                    : unlocked
                      ? "Перейти к заданиям модуля"
                      : "Открыть предыдущий обязательный модуль"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
