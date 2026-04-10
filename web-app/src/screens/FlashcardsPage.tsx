import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getLessonById,
  getModuleById
} from "@/src/content/catalogData";
import {
  getFlashcardsByLesson,
  getFlashcardsByModule,
  getFlashcardsByTrack
} from "@/src/content/flashcardData";
import { getSentenceReviewPackByLesson } from "@/src/content/sentenceReview";
import { getFlashcardPronunciation } from "@/src/content/transliteration";
import type { FlashcardItem } from "@/src/content/types";
import { getModuleStage } from "@/src/content/presentation";
import {
  getModuleNextLearningAction,
  getModuleProgressKey,
  hasModuleProgress
} from "@/src/content/progress";

type FlashcardsPageProps = {
  completedLessonIds: string[];
  reviewedModuleIds: string[];
  passedModuleQuizIds: string[];
  onMarkModuleReviewed: (moduleId: string) => void;
};

type FlashcardStudyState = "new" | "again_later" | "known" | "difficult";

const STUDY_STATE_LABELS: Record<FlashcardStudyState, string> = {
  again_later: "Повторить позже",
  difficult: "Сложная",
  known: "Знаю",
  new: "Новая"
};

const STUDY_STATE_ACTIONS: Array<{
  className: string;
  label: string;
  nextState: FlashcardStudyState;
}> = [
  { className: "flashcard-mark-button flashcard-mark-button-warning", label: "Сложное слово", nextState: "difficult" },
  { className: "flashcard-mark-button", label: "Повторить позже", nextState: "again_later" },
  { className: "flashcard-mark-button flashcard-mark-button-success", label: "Знаю", nextState: "known" }
];

const SENTENCE_EXERCISE_TYPE_LABELS = {
  cloze: "Заполни пропуск",
  rebuild: "Собери фразу"
} as const;

function getSessionScope(
  cards: FlashcardItem[],
  selectedTrack: "greek_b1" | "cyprus_reality",
  requestedLessonTitle?: string,
  requestedModuleTitle?: string
) {
  if (requestedLessonTitle) {
    return {
      description: `В этой сессии ${cards.length} карточек по текущему уроку.`,
      eyebrow: "Набор урока",
      title: requestedLessonTitle
    };
  }

  if (requestedModuleTitle) {
    return {
      description: `В этой сессии ${cards.length} карточек по текущему модулю.`,
      eyebrow: "Набор модуля",
      title: requestedModuleTitle
    };
  }

  return selectedTrack === "cyprus_reality"
    ? {
        description: `В этой сессии ${cards.length} карточек по датам, институтам и ключевым фактам о Кипре.`,
        eyebrow: "Трек карточек",
        title: "Cyprus Reality"
      }
    : {
        description: `В этой сессии ${cards.length} карточек по словам, фразам и формулировкам для повседневного греческого.`,
        eyebrow: "Трек карточек",
        title: "Греческий язык"
      };
}

