import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";

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

async function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return;
      }
    } catch {
      // keep polling until timeout
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for E2E server at ${url}`);
}

async function getAvailablePort() {
  if (process.env.E2E_PORT) {
    return process.env.E2E_PORT;
  }

  return new Promise((resolve, reject) => {
    const probeServer = createServer();

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

async function main() {
  const e2ePort = await getAvailablePort();
  const e2eBaseUrl = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;
  const server = spawn(
    "npm",
    ["run", "start", "--", "--port", e2ePort, "--hostname", "0.0.0.0"],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PORT: e2ePort
      }
    }
  );

  let serverClosed = false;

  server.on("exit", () => {
    serverClosed = true;
  });

  try {
    await waitForServer(e2eBaseUrl);
    await runCommand("node", [
      "--experimental-loader",
      "./tests/support/alias-loader.mjs",
      "--test",
      "./.test-dist/tests/e2e/browser-flows.test.js"
    ], {
      env: {
        ...process.env,
        E2E_BASE_URL: e2eBaseUrl,
        E2E_CHROME_PATH
      }
    });
  } finally {
    if (!serverClosed) {
      server.kill("SIGTERM");
      await new Promise((resolve) => {
        server.once("exit", resolve);
        setTimeout(() => {
          if (!serverClosed) {
            server.kill("SIGKILL");
          }
        }, 5000);
      });
    }
  }
}

await main();
