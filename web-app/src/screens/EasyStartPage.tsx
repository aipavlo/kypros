import { Link } from "react-router-dom";
import { getLessonById } from "@/src/content/catalogData";
import { easyStartLessonIds } from "@/src/content/trails";
import { getCompletedCount } from "@/src/content/progress";

type EasyStartPageProps = {
  completedLessonIds: string[];
};

function getEasyStartLessonLink(lessonId: string) {
  return `/lessons/${lessonId}?source=easy_start`;
}

function getLessonStateLabel(isCompleted: boolean, isCurrent: boolean) {
  if (isCompleted) {
    return "Пройдено";
  }

  if (isCurrent) {
    return "Сейчас";
  }

  return "Далее";
}

export function EasyStartPage(props: EasyStartPageProps) {
  const easyLessons = easyStartLessonIds
    .map((lessonId) => getLessonById(lessonId))
    .filter((lesson): lesson is NonNullable<ReturnType<typeof getLessonById>> => Boolean(lesson));
  const completedCount = getCompletedCount(easyLessons, props.completedLessonIds);
  const progressPercent =
    easyLessons.length > 0 ? Math.round((completedCount / easyLessons.length) * 100) : 0;
  const nextLesson =
    easyLessons.find((lesson) => !props.completedLessonIds.includes(lesson.id)) ?? easyLessons[0];
  const nextLessonIndex = nextLesson
    ? easyLessons.findIndex((lesson) => lesson.id === nextLesson.id)
    : 0;
  const upcomingLessons = easyLessons.slice(nextLessonIndex, nextLessonIndex + 3);

  return (
    <div className="stack">
      <section className="easy-start-hero panel">
        <div className="easy-start-primary">
          <p className="eyebrow">Лёгкий старт</p>
          <h1>Открой следующий урок</h1>
          <p className="section-copy">
            Это стартовый маршрут для изучения греческого языка на Кипре без лишнего выбора:
            сначала один ближайший урок, затем карточки, мини-проверка и следующий шаг.
          </p>
          <div className="easy-start-progress-line">
            <div className="progress-rail progress-rail-hero">
              <span className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <p>{completedCount} из {easyLessons.length} шагов пройдено</p>
          </div>
          <div className="actions-row easy-start-primary-actions">
            {nextLesson ? (
              <Link className="primary-link-button" to={getEasyStartLessonLink(nextLesson.id)}>
                Открыть следующий урок
              </Link>
            ) : null}
          </div>
          {nextLesson ? (
            <p className="easy-start-current-line">
              Сейчас: шаг {nextLessonIndex + 1} · {nextLesson.title}
            </p>
          ) : null}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Следом</p>
            <h2>Ближайшие шаги</h2>
            <p className="section-copy">
              Это следующие 2–3 шага маршрута. Достаточно смотреть только на этот короткий блок.
            </p>
          </div>
        </div>

        <div className="easy-start-roadmap easy-start-roadmap-compact">
          {upcomingLessons.map((lesson, offset) => {
            const index = nextLessonIndex + offset;
            const isCompleted = props.completedLessonIds.includes(lesson.id);
            const isCurrent = nextLesson?.id === lesson.id;

            return (
              <article
                className={
                  isCurrent
                    ? "easy-start-card easy-start-card-current"
                    : isCompleted
                      ? "easy-start-card easy-start-card-completed"
                      : "easy-start-card easy-start-card-upcoming"
                }
                key={lesson.id}
              >
                <div className="easy-start-card-top">
                  <span className="lesson-order-badge">{index + 1}</span>
                  <span className={`module-status-badge ${isCompleted ? "module-status-badge-completed" : isCurrent ? "module-status-badge-active" : "module-status-badge-available"}`}>
                    {getLessonStateLabel(isCompleted, isCurrent)}
                  </span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.objective}</p>
                <div className="easy-start-card-footer">
                  <span>{lesson.trackId === "greek_b1" ? "Греческий" : "Cyprus Reality"}</span>
                  <span>{lesson.estimatedMinutes} min</span>
                </div>
                {isCurrent ? (
                  <div className="actions-row">
                    <Link className="primary-link-button" to={getEasyStartLessonLink(lesson.id)}>
                      Открыть следующий урок
                    </Link>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Весь маршрут</p>
            <h2>Карта стартового пути</h2>
            <p className="section-copy">
              Компактный обзор всего маршрута без конкуренции с главным действием.
            </p>
          </div>
        </div>

        <div className="easy-start-mini-grid easy-start-mini-grid-compact">
          {easyLessons.map((lesson, index) => {
            const isCompleted = props.completedLessonIds.includes(lesson.id);
            const isCurrent = nextLesson?.id === lesson.id;

            return (
              <Link
                className={
                  isCurrent
                    ? "easy-start-mini-card easy-start-mini-card-current"
                    : isCompleted
                      ? "easy-start-mini-card easy-start-mini-card-completed"
                      : "easy-start-mini-card"
                }
                key={lesson.id}
                to={getEasyStartLessonLink(lesson.id)}
              >
                <span className="lesson-order-badge">{index + 1}</span>
                <div className="easy-start-mini-copy">
                  <strong>{lesson.title}</strong>
                  <p>{lesson.trackId === "greek_b1" ? "Греческий" : "Cyprus Reality"}</p>
                </div>
                <span className="easy-start-mini-state">{getLessonStateLabel(isCompleted, isCurrent)}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
