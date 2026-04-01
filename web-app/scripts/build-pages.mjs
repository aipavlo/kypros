import { rename } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const appDir = path.resolve("./app");
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

const movedEntries = [];

try {
  for (const entry of parkedEntries) {
    await rename(entry.from, entry.to);
    movedEntries.push(entry);
  }

  await runNextBuild();
} finally {
  for (const entry of movedEntries.reverse()) {
    await rename(entry.to, entry.from);
  }
}
