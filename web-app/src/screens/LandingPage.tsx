import { AppLink as Link } from "@/src/components/AppLink";
import {
  getLessonById,
  getLessonsByTrack,
  tracks
} from "@/src/content/catalogData";
import {
  FLASHCARD_TOTAL_COUNT,
  HUMOR_ITEM_COUNT,
  LESSON_TOTAL_COUNT,
  QUIZ_TOTAL_COUNT,
  TRAIL_TOTAL_COUNT
} from "@/src/content/contentCounts";
import { easyStartLessonIds } from "@/src/content/trails";
import { TrailBadge, TrailMiniArt } from "@/src/components/shared-ui";
import { appRoutes } from "@/src/lib/routes";

export function LandingPage() {
  const greekTrack = tracks.find((track) => track.id === "greek_b1");
  const cyprusTrack = tracks.find((track) => track.id === "cyprus_reality");
  const firstGreekLesson = getLessonsByTrack("greek_b1")[0];
  const firstCyprusLesson = getLessonsByTrack("cyprus_reality")[0];
  const firstEasyStartLesson = easyStartLessonIds[0] ? getLessonById(easyStartLessonIds[0]) : undefined;
  const easyStartCount = easyStartLessonIds.length;
  const cyprusRealityCount = getLessonsByTrack("cyprus_reality").length;
  const humorCount = HUMOR_ITEM_COUNT;
  const trailCount = TRAIL_TOTAL_COUNT;
  const languageLessonCount = getLessonsByTrack("greek_b1").length;
  const trackCount = tracks.length;

  return (
    <div className="stack">
      <section className="landing-hero panel">
        <div className="landing-copy">
          <p className="eyebrow">Kypros Path</p>
          <h1>Греческий и Cyprus Reality для жизни на Кипре</h1>
          <p className="lead">
            Если это первый заход, лучше идти через Лёгкий старт: один короткий урок, затем
            карточки и мини-проверка. Если прогресс уже есть, дашборд сразу покажет ближайший возврат.
          </p>
          <div className="actions-row">
            <Link className="primary-link-button" to={appRoutes.easyStart()}>
              Начать с короткого шага
            </Link>
            <Link className="secondary-link-button" to={appRoutes.dashboard()}>
              У меня уже есть прогресс
            </Link>
          </div>
          <div className="landing-proof-row">
            <span className="meta-pill meta-pill-success">{LESSON_TOTAL_COUNT} уроков</span>
            <span className="meta-pill">{QUIZ_TOTAL_COUNT} вопросов</span>
            <span className="meta-pill">{trailCount} готовых маршрутов</span>
          </div>
          <div className="decision-grid landing-session-grid">
            <article className="decision-card decision-card-primary">
              <p className="decision-card-kicker">Первый шаг</p>
              <h3>{firstEasyStartLesson ? `${firstEasyStartLesson.order}. ${firstEasyStartLesson.title}` : "Один короткий урок"}</h3>
              <p>Старт без выбора модулей и без каталога на первом экране.</p>
              <span className="decision-card-meta">{firstEasyStartLesson?.estimatedMinutes ?? 7} минут</span>
            </article>
            <article className="decision-card">
              <p className="decision-card-kicker">После урока</p>
              <h3>Сразу к карточкам</h3>
              <p>Следующий шаг уже задан: не нужно решать, куда идти дальше.</p>
              <span className="decision-card-meta">6 минут</span>
            </article>
            <article className="decision-card">
              <p className="decision-card-kicker">Потом</p>
              <h3>Короткая мини-проверка</h3>
              <p>Быстрый self-check вместо длинного меню режимов.</p>
              <span className="decision-card-meta">4-6 минут</span>
            </article>
          </div>
        </div>
      </section>

      <section className="panel landing-actions-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Если сценарий другой</p>
            <h2>Два альтернативных входа</h2>
            <p className="section-copy">
              Здесь только другие короткие сценарии: вернуться к своему прогрессу или сразу открыть Cyprus Reality.
            </p>
          </div>
        </div>

        <div className="landing-cta-grid">
          <Link className="landing-cta-card card-link-panel" to={appRoutes.dashboard()}>
            <p className="chip">Если уже что-то проходил</p>
            <h3>Вернуться к одному следующему действию</h3>
            <p>Дашборд покажет ближайший полезный возврат: продолжение, повтор или слабую тему.</p>
            <span className="action-link">Открыть дашборд</span>
          </Link>
          <Link className="landing-cta-card card-link-panel" to={appRoutes.cyprus()}>
            <p className="chip">Если нужен трек по Кипру</p>
            <h3>История, культура и устройство страны</h3>
            <p>Отдельная программа по Кипру: даты, институты, праздники и базовые факты.</p>
            <span className="action-link">Открыть программу по Кипру</span>
          </Link>
        </div>
      </section>

      <section className="panel landing-overview-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Что внутри</p>
            <h2>Три опорных слоя сервиса</h2>
            <p className="section-copy">
              Это обзор, а не точки входа. Основное действие остаётся сверху: дашборд или лёгкий старт.
            </p>
          </div>
        </div>

        <div className="landing-value-grid landing-value-grid-secondary">
          <article className="panel landing-value-card landing-value-card-secondary">
            <TrailBadge icon="chat" label="Язык" tone="language" />
            <h3>Греческий для реальной жизни</h3>
            <p>{greekTrack?.description}</p>
            <TrailMiniArt art="speech" tone="language" />
          </article>
          <article className="panel landing-value-card landing-value-card-secondary">
            <TrailBadge icon="map" label="Кипр" tone="history" />
            <h3>Кипр: история, институты и культура</h3>
            <p>{cyprusTrack?.description}</p>
            <TrailMiniArt art="mosaic" tone="history" />
          </article>
          <article className="panel landing-value-card landing-value-card-secondary">
            <TrailBadge icon="document" label="Проверка" tone="mixed" />
            <h3>Короткие проверки и повторение</h3>
            <p>После урока можно сразу закрепить материал карточками и мини-проверкой.</p>
            <TrailMiniArt art="stamp" tone="mixed" />
          </article>
          <article className="panel landing-value-card landing-value-card-secondary">
            <TrailBadge icon="spark" label="Сценарии" tone="language" />
            <h3>Everyday Greek для быстрых бытовых ситуаций</h3>
            <p>Короткие фразы и practical scenarios, которые можно открыть до длинного урока и сразу проговорить вслух.</p>
            <TrailMiniArt art="steps" tone="language" />
          </article>
        </div>
      </section>

      <section className="panel landing-cta-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Раскрываемые обзоры</p>
            <h2>Остальные входы и объём продукта открываются только по запросу</h2>
            <p className="section-copy">
              Главный выбор уже сделан выше. Ниже оставляем обзорные и каталожные слои в компактном
              disclosure-формате, чтобы первый экран не превращался в длинный scroll-архив.
            </p>
          </div>
        </div>

        <div className="content-disclosure-list">
          <details className="content-disclosure">
            <summary>Показать важные страницы и прямые входы</summary>
            <div className="content-disclosure-body">
              <div className="landing-cta-grid">
                <Link className="landing-cta-card card-link-panel" to="/easy-start">
                  <p className="chip">Старт</p>
                  <h3>Лёгкий старт по греческому</h3>
                  <p>Первый учебный вход без перегрузки и без ручного выбора модуля.</p>
                  <span className="action-link">Открыть easy start</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to="/lessons">
                  <p className="chip">Язык</p>
                  <h3>Полная программа Greek Core</h3>
                  <p>Уроки по уровням, карточки и мини-проверки для жизни на Кипре.</p>
                  <span className="action-link">Открыть lessons</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to="/cyprus">
                  <p className="chip">Кипр</p>
                  <h3>Программа Cyprus Reality</h3>
                  <p>История, культура, институты и база для экзаменационной подготовки.</p>
                  <span className="action-link">Открыть cyprus</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to="/trails">
                  <p className="chip">Маршруты</p>
                  <h3>Guided сценарии под задачу</h3>
                  <p>Разговор, сервисы, бытовые ситуации и тематический повтор без лишнего выбора.</p>
                  <span className="action-link">Открыть trails</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to="/phrasebook">
                  <p className="chip">Фразы</p>
                  <h3>Практические бытовые сценарии</h3>
                  <p>Компактный phrasebook-layer: приветствие, кафе, магазин, дорога и сервисные фразы.</p>
                  <span className="action-link">Открыть phrasebook</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to="/sitemap">
                  <p className="chip">Навигация</p>
                  <h3>HTML sitemap со всеми ключевыми входами</h3>
                  <p>Обычная страница со ссылками на главные разделы и стартовые lesson pages.</p>
                  <span className="action-link">Открыть карту сайта</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to={firstGreekLesson ? `/lessons/${firstGreekLesson.id}` : "/lessons"}>
                  <p className="chip">Урок</p>
                  <h3>{firstGreekLesson ? `${firstGreekLesson.order}. ${firstGreekLesson.title}` : "Первый урок греческого"}</h3>
                  <p>{firstGreekLesson?.objective ?? "Базовый вход в языковую программу."}</p>
                  <span className="action-link">Открыть lesson page</span>
                </Link>
                <Link className="landing-cta-card card-link-panel" to={firstCyprusLesson ? `/lessons/${firstCyprusLesson.id}` : "/cyprus"}>
                  <p className="chip">Cyprus lesson</p>
                  <h3>{firstCyprusLesson ? `${firstCyprusLesson.order}. ${firstCyprusLesson.title}` : "Первый урок по Кипру"}</h3>
                  <p>{firstCyprusLesson?.objective ?? "Прямой вход в базовый урок по Cyprus Reality."}</p>
                  <span className="action-link">Открыть lesson page</span>
                </Link>
              </div>
            </div>
          </details>

          <details className="content-disclosure">
            <summary>Показать структуру программы</summary>
            <div className="content-disclosure-body stack">
              <Link className="inline-link" to="/tracks">
                Открыть каталог программ
              </Link>
              <div className="landing-level-stats-grid">
                <article className="landing-level-stat">
                  <p className="chip">Греческий язык</p>
                  <h3>{languageLessonCount} уроков от A1 до B2 + дополнительный C1</h3>
                  <p>От простых бытовых тем до уверенной речи, текстов, аргументации и дополнительного продвинутого блока.</p>
                </article>
                <article className="landing-level-stat">
                  <p className="chip">Трек по Кипру</p>
                  <h3>{cyprusRealityCount} уроков по стране</h3>
                  <p>История, институты, праздники, культура и базовые экзаменационные темы.</p>
                </article>
                <article className="landing-level-stat">
                  <p className="chip">Маршруты</p>
                  <h3>{trailCount} готовых сценариев</h3>
                  <p>Разговор, сервисы, повторение, история и другие маршруты под конкретную задачу.</p>
                </article>
              </div>
            </div>
          </details>

          <details className="content-disclosure">
            <summary>Показать объём материалов</summary>
            <div className="content-disclosure-body">
              <div className="stats-grid landing-stats-grid">
                <article className="stat-card">
                  <p>Учебных программ и подборок</p>
                  <strong>{trackCount}</strong>
                  <span className="stat-card-hint">Язык, Кипр, проверка и спецмаршруты</span>
                </article>
                <article className="stat-card">
                  <p>Уроков по греческому</p>
                  <strong>{languageLessonCount}</strong>
                  <span className="stat-card-hint">A1-B2 + дополнительный C1</span>
                </article>
                <article className="stat-card">
                  <p>Уроков по Кипру</p>
                  <strong>{cyprusRealityCount}</strong>
                  <span className="stat-card-hint">История, культура, институты</span>
                </article>
                <article className="stat-card">
                  <p>Карточек</p>
                  <strong>{FLASHCARD_TOTAL_COUNT}</strong>
                  <span className="stat-card-hint">Для повторения слов, дат и терминов</span>
                </article>
                <article className="stat-card">
                  <p>Вопросов</p>
                  <strong>{QUIZ_TOTAL_COUNT}</strong>
                  <span className="stat-card-hint">Язык, Кипр и пробные режимы</span>
                </article>
                <article className="stat-card">
                  <p>Юмор и заметки</p>
                  <strong>{humorCount}</strong>
                  <span className="stat-card-hint">Лёгкий культурный слой без дублей</span>
                </article>
              </div>
            </div>
          </details>
        </div>
      </section>

      <section className="panel landing-outcomes-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Результат</p>
            <h2>Что это даёт на практике</h2>
            <p className="section-copy">
              Сервис нужен не ради красивой схемы, а ради понятного следующего шага и ощутимого прогресса.
            </p>
          </div>
        </div>

        <div className="landing-info-grid">
          <article className="landing-info-card landing-info-card-compact">
            <p className="chip">Итог</p>
            <h3>Более уверенный бытовой и административный греческий</h3>
            <p>Легче читать формы, понимать объявления и общаться в сервисах.</p>
          </article>
          <article className="landing-info-card landing-info-card-compact">
            <p className="chip">Итог</p>
            <h3>Опора на факты по Кипру</h3>
            <p>Появляется ясная картина по институтам, датам и базовым фактам о Кипре.</p>
          </article>
          <article className="landing-info-card landing-info-card-compact">
            <p className="chip">Итог</p>
            <h3>Понятный следующий шаг</h3>
            <p>Меньше времени уходит на выбор, что открыть дальше.</p>
          </article>
          <article className="landing-info-card landing-info-card-compact">
            <p className="chip">Первый шаг</p>
            <h3>{easyStartCount} шагов в лёгком старте</h3>
            <p>Если хочется начать без долгого выбора, здесь уже собран готовый путь.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
