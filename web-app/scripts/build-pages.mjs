import { access, readFile, rename, writeFile } from "node:fs/promises";
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
        NEXT_PUBLIC_DEPLOY_TARGET: "github-pages"
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
  if (pathname === "/") {
    return siteUrl;
  }

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
  await writeFile(path.join(outDir, "sitemap.xml"), await buildSitemapXml(), "utf8");
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function main() {
  assertValidCanonicalSiteUrl(siteUrl);

  const movedEntries = [];

  try {
    for (const entry of parkedEntries) {
      if (!(await pathExists(entry.from))) {
        continue;
      }

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
