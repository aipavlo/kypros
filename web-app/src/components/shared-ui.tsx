import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type TrailIconName =
  | "arrow"
  | "chat"
  | "civic"
  | "compass"
  | "document"
  | "laurel"
  | "map"
  | "spark";

type TrailMiniArtName =
  | "amphora"
  | "archive"
  | "columns"
  | "flag"
  | "island"
  | "island_map"
  | "market"
  | "mosaic"
  | "olive"
  | "road"
  | "script"
  | "speech"
  | "stamp"
  | "steps"
  | "sunrise"
  | "taverna"
  | "timeline"
  | "waves";

type TrailTone = "history" | "language" | "mixed";

type TrailIconProps = {
  icon: TrailIconName | string;
};

type TrailMiniArtProps = {
  art: TrailMiniArtName | string;
  tone: string;
};

type StatCardProps = {
  label: string;
  value: string | number;
  to?: string;
  hint?: string;
};

type ActionCardProps = {
  to: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
};

type LessonPreviewCardProps = {
  id: string;
  order: number;
  title: string;
  objective: string;
  difficulty: string;
  estimatedMinutes: number;
  meta?: string;
  completed?: boolean;
};

type TrailStepCardProps = {
  step: number;
  title: string;
  description: string;
  lessonCount: number;
  completedCount: number;
  nextLabel?: string;
  to: string;
  locked?: boolean;
  badgeLabel?: string;
  badgeEarned?: boolean;
};

type TrailLessonItemProps = {
  id: string;
  order: number;
  title: string;
  objective: string;
  difficulty: string;
  estimatedMinutes: number;
  completed?: boolean;
  variant?: "default" | "compact";
};

type TrailBadgeProps = {
  icon: TrailIconName | string;
  tone: string;
  label: string;
};

type InfographicCardProps = {
  icon: TrailIconName | string;
  tone: TrailTone;
  title: string;
  metric: string;
  description: string;
  to?: string;
  actionLabel?: string;
};

