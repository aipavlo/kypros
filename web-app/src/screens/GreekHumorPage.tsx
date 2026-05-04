import { useState } from "react";
import { AppLink as Link } from "@/src/components/AppLink";
import { localHumorStatsAdapter } from "@/src/adapters/localHumorStatsAdapter";
import { localHumorStudyAdapter } from "@/src/adapters/localHumorStudyAdapter";
import { getHumorItems, HUMOR_ITEM_COUNT } from "@/src/content/humorData";
import type { HumorItem } from "@/src/content/types";

const HUMOR_FILTERS = [
  { id: "all", label: "Все" },
  { id: "meme", label: "Мемы" },
  { id: "joke", label: "Шутки" },
  { id: "anecdote", label: "Анекдоты" },
  { id: "popular", label: "Популярное" },
  { id: "new", label: "Новое" },
  { id: "short", label: "Короткое" }
] as const;

const INITIAL_VISIBLE_ITEM_COUNT = 12;
const VISIBLE_ITEM_STEP = 10;

type HumorFilterId = (typeof HUMOR_FILTERS)[number]["id"];

function getPrimaryTheme(item: HumorItem) {
  return item.tags.find((tag) => tag.startsWith("theme:")) ?? null;
}

function getItemPopularityScore(views: number, votes: number) {
  return votes * 4 + views;
}

