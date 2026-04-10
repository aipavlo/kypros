import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const appDir = path.resolve("./app");
const outDir = path.resolve("./out");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://aipavlo.github.io/kypros/";
const siteBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (new URL(siteUrl).pathname === "/" ? "" : new URL(siteUrl).pathname.replace(/\/$/, ""));
const indexableStaticRoutesPath = path.resolve("./src/seo/indexableStaticRoutes.json");
const parkedEntries = [
  {
    from: path.join(appDir, "api"),
    to: path.join(appDir, "__api_pages_disabled__")
  },
  {
    from: path.join(appDir, "robots.ts"),
    to: path.join(appDir, "__robots_pages_disabled__.ts")
  },
  {
    from: path.join(appDir, "sitemap.ts"),
    to: path.join(appDir, "__sitemap_pages_disabled__.ts")
  }
];

function isUnsafeCanonicalHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".local");
}

export function assertValidCanonicalSiteUrl(url) {
  const parsedUrl = new URL(url);

  if (isUnsafeCanonicalHost(parsedUrl.hostname)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL must point to the published canonical host, got ${parsedUrl.origin}`
    );
  }
}

function runNextBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["next", "build"], {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_DEPLOY_TARGET: "github-pages",
        NEXT_PUBLIC_APP_MODE: "no-db"
      }
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`next build exited with code ${code ?? "unknown"}`));
    });
  });
}

export function getAbsoluteUrl(pathname = "/") {
  const normalizedPath = pathname === "/" ? "" : pathname.replace(/\/+$/, "") || "";
  const fullPath = `${siteBasePath}${normalizedPath}` || "/";

  return new URL(fullPath, `${new URL(siteUrl).origin}/`).toString();
}

async function readLessons() {
  const lessonFiles = [
    path.resolve("./app-content/02-greek-b1/lessons.json"),
    path.resolve("./app-content/03-cyprus-reality/lessons.json")
  ];
  const lessonGroups = await Promise.all(
    lessonFiles.map(async (filePath) => JSON.parse(await readFile(filePath, "utf8")))
  );

  return lessonGroups.flat();
}

async function readIndexableStaticRoutes() {
  return JSON.parse(await readFile(indexableStaticRoutesPath, "utf8"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getRouteArtifactPath(routePath) {
  return routePath === "/" ? path.join(outDir, "index.html") : path.join(outDir, routePath.replace(/^\/+/, ""), "index.html");
}

function renderLessonContentPreview(lesson) {
  const previewBlocks = (lesson.contentBlocks ?? []).slice(0, 3);

  if (previewBlocks.length === 0) {
    return "";
  }

  return previewBlocks
    .map((block) => {
      const items = (block.items ?? []).slice(0, 3);
      const renderedItems = items
        .map((item) => {
          const parts = [item.title, item.date, item.el, item.name, item.text, item.ru]
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => escapeHtml(part));

          return parts.length > 0 ? `<li>${parts.join(" — ")}</li>` : "";
        })
        .filter(Boolean)
        .join("");

      if (!renderedItems) {
        return "";
      }

      return `<section class="seo-route-snapshot-section"><h2>${escapeHtml(block.type)}</h2><ul>${renderedItems}</ul></section>`;
    })
    .filter(Boolean)
    .join("");
}

function renderLessonLinks(lessons, limit = 6) {
  return lessons
    .slice(0, limit)
    .map(
      (lesson) =>
        `<li><a href="${escapeHtml(`/lessons/${lesson.id}`)}">${escapeHtml(`${lesson.order ?? ""} ${lesson.title}`.trim())}</a></li>`
    )
    .join("");
}

function renderLinkList(items) {
  return items
    .filter((item) => item?.href && item?.label)
    .map((item) => `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a></li>`)
    .join("");
}

function renderPublicRouteSnapshot(routePath, lessons) {
  const greekLessons = lessons.filter((lesson) => lesson.trackId === "greek_b1");
  const cyprusLessons = lessons.filter((lesson) => lesson.trackId === "cyprus_reality");
  const lesson =
    routePath.startsWith("/lessons/") ? lessons.find((entry) => `/lessons/${entry.id}` === routePath) : null;
  const firstGreekLesson = greekLessons[0];
  const firstCyprusLesson = cyprusLessons[0];

  if (routePath === "/") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Kypros Path</p>
  <h1>Греческий и Cyprus Reality для жизни на Кипре</h1>
  <p>Короткие учебные входы для старта, language lessons, Cyprus Reality, guided trails и lesson pages с практическими сценариями и exam-oriented темами.</p>
  <nav aria-label="Public entry routes">
    <ul>
      <li><a href="/easy-start">Лёгкий старт по греческому</a></li>
      <li><a href="/phrasebook">Практические бытовые сценарии</a></li>
      <li><a href="/lessons">Уроки Greek Core</a></li>
      <li><a href="/cyprus">Программа Cyprus Reality</a></li>
      <li><a href="/trails">Готовые маршруты</a></li>
      <li><a href="/humor">Греческий юмор</a></li>
      ${firstGreekLesson ? `<li><a href="/lessons/${escapeHtml(firstGreekLesson.id)}">${escapeHtml(firstGreekLesson.title)}</a></li>` : ""}
      ${firstCyprusLesson ? `<li><a href="/lessons/${escapeHtml(firstCyprusLesson.id)}">${escapeHtml(firstCyprusLesson.title)}</a></li>` : ""}
    </ul>
  </nav>
</section>`;
  }

  if (routePath === "/easy-start") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Лёгкий старт</p>
  <h1>Греческий с нуля на Кипре: лёгкий старт</h1>
  <p>Маршрут для первого входа: один короткий урок, затем карточки и мини-проверка без длинного выбора модулей.</p>
  <h2>С чего начать</h2>
  <ul>${renderLessonLinks(greekLessons, 3)}</ul>
  <h2>Куда перейти дальше</h2>
  <ul>${renderLinkList([
    { href: "/phrasebook", label: "Phrasebook для бытовых фраз" },
    { href: "/trails", label: "Маршруты под конкретную задачу" },
    { href: "/lessons", label: "Вся программа Greek Core" },
    firstCyprusLesson ? { href: `/lessons/${firstCyprusLesson.id}`, label: `Первый Cyprus Reality урок: ${firstCyprusLesson.title}` } : null
  ])}</ul>
</section>`;
  }

  if (routePath === "/lessons") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Уроки</p>
  <h1>Уроки Greek Core для жизни на Кипре</h1>
  <p>Языковая программа с уровнями, lesson pages, flashcards и mini quiz по бытовым, service и public-life темам.</p>
  <h2>Первые уроки</h2>
  <ul>${renderLessonLinks(greekLessons, 6)}</ul>
  <h2>Связанные входы</h2>
  <ul>${renderLinkList([
    { href: "/easy-start", label: "Лёгкий старт для первого шага" },
    { href: "/phrasebook", label: "Phrasebook для быстрых бытовых сценариев" },
    { href: "/trails", label: "Маршруты по задачам" },
    { href: "/cyprus", label: "Cyprus Reality как отдельный трек" }
  ])}</ul>
</section>`;
  }

  if (routePath === "/phrasebook") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Phrasebook</p>
  <h1>Everyday Greek phrasebook для бытовых ситуаций на Кипре</h1>
  <p>Короткие practical phrases для приветствия, кафе, магазина, дороги и сервисных сценариев, которые можно открыть без длинного lesson flow.</p>
  <ul>
    <li><a href="/easy-start">Лёгкий старт</a></li>
    <li><a href="/lessons">Основная языковая программа</a></li>
    <li><a href="/trails">Маршруты по задачам</a></li>
    <li><a href="/humor">Юмор для короткой практики чтения</a></li>
    ${firstGreekLesson ? `<li><a href="/lessons/${escapeHtml(firstGreekLesson.id)}">${escapeHtml(`Первый урок Greek Core: ${firstGreekLesson.title}`)}</a></li>` : ""}
  </ul>
