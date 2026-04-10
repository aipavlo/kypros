import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  getLessonsByModule,
  getLessonsByTrack,
  getLessonsByTrackAndDifficulty,
  getModulesByTrack,
  getModulesByTrackAndDifficulty,
  getMutableCyprusFacts,
  modules,
  tracks
} from "@/src/content/catalogData";
import { getModuleStage, getTrackPresentation } from "@/src/content/presentation";
import {
  getFirstUnlockedModuleId,
  type ModuleCycleStatus,
  getModuleCycleStatus,
  getModuleNextLearningAction,
  getUnlockedModuleIds
} from "@/src/content/progress";
import { TrailLessonItem } from "@/src/components/shared-ui";

function getModuleQuizLink(trackId: string, moduleId: string, stageId?: string) {
  if (trackId === "cyprus_reality") {
    return `/quiz?mode=mode_cyprus_reality&module=${moduleId}`;
  }

  return `/quiz?mode=mode_greek_${stageId ?? getModuleStage(moduleId)}&module=${moduleId}`;
}

function getModuleBadgeLabel(moduleTitle: string) {
  return `${moduleTitle} Badge`;
}

function getProgramModeCopy(trackId: string) {
  if (trackId === "cyprus_reality") {
    return "Тематическая программа с фактами, повторением и перепроверкой перед экзаменом.";
  }

  return "Линейная языковая траектория: уровень, модуль, урок, закрепление и мини-проверка.";
}

function getProgramProgressLabel(completedLessons: number, lessonCount: number) {
  if (lessonCount === 0) {
    return "Прогресс появится после первого урока.";
  }

  return `${completedLessons} из ${lessonCount} уроков завершено.`;
}

function getModuleStateLabel(
  moduleCycleStatus: ModuleCycleStatus,
  isUnlocked: boolean,
  isActive: boolean
) {
  if (!isUnlocked) {
    return "Заблокировано";
  }

  if (moduleCycleStatus.completed) {
    return "Завершён";
  }

  if (isActive) {
    return moduleCycleStatus.progressPercent > 0 ? "В процессе" : "Активный";
  }

  return moduleCycleStatus.progressPercent > 0 ? "Доступен" : "Готов к старту";
}

function getModuleStatusTone(
  moduleCycleStatus: ModuleCycleStatus,
  isUnlocked: boolean,
  isActive: boolean
) {
  if (!isUnlocked) {
    return "locked";
  }

  if (moduleCycleStatus.completed) {
    return "completed";
  }

  if (isActive) {
    return "active";
  }

  if (moduleCycleStatus.progressPercent > 0) {
    return "progress";
  }

  return "available";
}

function getModuleStatusSummary(moduleCycleStatus: ModuleCycleStatus, isUnlocked: boolean) {
  if (!isUnlocked) {
    return "Откроется после завершения предыдущего модуля.";
  }

  const remainingSteps: string[] = [];

  if (!moduleCycleStatus.lessonsDone) {
    remainingSteps.push(
      `уроки ${moduleCycleStatus.completedLessonCount}/${moduleCycleStatus.moduleLessons.length}`
    );
  }

  if (!moduleCycleStatus.reviewDone) {
    remainingSteps.push("карточки");
  }

  if (!moduleCycleStatus.quizDone) {
    remainingSteps.push("мини-проверка");
  }

  if (remainingSteps.length === 0) {
    return "Модуль полностью закрыт.";
  }

  return `Осталось: ${remainingSteps.join(", ")}.`;
}

function getTrackActionLabel(trackId: string) {
  return trackId === "cyprus_reality" ? "Тематический режим" : "Линейная программа";
}

function getSourceLabel(sourceId: string | null) {
  const sourceLabels: Record<string, string> = {
    trail: "Открыто из карты пути",
    achievements: "Открыто из достижений",
    tracks: "Открыто из программы",
    start: "Открыто из стартового блока",
    easy_start: "Открыто из лёгкого старта",
    dashboard: "Открыто из обзора"
  };

  return sourceId ? sourceLabels[sourceId] ?? "Открыто из навигации" : "";
}

type LessonsPageProps = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  forcedTrackId?: "cyprus_reality" | "greek_b1";
};