const TRAIL_ART_VARIANTS: Record<string, ReactNode> = {
  sunrise: (
    <>
      <circle cx="42" cy="34" r="15" className="trail-art-accent" />
      <path d="M12 78h156" className="trail-art-line" />
      <path d="M28 78c16-18 34-28 56-28 24 0 38 16 68 28" className="trail-art-shape" />
    </>
  ),
  steps: (
    <>
      <rect x="20" y="62" width="32" height="16" rx="4" className="trail-art-shape" />
      <rect x="52" y="48" width="32" height="30" rx="4" className="trail-art-shape" />
      <rect x="84" y="34" width="32" height="44" rx="4" className="trail-art-shape" />
      <rect x="116" y="20" width="32" height="58" rx="4" className="trail-art-shape" />
    </>
  ),
  columns: (
    <>
      <path d="M26 30h128M20 78h140" className="trail-art-line" />
      <path d="M36 32v44M64 32v44M92 32v44M120 32v44M148 32v44" className="trail-art-shape" />
    </>
  ),
  flag: (
    <>
      <path d="M30 18v60" className="trail-art-line" />
      <path d="M34 20c18 4 34-10 52-4 15 5 22 0 30-4v34c-10 6-17 10-30 6-18-6-34 8-52 4Z" className="trail-art-shape" />
    </>
  ),
  waves: (
    <>
      <path d="M16 34c18 0 18 12 36 12s18-12 36-12 18 12 36 12 18-12 36-12" className="trail-art-line" />
      <path d="M16 58c18 0 18 12 36 12s18-12 36-12 18 12 36 12 18-12 36-12" className="trail-art-line" />
      <path d="M24 78c16-16 28-26 46-26 12 0 24 5 38 14 18 12 26 12 48 12" className="trail-art-shape" />
    </>
  ),
  island: (
    <>
      <path d="M22 60c22-20 38-28 66-26 22 2 40 14 68 28-22 14-48 20-78 18-20-2-38-8-56-20Z" className="trail-art-shape" />
      <path d="M18 78h144" className="trail-art-line" />
      <circle cx="130" cy="26" r="10" className="trail-art-accent" />
    </>
  ),
  market: (
    <>
      <path d="M18 38h144" className="trail-art-line" />
      <path d="M22 38c4-16 14-24 26-24s18 8 24 24c6-16 14-24 26-24s18 8 24 24c6-16 14-24 26-24s22 10 28 24" className="trail-art-shape" />
      <path d="M30 42v30M72 42v30M114 42v30M150 42v30" className="trail-art-line" />
    </>
  ),
  archive: (
    <>
      <rect x="22" y="24" width="40" height="18" rx="4" className="trail-art-shape" />
      <rect x="22" y="48" width="40" height="18" rx="4" className="trail-art-shape" />
      <rect x="72" y="24" width="86" height="42" rx="6" className="trail-art-shape" />
      <path d="M84 38h50M84 50h36" className="trail-art-line" />
    </>
  ),
  mosaic: (
    <>
      <rect x="24" y="20" width="28" height="24" rx="4" className="trail-art-shape" />
      <rect x="56" y="20" width="40" height="24" rx="4" className="trail-art-shape" />
      <rect x="100" y="20" width="22" height="24" rx="4" className="trail-art-shape" />
      <rect x="126" y="20" width="30" height="24" rx="4" className="trail-art-shape" />
      <rect x="24" y="48" width="38" height="28" rx="4" className="trail-art-shape" />
      <rect x="66" y="48" width="26" height="28" rx="4" className="trail-art-shape" />
      <rect x="96" y="48" width="60" height="28" rx="4" className="trail-art-shape" />
    </>
  ),
  olive: (
    <>
      <path d="M88 20v54" className="trail-art-line" />
      <path d="M88 34c-18-18-34-18-52-4M88 46c16-14 30-18 48-8M88 56c-18 8-30 18-42 28M88 58c18 4 32 12 46 26" className="trail-art-line" />
      <ellipse cx="44" cy="28" rx="10" ry="5" className="trail-art-accent" />
      <ellipse cx="138" cy="38" rx="10" ry="5" className="trail-art-accent" />
    </>
  ),
  script: (
    <>
      <path d="M22 28h136v44H22z" className="trail-art-shape" />
      <path d="M36 42c12-8 24 8 36 0 10-6 20 6 32-2 12-8 18 10 36 2" className="trail-art-line" />
      <path d="M36 56h84M36 64h54" className="trail-art-line" />
    </>
  ),
  speech: (
    <>
      <path d="M20 24h68a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H54l-12 10v-10H20a8 8 0 0 1-8-8V32a8 8 0 0 1 8-8Z" className="trail-art-shape" />
      <path d="M108 38h42a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-16l-10 8v-8h-16a8 8 0 0 1-8-8V46a8 8 0 0 1 8-8Z" className="trail-art-shape" />
    </>
  ),
  taverna: (
    <>
      <path d="M28 30h124" className="trail-art-line" />
      <path d="M44 30v46M136 30v46" className="trail-art-line" />
      <path d="M52 76c10-20 18-28 38-28s30 8 38 28" className="trail-art-shape" />
      <path d="M86 26v18" className="trail-art-line" />
    </>
  ),
  island_map: (
    <>
      <path d="M18 66c20-18 42-28 72-28 28 0 48 10 72 24-18 16-44 24-78 22-24-2-46-8-66-18Z" className="trail-art-shape" />
      <path d="M22 78h136" className="trail-art-line" />
      <path d="M92 28v34M74 44h36" className="trail-art-line" />
    </>
  ),
  stamp: (
    <>
      <rect x="34" y="20" width="84" height="52" rx="8" className="trail-art-shape" />
      <path d="M48 34h56M48 46h38M48 58h46" className="trail-art-line" />
      <circle cx="136" cy="58" r="14" className="trail-art-accent" />
    </>
  ),
  amphora: (
    <>
      <path d="M72 18h36M84 18v12c0 6-8 10-8 20 0 18 10 30 14 36M96 18v12c0 6 8 10 8 20 0 18-10 30-14 36" className="trail-art-shape" />
      <path d="M76 32c-10-8-18-6-24 8M104 32c10-8 18-6 24 8" className="trail-art-line" />
    </>
  ),
  road: (
    <>
      <path d="M30 78c14-34 30-52 60-52s42 18 60 52" className="trail-art-shape" />
      <path d="M90 24v52" className="trail-art-line" />
      <path d="M90 30v8M90 46v8M90 62v8" className="trail-art-line" />
    </>
  ),
  timeline: (
    <>
      <path d="M24 54h132" className="trail-art-line" />
      <circle cx="36" cy="54" r="8" className="trail-art-accent" />
      <circle cx="76" cy="54" r="8" className="trail-art-accent" />
      <circle cx="116" cy="54" r="8" className="trail-art-accent" />
      <circle cx="148" cy="54" r="8" className="trail-art-accent" />
      <path d="M36 24v18M76 18v24M116 28v14M148 20v22" className="trail-art-line" />
    </>
  )
};

