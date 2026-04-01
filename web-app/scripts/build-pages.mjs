import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const appDir = path.resolve("./app");
const outDir = path.resolve("./out");
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kyprospath.app";
const siteBasePath =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (new URL(siteUrl).pathname === "/" ? "" : new URL(siteUrl).pathname.replace(/\/$/, ""));
const staticRoutePaths = [
  "/",
  "/welcome",
  "/dashboard",
  "/easy-start",
  "/lessons",
  "/cyprus",
  "/tracks",
  "/trails",
  "/flashcards",
  "/quiz",
  "/content",
  "/humor",
  "/achievements"
];
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

function getAbsoluteUrl(pathname = "/") {
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

function buildRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${getAbsoluteUrl("/sitemap.xml")}`,
    ""
  ].join("\n");
}

async function buildSitemapXml() {
  const lessons = await readLessons();
  const staticEntries = staticRoutePaths.map((route) => ({
    url: getAbsoluteUrl(route),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/cyprus" || route === "/lessons" ? 0.9 : 0.7
  }));
  const lessonEntries = lessons.map((lesson) => ({
    url: getAbsoluteUrl(`/lessons/${lesson.id}`),
    changeFrequency: "monthly",
    priority: lesson.trackId === "cyprus_reality" ? 0.8 : 0.7
  }));
  const entries = [...staticEntries, ...lessonEntries]
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
}

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