export function LessonsPage(props: LessonsPageProps) {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const groupedTracks = tracks.filter((track) =>
    props.forcedTrackId
      ? track.id === props.forcedTrackId
      : track.id === "greek_b1"
  );
  const initialStage = searchParams.get("stage") ?? "a1";
  const requestedModuleId =
    searchParams.get("module") ??
    (props.forcedTrackId === "cyprus_reality" || pathname.startsWith("/cyprus")
      ? "cy_intro_identity"
      : null);
  const navigationSource = searchParams.get("source");
  const mutableCyprusFacts = getMutableCyprusFacts();
  const [selectedLanguageStage, setSelectedLanguageStage] = useState(initialStage);
  const [selectedModuleByTrack, setSelectedModuleByTrack] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      groupedTracks.map((track) => {
        const stageId = track.id === "greek_b1" ? initialStage : undefined;
        const stageModules =
          track.id === "greek_b1"
            ? getModulesByTrackAndDifficulty(track.id, initialStage)
            : getModulesByTrack(track.id);
        const allowedModuleId =
          requestedModuleId && stageModules.some((module) => module.id === requestedModuleId)
            ? requestedModuleId
            : undefined;
        const firstModule =
          track.id === "greek_b1"
            ? allowedModuleId ??
              getFirstUnlockedModuleId(
                stageModules,
                props.completedLessonIds,
                props.reviewedModuleIds,
                props.passedModuleQuizIds,
                track.id,
                stageId
              ) ??
              getModulesByTrack(track.id)[0]?.id
            : getModulesByTrack(track.id)[0];
        return [track.id, typeof firstModule === "string" ? firstModule : firstModule?.id ?? ""];
      })
    )
  );

  useEffect(() => {
    const stageFromUrl = searchParams.get("stage");
    const moduleFromUrl = searchParams.get("module");

    if (stageFromUrl && stageFromUrl !== selectedLanguageStage) {
      setSelectedLanguageStage(stageFromUrl);
    }

    if (!moduleFromUrl) {
      return;
    }

    const ownerModule = modules.find((module) => module.id === moduleFromUrl);

    if (!ownerModule) {
      return;
    }

    setSelectedModuleByTrack((current) => ({
      ...current,
      [ownerModule.trackId]: moduleFromUrl
    }));
  }, [searchParams, selectedLanguageStage]);

  function selectModule(trackId: string, moduleId: string) {
    setSelectedModuleByTrack((current) => ({ ...current, [trackId]: moduleId }));
  }

  function selectLanguageStage(stageId: string) {
    setSelectedLanguageStage(stageId);
    const stageModules = getModulesByTrackAndDifficulty("greek_b1", stageId);
    const firstModuleId =
      getFirstUnlockedModuleId(
        stageModules,
        props.completedLessonIds,
        props.reviewedModuleIds,
        props.passedModuleQuizIds,
        "greek_b1",
        stageId
      ) ??
      getModulesByTrack("greek_b1")[0]?.id;

    if (!firstModuleId) {
      return;
    }

    setSelectedModuleByTrack((current) => ({ ...current, greek_b1: firstModuleId }));
  }

  return (
    <div className="stack">
      <section className={`panel page-banner ${props.forcedTrackId === "cyprus_reality" ? "cyprus-hero-panel" : "lessons-hero-panel"}`}>
        <p className="eyebrow">{props.forcedTrackId === "cyprus_reality" ? "Кипр" : "Уроки"}</p>
        <h1>{props.forcedTrackId === "cyprus_reality" ? "Программа Cyprus Reality" : "Языковая программа Greek Core"}</h1>
        <p className="section-copy">
          {props.forcedTrackId === "cyprus_reality"
            ? "Здесь собраны уроки по истории Кипра, культуре, институтам, общественной жизни и экзаменационным темам Cyprus Reality."
            : "Здесь проходит именно языковая линия: уровень, модуль, урок, карточки и мини-проверка без смешивания с отдельной программой по Кипру."}
        </p>
        {navigationSource ? (
          <div className="source-callout">
            <span className="source-pill">{getSourceLabel(navigationSource)}</span>
            <p>Нужный модуль уже выбран ниже. Можно сразу продолжать.</p>
          </div>
        ) : null}
      </section>

      <section className={`panel ${props.forcedTrackId === "cyprus_reality" ? "cyprus-role-panel" : "lessons-role-panel"}`}>
        <article className="info-note-card lessons-role-compact">
          <div>
            <p className="eyebrow">Навигация рядом</p>
            <h2>{props.forcedTrackId === "cyprus_reality" ? "Здесь лучше сразу продолжать модуль" : "Здесь лучше сразу идти к активному модулю"}</h2>
            <p className="section-copy">
              {props.forcedTrackId === "cyprus_reality"
                ? "Для обзора всех линий держим отдельный navigation layer. Здесь оставляем только рабочий вход и ближайшие переходы."
                : "Для выбора между линиями есть отдельный обзор. Здесь оставляем компактные выходы, чтобы не спорить с next action внутри программы."}
            </p>
          </div>
          <div className="actions-row">
          {props.forcedTrackId === "cyprus_reality" ? (
            <>
              <Link className="secondary-link-button" to="/tracks">
                Открыть обзор линий
              </Link>
              <Link className="secondary-link-button" to="/lessons">
                Вернуться к Greek Core
              </Link>
              <Link className="action-link" to="/trails?trail=trail_fact_not_panic">
                Маршрут повтора по Кипру
              </Link>
            </>
          ) : (
            <>
              <Link className="secondary-link-button" to="/tracks">
                Посмотреть все линии
              </Link>
              <Link className="secondary-link-button" to="/cyprus">
                Перейти в Cyprus Reality
              </Link>
              <Link className="action-link" to="/trails?trail=trail_souvlaki_starter">
                Guided маршрут под задачу
              </Link>
            </>
          )}
          </div>
        </article>
      </section>

      {groupedTracks.map((track) => (
        <section
          className={`panel lessons-track-panel ${getTrackPresentation(track.id).themeClass}`}
          key={track.id}
        >
          {(() => {
            const trackPresentation = getTrackPresentation(track.id);
            const modulesForTrack =
              track.id === "greek_b1"
                ? getModulesByTrackAndDifficulty(track.id, selectedLanguageStage)
                : getModulesByTrack(track.id);
            const unlockedModuleIds =
              track.id === "greek_b1"
                ? getUnlockedModuleIds(
                    modulesForTrack,
                    props.completedLessonIds,
                    props.reviewedModuleIds,
                    props.passedModuleQuizIds,
                    track.id,
                    selectedLanguageStage
                  )
                : modulesForTrack.map((module) => module.id);
            const fallbackModuleId = unlockedModuleIds[0] ?? modulesForTrack[0]?.id;
            const selectedModuleId = selectedModuleByTrack[track.id] || fallbackModuleId;
            const activeModule =
              modulesForTrack.find((module) => module.id === selectedModuleId && unlockedModuleIds.includes(module.id)) ??
              modulesForTrack.find((module) => module.id === fallbackModuleId) ??
              modulesForTrack[0];
            const openedFromExternalFlow =
              Boolean(navigationSource) &&
              Boolean(requestedModuleId) &&
              requestedModuleId === activeModule?.id;
            const activeLessons = activeModule
              ? getLessonsByModule(activeModule.id).filter((lesson) =>
                  track.id === "greek_b1" ? lesson.difficulty === selectedLanguageStage : true
                )
              : [];
            const lessonsForProgress =
              track.id === "greek_b1"
                ? getLessonsByTrackAndDifficulty(track.id, selectedLanguageStage)
                : getLessonsByTrack(track.id);
            const completedTrackLessons = lessonsForProgress.filter((lesson) =>
              props.completedLessonIds.includes(lesson.id)
            ).length;
            const trackProgressPercent =
              lessonsForProgress.length > 0
                ? Math.round((completedTrackLessons / lessonsForProgress.length) * 100)
                : 0;
            const trackLessonCount =
              track.id === "greek_b1" ? lessonsForProgress.length : track.lessonCount;
            const activeModuleCycleStatus = activeModule
              ? getModuleCycleStatus(
                  activeModule.id,
                  props.completedLessonIds,
                  props.reviewedModuleIds,
                  props.passedModuleQuizIds,
                  track.id,
                  track.id === "greek_b1" ? selectedLanguageStage : undefined
                )
              : null;
            const nextAction = activeModule
              ? getModuleNextLearningAction(
                  activeModule.id,
                  props.completedLessonIds,
                  props.reviewedModuleIds,
                  props.passedModuleQuizIds,
                  track.id,
                  track.id === "greek_b1" ? selectedLanguageStage : undefined
                )
              : null;

            return (
              <>
                <div className={`lesson-program-shell lesson-program-shell-${track.id}`}>
                  <div className="section-head lesson-program-head">
                    <div>
                      <p className="eyebrow">{track.id === "cyprus_reality" ? "Cyprus Reality" : "Язык"}</p>
                      <p
                        className={`track-identity ${track.id === "greek_b1" ? "track-identity-language" : "track-identity-history"}`}
                      >
                        {trackPresentation.label}
                      </p>
                      <h2>{track.id === "greek_b1" ? "Программа Greek Core" : track.title}</h2>
                      <p className="track-focus-line">{getProgramModeCopy(track.id)}</p>
                    </div>
                    <div className="lesson-program-meta">
                      <span className="meta-pill">{getTrackActionLabel(track.id)}</span>
                      <span className="meta-pill">{trackLessonCount} уроков</span>
                      <span className="meta-pill meta-pill-success">{trackProgressPercent}% пройдено</span>
                    </div>
                  </div>

                  <div className="lesson-program-progress">
                    <div>
                      <strong>Прогресс программы</strong>
                      <p>{getProgramProgressLabel(completedTrackLessons, trackLessonCount)}</p>
                    </div>
                    <div>
                      <strong>Фокус</strong>
                      <p>{trackPresentation.focus}: {trackPresentation.summary}</p>
                    </div>
                  </div>

                  {track.id === "greek_b1" ? (
                    <div className="stage-switcher" role="tablist" aria-label="Уровень языка">
                      {[
                        { id: "a1", label: "A1" },
                        { id: "a2", label: "A2" },
                        { id: "b1", label: "B1" },
                        { id: "b2", label: "B2" },
                        { id: "c1", label: "C1" }
                      ].map((stage) => (
                        <button
                          aria-selected={selectedLanguageStage === stage.id}
                          className={
                            selectedLanguageStage === stage.id
                              ? "stage-chip stage-chip-active"
                              : "stage-chip"
                          }
                          key={stage.id}
                          onClick={() => selectLanguageStage(stage.id)}
                          role="tab"
                          type="button"
                        >
                          {stage.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div className="progress-rail progress-rail-inline">
                    <span className="progress-fill" style={{ width: `${trackProgressPercent}%` }} />
                  </div>
                </div>

                {track.id === "cyprus_reality" && mutableCyprusFacts.length > 0 ? (
                  <article className="info-note-card lessons-facts-note">
                    <div>
                      <p className="eyebrow">Проверить перед экзаменом</p>
                      <h3>Изменяемые факты не учим как постоянные</h3>
                      <p>Перепроверь эти блоки в конце подготовки или перед попыткой экзамена.</p>
                    </div>
                    <div className="module-step-pills lessons-facts-pills">
                      {mutableCyprusFacts.map((fact) => (
                        <span className="badge-chip" key={fact.id}>
                          {fact.title}
                        </span>
                      ))}
                    </div>
                  </article>
                ) : null}

                {activeModule && activeModuleCycleStatus && nextAction ? (
                  <article className="lesson-module lesson-module-active">
                    <header className="lesson-module-head">
                      <div className="lesson-module-main">
                        {openedFromExternalFlow ? (
                          <p className="source-pill">{getSourceLabel(navigationSource)}</p>
                        ) : null}
                        <p className="eyebrow">Активный модуль</p>
                        <h3>{activeModule.title}</h3>
                        <p>{activeModule.description}</p>
                        <div className="lesson-module-progress">
                          <div className="lesson-module-progress-head">
                            <strong>Прогресс модуля</strong>
                            <span>{activeModuleCycleStatus.progressPercent}%</span>
                          </div>
                          <div className="progress-rail module-progress-rail">
                            <span
                              className="progress-fill"
                              style={{ width: `${activeModuleCycleStatus.progressPercent}%` }}
                            />
                          </div>
                          <p className="module-overview-status">
                            {getModuleStatusSummary(activeModuleCycleStatus, true)}
                          </p>
                        </div>
                        <div className="module-step-pills">
                          <span className={activeModuleCycleStatus.lessonsDone ? "badge-chip badge-chip-earned" : "badge-chip"}>
                            Уроки {activeModuleCycleStatus.completedLessonCount}/{activeModuleCycleStatus.moduleLessons.length}
                          </span>
                          <span className={activeModuleCycleStatus.reviewDone ? "badge-chip badge-chip-earned" : "badge-chip"}>
                            Карточки
                          </span>
                          <span className={activeModuleCycleStatus.quizDone ? "badge-chip badge-chip-earned" : "badge-chip"}>
                            Мини-проверка
                          </span>
                        </div>
                        <div className="actions-row lesson-module-primary-action">
                          <Link className="primary-link-button" to={nextAction.to}>
                            {nextAction.title}
                          </Link>
                        </div>
                        <div className="lesson-module-secondary-actions">
                          <Link
                            className="secondary-link-button"
                            to={`/flashcards?track=${track.id}&module=${activeModule.id}`}
                          >
                            Карточки модуля
                          </Link>
                          <Link
                            className="secondary-link-button"
                            to={getModuleQuizLink(
                              track.id,
                              activeModule.id,
                              track.id === "greek_b1" ? selectedLanguageStage : undefined
                            )}
                          >
                            Мини-проверка
                          </Link>
                          {track.id === "cyprus_reality" ? (
                            <Link className="action-link" to="/trails?trail=trail_fact_not_panic">
                              Маршрут тематического повтора
                            </Link>
                          ) : null}
                        </div>
                      </div>
                      <aside className="lesson-module-sidecard">
                        <span className="meta-pill">{activeLessons.length} уроков</span>
                        <strong>{track.id === "cyprus_reality" ? "Тематический контур" : "Следующий шаг"}</strong>
                        <p>{nextAction.description}</p>
                        {track.id === "cyprus_reality" ? (
                          <p className="lesson-module-side-note">
                            Перед экзаменом отдельно перепроверь изменяемые факты по теме.
                          </p>
                        ) : (
                          <p className="lesson-module-side-note">
                            Двигайся по порядку: уроки, затем карточки и только потом мини-проверка.
                          </p>
                        )}
                      </aside>
                    </header>

                    <div className="trail-lesson-list">
                      {activeLessons.map((lesson) => (
                        <TrailLessonItem
                          completed={props.completedLessonIds.includes(lesson.id)}
                          difficulty={lesson.difficulty}
                          estimatedMinutes={lesson.estimatedMinutes}
                          id={lesson.id}
                          key={lesson.id}
                          objective={lesson.objective}
                          order={lesson.order}
                          title={lesson.title}
                          variant="compact"
                        />
                      ))}
                    </div>
                  </article>
                ) : null}

                <div className="lesson-program-secondary-block">
                  <div className="section-head lesson-program-secondary-head">
                    <div>
                      <p className="eyebrow">Все модули</p>
                      <h3>Каталог программы</h3>
                      <p className="section-copy">
                        Ниже полный обзор модулей. Сначала лучше закончить активный шаг выше.
                      </p>
                    </div>
                  </div>

                  <div className="module-overview-grid module-overview-grid-secondary">
                    {modulesForTrack.map((module) => {
                      const moduleCycleStatus = getModuleCycleStatus(
                        module.id,
                        props.completedLessonIds,
                        props.reviewedModuleIds,
                        props.passedModuleQuizIds,
                        track.id,
                        track.id === "greek_b1" ? selectedLanguageStage : undefined
                      );
                      const moduleProgressPercent = moduleCycleStatus.progressPercent;
                      const isUnlocked = unlockedModuleIds.includes(module.id);
                      const isCompletedModule = moduleCycleStatus.completed;
                      const isActiveModule = module.id === activeModule?.id;
                      const moduleStateLabel = getModuleStateLabel(
                        moduleCycleStatus,
                        isUnlocked,
                        isActiveModule
                      );
                      const moduleStatusTone = getModuleStatusTone(
                        moduleCycleStatus,
                        isUnlocked,
                        isActiveModule
                      );

                      return (
                        <button
                          className={
                            isActiveModule
                              ? isUnlocked
                                ? openedFromExternalFlow && requestedModuleId === module.id
                                  ? `module-overview-card module-overview-card-active module-overview-card-opened module-overview-card-${moduleStatusTone}`
                                  : `module-overview-card module-overview-card-active module-overview-card-${moduleStatusTone}`
                                : "module-overview-card module-overview-card-locked"
                              : isUnlocked
                                ? `module-overview-card module-overview-card-${moduleStatusTone}`
                                : "module-overview-card module-overview-card-locked"
                          }
                          disabled={!isUnlocked}
                          key={module.id}
                          onClick={() => {
                            if (!isUnlocked) {
                              return;
                            }
                            selectModule(track.id, module.id);
                          }}
                          type="button"
                        >
                          <div className="module-overview-meta">
                            <span className={`module-status-badge module-status-badge-${moduleStatusTone}`}>
                              {moduleStateLabel}
                            </span>
                            <span className="meta-pill">Модуль</span>
                          </div>
                          <h3>{module.title}</h3>
                          <p>{module.description}</p>
                          <p className="module-overview-status">
                            {getModuleStatusSummary(moduleCycleStatus, isUnlocked)}
                          </p>
                          <div className="progress-rail module-progress-rail">
                            <span
                              className="progress-fill"
                              style={{ width: `${moduleProgressPercent}%` }}
                            />
                          </div>
                          <div className="module-badge-line">
                            <span className="module-progress-note">
                              {isUnlocked ? `${moduleProgressPercent}% по модулю` : "Откроется по порядку"}
                            </span>
                            {isCompletedModule ? (
                              <span className="badge-chip badge-chip-earned">
                                {getModuleBadgeLabel(module.title)}
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </section>
      ))}
    </div>
  );
}
