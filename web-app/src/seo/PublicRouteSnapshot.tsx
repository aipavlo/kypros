import { getLessonById, getLessonsByTrack, getNextLesson, lessons } from "@/src/content/catalogData";
import { getRouteSeoEntry } from "@/src/seo/siteMetadata";

type PublicRouteSnapshotProps = {
  slug: string[];
};

function getRoutePathFromSlug(slug: string[]) {
  if (slug.length === 0) {
    return "/";
  }

  return `/${slug.join("/")}`;
}

function isIndexableSnapshotRoute(routePath: string) {
  if (routePath.startsWith("/lessons/")) {
    return Boolean(getLessonById(routePath.replace("/lessons/", "")));
  }

  return getRouteSeoEntry(routePath).indexable;
}

function getSnapshotLinks(routePath: string) {
  const firstGreekLesson = getLessonsByTrack("greek_b1")[0];
  const firstCyprusLesson = getLessonsByTrack("cyprus_reality")[0];

  if (routePath === "/") {
    return [
      { href: "/easy-start", label: "Лёгкий старт по греческому" },
      { href: "/phrasebook", label: "Практические бытовые сценарии" },
      { href: "/lessons", label: "Уроки Greek Core" },
      { href: "/cyprus", label: "Программа Cyprus Reality" },
      { href: "/trails", label: "Готовые маршруты" },
      { href: "/humor", label: "Греческий юмор" },
      firstGreekLesson
        ? { href: `/lessons/${firstGreekLesson.id}`, label: firstGreekLesson.title }
        : null,
      firstCyprusLesson
        ? { href: `/lessons/${firstCyprusLesson.id}`, label: firstCyprusLesson.title }
        : null
    ].filter(Boolean) as Array<{ href: string; label: string }>;
  }

  if (routePath === "/easy-start") {
    return [
      ...getLessonsByTrack("greek_b1")
        .slice(0, 3)
        .map((lesson) => ({ href: `/lessons/${lesson.id}`, label: `${lesson.order}. ${lesson.title}` })),
      { href: "/phrasebook", label: "Phrasebook для бытовых фраз" },
      { href: "/trails", label: "Маршруты под конкретную задачу" },
      { href: "/lessons", label: "Вся программа Greek Core" },
      firstCyprusLesson
        ? { href: `/lessons/${firstCyprusLesson.id}`, label: `Первый Cyprus Reality урок: ${firstCyprusLesson.title}` }
        : null
    ].filter(Boolean) as Array<{ href: string; label: string }>;
  }

  if (routePath === "/lessons") {
    return [
      ...getLessonsByTrack("greek_b1")
        .slice(0, 6)
        .map((lesson) => ({ href: `/lessons/${lesson.id}`, label: `${lesson.order}. ${lesson.title}` })),
      { href: "/easy-start", label: "Лёгкий старт для первого шага" },
      { href: "/phrasebook", label: "Phrasebook для быстрых бытовых сценариев" },
      { href: "/trails", label: "Маршруты по задачам" },
      { href: "/cyprus", label: "Cyprus Reality как отдельный трек" }
    ];
  }

  if (routePath === "/phrasebook") {
    return [
      { href: "/easy-start", label: "Лёгкий старт" },
      { href: "/lessons", label: "Основная языковая программа" },
      { href: "/trails", label: "Маршруты по задачам" },
      { href: "/humor", label: "Юмор для короткой практики чтения" },
      firstGreekLesson
        ? { href: `/lessons/${firstGreekLesson.id}`, label: `Первый урок Greek Core: ${firstGreekLesson.title}` }
        : null
    ].filter(Boolean) as Array<{ href: string; label: string }>;
  }

  if (routePath === "/cyprus") {
    return [
      ...getLessonsByTrack("cyprus_reality")
        .slice(0, 6)
        .map((lesson) => ({ href: `/lessons/${lesson.id}`, label: `${lesson.order}. ${lesson.title}` })),
      { href: "/trails", label: "Маршруты с блоком Cyprus Reality" },
      { href: "/lessons", label: "Greek Core для языкового слоя" },
      { href: "/humor", label: "Юмор и культурный контекст" }
    ];
  }

  if (routePath === "/trails") {
    return [
      { href: "/easy-start", label: "Лёгкий старт для первого короткого шага" },
      { href: "/lessons", label: "Lessons для последовательной языковой программы" },
      { href: "/cyprus", label: "Cyprus Reality для отдельного трека по стране" },
      { href: "/phrasebook", label: "Phrasebook для коротких бытовых сценариев" },
      firstGreekLesson
        ? { href: `/lessons/${firstGreekLesson.id}`, label: `Первый Greek Core урок: ${firstGreekLesson.title}` }
        : null,
      firstCyprusLesson
        ? { href: `/lessons/${firstCyprusLesson.id}`, label: `Первый Cyprus Reality урок: ${firstCyprusLesson.title}` }
        : null
    ].filter(Boolean) as Array<{ href: string; label: string }>;
  }

  if (routePath === "/humor") {
    return [
      { href: "/lessons", label: "Основная языковая программа" },
      { href: "/trails", label: "Готовые маршруты" },
      { href: "/phrasebook", label: "Phrasebook с бытовыми фразами" },
      { href: "/easy-start", label: "Лёгкий старт для первого шага" }
    ];
  }

  if (routePath.startsWith("/lessons/")) {
    const lessonId = routePath.replace("/lessons/", "");
    const lesson = getLessonById(lessonId);

    if (!lesson) {
      return [];
    }

    const nextLesson = getNextLesson(lesson.id);

    if (lesson.trackId === "cyprus_reality") {
      return [
        { href: "/", label: "Главная страница" },
        { href: "/cyprus", label: "Все уроки Cyprus Reality" },
        { href: "/trails", label: "Маршруты с темами по Кипру" },
        { href: "/lessons", label: "Greek Core для языкового слоя" },
        nextLesson ? { href: `/lessons/${nextLesson.id}`, label: `Следующий урок: ${nextLesson.title}` } : null,
        getLessonsByTrack("greek_b1")[0]
          ? {
              href: `/lessons/${getLessonsByTrack("greek_b1")[0].id}`,
              label: `Первый Greek Core урок: ${getLessonsByTrack("greek_b1")[0].title}`
            }
          : null
      ].filter(Boolean) as Array<{ href: string; label: string }>;
    }

    return [
      { href: "/", label: "Главная страница" },
      { href: "/lessons", label: "Все уроки Greek Core" },
      { href: "/easy-start", label: "Лёгкий старт" },
      { href: "/phrasebook", label: "Phrasebook для бытовых сценариев" },
      { href: "/trails", label: "Маршруты по задачам" },
      nextLesson ? { href: `/lessons/${nextLesson.id}`, label: `Следующий урок: ${nextLesson.title}` } : null,
      getLessonsByTrack("cyprus_reality")[0]
        ? {
            href: `/lessons/${getLessonsByTrack("cyprus_reality")[0].id}`,
            label: `Первый Cyprus Reality урок: ${getLessonsByTrack("cyprus_reality")[0].title}`
          }
        : null
    ].filter(Boolean) as Array<{ href: string; label: string }>;
  }

  return [];
}