</section>`;
  }

  if (routePath === "/cyprus") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Кипр</p>
  <h1>Cyprus Reality: история, культура и устройство страны</h1>
  <p>Отдельный учебный вход по Республике Кипр: базовые факты, институты, общественная жизнь и exam-oriented topics.</p>
  <h2>Стартовые темы</h2>
  <ul>${renderLessonLinks(cyprusLessons, 6)}</ul>
  <h2>Связанные страницы</h2>
  <ul>${renderLinkList([
    { href: "/trails", label: "Маршруты с блоком Cyprus Reality" },
    { href: "/lessons", label: "Greek Core для языкового слоя" },
    { href: "/humor", label: "Юмор и культурный контекст" }
  ])}</ul>
</section>`;
  }

  if (routePath === "/trails") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Маршруты</p>
  <h1>Маршруты по греческому и Cyprus Reality</h1>
  <p>Guided paths для everyday Greek, service situations, quick review и Cyprus-oriented study without a long catalog detour.</p>
  <ul>
    <li><a href="/easy-start">Лёгкий старт</a> для первого короткого шага</li>
    <li><a href="/lessons">Lessons</a> для последовательной языковой программы</li>
    <li><a href="/cyprus">Cyprus Reality</a> для отдельного трека по стране</li>
    <li><a href="/phrasebook">Phrasebook</a> для коротких бытовых сценариев</li>
    ${firstGreekLesson ? `<li><a href="/lessons/${escapeHtml(firstGreekLesson.id)}">${escapeHtml(`Первый Greek Core урок: ${firstGreekLesson.title}`)}</a></li>` : ""}
    ${firstCyprusLesson ? `<li><a href="/lessons/${escapeHtml(firstCyprusLesson.id)}">${escapeHtml(`Первый Cyprus Reality урок: ${firstCyprusLesson.title}`)}</a></li>` : ""}
  </ul>
