import { Link } from "react-router-dom";
import { getLessonById } from "@/src/content/catalogData";
import { trailDefinitions } from "@/src/content/trails";
import { getCompletedCount } from "@/src/content/progress";
import { InfographicCard, TrailBadge, TrailLessonItem, TrailMiniArt } from "@/src/components/shared-ui";

type TrailsPageProps = {
  completedLessonIds: string[];
};

export function TrailsPage(props: TrailsPageProps) {
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

  return (
    <div className="stack">
      <section className="panel page-banner">
        <p className="eyebrow">Маршруты</p>
        <h1>Готовые маршруты обучения</h1>
        <p className="section-copy">
          Здесь собраны готовые маршруты по греческому языку, сервисным ситуациям, истории Кипра,
          культуре и тематическому повторению перед экзаменом.
        </p>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Зачем это работает</p>
            <h2>Почему маршруты помогают учиться быстрее</h2>
            <p className="section-copy">
              Маршрут сразу даёт полезный порядок уроков. Не нужно собирать путь вручную.
            </p>
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
            description="Пользователь видит, что изучится по итогу, поэтому меньше риск выбрать красивый, но неуместный маршрут."
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
          <InfographicCard
            description="Маршрут можно пройти целиком и получить полезный микрорезультат, не дожидаясь конца всей программы."
            icon="chat"
            metric="Результат"
            title="Быстрые полезные победы"
            tone="language"
          />
        </div>
      </section>

      <section className="panel dual-track-panel">
        <div className="track-lane-grid">
          <article className="track-lane-card track-lane-card-language">
            <p className="track-lane-label">Языковые маршруты</p>
            <h3>Маршруты по греческому языку</h3>
            <p>Здесь фокус на том, чтобы говорить, читать и ориентироваться в бытовых и административных ситуациях.</p>
          </article>
          <article className="track-lane-card track-lane-card-history">
            <p className="track-lane-label">История и экзамен</p>
            <h3>Маршруты по Cyprus Reality</h3>
            <p>Здесь фокус на том, чтобы понимать государство, общество, культуру и ключевые даты Кипра.</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Каталог маршрутов</p>
            <h2>Выбери маршрут по цели</h2>
          </div>
        </div>

        <div className="trail-catalog-grid">
          {trails.map((trail, index) => (
            <a
              className={`trail-catalog-card trail-catalog-card-${trail.tone}`}
              href={`#${trail.id}`}
              key={trail.id}
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
              <span className="action-link">Перейти к маршруту</span>
            </a>
          ))}
        </div>
      </section>

      {trails.map((trail) => (
        <section
          className={`panel trail-detail-panel trail-detail-panel-${trail.tone}`}
          id={trail.id}
          key={trail.id}
        >
          <div className="section-head">
            <div>
              <p className="eyebrow">Маршрут</p>
              <TrailBadge icon={trail.icon} label="Маршрут" tone={trail.tone} />
              <h2>{trail.title}</h2>
              <p className="trail-subtitle">{trail.subtitle}</p>
              <p className="section-copy">{trail.result}</p>
            </div>
            <div className="meta-inline">
              <span className="meta-pill">{trail.lessons.length} уроков</span>
              <span className="meta-pill meta-pill-success">{trail.percent}% пройдено</span>
            </div>
          </div>

          <TrailMiniArt art={trail.art} tone={trail.tone} />

          <div className="trail-focus-box">
            <strong>Что изучится по итогу:</strong>
            <div className="trail-focus-tags">
              {trail.focus.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="content-block-card">
            <h3>Почему этот маршрут работает</h3>
            <p>{trail.strategyNote}</p>
          </div>

          <div className="actions-row">
            {trail.nextLesson ? (
              <Link className="primary-link-button" to={`/lessons/${trail.nextLesson.id}`}>
                Продолжить маршрут: {trail.nextLesson.order}. {trail.nextLesson.title}
              </Link>
            ) : null}
            <Link className="secondary-link-button" to="/lessons">
              Посмотреть все уроки
            </Link>
          </div>

          <div className="trail-lesson-list">
            {trail.lessons.map((lesson) => (
              <TrailLessonItem
                completed={props.completedLessonIds.includes(lesson.id)}
                difficulty={lesson.difficulty}
                estimatedMinutes={lesson.estimatedMinutes}
                id={lesson.id}
                key={lesson.id}
                objective={lesson.objective}
                order={lesson.order}
                title={lesson.title}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