function SnapshotLinks(props: { items: Array<{ href: string; label: string }> }) {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={`${item.href}-${item.label}`}>
          <a href={item.href}>{item.label}</a>
        </li>
      ))}
    </ul>
  );
}

function LessonPreview(props: { lessonId: string }) {
  const lesson = getLessonById(props.lessonId);

  if (!lesson) {
    return null;
  }

  const previewBlocks = (lesson.contentBlocks ?? []).slice(0, 3);

  return (
    <>
      <p>{lesson.objective ?? ""}</p>
      <p>
        Уровень: {lesson.difficulty ?? "n/a"} · Оценка времени: {lesson.estimatedMinutes ?? "n/a"} минут.
      </p>
      {previewBlocks.map((block) => {
        const items = (block.items ?? []).slice(0, 3)
          .map((item) => [item.title, item.date, item.el, item.name, item.text, item.ru].filter(Boolean).slice(0, 2))
          .filter((parts) => parts.length > 0);

        if (items.length === 0) {
          return null;
        }

        return (
          <section className="seo-route-snapshot-section" key={`${lesson.id}-${block.type}`}>
            <h2>{block.type}</h2>
            <ul>
              {items.map((parts, index) => (
                <li key={`${lesson.id}-${block.type}-${index}`}>{parts.join(" — ")}</li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

export function PublicRouteSnapshot(props: PublicRouteSnapshotProps) {
  const routePath = getRoutePathFromSlug(props.slug);

  if (!isIndexableSnapshotRoute(routePath)) {
    return null;
  }

  if (routePath === "/") {
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Kypros Path</p>
          <h1>Греческий и Cyprus Reality для жизни на Кипре</h1>
          <p>
            Короткие учебные входы для старта, language lessons, Cyprus Reality, guided trails и lesson
            pages с практическими сценариями и exam-oriented темами.
          </p>
          <nav aria-label="Public entry routes">
            <SnapshotLinks items={getSnapshotLinks(routePath)} />
          </nav>
        </section>
      </main>
    );
  }

  if (routePath === "/easy-start") {
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Лёгкий старт</p>
          <h1>Греческий с нуля на Кипре: лёгкий старт</h1>
          <p>Маршрут для первого входа: один короткий урок, затем карточки и мини-проверка без длинного выбора модулей.</p>
          <h2>С чего начать</h2>
          <SnapshotLinks items={getSnapshotLinks(routePath).slice(0, 4)} />
          <h2>Куда перейти дальше</h2>
          <SnapshotLinks items={getSnapshotLinks(routePath).slice(4)} />
        </section>
      </main>
    );
  }

  if (routePath === "/lessons") {
    const links = getSnapshotLinks(routePath);
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Уроки</p>
          <h1>Уроки Greek Core для жизни на Кипре</h1>
          <p>Языковая программа с уровнями, lesson pages, flashcards и mini quiz по бытовым, service и public-life темам.</p>
          <h2>Первые уроки</h2>
          <SnapshotLinks items={links.slice(0, 6)} />
          <h2>Связанные входы</h2>
          <SnapshotLinks items={links.slice(6)} />
        </section>
      </main>
    );
  }

  if (routePath === "/phrasebook") {
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Phrasebook</p>
          <h1>Everyday Greek phrasebook для бытовых ситуаций на Кипре</h1>
          <p>Короткие practical phrases для приветствия, кафе, магазина, дороги и сервисных сценариев, которые можно открыть без длинного lesson flow.</p>
          <SnapshotLinks items={getSnapshotLinks(routePath)} />
        </section>
      </main>
    );
  }

  if (routePath === "/cyprus") {
    const links = getSnapshotLinks(routePath);
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Кипр</p>
          <h1>Cyprus Reality: история, культура и устройство страны</h1>
          <p>Отдельный учебный вход по Республике Кипр: базовые факты, институты, общественная жизнь и exam-oriented topics.</p>
          <h2>Стартовые темы</h2>
          <SnapshotLinks items={links.slice(0, 6)} />
          <h2>Связанные страницы</h2>
          <SnapshotLinks items={links.slice(6)} />
        </section>
      </main>
    );
  }

  if (routePath === "/trails") {
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Маршруты</p>
          <h1>Маршруты по греческому и Cyprus Reality</h1>
          <p>Guided paths для everyday Greek, service situations, quick review и Cyprus-oriented study without a long catalog detour.</p>
          <SnapshotLinks items={getSnapshotLinks(routePath)} />
        </section>
      </main>
    );
  }

  if (routePath === "/humor") {
    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">Юмор</p>
          <h1>Греческий юмор для короткой практики чтения и разбора</h1>
          <p>Короткие мемы, jokes и anecdotes как учебный вход: прочитать, понять смысл, заметить культурный контекст и вернуться к языковой практике.</p>
          <SnapshotLinks items={getSnapshotLinks(routePath)} />
        </section>
      </main>
    );
  }

  if (routePath.startsWith("/lessons/")) {
    const lessonId = routePath.replace("/lessons/", "");
    const lesson = lessons.find((entry) => entry.id === lessonId);

    if (!lesson) {
      return null;
    }

    return (
      <main className="seo-route-snapshot" data-seo-route={routePath}>
        <section className="seo-route-snapshot-section">
          <p className="eyebrow">{lesson.trackId === "cyprus_reality" ? "Cyprus Reality lesson" : "Greek lesson"}</p>
          <h1>{lesson.title}</h1>
          <LessonPreview lessonId={lessonId} />
          <h2>Продолжить путь</h2>
          <SnapshotLinks items={getSnapshotLinks(routePath)} />
          <p>
            <a href={lesson.trackId === "cyprus_reality" ? "/cyprus" : "/lessons"}>Вернуться к списку уроков</a>
          </p>
        </section>
      </main>
    );
  }

  return null;
}