export function FlashcardsPage(props: FlashcardsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTrack = searchParams.get("track");
  const requestedLessonId = searchParams.get("lesson");
  const requestedModuleId = searchParams.get("module");
  const requestedSource = searchParams.get("source");
  const requestedTrailId = searchParams.get("trail");
  const requestedLesson = requestedLessonId ? getLessonById(requestedLessonId) : undefined;
  const isLessonFlow = requestedSource === "lesson" && Boolean(requestedLessonId);
  const trackFromParams =
    requestedTrack === "cyprus_reality" || requestedTrack === "greek_b1"
      ? requestedTrack
      : requestedLesson?.trackId === "cyprus_reality"
        ? "cyprus_reality"
        : "greek_b1";
  const [selectedTrack, setSelectedTrack] = useState<"greek_b1" | "cyprus_reality">(
    trackFromParams
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [cardStudyStates, setCardStudyStates] = useState<Record<string, FlashcardStudyState>>({});
  const [visitedCardIds, setVisitedCardIds] = useState<string[]>([]);
  const scopedCards = requestedLessonId
    ? getFlashcardsByLesson(requestedLessonId)
    : requestedModuleId
      ? getFlashcardsByModule(requestedModuleId)
      : [];
  const activeModuleId = requestedModuleId ?? requestedLesson?.moduleId ?? null;
  const activeModule = activeModuleId ? getModuleById(activeModuleId) : undefined;
  const activeModuleStageId =
    activeModuleId && activeModule?.trackId === "greek_b1" ? getModuleStage(activeModuleId) : undefined;
  const activeModuleProgressId =
    activeModuleId && activeModule
      ? getModuleProgressKey(activeModuleId, activeModule.trackId, activeModuleStageId)
      : null;
  const isModuleReviewMarked =
    activeModuleId && activeModule
      ? hasModuleProgress(
          props.reviewedModuleIds,
          activeModuleId,
          activeModule.trackId,
          activeModuleStageId
        )
      : false;
  const activeModuleQuizLink = activeModuleId
    ? activeModule?.trackId === "cyprus_reality"
      ? `/quiz?mode=mode_cyprus_reality&module=${activeModuleId}${requestedLessonId ? `&lesson=${requestedLessonId}` : ""}${isLessonFlow ? "&source=lesson" : ""}${requestedTrailId ? `&trail=${requestedTrailId}` : ""}`
      : `/quiz?mode=mode_greek_${getModuleStage(activeModuleId)}&module=${activeModuleId}${requestedLessonId ? `&lesson=${requestedLessonId}` : ""}${isLessonFlow ? "&source=lesson" : ""}${requestedTrailId ? `&trail=${requestedTrailId}` : ""}`
    : "/quiz";
  const activeLoopAction =
    activeModuleId && activeModule
      ? getModuleNextLearningAction(
          activeModuleId,
          props.completedLessonIds,
          props.reviewedModuleIds,
          props.passedModuleQuizIds,
          activeModule.trackId,
          activeModuleStageId
        )
      : null;
  const cards = scopedCards.length > 0 ? scopedCards : getFlashcardsByTrack(selectedTrack);
  const safeActiveIndex = activeIndex >= cards.length ? 0 : activeIndex;
  const activeCard = cards[safeActiveIndex];
  const activeCardState = activeCard ? cardStudyStates[activeCard.id] ?? "new" : "new";
  const activeCardPronunciation = activeCard
    ? getFlashcardPronunciation(activeCard, { includeStress: true })
    : null;
  const knownCardCount = cards.filter((card) => cardStudyStates[card.id] === "known").length;
  const againLaterCardCount = cards.filter((card) => cardStudyStates[card.id] === "again_later").length;
  const difficultCardCount = cards.filter((card) => cardStudyStates[card.id] === "difficult").length;
  const studiedCardCount = cards.filter((card) => (cardStudyStates[card.id] ?? "new") !== "new").length;
  const visitedCardCount = cards.filter((card) => visitedCardIds.includes(card.id)).length;
  const sessionProgressPercent = cards.length > 0 ? Math.round((visitedCardCount / cards.length) * 100) : 0;
  const masteryProgressPercent = cards.length > 0 ? Math.round((knownCardCount / cards.length) * 100) : 0;
  const sessionScope = getSessionScope(cards, selectedTrack, requestedLesson?.title, activeModule?.title);
  const lessonBackLink = requestedLessonId
    ? `/lessons/${requestedLessonId}?${new URLSearchParams(
        Object.fromEntries(
          [
            requestedSource ? ["source", requestedSource] : null,
            requestedTrailId ? ["trail", requestedTrailId] : null
          ].filter((entry): entry is [string, string] => Boolean(entry))
        )
      ).toString()}`
    : "/lessons";
  const sentenceReviewPack =
    selectedTrack === "greek_b1" && requestedLessonId
      ? getSentenceReviewPackByLesson(requestedLessonId)
      : undefined;
  const [revealedSentenceIds, setRevealedSentenceIds] = useState<string[]>([]);
  const [selectedSentenceOptions, setSelectedSentenceOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedTrack(trackFromParams);
  }, [trackFromParams]);

  useEffect(() => {
    setActiveIndex(0);
    setRevealed(false);
    setVisitedCardIds(cards[0] ? [cards[0].id] : []);
  }, [selectedTrack, requestedLessonId, requestedModuleId]);

  useEffect(() => {
    setRevealedSentenceIds([]);
    setSelectedSentenceOptions({});
  }, [requestedLessonId, requestedModuleId, selectedTrack]);

  useEffect(() => {
    if (!activeCard) {
      return;
    }

    setVisitedCardIds((current) =>
      current.includes(activeCard.id) ? current : [...current, activeCard.id]
    );
  }, [activeCard]);

  function selectTrack(trackId: "greek_b1" | "cyprus_reality") {
    setSelectedTrack(trackId);
    setSearchParams({ track: trackId });
  }

  function goNext() {
    setActiveIndex((prev) => (prev + 1) % cards.length);
    setRevealed(false);
  }

  function goPrev() {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    setRevealed(false);
  }

  function openCard(cardIndex: number) {
    setActiveIndex(cardIndex);
    setRevealed(false);
  }

  function setCardStudyState(nextState: FlashcardStudyState) {
    if (!activeCard) {
      return;
    }

    setCardStudyStates((current) => ({
      ...current,
      [activeCard.id]: nextState
    }));
  }

  function toggleSentenceAnswer(exerciseId: string) {
    setRevealedSentenceIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId]
    );
  }

  function selectSentenceOption(exerciseId: string, option: string) {
    setSelectedSentenceOptions((current) => ({
      ...current,
      [exerciseId]: option
    }));
  }

  if (cards.length === 0) {
    return (
      <section className="panel page-banner">
        <p className="eyebrow">Карточки</p>
        <h2>Карточки пока не найдены</h2>
        <p className="section-copy">
          Для этой программы пока нет набора карточек. Можно вернуться к урокам или к проверке.
        </p>
      </section>
    );
  }

  return (
    <div className="stack">
      <section className="panel flashcards-focus-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Карточки</p>
            <h2>{selectedTrack === "greek_b1" ? "Быстрое повторение по греческому" : "Быстрое повторение по Cyprus Reality"}</h2>
            {isLessonFlow && requestedLesson ? (
              <p className="trail-note">
                Вы в шаге урока {requestedLesson.order}: <strong>{requestedLesson.title}</strong>.
              </p>
            ) : null}
          </div>
          <div className="flashcards-head-pills">
            <span className="meta-pill meta-pill-strong">{safeActiveIndex + 1} / {cards.length}</span>
            <span className="meta-pill">{STUDY_STATE_LABELS[activeCardState]}</span>
          </div>
        </div>

        <div className="stage-switcher" role="tablist" aria-label="Трек карточек">
          <button
            aria-selected={selectedTrack === "greek_b1"}
            className={selectedTrack === "greek_b1" ? "stage-chip stage-chip-active" : "stage-chip"}
            onClick={() => selectTrack("greek_b1")}
            role="tab"
            type="button"
          >
            Греческий язык
          </button>
          <button
            aria-selected={selectedTrack === "cyprus_reality"}
            className={selectedTrack === "cyprus_reality" ? "stage-chip stage-chip-active" : "stage-chip"}
            onClick={() => selectTrack("cyprus_reality")}
            role="tab"
            type="button"
          >
            Cyprus Reality
          </button>
        </div>

        <div className="study-layout flashcards-focus-layout">
          <div className="study-main-panel flashcards-main-column">
            <div className="flashcards-session-bar">
              <article className="flashcards-session-card flashcards-session-card-primary">
                <p className="eyebrow">{sessionScope.eyebrow}</p>
                <h3>{sessionScope.title}</h3>
                <p>{sessionScope.description}</p>
              </article>
              <article className="flashcards-session-card">
                <strong>По сессии</strong>
                <p>{sessionProgressPercent}% пройдено</p>
                <div className="progress-rail progress-rail-compact">
                  <span className="progress-fill" style={{ width: `${sessionProgressPercent}%` }} />
                </div>
              </article>
              <article className="flashcards-session-card">
                <strong>По закреплению</strong>
                <p>{masteryProgressPercent}% уже закреплено</p>
                <div className="progress-rail progress-rail-compact">
                  <span className="progress-fill" style={{ width: `${masteryProgressPercent}%` }} />
                </div>
              </article>
            </div>

            <article className="flashcards-focus-shell">
              <div className="section-head">
                <div>
                  <p className="eyebrow">Текущая карточка</p>
                  <h2>Один шаг повторения без лишнего шума</h2>
                  <p className="section-copy">
                    Сначала попробуй ответить, потом открой обратную сторону и сразу зафиксируй статус карточки.
                  </p>
                </div>
                <div className="flashcards-focus-meta">
                  <span className="meta-pill meta-pill-strong">{safeActiveIndex + 1} / {cards.length}</span>
                  <span className={`flashcard-state-pill flashcard-state-pill-${activeCardState}`}>
                    {STUDY_STATE_LABELS[activeCardState]}
                  </span>
                </div>
              </div>

              <button className="flashcard flashcard-focus" onClick={() => setRevealed((value) => !value)} type="button">
                <div className="flashcard-topline">
                  <p className="chip">{activeCard.difficulty.toUpperCase()}</p>
                  <span className={`flashcard-state-pill flashcard-state-pill-${activeCardState}`}>
                    {STUDY_STATE_LABELS[activeCardState]}
                  </span>
                </div>
                <p className="flashcard-face-label">{revealed ? "Ответ" : "Вопрос"}</p>
                <h3>{revealed ? activeCard.back : activeCard.front}</h3>
                {activeCardPronunciation ? (
                  <p className="flashcard-pronunciation">Как читать: {activeCardPronunciation}</p>
                ) : null}
                <p className="flashcard-helper-copy">
                  {revealed
                    ? "Ответ открыт. Теперь реши: знаешь карточку, оставить её на потом или отметить как сложную."
                    : "Сначала попробуй ответить сам, потом открой обратную сторону."}
                </p>
              </button>

              <div className="flashcards-primary-actions">
                <button className="primary-button flashcards-next-button" onClick={goNext} type="button">
                  Следующая
                </button>
                <button className="secondary-button flashcards-answer-button" onClick={() => setRevealed((value) => !value)} type="button">
                  {revealed ? "Скрыть ответ" : "Показать ответ"}
                </button>
                <button className="secondary-button flashcards-prev-button" onClick={goPrev} type="button">
                  Предыдущая
                </button>
              </div>

              <div className="flashcards-status-actions flashcards-status-actions-focus">
                {STUDY_STATE_ACTIONS.map((action) => (
                  <button
                    key={action.nextState}
                    className={action.className}
                    onClick={() => setCardStudyState(action.nextState)}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </article>
          </div>

          <aside className="study-sticky-panel flashcards-side-column">
            <article className="study-sidecard flashcards-sidecard flashcards-summary-card">
              <strong>Быстрые статусы</strong>
              <div className="flashcards-metric-list">
                <div className="flashcards-metric-item">
                  <span>Знаю</span>
                  <strong>{knownCardCount}</strong>
                </div>
                <div className="flashcards-metric-item">
                  <span>Повторить позже</span>
                  <strong>{againLaterCardCount}</strong>
                </div>
                <div className="flashcards-metric-item">
                  <span>Сложные</span>
                  <strong>{difficultCardCount}</strong>
                </div>
                <div className="flashcards-metric-item">
                  <span>Уже отмечены</span>
                  <strong>{studiedCardCount}</strong>
                </div>
              </div>
            </article>

            {activeModuleId ? (
              <article className="study-sidecard flashcards-sidecard flashcards-route-card">
                <strong>{isLessonFlow ? "Учебный маршрут урока" : "Связь с модулем"}</strong>
                <p>{activeModule?.title ?? activeModuleId}</p>
                <p className="muted">
                  {isLessonFlow
                    ? "После карточек возвращайся к шагу урока и переходи к мини-проверке."
                    : activeLoopAction?.description ?? "После карточек переходи к следующему учебному шагу модуля."}
                </p>
                <div className="flashcards-side-actions">
                  <button
                    className={isModuleReviewMarked ? "secondary-button" : "primary-button"}
                    disabled={isModuleReviewMarked}
                    onClick={() => activeModuleProgressId && props.onMarkModuleReviewed(activeModuleProgressId)}
                    type="button"
                  >
                    {isModuleReviewMarked ? "Шаг карточек завершён" : "Засчитать карточки"}
                  </button>
                  {isLessonFlow ? (
                    <>
                      <Link className="secondary-link-button" to={activeModuleQuizLink}>
                        Шаг 3. Мини-проверка урока
                      </Link>
                      <Link className="action-link" to={lessonBackLink}>
                        Назад к уроку
                      </Link>
                    </>
                  ) : (
                    <Link className="secondary-link-button" to={activeLoopAction?.to ?? activeModuleQuizLink}>
                      {activeLoopAction?.kind === "quiz"
                        ? "К мини-проверке"
                        : activeLoopAction?.kind === "next_module"
                          ? "К следующему модулю"
                          : activeLoopAction?.title ?? "Продолжить"}
                    </Link>
                  )}
                </div>
              </article>
            ) : null}
          </aside>
        </div>

        {sentenceReviewPack ? (
          <article className="flashcards-library-shell sentence-review-shell">
            <div className="section-head">
              <div>
                <p className="eyebrow">Sentence review</p>
                <h2>Закрепи карточки в коротких фразах перед мини-проверкой</h2>
                <p className="section-copy">
                  Здесь слова уже собираются в рабочие фразы. Это лёгкий bridge между
                  карточками и quiz, чтобы повтор не оставался на уровне отдельных единиц.
                </p>
              </div>
              <div className="flashcards-focus-meta">
                <span className="meta-pill meta-pill-strong">
                  {sentenceReviewPack.exercises.length} упражнения
                </span>
              </div>
            </div>

            <article className="sentence-review-pack">
              <div className="sentence-review-pack-head">
                <div>
                  <strong>{sentenceReviewPack.title}</strong>
                  <p>{sentenceReviewPack.focus}</p>
                </div>
                <span className="meta-pill">{sentenceReviewPack.difficulty.toUpperCase()}</span>
              </div>

              <div className="sentence-review-grid">
                {sentenceReviewPack.exercises.map((exercise, index) => {
                  const selectedOption = selectedSentenceOptions[exercise.id];
                  const isAnswerVisible = revealedSentenceIds.includes(exercise.id);
                  const isCorrectChoice = selectedOption === exercise.answer;

                  return (
                    <article className="sentence-review-card" key={exercise.id}>
                      <div className="sentence-review-card-top">
                        <p className="eyebrow">Шаг {index + 1}</p>
                        <span className="meta-pill">
                          {SENTENCE_EXERCISE_TYPE_LABELS[exercise.type]}
                        </span>
                      </div>
                      <h3>{exercise.prompt}</h3>
                      <p className="muted">{exercise.translation}</p>

                      {exercise.options ? (
                        <div className="sentence-review-options">
                          {exercise.options.map((option) => (
                            <button
                              className={`sentence-review-option ${
                                selectedOption === option ? "sentence-review-option-active" : ""
                              }`}
                              key={option}
                              onClick={() => selectSentenceOption(exercise.id, option)}
                              type="button"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {exercise.parts ? (
                        <div className="sentence-review-parts">
                          {exercise.parts.map((part) => (
                            <span className="chip" key={part}>
                              {part}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {selectedOption ? (
                        <p
                          className={`sentence-review-feedback ${
                            isCorrectChoice
                              ? "sentence-review-feedback-correct"
                              : "sentence-review-feedback-soft"
                          }`}
                        >
                          {isCorrectChoice
                            ? "Хорошо: опорный ответ совпал."
                            : "Неплохо: теперь открой опорный ответ и проговори фразу целиком."}
                        </p>
                      ) : null}

                      {exercise.note ? <p>{exercise.note}</p> : null}

                      {isAnswerVisible ? (
                        <div className="sentence-review-answer">
                          <strong>Опорный ответ</strong>
                          <p>{exercise.answer}</p>
                        </div>
                      ) : null}

                      <button
                        className="secondary-button"
                        onClick={() => toggleSentenceAnswer(exercise.id)}
                        type="button"
                      >
                        {isAnswerVisible ? "Скрыть опорный ответ" : "Показать опорный ответ"}
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="sentence-review-actions">
                <p className="muted">
                  Сначала собери 2-3 фразы вслух, затем переходи к мини-проверке, пока
                  sentence pattern ещё держится в памяти.
                </p>
                <Link className="secondary-link-button" to={activeModuleQuizLink}>
                  К мини-проверке после sentence review
                </Link>
              </div>
            </article>
          </article>
        ) : null}

        <article className="flashcards-library-shell flashcards-library-shell-secondary">
          <div className="section-head">
            <div>
              <p className="eyebrow">Весь набор</p>
              <h2>Библиотека карточек текущей сессии</h2>
              <p className="section-copy">
                Это вторичный слой: быстрые переходы по карточкам и обзор уже отмеченных статусов.
              </p>
            </div>
          </div>
          <div className="flashcards-library-grid">
            {cards.map((card, cardIndex) => {
              const cardState = cardStudyStates[card.id] ?? "new";
              const isActive = cardIndex === safeActiveIndex;
              const cardPronunciation = getFlashcardPronunciation(card, { includeStress: true });

              return (
                <button
                  className={`flashcard-library-item ${isActive ? "flashcard-library-item-active" : ""} flashcard-library-item-${card.difficulty}`}
                  key={card.id}
                  onClick={() => openCard(cardIndex)}
                  type="button"
                >
                  <div className="flashcard-library-top">
                    <span className="chip">{card.difficulty.toUpperCase()}</span>
                    <span className={`flashcard-state-pill flashcard-state-pill-${cardState}`}>
                      {STUDY_STATE_LABELS[cardState]}
                    </span>
                  </div>
                  <strong>{card.front}</strong>
                  {cardPronunciation ? (
                    <p className="flashcard-library-pronunciation">Как читать: {cardPronunciation}</p>
                  ) : null}
                  <p>{card.back}</p>
                  <span className="flashcard-library-index">Карточка {cardIndex + 1}</span>
                </button>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
