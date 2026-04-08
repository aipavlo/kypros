import { Link } from "react-router-dom";
import {
  getLessonsByModule,
  getMutableCyprusFacts,
  getLessonsByTrackAndDifficulty,
  getModulesByTrack,
  tracks
} from "@/src/content/catalogData";
import { getModuleStage, getTrackCountCopy, getTrackPresentation } from "@/src/content/presentation";

export function TracksPage() {
  const greekA1Lessons = getLessonsByTrackAndDifficulty("greek_b1", "a1");
  const greekA2Lessons = getLessonsByTrackAndDifficulty("greek_b1", "a2");
  const greekB1Lessons = getLessonsByTrackAndDifficulty("greek_b1", "b1");
  const greekB2Lessons = getLessonsByTrackAndDifficulty("greek_b1", "b2");
  const greekC1Lessons = getLessonsByTrackAndDifficulty("greek_b1", "c1");
  const cyprusTrack = tracks.find((track) => track.id === "cyprus_reality");
  const cyprusModules = getModulesByTrack("cyprus_reality");
  const mutableCyprusFacts = getMutableCyprusFacts();
  const supportingTracks = tracks.filter((track) => !["greek_b1", "cyprus_reality"].includes(track.id));
  const curatedTrackCards: Record<
    string,
    Array<{ title: string; description: string; to: string; pill: string; action: string }>
  > = {
    speaking_practice: [
      {
        title: "No English, Please",
        description:
          "Маршрут про разговор под давлением, удержание разговора на греческом и живое восприятие речи.",
        to: "/trails#trail_no_english_pls",
        pill: "Разговорный маршрут",
        action: "Перейти к маршруту"
      },
      {
        title: "Athena Small Talk Forge",
        description:
          "Стартовый разговорный маршрут: представиться, рассказать о себе и спокойно поддержать простой диалог.",
        to: "/trails#trail_athena_small_talk",
        pill: "Стартовый маршрут",
        action: "Перейти к маршруту"
      }
    ],
    citizenship_strategy: [
      {
        title: "KEP Survival Mode",
        description:
          "Маршрут по заявлениям, формам, записи, курсам и сервисным сценариям вокруг документов и услуг.",
        to: "/trails#trail_kep_survival_mode",
        pill: "Сервисный маршрут",
        action: "Перейти к маршруту"
      },
      {
        title: "Fact, Not Panic",
        description:
          "Маршрут по тематическому повторению Cyprus Reality и перепроверке изменяемых фактов перед экзаменом.",
        to: "/trails#trail_fact_not_panic",
        pill: "Экзаменационная стратегия",
        action: "Перейти к маршруту"
      }
    ],
    greek_humor: [
      {
        title: "Greek Memes and Anecdotes",
        description:
          "Отдельная лёгкая подборка про короткие разговорные шутки, мемы и культурные наблюдения.",
        to: "/humor",
        pill: "Юмористическая подборка",
        action: "Открыть раздел"
      },
      {
        title: "Local jokes with votes",
        description:
          "Смотри самые удачные шутки, ставь оценки и находи самые просматриваемые культурные заметки.",
        to: "/humor",
        pill: "Рейтинг",
        action: "Смотреть рейтинг"
      }
    ]
  };

  return (
    <div className="stack">
      <section className="panel page-banner">
        <p className="eyebrow">Программы</p>
        <h1>Учебные программы и подборки</h1>
        <p className="section-copy">
          Эта страница нужна для выбора правильной линии. Проходить язык лучше в `lessons`, а
          Cyprus Reality лучше вести через отдельную страницу `cyprus`.
        </p>
      </section>

      <section className="panel tracks-role-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Роли страниц</p>
            <h2>Что открывать и зачем</h2>
            <p className="section-copy">
              Здесь не нужно учиться внутри карточек. Это навигационный слой: выбрать программу,
              понять её роль и перейти в правильную рабочую страницу.
            </p>
          </div>
        </div>

        <div className="grid spotlight-grid">
          <Link className="card card-link track-card track-card-language" to="/lessons">
            <p className="chip">lessons</p>
            <h3>Проходить языковую программу</h3>
            <p>Рабочая страница для Greek Core: модуль, уроки, карточки и мини-проверка.</p>
            <span className="action-link">Открыть язык</span>
          </Link>
          <Link className="card card-link track-card track-card-history" to="/cyprus">
            <p className="chip">cyprus</p>
            <h3>Изучать Cyprus Reality отдельно</h3>
            <p>Отдельная учебная линия по Кипру: факты, история, государство, повторение и экзаменационный ритм.</p>
            <span className="action-link">Открыть Cyprus Reality</span>
          </Link>
          <Link className="card card-link track-card" to="/quiz">
            <p className="chip">quiz</p>
            <h3>Проверить знания</h3>
            <p>Отдельный слой самопроверки, а не вход в программы. Сюда лучше идти после учебного шага.</p>
            <span className="action-link">Открыть проверку</span>
          </Link>
        </div>
      </section>

      <section className="panel dual-track-panel">
        <div className="track-lane-grid">
          <article className="track-lane-card track-lane-card-language">
            <p className="track-lane-label">Линия 1</p>
            <h3>Языковая программа</h3>
            <p>
              Если цель говорить, читать и понимать греческий в реальных ситуациях, двигайся по
              этой линии.
            </p>
          </article>
          <article className="track-lane-card track-lane-card-history">
            <p className="track-lane-label">Линия 2</p>
            <h3>Программа Cyprus Reality</h3>
            <p>
              Если цель понимать государство, историю, культуру и вопросы экзамена, держи в
              фокусе Cyprus Reality.
            </p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Уровни языка</p>
            <h2>Внутри языкового трека</h2>
          </div>
        </div>

        <div className="grid">
          <Link className="card card-link track-card track-card-language" to="/lessons?stage=a1&source=tracks">
            <p className="chip">A1</p>
            <h3>Стартовая линейка</h3>
            <p>Лучший вход для старта: знакомство, бытовые темы, город, покупки и простые формы.</p>
            <p className="muted">{greekA1Lessons.length} уроков</p>
            <span className="action-link">Открыть уровень A1</span>
          </Link>
          <Link className="card card-link track-card track-card-language" to="/lessons?stage=a2&source=tracks">
            <p className="chip">A2</p>
            <h3>Переходный уровень</h3>
            <p>Когда база уже есть: повседневное общение, работа, документы, разговор и сервисные сценарии.</p>
            <p className="muted">{greekA2Lessons.length} уроков</p>
            <span className="action-link">Открыть уровень A2</span>
          </Link>
          <Link className="card card-link track-card track-card-language" to="/lessons?stage=b1&source=tracks">
            <p className="chip">B1</p>
            <h3>Уровень общественной жизни</h3>
            <p>Язык для общественной жизни, административных формулировок и более связного ответа.</p>
            <p className="muted">{greekB1Lessons.length} уроков</p>
            <span className="action-link">Открыть уровень B1</span>
          </Link>
          <Link className="card card-link track-card track-card-language" to="/lessons?stage=b2&source=tracks">
            <p className="chip">B2</p>
            <h3>Уверенный самостоятельный уровень</h3>
            <p>Более длинные тексты, аргументация, сводки и полуформальные ответы перед дополнительным продвинутым блоком.</p>
            <p className="muted">{greekB2Lessons.length} уроков</p>
            <span className="action-link">Открыть уровень B2</span>
          </Link>
          <Link className="card card-link track-card track-card-language" to="/lessons?stage=c1&source=tracks">
            <p className="chip">C1</p>
            <h3>Дополнительный продвинутый блок</h3>
            <p>Компактный продвинутый слой после B2: общественный дискурс, письмо, регистр и смысловые нюансы.</p>
            <p className="muted">{greekC1Lessons.length} уроков</p>
            <span className="action-link">Открыть блок C1</span>
          </Link>
        </div>
      </section>

      <section className="panel track-history">
        <div className="section-head">
          <div>
            <p className="eyebrow">Самостоятельная программа</p>
            <p className="track-identity track-identity-history">Cyprus Reality</p>
            <h2>Отдельная линия по Кипру, а не приложение к языку</h2>
            <p className="section-copy">
              Эта программа собрана как самостоятельная линия: история, институты, культура,
              ключевые даты и тематическое повторение идут как единый учебный слой.
            </p>
          </div>
          <div className="meta-inline">
            <span className="meta-pill">{cyprusTrack?.moduleCount ?? cyprusModules.length} модулей</span>
            <span className="meta-pill">{cyprusTrack?.lessonCount ?? 0} уроков</span>
          </div>
        </div>

        <div className="cyprus-program-grid">
          <article className="content-block-card">
            <p className="eyebrow">Что внутри</p>
            <h3>История, государство, даты и культура</h3>
            <p>
              Внутри программы темы собраны по смысловым блокам, чтобы факты не распадались на
              случайный список для заучивания.
            </p>
          </article>

          <article className="content-block-card">
            <p className="eyebrow">Как проходить</p>
            <h3>Урок, карточки, мини-проверка и перепроверка</h3>
            <p>
              Лучший ритм для этого трека: сначала короткий урок по теме, потом повторение
              карточками, затем мини-проверка и перепроверка изменяемых фактов перед экзаменом.
            </p>
          </article>

          <article className="content-block-card">
            <p className="eyebrow">Зачем это отдельно</p>
            <h3>Можно учить Cyprus Reality как отдельный предмет</h3>
            <p>
              Программа уже не зависит от языковой линии как вспомогательный блок: у неё есть свои
              модули, карточки, мини-проверки и маршруты для тематического повторения.
            </p>
          </article>
        </div>

        {mutableCyprusFacts.length > 0 ? (
          <article className="info-note-card">
            <p className="eyebrow">Изменяемые факты</p>
            <h3>Что стоит перепроверять отдельно</h3>
            <p>
              Некоторые данные могут меняться со временем. Их лучше не просто заучивать, а
              перепроверять перед экзаменом и перед финальным повторением.
            </p>
            <div className="module-step-pills">
              {mutableCyprusFacts.map((fact) => (
                <span className="badge-chip" key={fact.id}>
                  {fact.title}
                </span>
              ))}
            </div>
          </article>
        ) : null}

        <div className="actions-row">
          <Link className="primary-link-button" to="/cyprus">
            Открыть программу Cyprus Reality
          </Link>
          <Link className="secondary-link-button" to="/flashcards?track=cyprus_reality">
            Открыть карточки программы
          </Link>
          <Link className="secondary-link-button" to="/quiz?mode=mode_cyprus_reality">
            Открыть мини-проверку программы
          </Link>
          <Link className="secondary-link-button" to="/trails#trail_fact_not_panic">
            Открыть маршрут повтора
          </Link>
        </div>
      </section>

      {supportingTracks.map((track) => {
        const trackModules = getModulesByTrack(track.id);
        const trackPresentation = getTrackPresentation(track.id);
        const curatedCards = curatedTrackCards[track.id] ?? [];
        const isCuratedOnly = trackModules.length === 0;

        return (
          <section className={`panel track-section ${trackPresentation.themeClass}`} key={track.id}>
            <div className="section-head">
              <div>
                <p className="eyebrow">{track.id}</p>
                <p
                  className={`track-identity ${track.id === "greek_b1" ? "track-identity-language" : track.id === "cyprus_reality" ? "track-identity-history" : ""}`}
                >
                  {trackPresentation.label}
                </p>
                <h2>{track.title}</h2>
              </div>
              <div className="meta-inline">
                <span>{getTrackCountCopy(track.id, track.moduleCount, track.lessonCount)}</span>
              </div>
            </div>

            <p className="section-copy">{track.description}</p>
            <p className="track-focus-line">{trackPresentation.summary}</p>

            <div className="grid">
              {trackModules.length > 0 ? (
                trackModules.map((module) => (
                  <Link
                    className={`card card-link track-card ${trackPresentation.themeClass === "track-language" ? "track-card-language" : trackPresentation.themeClass === "track-history" ? "track-card-history" : ""}`}
                    key={module.id}
                    to={
                      track.id === "greek_b1"
                        ? `/lessons?stage=${getModuleStage(module.id)}&module=${module.id}&source=tracks`
                        : `/cyprus?module=${module.id}&source=tracks`
                    }
                  >
                    <p className="chip">Модуль</p>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                    <p className="muted">{getLessonsByModule(module.id).length} уроков в модуле</p>
                    <span className="action-link">Перейти к заданиям модуля</span>
                  </Link>
                ))
              ) : isCuratedOnly ? (
                curatedCards.map((card) => (
                  <Link
                    className={`card card-link track-card ${trackPresentation.themeClass === "track-language" ? "track-card-language" : "track-card-history"}`}
                    key={card.title}
                    to={card.to}
                  >
                    <p className="chip">{card.pill}</p>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    <p className="muted">Это отдельная подборка на базе уже существующих уроков и маршрутов.</p>
                    <span className="action-link">{card.action}</span>
                  </Link>
                ))
              ) : (
                <Link className="card card-link track-card" to="/quiz">
                  <p className="chip">Раздел</p>
                  <h3>Банк экзаменационных вопросов</h3>
                  <p>Эта линия живёт не как программа модулей, а как самостоятельный слой проверок.</p>
                  <span className="action-link">Открыть quiz</span>
                </Link>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