</section>`;
  }

  if (routePath === "/humor") {
    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">Юмор</p>
  <h1>Греческий юмор для короткой практики чтения и разбора</h1>
  <p>Короткие мемы, jokes и anecdotes как учебный вход: прочитать, понять смысл, заметить культурный контекст и вернуться к языковой практике.</p>
  <ul>
    <li><a href="/lessons">Основная языковая программа</a></li>
    <li><a href="/trails">Готовые маршруты</a></li>
    <li><a href="/phrasebook">Phrasebook с бытовыми фразами</a></li>
    <li><a href="/easy-start">Лёгкий старт для первого шага</a></li>
  </ul>
</section>`;
  }

  if (lesson) {
    const sameTrackLessons = lessons.filter((entry) => entry.trackId === lesson.trackId);
    const lessonIndex = sameTrackLessons.findIndex((entry) => entry.id === lesson.id);
    const nextLesson = lessonIndex >= 0 ? sameTrackLessons[lessonIndex + 1] ?? null : null;
    const parentPath = lesson.trackId === "cyprus_reality" ? "/cyprus" : "/lessons";
    const relatedLinks =
      lesson.trackId === "cyprus_reality"
        ? [
            { href: "/", label: "Главная страница" },
            { href: "/cyprus", label: "Все уроки Cyprus Reality" },
            { href: "/trails", label: "Маршруты с темами по Кипру" },
            { href: "/lessons", label: "Greek Core для языкового слоя" }
          ]
        : [
            { href: "/", label: "Главная страница" },
            { href: "/lessons", label: "Все уроки Greek Core" },
            { href: "/easy-start", label: "Лёгкий старт" },
            { href: "/phrasebook", label: "Phrasebook для бытовых сценариев" },
            { href: "/trails", label: "Маршруты по задачам" }
          ];

    return `
<section class="seo-route-snapshot-section">
  <p class="eyebrow">${escapeHtml(lesson.trackId === "cyprus_reality" ? "Cyprus Reality lesson" : "Greek lesson")}</p>
  <h1>${escapeHtml(lesson.title)}</h1>
  <p>${escapeHtml(lesson.objective ?? "")}</p>
  <p>Уровень: ${escapeHtml(lesson.difficulty ?? "n/a")} · Оценка времени: ${escapeHtml(lesson.estimatedMinutes ?? "n/a")} минут.</p>
  ${renderLessonContentPreview(lesson)}
  <h2>Продолжить путь</h2>
  <ul>${renderLinkList([
    ...relatedLinks,
    nextLesson ? { href: `/lessons/${nextLesson.id}`, label: `Следующий урок: ${nextLesson.title}` } : null,
    firstCyprusLesson && lesson.trackId !== "cyprus_reality"
      ? { href: `/lessons/${firstCyprusLesson.id}`, label: `Первый Cyprus Reality урок: ${firstCyprusLesson.title}` }
      : null,
    firstGreekLesson && lesson.trackId === "cyprus_reality"
      ? { href: `/lessons/${firstGreekLesson.id}`, label: `Первый Greek Core урок: ${firstGreekLesson.title}` }
      : null
  ])}</ul>
  <p><a href="${escapeHtml(parentPath)}">Вернуться к списку уроков</a></p>
</section>`;
  }

  return "";
}

