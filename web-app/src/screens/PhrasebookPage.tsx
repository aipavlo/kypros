import { Link, useSearchParams } from "react-router-dom";
import { TrailBadge, TrailMiniArt } from "@/src/components/shared-ui";
import { getLessonById } from "@/src/content/catalogData";
import {
  getScenarioPackById,
  getScenarioPackLink,
  scenarioPacks
} from "@/src/content/scenarioPacks";

function getScenarioEntryLink(packId: string, lessonId: string) {
  return `/lessons/${lessonId}?source=phrasebook&pack=${packId}`;
}

function getScenarioTrailLink(trailId: string, packId: string) {
  return `/trails?trail=${trailId}&pack=${packId}`;
}

export function PhrasebookPage() {
  const [searchParams] = useSearchParams();
  const selectedPack = getScenarioPackById(searchParams.get("pack"));
  const selectedLesson = getLessonById(selectedPack.linkedLessonId);
  const groupedScenarioPacks = [
    {
      id: "first_week",
      title: "Первая неделя",
      description: "Входы для первых бытовых контактов после приезда или на старте языка.",
      items: scenarioPacks.filter((pack) => pack.category === "first_week")
    },
    {
      id: "daily_runs",
      title: "Ежедневные дела",
      description: "Кофе, магазин, дорога, оплата и другие короткие сценарии на каждый день.",
      items: scenarioPacks.filter((pack) => pack.category === "daily_runs")
    },
    {
      id: "services",
      title: "Сервисы и организация",
      description: "Запись, документы, звонки, аптека и короткие office-style разговоры.",
      items: scenarioPacks.filter((pack) => pack.category === "services")
    }
  ];
  const primaryLessonLink = selectedLesson
    ? getScenarioEntryLink(selectedPack.id, selectedLesson.id)
    : "/lessons";
  const recommendedTrailLink = selectedPack.linkedTrailId
    ? getScenarioTrailLink(selectedPack.linkedTrailId, selectedPack.id)
    : "/trails";

  return (
    <div className="stack">
      <section className="hero-panel phrasebook-hero">
        <div className="hero-copy">
          <p className="eyebrow">Everyday Greek</p>
          <h1>Практические фразы и бытовые сценарии без режима справочника</h1>
          <p className="lead">
            Здесь сценарии собраны как guided mini-routes: один intent, несколько рабочих фраз,
            короткий self-check и понятный переход в урок или маршрут.
          </p>
          <div className="actions-row">
            <Link className="primary-link-button" to={primaryLessonLink}>
              Открыть опорный урок
            </Link>
            <Link className="secondary-link-button" to={recommendedTrailLink}>
              Открыть связанный маршрут
            </Link>
          </div>
        </div>

        <div className="hero-sidebar">
          <article className="hero-badge phrasebook-hero-badge">
            <span className="hero-step-status">{selectedPack.categoryLabel}</span>
            <strong>{selectedPack.title}</strong>
            <p>{selectedPack.promise}</p>
            <div className="hero-step-meta">
              <span className="badge-chip">{selectedPack.estimatedMinutes} минут</span>
              <span className="badge-chip">{selectedPack.focus.length} опорных фокуса</span>
            </div>
            <div className="trail-focus-tags">
              {selectedPack.focus.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
            <p className="hero-goal-text">
              {selectedLesson ? `Опора: ${selectedLesson.order}. ${selectedLesson.title}` : "Опора в уроке и практическом маршруте."}
            </p>
          </article>
        </div>
      </section>

      <section className="panel phrasebook-recommended-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Быстрый вход</p>
            <h2>С чего начать по самой частой бытовой задаче</h2>
            <p className="section-copy">
              Здесь не большой phrasebook-catalog, а короткий shortlist из практических входов,
              которые реально нужны в первую очередь.
            </p>
          </div>
        </div>

        <div className="trail-catalog-grid">
          {scenarioPacks.slice(0, 6).map((pack) => (
            <Link
              className={`trail-catalog-card trail-catalog-card-${pack.tone} phrasebook-pack-card`}
              key={pack.id}
              to={getScenarioPackLink(pack.id)}
            >
              <div className="trail-catalog-top">
                <TrailBadge icon={pack.icon} label={pack.categoryLabel} tone={pack.tone} />
                <span className="meta-pill">{pack.estimatedMinutes} минут</span>
              </div>
              <TrailMiniArt art={pack.art} tone={pack.tone} />
              <h3>{pack.title}</h3>
              <p className="trail-subtitle">{pack.subtitle}</p>
              <p>{pack.promise}</p>
              <span className="action-link">Открыть сценарий</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`panel phrasebook-detail-panel phrasebook-detail-panel-${selectedPack.tone}`}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Открытый сценарий</p>
            <TrailBadge icon={selectedPack.icon} label="Сейчас в фокусе" tone={selectedPack.tone} />
            <h2>{selectedPack.title}</h2>
            <p className="trail-subtitle">{selectedPack.subtitle}</p>
            <p className="section-copy">{selectedPack.description}</p>
          </div>
          <div className="meta-inline">
            <span className="meta-pill">{selectedPack.estimatedMinutes} минут</span>
            <span className="meta-pill">{selectedPack.phrases.length} фраз</span>
          </div>
        </div>

        <div className="study-layout phrasebook-layout">
          <section className="study-main-panel">
            <article className="study-feature-card phrasebook-feature-card">
              <div className="phrasebook-copy">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Phrase pack</p>
                    <h2>Один практический intent вместо длинного словаря</h2>
                    <p className="section-copy">
                      Прочитай, проговори и сразу проверь, можешь ли ты удержать сценарий вслух.
                    </p>
                  </div>
                </div>

                <div className="phrasebook-phrase-list">
                  {selectedPack.phrases.map((phrase) => (
                    <article className="content-block-card phrasebook-phrase-card" key={phrase.greek}>
                      <div className="phrasebook-phrase-top">
                        <strong>{phrase.greek}</strong>
                        {phrase.transliteration ? <span className="meta-pill">{phrase.transliteration}</span> : null}
                      </div>
                      <p>{phrase.translation}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="study-action-card phrasebook-action-card">
                <strong>Self-check</strong>
                <p>{selectedPack.selfCheck.prompt}</p>
                <div className="phrasebook-check-list">
                  {selectedPack.selfCheck.checks.map((item) => (
                    <p className="chip" key={item}>
                      {item}
                    </p>
                  ))}
                </div>
                <strong>Production prompt</strong>
                <p>{selectedPack.productionPrompt}</p>
              </div>
            </article>
          </section>

          <aside className="study-sticky-panel phrasebook-side-panel">
            <article className="study-sidecard">
              <strong>Как использовать этот слой</strong>
              <p>Сначала просканируй 3-4 фразы, потом проговори их вслух и только после этого переходи в урок или маршрут.</p>
            </article>

            <article className="study-sidecard">
              <strong>Связь с продуктом</strong>
              <p>
                {selectedLesson
                  ? `Опорный урок: ${selectedLesson.order}. ${selectedLesson.title}.`
                  : "Сценарий связан с основной учебной программой."}
              </p>
              <div className="actions-row">
                <Link className="primary-link-button" to={primaryLessonLink}>
                  Открыть опорный урок
                </Link>
                <Link className="secondary-link-button" to={recommendedTrailLink}>
                  Открыть связанный маршрут
                </Link>
              </div>
            </article>
          </aside>
        </div>
      </section>

      {groupedScenarioPacks.map((group) => (
        <section className="panel phrasebook-group-panel" key={group.id}>
          <div className="section-head">
            <div>
              <p className="eyebrow">Категория</p>
              <h2>{group.title}</h2>
              <p className="section-copy">{group.description}</p>
            </div>
          </div>

          <div className="trail-catalog-grid">
            {group.items.map((pack) => (
              <Link
                className={`trail-catalog-card trail-catalog-card-${pack.tone}`}
                key={pack.id}
                to={getScenarioPackLink(pack.id)}
              >
                <div className="trail-catalog-top">
                  <TrailBadge icon={pack.icon} label={pack.categoryLabel} tone={pack.tone} />
                  <span className="meta-pill">{pack.estimatedMinutes} минут</span>
                </div>
                <h3>{pack.title}</h3>
                <p>{pack.promise}</p>
                <div className="trail-focus-tags">
                  {pack.focus.map((item) => (
                    <span className="chip" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
                <span className="action-link">Открыть</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