export function TrailIcon({ icon }: TrailIconProps) {
  switch (icon) {
    case "chat":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="M14 18h36a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H31l-11 8v-8h-6a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8Z" />
        </svg>
      );
    case "document":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="M20 8h18l14 14v30a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" />
          <path d="M38 8v16h16" />
          <path d="M24 30h16M24 38h16M24 46h10" />
        </svg>
      );
    case "laurel":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="M24 48c-10-4-14-16-10-28 10 4 14 16 10 28Z" />
          <path d="M40 48c10-4 14-16 10-28-10 4-14 16-10 28Z" />
          <path d="M32 20v28" />
        </svg>
      );
    case "civic":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="M10 26 32 14l22 12" />
          <path d="M16 26h32v24H16z" />
          <path d="M22 30v20M32 30v20M42 30v20M12 54h40" />
        </svg>
      );
    case "arrow":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="M12 46c10-18 22-28 40-30" />
          <path d="m40 10 12 6-10 10" />
        </svg>
      );
    case "spark":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="m32 10 4 14 14 4-14 4-4 14-4-14-14-4 14-4 4-14Z" />
        </svg>
      );
    case "compass":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="22" />
          <path d="m38 26-4 12-12 4 4-12 12-4Z" />
        </svg>
      );
    case "map":
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <path d="M10 18 24 12l16 6 14-6v34l-14 6-16-6-14 6Z" />
          <path d="M24 12v34M40 18v34" />
        </svg>
      );
    default:
      return (
        <svg aria-hidden="true" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="18" />
        </svg>
      );
  }
}

export function TrailMiniArt({ art, tone }: TrailMiniArtProps) {
  return (
    <div className={`trail-mini-art trail-mini-art-${tone}`}>
      <svg aria-hidden="true" viewBox="0 0 180 100">
        {TRAIL_ART_VARIANTS[art] ?? null}
      </svg>
    </div>
  );
}

export function StatCard({ hint, label, to, value }: StatCardProps) {
  if (to) {
    return (
      <Link className="stat-card stat-card-link" to={to}>
        <p>{label}</p>
        <strong>{value}</strong>
        <span className="stat-card-hint">{hint ?? "Открыть раздел"}</span>
      </Link>
    );
  }

  return (
    <article className="stat-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {hint ? <span className="stat-card-hint">{hint}</span> : null}
    </article>
  );
}

export function ActionCard({ actionLabel, description, eyebrow, title, to }: ActionCardProps) {
  return (
    <Link className="action-card" to={to}>
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="action-link">{actionLabel}</span>
    </Link>
  );
}

export function LessonPreviewCard({
  completed,
  difficulty,
  estimatedMinutes,
  id,
  meta,
  objective,
  order,
  title
}: LessonPreviewCardProps) {
  return (
    <Link className="lesson-preview-card" to={`/lessons/${id}`}>
      {meta ? <p className="eyebrow">{meta}</p> : null}
      <div className="lesson-preview-top">
        <span className="lesson-order-badge">{order}</span>
        <h3>{title}</h3>
      </div>
      <div className="lesson-preview-meta">
        <span className="chip">{difficulty.toUpperCase()}</span>
        <span className="meta-pill">{estimatedMinutes} min</span>
        {completed ? <span className="meta-pill meta-pill-success">Пройдено</span> : null}
      </div>
      <p>{objective}</p>
      <div className="lesson-preview-footer">
        <span>{completed ? "Повторить урок" : "Открыть урок"}</span>
        <span className="action-link">{completed ? "Повторить" : "Продолжить"}</span>
      </div>
    </Link>
  );
}

