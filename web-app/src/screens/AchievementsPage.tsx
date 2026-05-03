import { AppLink as Link } from "@/src/components/AppLink";
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
  const nextA1LessonPreview =
    greekA1Lessons.find((lesson) => lesson.id === nextA1Lesson?.id) ?? greekA1Lessons[0];
  const earnedMilestoneCount = milestoneBadges.filter((badge) => badge.earned).length;
  const nextMilestone =
    milestoneBadges.find((badge) => !badge.earned) ?? milestoneBadges[milestoneBadges.length - 1];
  const a1ProgressPercent =
    greekA1Lessons.length > 0 ? Math.round((completedGreekA1Lessons / greekA1Lessons.length) * 100) : 0;
  const nextMilestoneCopy =
    nextMilestone.id === "starter"
      ? "Нужен первый завершённый урок A1."
      : nextMilestone.id === "builder"
        ? "Нужно дойти до 6 завершённых уроков A1."
        : nextMilestone.id === "explorer"
          ? "Нужно дойти до 12 завершённых уроков A1."
          : nextMilestone.id === "finisher"
            ? "Нужно закрыть весь A1-цикл."
            : "Следующий этап уже близко.";

  return (
    <div className="stack">
      <section className="panel page-banner achievements-hero-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Achievements</p>
            <h1>Достижения и разблокировки</h1>
            <p className="section-copy">
              Здесь прогресс должен ощущаться как реальный подъём: уже заработанные этапы, следующий
              трофей и ближайший ход к нему.
            </p>
          </div>
          <div className="achievements-hero-sidecard">
            <span className="achievement-label">Следующая цель</span>
            <strong>{nextMilestone.title}</strong>
            <p>{nextMilestoneCopy}</p>
            <div className="progress-rail progress-rail-hero">
              <span className="progress-fill" style={{ width: `${a1ProgressPercent}%` }} />
            </div>
            <p className="muted">{completedGreekA1Lessons} из {greekA1Lessons.length} уроков A1 уже закрыто</p>
            {nextA1Lesson ? (
              <Link className="primary-link-button" to={`/lessons/${nextA1Lesson.id}`}>
                Продолжить к следующему бейджу
              </Link>
            ) : (
              <Link className="primary-link-button" to="/lessons?stage=a1&source=achievements">
                Открыть программу A1
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="achievement-strip">
        <article className="achievement-card achievement-card-highlight">
          <span className="achievement-label">Этапы</span>
          <strong>{earnedMilestoneCount} / {milestoneBadges.length}</strong>
          <p>Основные milestone-бейджи уже заработаны по A1.</p>
        </article>
        <article className="achievement-card achievement-card-highlight achievement-card-language">
          <span className="achievement-label">Следующий ход</span>
          <strong>{nextA1LessonPreview ? `${nextA1LessonPreview.order}. ${nextA1LessonPreview.title}` : "A1 путь собран"}</strong>
          <p>{nextA1Lesson ? "Открой ближайший урок и забери следующий видимый прогресс." : "Можно переходить к следующему языковому этапу."}</p>
        </article>
        <article className="achievement-card achievement-card-highlight achievement-card-history">
          <span className="achievement-label">Cyprus Reality</span>
          <strong>{totalCyprusCompletedModules}</strong>
          <p>Отдельные модульные победы по Кипру тоже уже накапливаются как самостоятельный слой.</p>
        </article>
      </section>

      <section className="stats-grid achievements-stats-grid">
        <StatCard label="XP" value={totalXp} />
        <StatCard label="Уроки A1" value={`${completedGreekA1Lessons}/${greekA1Lessons.length}`} />
        <StatCard label="Бейджи модулей" value={completedA1Modules.length} />
        <StatCard label="Открытые модули" value={unlockedModules.length} />
        <StatCard label="Закрыто модулей Greek" value={totalGreekCompletedModules} />
        <StatCard label="Закрыто модулей Cyprus" value={totalCyprusCompletedModules} />
      </section>

      <section className="panel achievements-milestones-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Этапы</p>
            <h2>Основные бейджи пути</h2>
            <p className="section-copy">
              Это не просто список. Здесь видно, какие этапы уже закрыты и какой milestone сейчас
              реально ближайший.
            </p>
          </div>
        </div>

        <div className="achievement-grid">
          {milestoneBadges.map((badge) =>
            badge.earned ? (
              <article
                className="achievement-badge achievement-badge-static achievement-badge-earned"
                key={badge.id}
              >
                <span className="achievement-label">Этап</span>
                <h3>{badge.title}</h3>
                <p>Заработано</p>
              </article>
            ) : badge.id === nextMilestone.id ? (
              <Link
                className="achievement-badge achievement-badge-static achievement-badge-linkable achievement-badge-next"
                key={badge.id}
                to={nextA1Lesson ? `/lessons/${nextA1Lesson.id}` : "/lessons?stage=a1&source=achievements"}
              >
                <span className="achievement-label">Этап</span>
                <h3>{badge.title}</h3>
                <p>{nextMilestoneCopy}</p>
                <div className="achievement-actions">
                  <span className="achievement-action-link">Забрать следующий этап</span>
                </div>
              </Link>
            ) : (
              <article
                className="achievement-badge achievement-badge-static achievement-badge-locked"
                key={badge.id}
              >
                <span className="achievement-label">Этап</span>
                <h3>{badge.title}</h3>
                <p>Откроется после ближайшего milestone.</p>
              </article>
            )
          )}
        </div>
      </section>

      <section className="panel achievements-modules-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Бейджи модулей</p>
            <h2>Бейдж за каждый модуль</h2>
            <p className="section-copy">
              Здесь уже виден ритм пути: полученные бейджи, следующий доступный модуль и ещё
              заблокированные награды впереди.
            </p>
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
            const isAccessible = unlocked || earned;
            const previousUnlockedModuleId =
              index > 0 ? greekA1Modules[index - 1]?.id : module.id;
            const targetModuleId = isAccessible ? module.id : previousUnlockedModuleId;

            if (earned) {
              return (
                <article
                  className="achievement-badge achievement-badge-static achievement-badge-earned"
                  key={module.id}
                >
                  <span className="achievement-label">Шаг {index + 1}</span>
                  <h3>{getModuleBadgeLabel(module.title)}</h3>
                  <p>Бейдж получен</p>
                </article>
              );
            }

            if (isAccessible) {
              return (
                <Link
                  className="achievement-badge achievement-badge-static achievement-badge-linkable achievement-badge-next"
                  key={module.id}
                  to={`/lessons?stage=a1&module=${targetModuleId}&source=achievements`}
                >
                  <span className="achievement-label">Шаг {index + 1}</span>
                  <h3>{getModuleBadgeLabel(module.title)}</h3>
                  <p>{getModuleRemainingCopy(moduleCycleStatus)}</p>
                  <div className="achievement-actions">
                    <span className="achievement-action-link">Перейти к заданиям</span>
                  </div>
                </Link>
              );
            }

            return (
              <article
                className="achievement-badge achievement-badge-static achievement-badge-locked"
                key={module.id}
              >
                <span className="achievement-label">Шаг {index + 1}</span>
                <h3>{getModuleBadgeLabel(module.title)}</h3>
                <p>Пока заблокирован</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
