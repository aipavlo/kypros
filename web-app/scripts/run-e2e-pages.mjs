import { spawn } from "node:child_process";
import { createServer as createNetServer } from "node:net";
import { createServer as createHttpServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

function getChromePath() {
  const candidates = [
    process.env.E2E_CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean);

  return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0] ?? "/usr/bin/google-chrome";
}

const E2E_CHROME_PATH = getChromePath();
const OUT_DIR = path.resolve("./out");
const BASE_PATH = process.env.E2E_PAGES_BASE_PATH ?? "/kypros";

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options
    });

    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} failed with ${signal ? `signal ${signal}` : `code ${code}`}`
        )
      );
    });
  });
}

async function getAvailablePort() {
  if (process.env.E2E_PORT) {
    return process.env.E2E_PORT;
  }

  return new Promise((resolve, reject) => {
    const probeServer = createNetServer();

    probeServer.once("error", reject);
    probeServer.listen(0, "127.0.0.1", () => {
      const address = probeServer.address();

      if (!address || typeof address === "string") {
        probeServer.close(() => reject(new Error("Failed to determine an available E2E port")));
        return;
      }

      const freePort = String(address.port);
      probeServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(freePort);
      });
    });
  });
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".xml")) return "application/xml; charset=utf-8";
  if (filePath.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (filePath.endsWith(".webmanifest")) return "application/manifest+json; charset=utf-8";
  if (filePath.endsWith(".ico")) return "image/x-icon";

  return "application/octet-stream";
}

async function resolveStaticFile(urlPathname) {
  if (urlPathname === BASE_PATH) {
    return { redirect: `${BASE_PATH}/` };
  }

  if (!urlPathname.startsWith(`${BASE_PATH}/`)) {
    return null;
  }

  const relativePath = urlPathname.slice(BASE_PATH.length) || "/";
  const normalizedRelativePath = relativePath.replace(/^\/+/, "");
  const candidates = normalizedRelativePath.endsWith("/")
    ? [path.join(OUT_DIR, normalizedRelativePath, "index.html")]
    : normalizedRelativePath.includes(".")
      ? [path.join(OUT_DIR, normalizedRelativePath)]
      : [
          path.join(OUT_DIR, normalizedRelativePath, "index.html"),
          path.join(OUT_DIR, normalizedRelativePath)
        ];

  for (const candidate of candidates) {
    try {
      const body = await readFile(candidate);
      return {
        body,
        contentType: getContentType(candidate)
      };
    } catch {
      // try next candidate
    }
  }

  return null;
}

async function main() {
  const e2ePort = await getAvailablePort();
  const pagesBaseUrl = process.env.E2E_PAGES_BASE_URL ?? `http://127.0.0.1:${e2ePort}${BASE_PATH}`;
  const siteUrl = pagesBaseUrl.replace(/\/$/, "");

  await runCommand("npm", ["run", "test:build"]);
  await runCommand("npm", ["run", "build:pages"], {
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_MODE: "no-db",
      NEXT_PUBLIC_DEPLOY_TARGET: "github-pages",
      NEXT_PUBLIC_BASE_PATH: BASE_PATH,
      NEXT_PUBLIC_SITE_URL: siteUrl
    }
  });

  const server = createHttpServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const resolved = await resolveStaticFile(pathname);

    if (!resolved) {
      response.statusCode = 404;
      response.end("Not found");
      return;
    }

    if ("redirect" in resolved) {
      response.statusCode = 302;
      response.setHeader("Location", resolved.redirect);
      response.end();
      return;
    }

    response.statusCode = 200;
    response.setHeader("Content-Type", resolved.contentType);
    response.end(resolved.body);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(Number(e2ePort), "127.0.0.1", resolve);
  });

  try {
    await runCommand(
      "node",
      [
        "--experimental-loader",
        "./tests/support/alias-loader.mjs",
        "--test",
        "./.test-dist/tests/e2e/browser-pages-flows.test.js"
      ],
      {
        env: {
          ...process.env,
          E2E_CHROME_PATH,
          E2E_PAGES_BASE_URL: pagesBaseUrl
        }
      }
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

await main();
