import { Link } from "react-router-dom";
import {
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

export function LandingPage() {
  const greekTrack = tracks.find((track) => track.id === "greek_b1");
  const cyprusTrack = tracks.find((track) => track.id === "cyprus_reality");
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
          <h1>Греческий язык и подготовка по Кипру в одном месте</h1>
          <p className="lead">
            Если не хочется разбираться, с чего начать, нажимай на дашборд. Там сайт сам покажет
            следующий шаг: урок, карточки или мини-проверку.
          </p>
          <div className="actions-row">
            <Link className="primary-link-button" to="/dashboard">
              Открыть дашборд
            </Link>
            <Link className="secondary-link-button" to="/easy-start">
              Я начинаю с нуля
            </Link>
          </div>
          <div className="landing-proof-row">
            <span className="meta-pill meta-pill-success">{LESSON_TOTAL_COUNT} уроков</span>
            <span className="meta-pill">{QUIZ_TOTAL_COUNT} вопросов</span>
            <span className="meta-pill">{trailCount} готовых маршрутов</span>
          </div>
        </div>
      </section>

      <section className="panel landing-actions-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Другие входы</p>
            <h2>Или выбери раздел</h2>
            <p className="section-copy">Два коротких пути: первый шаг по греческому или сразу по Кипру.</p>
          </div>
        </div>

        <div className="landing-cta-grid">
          <Link className="landing-cta-card card-link-panel" to="/easy-start">
            <p className="chip">Для первого захода</p>
            <h3>Лёгкий старт без выбора модулей</h3>
            <p>Открой первый шаг и просто иди дальше по готовому пути.</p>
            <span className="action-link">Начать сейчас</span>
          </Link>
          <Link className="landing-cta-card card-link-panel" to="/cyprus">
            <p className="chip">Если нужен экзамен по Кипру</p>
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
        </div>
      </section>

      <section className="panel landing-cta-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Структура программы</p>
            <h2>Как устроен учебный путь</h2>
            <p className="section-copy">
              Здесь две основные программы: греческий язык для повседневной жизни на Кипре и Cyprus Reality
              для подготовки по истории, культуре и устройству страны.
            </p>
          </div>
        </div>

        <div className="landing-level-stats-grid">
          <Link className="landing-level-stat card-link-panel" to="/lessons?stage=a1&source=start">
            <p className="chip">Греческий язык</p>
            <h3>{languageLessonCount} уроков от A1 до B2 + дополнительный C1</h3>
            <p>От простых бытовых тем до уверенной речи, текстов, аргументации и дополнительного продвинутого блока.</p>
          </Link>
          <Link className="landing-level-stat card-link-panel" to="/cyprus">
            <p className="chip">Трек по Кипру</p>
            <h3>{cyprusRealityCount} уроков по стране</h3>
            <p>История, институты, праздники, культура и базовые экзаменационные темы.</p>
          </Link>
          <Link className="landing-level-stat card-link-panel" to="/trails">
            <p className="chip">Маршруты</p>
            <h3>{trailCount} готовых сценариев</h3>
            <p>Разговор, сервисы, повторение, история и другие маршруты под конкретную задачу.</p>
          </Link>
        </div>
      </section>

      <section className="panel landing-summary-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Объём материалов</p>
            <h2>Что уже собрано внутри</h2>
            <p className="section-copy">
              Ниже спокойная сводка по контенту. Это статистика, а не точки входа.
            </p>
          </div>
        </div>

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
          <Link className="landing-info-card card-link-panel" to="/easy-start">
            <p className="chip">Первый шаг</p>
            <h3>{easyStartCount} шагов в лёгком старте</h3>
            <p>Если хочется начать без долгого выбора, здесь уже собран готовый путь.</p>
            <span className="action-link">Перейти к лёгкому старту</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