export function TrailStepCard({
  badgeEarned,
  badgeLabel,
  completedCount,
  description,
  lessonCount,
  locked,
  nextLabel,
  step,
  title,
  to
}: TrailStepCardProps) {
  const progressPercent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const progressLabel = locked ? "Недоступен" : `${progressPercent}% пройдено`;
  const stepStatusCopy = locked
    ? "Сначала заверши предыдущий модуль"
    : `${completedCount} из ${lessonCount} уроков пройдено`;

  return (
    <Link
      className={locked ? "trail-step-card trail-step-card-locked" : "trail-step-card"}
      to={locked ? "#" : to}
      onClick={(event) => {
        if (locked) {
          event.preventDefault();
        }
      }}
    >
      <div className="trail-step-top">
        <span className="trail-step-number">Шаг {step}</span>
        <span className={locked ? "meta-pill" : "meta-pill meta-pill-success"}>{progressLabel}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <p className="muted">{stepStatusCopy}</p>
      <div className="progress-rail module-progress-rail">
        <span className="progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>
      {badgeLabel ? (
        <div className="trail-badge-row">
          <span className={badgeEarned ? "badge-chip badge-chip-earned" : "badge-chip"}>
            {badgeEarned ? badgeLabel : `Будет доступен: ${badgeLabel}`}
          </span>
        </div>
      ) : null}
      <div className="trail-step-footer">
        <span>{nextLabel ?? "Перейти к модулю"}</span>
        <span className="action-link">Перейти</span>
      </div>
    </Link>
  );
}

export function TrailLessonItem({
  completed,
  difficulty,
  estimatedMinutes,
  id,
  objective,
  order,
  title,
  variant = "default"
}: TrailLessonItemProps) {
  return (
    <Link className={`trail-lesson-item trail-lesson-item-${variant}`} to={`/lessons/${id}`}>
      <div className="trail-lesson-side">
        <span className="lesson-order-badge lesson-order-badge-large">{order}</span>
      </div>
      <div className="trail-lesson-body">
        <div className="trail-lesson-head">
          <h3>{title}</h3>
          <div className="lesson-preview-meta">
            <span className="chip">{difficulty.toUpperCase()}</span>
            <span className="meta-pill">{estimatedMinutes} min</span>
            {completed ? <span className="meta-pill meta-pill-success">Пройдено</span> : null}
          </div>
        </div>
        <p>{objective}</p>
        <div className="trail-lesson-footer">
          <span>{completed ? "Повторить урок" : "Следующий шаг"}</span>
          <span className="action-link">{completed ? "Повторить шаг" : "Начать шаг"}</span>
        </div>
      </div>
    </Link>
  );
}

export function TrailBadge({ icon, label, tone }: TrailBadgeProps) {
  return (
    <div className={`trail-badge trail-badge-${tone}`}>
      <span className="trail-badge-icon" aria-hidden="true">
        <TrailIcon icon={icon} />
      </span>
      <span className="trail-badge-label">{label}</span>
    </div>
  );
}

export function InfographicCard({
  actionLabel,
  description,
  icon,
  metric,
  title,
  to,
  tone
}: InfographicCardProps) {
  const content = (
    <>
      <div className="infographic-top">
        <span className="trail-badge-icon" aria-hidden="true">
          <TrailIcon icon={icon} />
        </span>
        <span className="meta-pill">{metric}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {to ? <span className="action-link">{actionLabel ?? "Перейти"}</span> : null}
    </>
  );

  if (to) {
    return (
      <Link
        className={`infographic-card infographic-card-${tone} infographic-card-link`}
        to={to}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={`infographic-card infographic-card-${tone}`}>
      {content}
    </article>
  );
}