async function injectPublicRouteSnapshots() {
  const lessons = await readLessons();
  const staticRoutes = await readIndexableStaticRoutes();
  const routePaths = [...staticRoutes.map((entry) => entry.pathname), ...lessons.map((lesson) => `/lessons/${lesson.id}`)];

  for (const routePath of routePaths) {
    const snapshot = renderPublicRouteSnapshot(routePath, lessons);

    if (!snapshot) {
      continue;
    }

    const artifactPath = getRouteArtifactPath(routePath);
    const html = await readFile(artifactPath, "utf8");
    const hydratedHtml = html.replace(
      /<body>/,
      `<body><main class="seo-route-snapshot" data-seo-route="${escapeHtml(routePath)}">${snapshot}</main>`
    );

    await writeFile(artifactPath, hydratedHtml, "utf8");
  }
}

export function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${getAbsoluteUrl("/sitemap.xml")}`,
    ""
  ].join("\n");
}

export function buildSitemapEntries(staticRoutes, lessons) {
  const staticEntries = staticRoutes.map((entry) => ({
    url: getAbsoluteUrl(entry.pathname),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));
  const lessonEntries = lessons.map((lesson) => ({
    url: getAbsoluteUrl(`/lessons/${lesson.id}`),
    changeFrequency: "monthly",
    priority: lesson.trackId === "cyprus_reality" ? 0.8 : 0.7
  }));

  return [...staticEntries, ...lessonEntries];
}

export async function buildSitemapXml() {
  const lessons = await readLessons();
  const staticRoutes = await readIndexableStaticRoutes();
  const entries = buildSitemapEntries(staticRoutes, lessons)
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

async function writeSeoArtifacts() {
  await writeFile(path.join(outDir, "robots.txt"), buildRobotsTxt(), "utf8");
  await writeFile(path.join(outDir, "sitemap.xml"), await buildSitemapXml(), "utf8");
  await injectPublicRouteSnapshots();
}

export async function main() {
  assertValidCanonicalSiteUrl(siteUrl);

  const movedEntries = [];

  try {
    for (const entry of parkedEntries) {
      await rename(entry.from, entry.to);
      movedEntries.push(entry);
    }

    await runNextBuild();
    await writeSeoArtifacts();
  } finally {
    for (const entry of movedEntries.reverse()) {
      await rename(entry.to, entry.from);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