export function GreekHumorPage() {
  const items = getHumorItems();
  const [stats, setStats] = useState<Record<string, { views: number; votes: number }>>(
    () => localHumorStatsAdapter.readStats()
  );
  const [studyState, setStudyState] = useState(() => localHumorStudyAdapter.readState());
  const [activeFilter, setActiveFilter] = useState<HumorFilterId>("all");
  const [openedId, setOpenedId] = useState<string | null>(items[0]?.id ?? null);
  const [visibleItemCount, setVisibleItemCount] = useState(INITIAL_VISIBLE_ITEM_COUNT);

  function getItemStats(itemId: string) {
    return stats[itemId] ?? { views: 0, votes: 0 };
  }

  function isSaved(itemId: string) {
    return studyState.savedItemIds.includes(itemId);
  }

  function isViewed(itemId: string) {
    return studyState.viewedItemIds.includes(itemId);
  }

  function openItem(itemId: string) {
    setOpenedId(itemId);
    setStats((current) => localHumorStatsAdapter.trackItemOpen(current, itemId));
  }

  function voteItem(itemId: string, delta: 1 | -1) {
    setStats((current) => localHumorStatsAdapter.voteItem(current, itemId, delta));
  }

  function markViewed(itemId: string) {
    setStudyState((current) => localHumorStudyAdapter.markViewed(current, itemId));
  }

  function toggleSaved(itemId: string) {
    setStudyState((current) => localHumorStudyAdapter.toggleSaved(current, itemId));
  }

  function setFilter(filterId: HumorFilterId) {
    setActiveFilter(filterId);
    setVisibleItemCount(INITIAL_VISIBLE_ITEM_COUNT);
  }

  const popularitySortedItems = [...items].sort((left, right) => {
    const leftStats = getItemStats(left.id);
    const rightStats = getItemStats(right.id);
    const leftScore = getItemPopularityScore(leftStats.views, leftStats.votes);
    const rightScore = getItemPopularityScore(rightStats.views, rightStats.votes);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return items.findIndex((item) => item.id === left.id) - items.findIndex((item) => item.id === right.id);
  });

  const reversedItems = [...items].reverse();
  const filterDefinitions: Record<HumorFilterId, typeof items> = {
    all: items,
    meme: items.filter((item) => item.type === "meme"),
    joke: items.filter((item) => item.type === "joke"),
    anecdote: items.filter((item) => item.type === "anecdote"),
    popular: popularitySortedItems,
    new: reversedItems,
    short: items.filter((item) => item.greek.length <= 34 || item.translation.length <= 42)
  };
  const filteredItems = filterDefinitions[activeFilter];
  const visibleItems = filteredItems.slice(0, visibleItemCount);
  const activeItem = visibleItems.find((item) => item.id === openedId) ?? visibleItems[0] ?? filteredItems[0];
  const activeIndex = activeItem ? filteredItems.findIndex((item) => item.id === activeItem.id) : -1;
  const nextItem =
    activeIndex >= 0 && activeIndex + 1 < filteredItems.length ? filteredItems[activeIndex + 1] : filteredItems[0] ?? null;
  const nextStudyItem = filteredItems.find((item) => !isViewed(item.id)) ?? filteredItems[0] ?? null;
  const similarItem =
    activeItem == null
      ? null
      : items.find((candidate) => {
          if (candidate.id === activeItem.id || candidate.type !== activeItem.type) {
            return false;
          }

          const activeTheme = getPrimaryTheme(activeItem);
          const candidateTheme = getPrimaryTheme(candidate);

          return activeTheme != null && candidateTheme != null ? activeTheme === candidateTheme : true;
        }) ?? null;

  return (
    <div className="stack">
      <section className="panel page-banner track-language humor-banner">
        <div className="humor-banner-copy">
          <p className="eyebrow">Греческий юмор</p>
          <h1>Греческий юмор и мемы для изучения языка</h1>
          <p className="section-copy">
            Откройте один материал, разберите, как он звучит и почему он смешной, а потом сохраните его в повторение.
          </p>
        </div>
        <div className="humor-banner-actions">
          <button
            className="primary-button"
            onClick={() => {
              if (nextStudyItem) {
                openItem(nextStudyItem.id);
              }
            }}
            type="button"
          >
            Открыть следующий материал
          </button>
          <p className="muted">
            {visibleItems.length} из {filteredItems.length} в текущей ленте · всего {HUMOR_ITEM_COUNT} материалов
          </p>
        </div>
        <div className="humor-filter-row" role="tablist" aria-label="Фильтры юмора">
          {HUMOR_FILTERS.map((filter) => (
            <button
              aria-pressed={filter.id === activeFilter}
              className={filter.id === activeFilter ? "humor-filter-chip humor-filter-chip-active" : "humor-filter-chip"}
              key={filter.id}
              onClick={() => setFilter(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="actions-row">
          <Link className="secondary-link-button" to="/lessons?stage=a1&source=humor">
            Вернуться к урокам
          </Link>
          <Link className="secondary-link-button" to="/trails">
            Открыть маршруты
          </Link>
        </div>
      </section>

      <section className="study-layout humor-layout">
        <section className="panel study-main-panel humor-list-panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Лента</p>
              <h2>Подборка для разбора</h2>
              <p className="section-copy">
                Слева остаётся только выбор материала. Главный разбор и действия всегда находятся справа.
              </p>
            </div>
            <span className="meta-pill">{filteredItems.length} материалов</span>
          </div>

          <div className="humor-list">
            {visibleItems.map((item) => {
              const itemStats = getItemStats(item.id);
              return (
                <button
                  className={
                    item.id === activeItem?.id
                      ? "humor-list-item humor-list-item-active"
                      : "humor-list-item"
                  }
                  key={item.id}
                  onClick={() => openItem(item.id)}
                  type="button"
                >
                  <div className="humor-list-top">
                    <span className="chip">{item.type}</span>
                    <div className="humor-list-status">
                      {isSaved(item.id) ? <span className="meta-pill meta-pill-success">в повторении</span> : null}
                      {isViewed(item.id) ? <span className="meta-pill">разобрано</span> : null}
                    </div>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="humor-list-hook">{item.hook}</p>
                  <div className="humor-list-meta">
                    {item.variants && item.variants.length > 1 ? <span>{item.variants.length} варианта</span> : null}
                    <span>{itemStats.views} просмотров</span>
                    <span>{itemStats.votes} голосов</span>
                  </div>
                </button>
              );
            })}
          </div>
          {visibleItems.length < filteredItems.length ? (
            <button
              className="secondary-button humor-show-more-button"
              onClick={() => setVisibleItemCount((current) => current + VISIBLE_ITEM_STEP)}
              type="button"
            >
              Показать ещё
            </button>
          ) : null}
        </section>

        {activeItem ? (
          <section className="panel study-sticky-panel humor-detail-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Разбор</p>
                <h2>{activeItem.title}</h2>
                <p className="section-copy">{activeItem.hook}</p>
              </div>
              <div className="meta-inline">
                <span className="chip">{activeItem.type}</span>
                {isSaved(activeItem.id) ? <span className="meta-pill meta-pill-success">в повторении</span> : null}
                {isViewed(activeItem.id) ? <span className="meta-pill">разобрано</span> : null}
              </div>
            </div>

            <article className="study-feature-card humor-hero-card">
              <div className="humor-hero-copy">
                <p className="humor-greek-line">{activeItem.greek}</p>
                <div className="humor-reading-block">
                  <span className="humor-detail-label">Как читать</span>
                  <p className="muted">{activeItem.transliteration}</p>
                </div>
                <div className="humor-reading-block">
                  <span className="humor-detail-label">Смысл</span>
                  <p className="humor-translation">{activeItem.translation}</p>
                </div>
              </div>
              <div className="study-action-card humor-actions-card">
                <button className="primary-button" onClick={() => toggleSaved(activeItem.id)} type="button">
                  {isSaved(activeItem.id) ? "Убрать из повторения" : "В повторение"}
                </button>
                <button
                  className="secondary-button"
                  disabled={isViewed(activeItem.id)}
                  onClick={() => markViewed(activeItem.id)}
                  type="button"
                >
                  {isViewed(activeItem.id) ? "Уже разобрано" : "Отметить как разобранное"}
                </button>
                <div className="actions-row humor-vote-row">
                  <button className="secondary-button" onClick={() => voteItem(activeItem.id, -1)} type="button">
                    Не зашло
                  </button>
                  <button className="secondary-button" onClick={() => voteItem(activeItem.id, 1)} type="button">
                    Сохранить как удачное
                  </button>
                </div>
                <div className="actions-row humor-next-row">
                  <button
                    className="secondary-button"
                    disabled={similarItem == null}
                    onClick={() => {
                      if (similarItem) {
                        openItem(similarItem.id);
                      }
                    }}
                    type="button"
                  >
                    Открыть похожее
                  </button>
                  <button
                    className="primary-button"
                    disabled={nextItem == null}
                    onClick={() => {
                      if (nextItem) {
                        openItem(nextItem.id);
                      }
                    }}
                    type="button"
                  >
                    Следующий материал
                  </button>
                </div>
              </div>
            </article>

            <div className="content-block-list">
              {activeItem.variants && activeItem.variants.length > 1 ? (
                <article className="content-block-card">
                  <h3>Варианты этой реплики</h3>
                  <div className="humor-variant-list">
                    {activeItem.variants.map((variant) => (
                      <div className="humor-variant-item" key={`${activeItem.id}-${variant.greek}`}>
                        <strong>{variant.greek}</strong>
                        <span className="muted">{variant.transliteration}</span>
                        <span>{variant.title}</span>
                      </div>
                    ))}
                  </div>
                </article>
              ) : null}
              <article className="content-block-card">
                <h3>Почему это смешно</h3>
                <p>{activeItem.humorNote}</p>
              </article>
              <article className="content-block-card">
                <h3>Что это даёт для языка</h3>
                <p>{activeItem.explanation}</p>
              </article>
              <article className="content-block-card">
                <h3>Культурный угол</h3>
                <p>{activeItem.cultureAngle}</p>
              </article>
            </div>
          </section>
        ) : null}
      </section>
    </div>
  );
}
