import { Link, useSearchParams } from "react-router-dom";
import { getLessonById } from "@/src/content/catalogData";
import { trailDefinitions } from "@/src/content/trails";
import { getCompletedCount } from "@/src/content/progress";
import { InfographicCard, TrailBadge, TrailLessonItem, TrailMiniArt } from "@/src/components/shared-ui";

type TrailsPageProps = {
  completedLessonIds: string[];
};

export function TrailsPage(props: TrailsPageProps) {
  const [searchParams] = useSearchParams();
  const trails = trailDefinitions.map((trail) => {
    const trailLessons = trail.lessonIds
      .map((lessonId) => getLessonById(lessonId))
      .filter((lesson): lesson is NonNullable<ReturnType<typeof getLessonById>> => Boolean(lesson));
    const completedCount = getCompletedCount(trailLessons, props.completedLessonIds);
    const percent =
      trailLessons.length > 0 ? Math.round((completedCount / trailLessons.length) * 100) : 0;
    const nextLesson =
      trailLessons.find((lesson) => !props.completedLessonIds.includes(lesson.id)) ?? trailLessons[0];

    return {
      ...trail,
      lessons: trailLessons,
      completedCount,
      percent,
      nextLesson
    };
  });
  const recommendedTrailIds = [
    "trail_home_setup_no_drama",
    "trail_souvlaki_starter",
    "trail_kep_to_resolution",
    "trail_fact_not_panic"
  ] as const;
  const recommendedTrails = recommendedTrailIds
    .map((trailId) => trails.find((trail) => trail.id === trailId))
    .filter((trail): trail is NonNullable<(typeof trails)[number]> => Boolean(trail));
  const selectedTrailId = searchParams.get("trail");
  const selectedTrail =
    trails.find((trail) => trail.id === selectedTrailId) ?? recommendedTrails[0] ?? trails[0];
  const neighboringTrails = trails
    .filter((trail) => trail.id !== selectedTrail.id && trail.tone === selectedTrail.tone)
    .slice(0, 3);
  const additionalTrails = trails.filter((trail) => trail.id !== selectedTrail.id).slice(0, 6);

  function getTrailLink(trailId: string) {
    return `/trails?trail=${trailId}`;
  }

  function getTrailLessonLink(trailId: string, lessonId: string) {
    return `/lessons/${lessonId}?trail=${trailId}&source=trail`;
  }

  return (
    <div className="stack">
      <section className="panel page-banner trails-hero-panel">
        <p className="eyebrow">Маршруты</p>
        <h1>Готовые маршруты обучения</h1>
        <p className="section-copy">
          Выбери один сценарий под текущую задачу и открой его как рабочий маршрут, без длинного
          сравнения всего каталога подряд.
        </p>
        <div className="actions-row">
          <Link className="primary-link-button" to="/lessons">
            Открыть языковую программу
          </Link>
          <Link className="secondary-link-button" to="/cyprus">
            Открыть Cyprus Reality
          </Link>
        </div>
      </section>

      <section className="panel trails-recommended-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Рекомендовано</p>
            <h2>С чего начать по самой частой задаче</h2>
            <p className="section-copy">
              Это короткий shortlist вместо полного каталога. Если задача типовая, лучше начать
              отсюда и не сравнивать все trail’ы вручную.
            </p>
          </div>
        </div>

        <div className="trail-catalog-grid trails-recommended-grid">
          {recommendedTrails.map((trail) => (
            <Link
              className={`trail-catalog-card trail-catalog-card-${trail.tone} trails-recommended-card`}
              key={trail.id}
              to={getTrailLink(trail.id)}
            >
              <div className="trail-catalog-top">
                <TrailBadge icon={trail.icon} label="Лучший вход" tone={trail.tone} />
                <span className="meta-pill meta-pill-success">{trail.percent}% пройдено</span>
              </div>
              <h3>{trail.title}</h3>
              <p className="trail-subtitle">{trail.subtitle}</p>
              <p>{trail.result}</p>
              <p className="muted">
                {trail.completedCount} / {trail.lessons.length} уроков пройдено
              </p>
              <span className="action-link">Открыть детали</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`panel trail-detail-panel trail-detail-panel-${selectedTrail.tone}`}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Открытый маршрут</p>
            <TrailBadge icon={selectedTrail.icon} label="Сейчас открыт" tone={selectedTrail.tone} />
            <h2>{selectedTrail.title}</h2>
            <p className="trail-subtitle">{selectedTrail.subtitle}</p>
            <p className="section-copy">{selectedTrail.result}</p>
          </div>
          <div className="meta-inline">
            <span className="meta-pill">{selectedTrail.lessons.length} уроков</span>
            <span className="meta-pill meta-pill-success">{selectedTrail.percent}% пройдено</span>
          </div>
        </div>

        <TrailMiniArt art={selectedTrail.art} tone={selectedTrail.tone} />

        <div className="trail-focus-box">
          <strong>Что изучится по итогу:</strong>
          <div className="trail-focus-tags">
            {selectedTrail.focus.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="infographic-grid">
          <InfographicCard
            description="Маршрут уже собран под цель: поговорить, пройти сервисные ситуации, разобраться в истории или повторить Cyprus Reality."
            icon="map"
            metric="Цель"
            title="Цель важнее списка тем"
            tone="mixed"
          />
          <InfographicCard
            description="Пользователь заранее видит, какой микрорезультат получит, и меньше тратит силы на сравнение похожих вариантов."
            icon="spark"
            metric="Ясность"
            title="Меньше лишнего выбора"
            tone="language"
          />
          <InfographicCard
            description="У маршрута есть следующий урок и процент прохождения, поэтому продолжать психологически легче."
            icon="arrow"
            metric="Темп"
            title="Проще идти дальше"
            tone="history"
          />
        </div>

        <div className="content-block-card">
          <h3>Почему этот маршрут работает</h3>
          <p>{selectedTrail.strategyNote}</p>
        </div>

        <div className="actions-row">
          {selectedTrail.nextLesson ? (
            <Link
              className="primary-link-button"
              to={getTrailLessonLink(selectedTrail.id, selectedTrail.nextLesson.id)}
            >
              Продолжить маршрут: {selectedTrail.nextLesson.order}. {selectedTrail.nextLesson.title}
            </Link>
          ) : null}
          <Link className="secondary-link-button" to="/lessons">
            Посмотреть все уроки
          </Link>
        </div>

        <div className="trail-lesson-list">
          {selectedTrail.lessons.map((lesson) => (
            <TrailLessonItem
              completed={props.completedLessonIds.includes(lesson.id)}
              difficulty={lesson.difficulty}
              estimatedMinutes={lesson.estimatedMinutes}
              id={lesson.id}
              key={lesson.id}
              objective={lesson.objective}
              order={lesson.order}
              to={getTrailLessonLink(selectedTrail.id, lesson.id)}
              title={lesson.title}
            />
          ))}
        </div>
      </section>

      {neighboringTrails.length > 0 ? (
        <section className="panel trails-catalog-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Соседние маршруты</p>
              <h2>Если нужен похожий маршрут, а не новый большой каталог</h2>
              <p className="section-copy">
                Сначала держим под рукой только несколько близких вариантов, чтобы не возвращать
                пользователя в длинное сравнение всех маршрутов.
              </p>
            </div>
          </div>

          <div className="trail-catalog-grid">
            {neighboringTrails.map((trail) => (
              <Link
                className={`trail-catalog-card trail-catalog-card-${trail.tone}`}
                key={trail.id}
                to={getTrailLink(trail.id)}
              >
                <div className="trail-catalog-top">
                  <TrailBadge icon={trail.icon} label="Похожий маршрут" tone={trail.tone} />
                  <span className="meta-pill meta-pill-success">{trail.percent}% пройдено</span>
                </div>
                <TrailMiniArt art={trail.art} tone={trail.tone} />
                <h3>{trail.title}</h3>
                <p className="trail-subtitle">{trail.subtitle}</p>
                <p>{trail.result}</p>
                <span className="action-link">Открыть рядом</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel trails-catalog-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Полный каталог</p>
            <h2>Все маршруты по цели открываются только по запросу</h2>
            <p className="section-copy">
              Полный каталог нужен, только если shortlist выше не подошёл или нужна более точная
              тема. По умолчанию он остаётся свёрнутым, чтобы не спорить с открытым маршрутом.
            </p>
          </div>
        </div>

        <details className="content-disclosure">
          <summary>Показать полный каталог маршрутов</summary>
          <div className="content-disclosure-body">
            <div className="trail-catalog-grid">
              {additionalTrails.map((trail, index) => (
                <Link
                  className={`trail-catalog-card trail-catalog-card-${trail.tone}`}
                  key={trail.id}
                  to={getTrailLink(trail.id)}
                >
                  <div className="trail-catalog-top">
                    <TrailBadge
                      icon={trail.icon}
                      label={`Маршрут ${index + 1}`}
                      tone={trail.tone}
                    />
                    <span className="meta-pill meta-pill-success">{trail.percent}% пройдено</span>
                  </div>
                  <TrailMiniArt art={trail.art} tone={trail.tone} />
                  <h3>{trail.title}</h3>
                  <p className="trail-subtitle">{trail.subtitle}</p>
                  <p>{trail.result}</p>
                  <p className="muted">
                    {trail.completedCount} / {trail.lessons.length} уроков пройдено
                  </p>
                  <span className="action-link">Открыть детали</span>
                </Link>
              ))}
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
