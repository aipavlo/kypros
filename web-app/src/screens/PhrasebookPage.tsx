import { useSearchParams } from "react-router-dom";
import { AppLink as Link } from "@/src/components/AppLink";
import { TrailBadge, TrailMiniArt } from "@/src/components/shared-ui";
import { getLessonById } from "@/src/content/catalogData";
import {
  getScenarioPackById,
  getScenarioPackLink,
  scenarioPacks
} from "@/src/content/scenarioPacks";
import { appRoutes } from "@/src/lib/routes";

function getScenarioEntryLink(packId: string, lessonId: string) {
  return appRoutes.lesson(lessonId, { source: "phrasebook", pack: packId });
}

function getScenarioTrailLink(trailId: string, packId: string) {
  return appRoutes.trails({ trail: trailId, pack: packId });
}

function getAlternativeScenarioPacks(packId: string) {
  return scenarioPacks.filter((pack) => pack.id !== packId);
}

export function PhrasebookPage() {
  const [searchParams] = useSearchParams();
  const selectedPack = getScenarioPackById(searchParams.get("pack"));
  const selectedLesson = getLessonById(selectedPack.linkedLessonId);
  const primaryLessonLink = selectedLesson
    ? getScenarioEntryLink(selectedPack.id, selectedLesson.id)
    : appRoutes.lessons();
  const recommendedTrailLink = selectedPack.linkedTrailId
    ? getScenarioTrailLink(selectedPack.linkedTrailId, selectedPack.id)
    : appRoutes.trails();
  const currentCategoryPacks = scenarioPacks.filter((pack) => pack.category === selectedPack.category);
  const alternativeScenarioPacks = getAlternativeScenarioPacks(selectedPack.id);
  const miniRouteShortlist = [
    selectedPack,
    ...alternativeScenarioPacks.filter((pack) => pack.category !== selectedPack.category)
  ].slice(0, 4);
  const neighboringRoutes = currentCategoryPacks.filter((pack) => pack.id !== selectedPack.id).slice(0, 3);
  const nextRoutePick =
    neighboringRoutes[0] ??
    alternativeScenarioPacks.find((pack) => pack.linkedTrailId) ??
    alternativeScenarioPacks[0];

  return (
    <div className="stack">
      <section className="hero-panel phrasebook-hero">
        <div className="hero-copy">
          <p className="eyebrow">Everyday Greek</p>
          <h1>Бытовые фразы на греческом для жизни на Кипре</h1>
          <p className="lead">
            Один бытовой intent, несколько рабочих фраз, короткий self-check и один понятный
            следующий шаг. Здесь не нужно читать длинный словарь или вручную сравнивать весь
            каталог.
          </p>
          <div className="actions-row">
            <Link className="primary-link-button" to={primaryLessonLink}>
              Пройти этот mini-route
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
              {selectedLesson
                ? `Опора: ${selectedLesson.order}. ${selectedLesson.title}`
                : "Опора в уроке и практическом маршруте."}
            </p>
          </article>
        </div>
      </section>

      <section className="panel phrasebook-recommended-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Быстрый shortlist</p>
            <h2>Выбери бытовую задачу и открой один компактный маршрут</h2>
            <p className="section-copy">
              Сверху только несколько сильных practical entries. Остальные сценарии остаются ниже
              как соседние варианты, а не как длинный архив карточек.
            </p>
          </div>
        </div>

        <div className="trail-catalog-grid">
          {miniRouteShortlist.map((pack) => (
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
              <span className="action-link">
                {pack.id === selectedPack.id ? "Маршрут открыт" : "Открыть mini-route"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Route logic</p>
            <h2>Как проходить practical scenario за 5-7 минут</h2>
            <p className="section-copy">
              Этот слой работает как guided mini-route: сначала быстрое сканирование, потом
              проговаривание, затем один следующий шаг без лишней навигации.
            </p>
          </div>
        </div>

        <div className="infographic-grid">
          <article className="content-block-card">
            <p className="eyebrow">Шаг 1</p>
            <h3>Просканируй 3-4 опорные фразы</h3>
            <p>Посмотри на короткий script, не пытаясь выучить всё подряд. Здесь важнее intent, а не длинный список слов.</p>
          </article>
          <article className="content-block-card">
            <p className="eyebrow">Шаг 2</p>
            <h3>Скажи сценарий вслух</h3>
            <p>Transliteration остаётся рядом как мягкая опора, но не перетягивает на себя весь экран и не превращает слой в таблицу.</p>
          </article>
          <article className="content-block-card">
            <p className="eyebrow">Шаг 3</p>
            <h3>Переходи дальше по готовому маршруту</h3>
            <p>Если сценарий держится, открывай урок или trail. Если нет, оставайся на этом intent и проговори его ещё один короткий круг.</p>
          </article>
        </div>
      </section>

      <section className={`panel phrasebook-detail-panel phrasebook-detail-panel-${selectedPack.tone}`}>
        <div className="section-head">
          <div>
            <p className="eyebrow">Открытый mini-route</p>
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
                    <p className="eyebrow">Mini-route script</p>
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
              <strong>Один следующий шаг</strong>
              <p>
                Не переходи в полный каталог. Сначала закрой этот intent, затем иди в урок или trail
                как в следующий слой того же маршрута.
              </p>
              <div className="actions-row">
                <Link className="primary-link-button" to={primaryLessonLink}>
                  Открыть опорный урок
                </Link>
                <Link className="secondary-link-button" to={recommendedTrailLink}>
                  Открыть trail
                </Link>
              </div>
            </article>

            <article className="study-sidecard">
              <strong>Связь с продуктом</strong>
              <p>
                {selectedLesson
                  ? `Опорный урок: ${selectedLesson.order}. ${selectedLesson.title}.`
                  : "Сценарий связан с основной учебной программой."}
              </p>
              <p>
                {selectedPack.linkedTrailId
                  ? "Если нужен более длинный бытовой прогон, соседний trail уже подобран."
                  : "Если нужен более длинный прогон, этот сценарий всё равно ведёт обратно в основной learning flow."}
              </p>
            </article>
          </aside>
        </div>
      </section>

      {neighboringRoutes.length > 0 ? (
        <section className="panel phrasebook-group-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Соседние маршруты</p>
              <h2>Если нужен похожий intent, а не новый большой раздел</h2>
              <p className="section-copy">
                Ниже только ближайшие сценарии из того же бытового контекста, чтобы переключение
                оставалось быстрым и не превращалось в browsing.
              </p>
            </div>
          </div>

          <div className="trail-catalog-grid">
            {neighboringRoutes.map((pack) => (
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
                <span className="action-link">Открыть mini-route</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {nextRoutePick ? (
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Next practical entry</p>
              <h2>Когда этот сценарий уже держится, куда идти дальше</h2>
              <p className="section-copy">
                Вместо общего phrasebook-архива оставляем один соседний entry, который логично
                продолжает бытовой ритм.
              </p>
            </div>
          </div>

          <article className={`trail-catalog-card trail-catalog-card-${nextRoutePick.tone}`}>
            <div className="trail-catalog-top">
              <TrailBadge icon={nextRoutePick.icon} label={nextRoutePick.categoryLabel} tone={nextRoutePick.tone} />
              <span className="meta-pill">{nextRoutePick.estimatedMinutes} минут</span>
            </div>
            <h3>{nextRoutePick.title}</h3>
            <p className="trail-subtitle">{nextRoutePick.subtitle}</p>
            <p>{nextRoutePick.promise}</p>
            <div className="actions-row">
              <Link className="primary-link-button" to={getScenarioPackLink(nextRoutePick.id)}>
                Открыть следующий mini-route
              </Link>
              <Link className="secondary-link-button" to="/trails">
                Открыть все trails
              </Link>
            </div>
          </article>
        </section>
      ) : null}
    </div>
  );
}
